import { es } from '@/i18n/es';
import { ApiError } from './client';

/** Error codes the API emits. Kept in sync with the backend's DomainError set. */
export const API_ERROR_CODE = {
  OVERLAPPING_RESERVATION: 'OVERLAPPING_RESERVATION',
  OUTSIDE_OPERATING_HOURS: 'OUTSIDE_OPERATING_HOURS',
  RESOURCE_BLOCKED: 'RESOURCE_BLOCKED',
  RESOURCE_UNAVAILABLE: 'RESOURCE_UNAVAILABLE',
  CAPACITY_EXCEEDED: 'CAPACITY_EXCEEDED',
  RESERVATION_LIMIT_REACHED: 'RESERVATION_LIMIT_REACHED',
  RESERVATION_IN_PAST: 'RESERVATION_IN_PAST',
} as const;

/**
 * True when the request lost a race for a slot.
 *
 * This is the one error the booking dialog handles specially: instead of just
 * reporting it, it shows the conflicting range and reloads the free slots.
 */
export function isOverlapConflict(error: unknown): error is ApiError {
  return error instanceof ApiError && error.problem.code === API_ERROR_CODE.OVERLAPPING_RESERVATION;
}

/** The conflicting reservation's range, when the API included it. */
export function extractConflict(error: unknown): { startAt: Date; endAt: Date } | null {
  if (!(error instanceof ApiError) || !error.problem.conflict) return null;
  return {
    startAt: new Date(error.problem.conflict.startAt),
    endAt: new Date(error.problem.conflict.endAt),
  };
}

/**
 * Maps an error to Spanish copy for the user.
 *
 * Falls back to the API's own `title`, which is already in Spanish: the
 * backend owns the user-facing error catalogue so translations are not
 * duplicated on both sides.
 */
export function toUserMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return es.errors.unexpected;

  switch (error.problem.code) {
    case API_ERROR_CODE.OVERLAPPING_RESERVATION:
      return es.errors.overlap;
    case API_ERROR_CODE.OUTSIDE_OPERATING_HOURS:
      return es.errors.outsideHours;
    case API_ERROR_CODE.RESOURCE_BLOCKED:
      return es.errors.resourceBlocked;
    case API_ERROR_CODE.CAPACITY_EXCEEDED:
      return es.errors.capacityExceeded;
    case API_ERROR_CODE.RESERVATION_LIMIT_REACHED:
      return es.errors.limitReached;
    case API_ERROR_CODE.RESERVATION_IN_PAST:
      return es.errors.inThePast;
    default:
      return error.problem.title || es.errors.unexpected;
  }
}

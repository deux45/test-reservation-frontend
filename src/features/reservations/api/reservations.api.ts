import { api } from '@/lib/api/client';
import type {
  CreateReservationInput,
  Paginated,
  Reservation,
  ReservationFilters,
} from '@/lib/api/types';

export const reservationsApi = {
  list(filters: ReservationFilters = {}): Promise<Paginated<Reservation>> {
    return api(`/api/v1/reservations${toQuery(filters)}`);
  },

  get(id: string): Promise<Reservation> {
    return api(`/api/v1/reservations/${id}`);
  },

  /**
   * The Idempotency-Key makes a retried request safe: the API returns the
   * reservation it already created instead of a 409. Generated once per
   * dialog opening, not per attempt, so a double click is a retry.
   */
  create(input: CreateReservationInput, idempotencyKey: string): Promise<Reservation> {
    return api('/api/v1/reservations', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(input),
    });
  },

  /**
   * Cancellation is a POST that creates a cancellation fact, not a DELETE.
   * Nothing is removed: who, when and why are recorded, and the slot is free
   * again immediately.
   */
  cancel(id: string, reason?: string): Promise<Reservation> {
    return api(`/api/v1/reservations/${id}/cancellation`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

function toQuery(filters: ReservationFilters): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === '') continue;
    // status is repeatable: ?status=CONFIRMED&status=CANCELLED
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, String(entry)));
      continue;
    }
    params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

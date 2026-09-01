/**
 * Contracts mirrored from the API.
 *
 * Written by hand for now. Once the backend's openapi.json is generated in CI,
 * `npm run api:types` replaces these with the generated schema and a drifted
 * contract becomes a compile error rather than a runtime surprise.
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ResourceType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  attributesSchema: Record<string, unknown>;
  isActive: boolean;
}

export interface Resource {
  id: string;
  code: string;
  name: string;
  description: string | null;
  capacity: number | null;
  location: string | null;
  /** IANA zone. Times are rendered in this zone, not the browser's. */
  timeZone: string;
  attributes: Record<string, unknown>;
  isActive: boolean;
  resourceType?: ResourceType;
  createdAt: string;
}

/** Matches the API enum exactly. The Spanish labels live in i18n/es.ts. */
export type ReservationStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Reservation {
  id: string;
  title: string;
  /** UTC, inclusive. */
  startAt: string;
  /** UTC, **exclusive**: a booking ending at 11:00 leaves 11:00 free. */
  endAt: string;
  status: ReservationStatus;
  attendees: number | null;
  notes: string | null;
  userId: string;
  resourceId: string;
  resource?: Resource;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
}

export interface CreateResourceInput {
  resourceTypeId: string;
  code: string;
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
  timeZone?: string;
  attributes?: Record<string, unknown>;
}

/** code and resourceTypeId are absent on purpose: the API refuses to change
 *  either, because both would invalidate the stored attributes. */
export type UpdateResourceInput = Omit<CreateResourceInput, 'code' | 'resourceTypeId'>;

export interface CreateReservationInput {
  resourceId: string;
  title: string;
  startAt: string;
  endAt: string;
  attendees?: number;
  notes?: string;
}

export interface ReservationFilters {
  resourceId?: string;
  status?: ReservationStatus[];
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface ResourceFilters {
  typeId?: string;
  q?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  banned: boolean;
  /** Future confirmed reservations, so the impact of a role change is visible. */
  activeReservations: number;
  createdAt: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

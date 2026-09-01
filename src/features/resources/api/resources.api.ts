import { api } from '@/lib/api/client';
import type { Paginated, Resource, ResourceFilters, ResourceType } from '@/lib/api/types';

/** The only place that knows the resource endpoints exist. */
export const resourcesApi = {
  list(filters: ResourceFilters = {}): Promise<Paginated<Resource>> {
    return api(`/api/v1/resources${toQuery(filters)}`);
  },

  get(id: string): Promise<Resource> {
    return api(`/api/v1/resources/${id}`);
  },

  listTypes(): Promise<ResourceType[]> {
    return api('/api/v1/resource-types');
  },

  /** Soft delete: the resource stops accepting bookings, history is kept. */
  deactivate(id: string): Promise<void> {
    return api(`/api/v1/resources/${id}`, { method: 'DELETE' });
  },

  activate(id: string): Promise<Resource> {
    return api(`/api/v1/resources/${id}/activation`, { method: 'POST' });
  },
};

function toQuery(filters: ResourceFilters): string {
  const params = new URLSearchParams();

  // Skips undefined rather than sending "undefined" as a value, and skips ''
  // so an empty search box does not filter for the empty string.
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === '') continue;
    params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

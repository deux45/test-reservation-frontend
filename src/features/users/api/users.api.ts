import { api } from '@/lib/api/client';
import type { CreateUserInput, Paginated, User, UserRole } from '@/lib/api/types';

export const usersApi = {
  list(page = 1, limit = 20): Promise<Paginated<User>> {
    return api(`/api/v1/users?page=${page}&limit=${limit}`);
  },

  create(input: CreateUserInput): Promise<User> {
    return api('/api/v1/users', { method: 'POST', body: JSON.stringify(input) });
  },

  updateRole(id: string, role: UserRole): Promise<User> {
    return api(`/api/v1/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  /**
   * A ban is created and destroyed, not toggled: it carries a reason and an
   * expiry, so it is a thing rather than a boolean.
   */
  ban(id: string, input: { reason?: string; days?: number }): Promise<User> {
    return api(`/api/v1/users/${id}/ban`, { method: 'POST', body: JSON.stringify(input) });
  },

  unban(id: string): Promise<User> {
    return api(`/api/v1/users/${id}/ban`, { method: 'DELETE' });
  },
};

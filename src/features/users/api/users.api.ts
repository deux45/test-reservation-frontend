import { api } from '@/lib/api/client';
import type { Paginated, User, UserRole } from '@/lib/api/types';

export const usersApi = {
  list(page = 1, limit = 20): Promise<Paginated<User>> {
    return api(`/api/v1/users?page=${page}&limit=${limit}`);
  },

  updateRole(id: string, role: UserRole): Promise<User> {
    return api(`/api/v1/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },
};

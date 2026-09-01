import type { Metadata } from 'next';
import { UsersTable } from '@/features/users/components/users-table';
import { es } from '@/i18n/es';

export const metadata: Metadata = { title: `${es.users.title} · ${es.app.name}` };

export default function UsersPage() {
  return <UsersTable />;
}

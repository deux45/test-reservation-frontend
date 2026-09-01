import type { Metadata } from 'next';
import { ReservationsTable } from '@/features/reservations/components/reservations-table';
import { es } from '@/i18n/es';

export const metadata: Metadata = { title: `${es.reservations.title} · ${es.app.name}` };

export default function ReservationsPage() {
  return <ReservationsTable />;
}

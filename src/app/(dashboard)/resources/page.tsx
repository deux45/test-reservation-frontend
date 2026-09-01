import type { Metadata } from 'next';
import { ResourcesTable } from '@/features/resources/components/resources-table';
import { es } from '@/i18n/es';

export const metadata: Metadata = { title: `${es.resources.title} · ${es.app.name}` };

export default function ResourcesPage() {
  return <ResourcesTable />;
}

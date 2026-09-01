import Chip from '@mui/material/Chip';
import { es } from '@/i18n/es';
import type { ReservationStatus } from '@/lib/api/types';

/**
 * One component for every reservation status, everywhere.
 *
 * Colour comes from the semantic palette, not the brand accent, so rebranding
 * can never make "cancelada" read as "confirmada".
 */
const STYLE: Record<ReservationStatus, { label: string; color: 'success' | 'default' | 'info' }> = {
  CONFIRMED: { label: es.reservations.statusConfirmed, color: 'success' },
  CANCELLED: { label: es.reservations.statusCancelled, color: 'default' },
  COMPLETED: { label: es.reservations.statusCompleted, color: 'info' },
};

export function StatusChip({ status }: { status: ReservationStatus }) {
  const { label, color } = STYLE[status];

  return (
    <Chip
      size="small"
      label={label}
      color={color}
      variant={color === 'default' ? 'outlined' : 'filled'}
    />
  );
}

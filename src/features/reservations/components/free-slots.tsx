'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { es } from '@/i18n/es';
import { formatTime, wallClockToUtc } from '@/lib/dates';
import { reservationsApi } from '../api/reservations.api';

/**
 * The free slots for a resource on a chosen day, as clickable chips.
 *
 * This is the point of the availability endpoint: showing what is free turns
 * most conflicts into something that never happens, rather than something the
 * server has to report after the fact. The 409 handling stays -- someone else
 * can always book between the query and the submit -- but it becomes the rare
 * path instead of the normal one.
 */
export function FreeSlots({
  resourceId,
  date,
  timeZone,
  onPick,
}: {
  resourceId: string;
  date: string;
  timeZone: string;
  onPick: (from: string, to: string) => void;
}) {
  const enabled = Boolean(resourceId && date);

  const { data, isPending } = useQuery({
    // The day is part of the key, so switching back to a day already looked at
    // renders from cache instead of refetching.
    queryKey: ['availability', resourceId, date],
    // Midnight to midnight in the RESOURCE's zone, not the browser's: asking
    // for a UTC day would return the wrong slice for anyone east or west of
    // Greenwich.
    queryFn: () =>
      reservationsApi.availability(
        resourceId,
        wallClockToUtc(date, '00:00', timeZone),
        wallClockToUtc(nextDay(date), '00:00', timeZone),
      ),
    enabled,
  });

  if (!enabled) return null;

  if (isPending) {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} variant="rounded" width={120} height={32} />
        ))}
      </Box>
    );
  }

  if (!data?.length) {
    return (
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {es.availability.noSlots}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {es.availability.freeSlots} · {es.availability.pickHint}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {data.map((slot) => {
          const from = formatTime(slot.startAt, timeZone);
          const to = formatTime(slot.endAt, timeZone);

          return (
            <Chip
              key={slot.startAt}
              label={`${from} – ${to}`}
              variant="outlined"
              color="primary"
              // Clickable and keyboard reachable: onClick alone on a Chip
              // leaves it out of the tab order.
              onClick={() => onPick(from, to)}
            />
          );
        })}
      </Box>
    </Box>
  );
}

/** `2026-12-15` -> `2026-12-16`, without touching time zones. */
function nextDay(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const next = new Date(Date.UTC(year!, month! - 1, day! + 1));
  return next.toISOString().slice(0, 10);
}

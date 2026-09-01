'use client';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { es } from '@/i18n/es';
import { extractConflict, isOverlapConflict, toUserMessage } from '@/lib/api/errors';
import { formatRange, isForeignTimeZone, wallClockToUtc } from '@/lib/dates';
import { resourcesApi } from '@/features/resources/api/resources.api';
import { reservationsApi } from '../api/reservations.api';
import { FreeSlots } from './free-slots';

/** Matches the Period value object on the API. */
const SLOT_SECONDS = 15 * 60;

const EMPTY = { resourceId: '', title: '', date: '', from: '', to: '', notes: '' };

export function BookingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [fields, setFields] = useState(EMPTY);

  /**
   * Generated once per opening, not per attempt.
   *
   * That is what makes a double click or a retry after a dropped connection
   * return the reservation already created instead of a 409. A key per attempt
   * would defeat the whole point.
   */
  const [idempotencyKey, setIdempotencyKey] = useState('');

  useEffect(() => {
    if (!open) return;
    setFields(EMPTY);
    setIdempotencyKey(crypto.randomUUID());
  }, [open]);

  const { data: resources } = useQuery({
    queryKey: ['resources', 'options'],
    queryFn: () => resourcesApi.list({ limit: 100, isActive: true }),
    staleTime: 5 * 60_000,
  });

  const resource = resources?.data.find((entry) => entry.id === fields.resourceId);
  const timeZone = resource?.timeZone ?? 'UTC';

  const create = useMutation({
    mutationFn: () =>
      reservationsApi.create(
        {
          resourceId: fields.resourceId,
          title: fields.title,
          // Converted from the RESOURCE's wall clock, not the browser's: a
          // Madrid room booked from Bogotá must still mean 10:00 in Madrid.
          startAt: wallClockToUtc(fields.date, fields.from, timeZone),
          endAt: wallClockToUtc(fields.date, fields.to, timeZone),
          notes: fields.notes || undefined,
        },
        idempotencyKey,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reservations'] });
      void queryClient.invalidateQueries({ queryKey: ['availability'] });
      onClose();
    },
    onError: () => {
      // A 409 means someone booked between the moment the slots were listed
      // and this submit, so the chips on screen are now a lie. Refetching them
      // turns the error into a next step: the alternatives are already there.
      void queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });

  // The one error worth handling specially. The API returns the exact range
  // that clashes, so the message can name the hours instead of saying "error".
  const conflict = isOverlapConflict(create.error) ? extractConflict(create.error) : null;

  const set = (key: keyof typeof EMPTY) => (value: string) =>
    setFields((current) => ({ ...current, [key]: value }));

  const complete = fields.resourceId && fields.title && fields.date && fields.from && fields.to;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{es.reservations.newReservation}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            select
            size="small"
            label={es.reservations.resource}
            value={fields.resourceId}
            onChange={(event) => set('resourceId')(event.target.value)}
          >
            {resources?.data.map((entry) => (
              <MenuItem key={entry.id} value={entry.id}>
                {entry.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            label={es.reservations.reservationTitle}
            value={fields.title}
            onChange={(event) => set('title')(event.target.value)}
          />

          <TextField
            type="date"
            size="small"
            label={es.reservations.date}
            value={fields.date}
            slotProps={{ inputLabel: { shrink: true } }}
            onChange={(event) => set('date')(event.target.value)}
          />

          <FreeSlots
            resourceId={fields.resourceId}
            date={fields.date}
            timeZone={timeZone}
            onPick={(from, to) => setFields((current) => ({ ...current, from, to }))}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              type="time"
              size="small"
              label={es.reservations.from}
              value={fields.from}
              sx={{ flex: 1 }}
              // 15-minute steps, because Period rejects anything else. Better
              // for the picker to offer only valid values than for the server
              // to explain afterwards.
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: SLOT_SECONDS } }}
              onChange={(event) => set('from')(event.target.value)}
            />
            <TextField
              type="time"
              size="small"
              label={es.reservations.to}
              value={fields.to}
              sx={{ flex: 1 }}
              helperText={es.reservations.endExclusive}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: SLOT_SECONDS } }}
              onChange={(event) => set('to')(event.target.value)}
            />
          </Box>

          {/* Only when it differs from the viewer's, so the common case stays
              uncluttered and the surprising one is called out. */}
          {resource && isForeignTimeZone(timeZone) && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {es.reservations.timeZoneNote(timeZone)}
            </Typography>
          )}

          <TextField
            size="small"
            multiline
            minRows={2}
            label={es.reservations.notes}
            value={fields.notes}
            onChange={(event) => set('notes')(event.target.value)}
          />

          {conflict && (
            <Alert severity="warning">
              <AlertTitle>{es.errors.overlap}</AlertTitle>
              {es.errors.overlapDetail(
                formatRange(conflict.startAt, conflict.endAt, timeZone),
                resource?.name ?? '',
              )}
            </Alert>
          )}

          {create.error && !conflict && (
            <Alert severity="error">{toUserMessage(create.error)}</Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{es.common.cancel}</Button>
        <Button
          variant="contained"
          disabled={create.isPending || !complete}
          onClick={() => create.mutate()}
        >
          {es.reservations.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

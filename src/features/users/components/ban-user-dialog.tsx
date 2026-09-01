'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { es } from '@/i18n/es';
import { toUserMessage } from '@/lib/api/errors';
import type { User } from '@/lib/api/types';
import { usersApi } from '../api/users.api';

export function BanUserDialog({ user, onClose }: { user: User | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const [days, setDays] = useState('');

  useEffect(() => {
    if (user) {
      setReason('');
      setDays('');
    }
  }, [user]);

  const ban = useMutation({
    mutationFn: () =>
      usersApi.ban(user!.id, {
        reason: reason || undefined,
        // Empty means indefinite, not zero days.
        days: days ? Number(days) : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  return (
    <Dialog open={Boolean(user)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{es.users.banTitle}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {/* Names the consequence rather than asking "are you sure?", which
              tells the reader nothing they did not already know. */}
          <DialogContentText sx={{ fontSize: 14 }}>
            {es.users.banWarning(user?.name ?? '', user?.activeReservations ?? 0)}
          </DialogContentText>

          <TextField
            size="small"
            label={es.users.banReason}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />

          <TextField
            size="small"
            type="number"
            label={es.users.banDays}
            value={days}
            helperText={es.users.banDaysHint}
            slotProps={{ htmlInput: { min: 1 } }}
            onChange={(event) => setDays(event.target.value)}
          />

          {ban.error && <Alert severity="error">{toUserMessage(ban.error)}</Alert>}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{es.common.cancel}</Button>
        <Button
          color="error"
          variant="contained"
          disabled={ban.isPending}
          onClick={() => ban.mutate()}
        >
          {es.users.ban}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

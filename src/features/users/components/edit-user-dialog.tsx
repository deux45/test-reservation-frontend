'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { es } from '@/i18n/es';
import { toUserMessage } from '@/lib/api/errors';
import type { User } from '@/lib/api/types';
import { usersApi } from '../api/users.api';

export function EditUserDialog({ user, onClose }: { user: User | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const save = useMutation({
    mutationFn: () => usersApi.update(user!.id, { name, email }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const emailChanged = Boolean(user) && email !== user!.email;

  return (
    <Dialog open={Boolean(user)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{es.users.editUser}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            size="small"
            label={es.users.name}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <TextField
            size="small"
            type="email"
            label={es.users.email}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          {/* The email is the credential this person signs in with. Saying so
              before saving beats explaining it afterwards to someone who can
              no longer get in. */}
          {emailChanged && <Alert severity="warning">{es.users.emailChangeWarning}</Alert>}

          {save.error && <Alert severity="error">{toUserMessage(save.error)}</Alert>}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{es.common.cancel}</Button>
        <Button
          variant="contained"
          disabled={save.isPending || !name || !email}
          onClick={() => save.mutate()}
        >
          {es.common.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { es } from '@/i18n/es';
import { toUserMessage } from '@/lib/api/errors';
import type { UserRole } from '@/lib/api/types';
import { usersApi } from '../api/users.api';

const EMPTY = { email: '', name: '', password: '', role: 'user' as UserRole };

/** Mirrors the API, which mirrors Better Auth's minPasswordLength. */
const MIN_PASSWORD = 10;

export function CreateUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [fields, setFields] = useState(EMPTY);

  // Cleared on each opening, so reopening never shows the previous attempt --
  // which for a password field would be a small but real leak.
  useEffect(() => {
    if (open) setFields(EMPTY);
  }, [open]);

  const create = useMutation({
    mutationFn: () => usersApi.create(fields),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const passwordTooShort = fields.password.length > 0 && fields.password.length < MIN_PASSWORD;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{es.users.newUser}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            size="small"
            label={es.users.name}
            value={fields.name}
            onChange={(event) => setFields({ ...fields, name: event.target.value })}
          />

          <TextField
            size="small"
            type="email"
            label={es.users.email}
            value={fields.email}
            onChange={(event) => setFields({ ...fields, email: event.target.value })}
          />

          <TextField
            size="small"
            type="password"
            label={es.auth.password}
            value={fields.password}
            autoComplete="new-password"
            error={passwordTooShort}
            helperText={es.users.passwordHint}
            onChange={(event) => setFields({ ...fields, password: event.target.value })}
          />

          <TextField
            select
            size="small"
            label={es.users.role}
            value={fields.role}
            onChange={(event) => setFields({ ...fields, role: event.target.value as UserRole })}
          >
            <MenuItem value="user">{es.users.roleUser}</MenuItem>
            <MenuItem value="admin">{es.users.roleAdmin}</MenuItem>
          </TextField>

          {create.error && <Alert severity="error">{toUserMessage(create.error)}</Alert>}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{es.common.cancel}</Button>
        <Button
          variant="contained"
          disabled={
            create.isPending ||
            !fields.name ||
            !fields.email ||
            fields.password.length < MIN_PASSWORD
          }
          onClick={() => create.mutate()}
        >
          {es.common.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

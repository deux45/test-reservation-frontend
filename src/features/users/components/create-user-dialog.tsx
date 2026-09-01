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

const EMPTY = {
  email: '',
  name: '',
  password: '',
  passwordConfirm: '',
  role: 'user' as UserRole,
};

/** Mirrors the API, which mirrors Better Auth's minPasswordLength. */
const MIN_PASSWORD = 10;

export function CreateUserDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [fields, setFields] = useState(EMPTY);

  // Cleared on every opening, so reopening never shows the previous attempt --
  // which for a password field would be a small but real leak.
  useEffect(() => {
    if (open) setFields(EMPTY);
  }, [open]);

  const create = useMutation({
    mutationFn: () =>
      // passwordConfirm never leaves the browser: it exists to catch a typo,
      // and the server has no use for it.
      usersApi.create({
        email: fields.email,
        name: fields.name,
        password: fields.password,
        role: fields.role,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const tooShort = fields.password.length > 0 && fields.password.length < MIN_PASSWORD;

  // Only flagged once the confirmation has been typed into. Complaining while
  // someone is still typing the second field is noise, not help.
  const mismatch = fields.passwordConfirm.length > 0 && fields.password !== fields.passwordConfirm;

  const canSave =
    !create.isPending &&
    Boolean(fields.name) &&
    Boolean(fields.email) &&
    fields.password.length >= MIN_PASSWORD &&
    fields.password === fields.passwordConfirm;

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
            error={tooShort}
            helperText={tooShort ? es.users.passwordTooShort : es.users.passwordHint}
            onChange={(event) => setFields({ ...fields, password: event.target.value })}
          />

          <TextField
            size="small"
            type="password"
            label={es.users.passwordConfirm}
            value={fields.passwordConfirm}
            autoComplete="new-password"
            error={mismatch}
            helperText={mismatch ? es.users.passwordMismatch : undefined}
            onChange={(event) => setFields({ ...fields, passwordConfirm: event.target.value })}
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
        <Button variant="contained" disabled={!canSave} onClick={() => create.mutate()}>
          {es.common.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

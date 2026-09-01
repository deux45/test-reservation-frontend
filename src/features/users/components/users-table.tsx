'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { es } from '@/i18n/es';
import { toUserMessage } from '@/lib/api/errors';
import type { User, UserRole } from '@/lib/api/types';
import { useSession } from '@/lib/auth-client';
import { monoFontFamily } from '@/theme/theme';
import { usersApi } from '../api/users.api';
import { BanUserDialog } from './ban-user-dialog';
import { CreateUserDialog } from './create-user-dialog';

export function UsersTable() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const [creating, setCreating] = useState(false);
  const [banning, setBanning] = useState<User | null>(null);

  const { data, isPending, error } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: () => usersApi.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['users'] });

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => usersApi.updateRole(id, role),
    onSuccess: invalidate,
  });

  const unban = useMutation({
    mutationFn: (id: string) => usersApi.unban(id),
    onSuccess: invalidate,
  });

  if (error) return <Alert severity="error">{toUserMessage(error)}</Alert>;

  const busy = changeRole.isPending || unban.isPending;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {isPending
            ? es.common.loading
            : `${data?.meta.total ?? 0} ${es.users.title.toLowerCase()}`}
        </Typography>
        <Button variant="contained" onClick={() => setCreating(true)}>
          {es.users.newUser}
        </Button>
      </Box>

      {changeRole.error && <Alert severity="error">{toUserMessage(changeRole.error)}</Alert>}
      {unban.error && <Alert severity="error">{toUserMessage(unban.error)}</Alert>}

      <Paper elevation={1}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>{es.users.name}</TableCell>
              <TableCell>{es.users.email}</TableCell>
              <TableCell>{es.users.activeReservations}</TableCell>
              <TableCell>{es.users.status}</TableCell>
              <TableCell>{es.users.role}</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>

          <TableBody>
            {isPending &&
              Array.from({ length: 3 }, (_, row) => (
                <TableRow key={row}>
                  {Array.from({ length: 6 }, (_cell, index) => (
                    <TableCell key={index}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {data?.data.map((user) => {
              const isSelf = user.id === session?.user?.id;

              return (
                <TableRow key={user.id} hover>
                  <TableCell>
                    {user.name}
                    {/* Marking your own row explains why its controls are
                        disabled, instead of leaving them looking broken. */}
                    {isSelf && <Chip size="small" label="tú" sx={{ ml: 1 }} variant="outlined" />}
                  </TableCell>
                  <TableCell
                    sx={{ fontFamily: monoFontFamily, fontSize: 13, color: 'text.secondary' }}
                  >
                    {user.email}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{user.activeReservations}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={user.banned ? es.users.blocked : es.users.enabled}
                      color={user.banned ? 'error' : 'success'}
                      variant={user.banned ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={user.role}
                      // An admin cannot demote themselves. The API refuses it
                      // too; disabling here avoids offering an action that can
                      // only fail.
                      disabled={isSelf || busy}
                      onChange={(event) =>
                        changeRole.mutate({ id: user.id, role: event.target.value as UserRole })
                      }
                      sx={{ minWidth: 150 }}
                    >
                      <MenuItem value="admin">{es.users.roleAdmin}</MenuItem>
                      <MenuItem value="user">{es.users.roleUser}</MenuItem>
                    </TextField>
                  </TableCell>
                  <TableCell align="right">
                    {user.banned ? (
                      <Button size="small" disabled={busy} onClick={() => unban.mutate(user.id)}>
                        {es.users.unban}
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        color="error"
                        disabled={isSelf || busy}
                        onClick={() => setBanning(user)}
                      >
                        {es.users.ban}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <CreateUserDialog open={creating} onClose={() => setCreating(false)} />
      <BanUserDialog user={banning} onClose={() => setBanning(null)} />

      <Typography sx={{ fontFamily: monoFontFamily, fontSize: 12, color: 'text.secondary' }}>
        GET · POST /api/v1/users · PATCH /api/v1/users/:id/role · POST · DELETE
        /api/v1/users/:id/ban
      </Typography>
    </Box>
  );
}

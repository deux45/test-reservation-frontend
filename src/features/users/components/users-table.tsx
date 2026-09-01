'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
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
import { es } from '@/i18n/es';
import { toUserMessage } from '@/lib/api/errors';
import type { UserRole } from '@/lib/api/types';
import { useSession } from '@/lib/auth-client';
import { monoFontFamily } from '@/theme/theme';
import { usersApi } from '../api/users.api';

export function UsersTable() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const { data, isPending, error } = useQuery({
    queryKey: ['users', 'list'],
    queryFn: () => usersApi.list(),
  });

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => usersApi.updateRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  if (error) return <Alert severity="error">{toUserMessage(error)}</Alert>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {changeRole.error && <Alert severity="error">{toUserMessage(changeRole.error)}</Alert>}

      <Paper elevation={1}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>{es.users.name}</TableCell>
              <TableCell>{es.users.email}</TableCell>
              <TableCell>{es.users.activeReservations}</TableCell>
              <TableCell>{es.users.role}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isPending &&
              Array.from({ length: 3 }, (_, row) => (
                <TableRow key={row}>
                  {Array.from({ length: 4 }, (_cell, index) => (
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
                    {/* Marking your own row explains why its control is
                        disabled, instead of leaving it looking broken. */}
                    {isSelf && <Chip size="small" label="tú" sx={{ ml: 1 }} variant="outlined" />}
                  </TableCell>
                  <TableCell
                    sx={{ fontFamily: monoFontFamily, fontSize: 13, color: 'text.secondary' }}
                  >
                    {user.email}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{user.activeReservations}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={user.role}
                      // An admin cannot demote themselves. The API refuses it
                      // too; disabling here just avoids offering an action
                      // that can only fail.
                      disabled={isSelf || changeRole.isPending}
                      onChange={(event) =>
                        changeRole.mutate({ id: user.id, role: event.target.value as UserRole })
                      }
                      sx={{ minWidth: 160 }}
                    >
                      <MenuItem value="admin">{es.users.roleAdmin}</MenuItem>
                      <MenuItem value="user">{es.users.roleUser}</MenuItem>
                    </TextField>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Typography sx={{ fontFamily: monoFontFamily, fontSize: 12, color: 'text.secondary' }}>
        GET /api/v1/users · PATCH /api/v1/users/:id/role
      </Typography>
    </Box>
  );
}

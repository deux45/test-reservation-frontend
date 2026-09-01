'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { es } from '@/i18n/es';
import { toUserMessage } from '@/lib/api/errors';
import type { ReservationStatus } from '@/lib/api/types';
import { formatRange } from '@/lib/dates';
import { monoFontFamily } from '@/theme/theme';
import { resourcesApi } from '@/features/resources/api/resources.api';
import { reservationsApi } from '../api/reservations.api';
import { StatusChip } from './status-chip';

const ALL = 'all';

export function ReservationsTable() {
  const queryClient = useQueryClient();

  const [resourceId, setResourceId] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const filters = {
    resourceId: resourceId === ALL ? undefined : resourceId,
    status: status === ALL ? undefined : ([status] as ReservationStatus[]),
    from: from ? new Date(`${from}T00:00:00Z`).toISOString() : undefined,
    to: to ? new Date(`${to}T23:59:59Z`).toISOString() : undefined,
    page: page + 1, // the API is 1-based, MUI's TablePagination is 0-based
    limit,
  };

  // The filters are part of the cache key, so switching back to a previous
  // combination renders instantly from cache instead of refetching.
  const { data, isPending, error } = useQuery({
    queryKey: ['reservations', 'list', filters],
    queryFn: () => reservationsApi.list(filters),
  });

  const { data: resources } = useQuery({
    queryKey: ['resources', 'options'],
    queryFn: () => resourcesApi.list({ limit: 100, isActive: true }),
    staleTime: 5 * 60_000,
  });

  const cancel = useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id),
    onSuccess: () => {
      // Availability changes too: the cancelled slot is free immediately,
      // because the database constraint only indexes CONFIRMED rows.
      void queryClient.invalidateQueries({ queryKey: ['reservations'] });
      void queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });

  const resetPage =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      // Staying on page 4 of a result set that now has one page shows an empty
      // table and looks like a bug.
      setPage(0);
    };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper
        elevation={1}
        sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}
      >
        <TextField
          select
          size="small"
          label={es.reservations.filterResource}
          value={resourceId}
          onChange={(event) => resetPage(setResourceId)(event.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value={ALL}>{es.reservations.all}</MenuItem>
          {resources?.data.map((resource) => (
            <MenuItem key={resource.id} value={resource.id}>
              {resource.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label={es.reservations.filterStatus}
          value={status}
          onChange={(event) => resetPage(setStatus)(event.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value={ALL}>{es.reservations.all}</MenuItem>
          <MenuItem value="CONFIRMED">{es.reservations.statusConfirmed}</MenuItem>
          <MenuItem value="CANCELLED">{es.reservations.statusCancelled}</MenuItem>
          <MenuItem value="COMPLETED">{es.reservations.statusCompleted}</MenuItem>
        </TextField>

        <TextField
          type="date"
          size="small"
          label={es.reservations.from}
          value={from}
          onChange={(event) => resetPage(setFrom)(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          type="date"
          size="small"
          label={es.reservations.to}
          value={to}
          onChange={(event) => resetPage(setTo)(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Paper>

      {error && <Alert severity="error">{toUserMessage(error)}</Alert>}
      {cancel.error && <Alert severity="error">{toUserMessage(cancel.error)}</Alert>}

      <Paper elevation={1}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>{es.reservations.resource}</TableCell>
              <TableCell>{es.reservations.reservationTitle}</TableCell>
              <TableCell>{es.reservations.range}</TableCell>
              <TableCell>{es.reservations.filterStatus}</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>

          <TableBody>
            {isPending &&
              Array.from({ length: 5 }, (_, row) => (
                <TableRow key={row}>
                  {Array.from({ length: 5 }, (_cell, index) => (
                    <TableCell key={index}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography sx={{ fontWeight: 500 }}>{es.reservations.emptyTitle}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {es.reservations.emptyBody}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {data?.data.map((reservation) => {
              // Rendered in the RESOURCE's zone, not the browser's: a room in
              // Madrid is booked at Madrid's wall clock whoever is looking.
              const timeZone = reservation.resource?.timeZone ?? 'UTC';

              return (
                <TableRow key={reservation.id} hover>
                  <TableCell>{reservation.resource?.name ?? '—'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{reservation.title}</TableCell>
                  <TableCell
                    sx={{ fontFamily: monoFontFamily, fontSize: 13, color: 'text.secondary' }}
                  >
                    {formatRange(reservation.startAt, reservation.endAt, timeZone)}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={reservation.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="error"
                      disabled={reservation.status !== 'CONFIRMED' || cancel.isPending}
                      onClick={() => cancel.mutate(reservation.id)}
                    >
                      {es.reservations.cancel}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={data?.meta.total ?? 0}
          page={page}
          onPageChange={(_event, next) => setPage(next)}
          rowsPerPage={limit}
          rowsPerPageOptions={[10, 20, 50]}
          onRowsPerPageChange={(event) => {
            setLimit(Number(event.target.value));
            setPage(0);
          }}
          labelRowsPerPage={es.reservations.rowsPerPage}
          labelDisplayedRows={({ from: a, to: b, count }) => `${a}–${b} ${es.common.of} ${count}`}
        />
      </Paper>

      <Typography sx={{ fontFamily: monoFontFamily, fontSize: 12, color: 'text.secondary' }}>
        GET /api/v1/reservations?resourceId=&amp;status=&amp;from=&amp;to=&amp;page=&amp;limit= ·
        POST /api/v1/reservations/:id/cancellation
      </Typography>
    </Box>
  );
}

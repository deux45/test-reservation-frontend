'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { Resource } from '@/lib/api/types';
import { ResourceDialog } from './resource-dialog';
import { resourcesApi } from '../api/resources.api';
import { es } from '@/i18n/es';
import { toUserMessage } from '@/lib/api/errors';
import { monoFontFamily } from '@/theme/theme';

const COLUMNS = [
  es.resources.name,
  es.resources.type,
  es.resources.capacity,
  es.resources.status,
  '',
];

export function ResourcesTable() {
  const queryClient = useQueryClient();

  // undefined = closed. null = creating. A resource = editing that one.
  const [editing, setEditing] = useState<Resource | null | undefined>(undefined);

  const { data, isPending, error } = useQuery({
    queryKey: ['resources', 'list'],
    queryFn: () => resourcesApi.list({ limit: 50 }),
  });

  const toggle = useMutation({
    // Returns void on both branches: deactivate() answers 204 and activate()
    // answers the resource, and a union of the two would be a return type no
    // caller can use. The refetch below is what updates the table either way.
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }): Promise<void> => {
      if (isActive) await resourcesApi.deactivate(id);
      else await resourcesApi.activate(id);
    },
    // Refetch rather than patch the cache by hand: deactivation is a server
    // decision that can be refused, so the server's answer is the truth.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resources'] }),
  });

  if (error) return <Alert severity="error">{toUserMessage(error)}</Alert>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {isPending
            ? es.common.loading
            : `${data?.meta.total ?? 0} ${es.resources.title.toLowerCase()}`}
        </Typography>
        <Button variant="contained" onClick={() => setEditing(null)}>
          {es.resources.newResource}
        </Button>
      </Box>

      <Paper elevation={1}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              {COLUMNS.map((label, index) => (
                <TableCell
                  key={label || index}
                  align={index === COLUMNS.length - 1 ? 'right' : 'left'}
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {isPending &&
              // Skeleton rows rather than a centred spinner: the table's shape
              // stays put, so nothing jumps when the data lands.
              Array.from({ length: 4 }, (_, row) => (
                <TableRow key={row}>
                  {COLUMNS.map((_label, cell) => (
                    <TableCell key={cell}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {data?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length}>
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography sx={{ fontWeight: 500 }}>{es.resources.emptyTitle}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {es.resources.emptyBody}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {data?.data.map((resource) => (
              <TableRow key={resource.id} hover>
                <TableCell>{resource.name}</TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>
                  {resource.resourceType?.name ?? '—'}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{resource.capacity ?? '—'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={resource.isActive ? es.resources.active : es.resources.inactive}
                    color={resource.isActive ? 'success' : 'default'}
                    variant={resource.isActive ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => setEditing(resource)}>
                    {es.resources.edit}
                  </Button>
                  <Button
                    size="small"
                    disabled={toggle.isPending}
                    onClick={() => toggle.mutate({ id: resource.id, isActive: resource.isActive })}
                  >
                    {resource.isActive ? es.resources.deactivate : es.resources.activate}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {toggle.error && <Alert severity="error">{toUserMessage(toggle.error)}</Alert>}

      <ResourceDialog
        open={editing !== undefined}
        resource={editing ?? undefined}
        onClose={() => setEditing(undefined)}
      />

      <Typography sx={{ fontFamily: monoFontFamily, fontSize: 12, color: 'text.secondary' }}>
        GET /api/v1/resources · DELETE /api/v1/resources/:id (baja lógica) · POST
        /api/v1/resources/:id/activation
      </Typography>
    </Box>
  );
}

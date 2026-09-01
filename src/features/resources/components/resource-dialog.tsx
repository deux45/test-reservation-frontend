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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { es } from '@/i18n/es';
import { ApiError } from '@/lib/api/client';
import { toUserMessage } from '@/lib/api/errors';
import type { Resource } from '@/lib/api/types';
import { resourcesApi } from '../api/resources.api';
import { AttributesFields } from './attributes-fields';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Present when editing. Absent when creating. */
  resource?: Resource;
}

/**
 * The resource's time zone is not edited here.
 *
 * It still exists on the resource and still matters -- operating hours are
 * wall-clock in it, and the reservations table renders every time in it -- but
 * asking for an IANA identifier in a free-text field asks the wrong person the
 * wrong question. New resources take the API's default, UTC.
 */
const EMPTY = { code: '', name: '', description: '', location: '' };

export function ResourceDialog({ open, onClose, resource }: Props) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(resource);

  const [typeId, setTypeId] = useState('');
  const [fields, setFields] = useState(EMPTY);
  const [attributes, setAttributes] = useState<Record<string, unknown>>({});

  const { data: types } = useQuery({
    queryKey: ['resource-types'],
    queryFn: () => resourcesApi.listTypes(),
    staleTime: 5 * 60_000,
  });

  // Refills the form each time the dialog opens, so reopening after a cancel
  // does not show the previous attempt's half-typed values.
  useEffect(() => {
    if (!open) return;

    setTypeId(resource?.resourceType?.id ?? '');
    setAttributes(resource?.attributes ?? {});
    setFields(
      resource
        ? {
            code: resource.code,
            name: resource.name,
            description: resource.description ?? '',
            location: resource.location ?? '',
          }
        : EMPTY,
    );
  }, [open, resource]);

  const selectedType = types?.find((type) => type.id === typeId);

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name: fields.name,
        description: fields.description || undefined,
        location: fields.location || undefined,
        attributes,
      };

      // code and resourceTypeId are omitted when editing: the API rejects
      // them, because changing either would invalidate the attributes already
      // stored against the type's schema.
      return isEdit
        ? resourcesApi.update(resource!.id, payload)
        : resourcesApi.create({ ...payload, code: fields.code, resourceTypeId: typeId });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['resources'] });
      onClose();
    },
  });

  // The server validates attributes with ajv and returns every violation.
  // Rendering them beside the fields beats one opaque sentence at the top.
  const violations =
    save.error instanceof ApiError
      ? ((save.error.problem as { violations?: string[] }).violations ?? undefined)
      : undefined;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? es.resources.editResource : es.resources.newResource}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            select
            size="small"
            label={es.resources.type}
            value={typeId}
            // Immutable after creation: the type decides which attribute
            // schema applies, so changing it would orphan the stored values.
            disabled={isEdit}
            onChange={(event) => {
              setTypeId(event.target.value);
              setAttributes({});
            }}
          >
            {types?.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            label={es.resources.code}
            value={fields.code}
            disabled={isEdit}
            helperText={isEdit ? undefined : es.resources.codeHint}
            onChange={(event) => setFields({ ...fields, code: event.target.value })}
          />

          <TextField
            size="small"
            label={es.resources.name}
            value={fields.name}
            onChange={(event) => setFields({ ...fields, name: event.target.value })}
          />

          <TextField
            size="small"
            label={es.resources.location}
            value={fields.location}
            onChange={(event) => setFields({ ...fields, location: event.target.value })}
          />

          {selectedType && (
            <AttributesFields
              schema={selectedType.attributesSchema}
              values={attributes}
              onChange={setAttributes}
              errors={violations}
            />
          )}

          {save.error && !violations && <Alert severity="error">{toUserMessage(save.error)}</Alert>}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{es.common.cancel}</Button>
        <Button
          variant="contained"
          disabled={save.isPending || !fields.name || (!isEdit && (!typeId || !fields.code))}
          onClick={() => save.mutate()}
        >
          {es.common.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

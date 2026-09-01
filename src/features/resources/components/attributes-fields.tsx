'use client';

import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { es } from '@/i18n/es';

/** The subset of JSON Schema this form renders. */
interface SchemaProperty {
  type?: 'string' | 'integer' | 'number' | 'boolean';
  title?: string;
  description?: string;
  enum?: (string | number)[];
  minimum?: number;
  maximum?: number;
}

interface AttributesSchema {
  properties?: Record<string, SchemaProperty>;
  required?: string[];
}

/**
 * Builds the attribute form from the resource type's JSON Schema.
 *
 * This is the generic model paying off in the interface. A new resource type
 * is a row in the database, and the form for it appears here without a
 * deployment -- if this component hard-coded "floor" and "hasProjector", every
 * new type would need a frontend release too.
 *
 * The server validates the same schema with ajv and is the authority. This
 * exists so a user is guided rather than guessing, not to replace that check.
 */
export function AttributesFields({
  schema,
  values,
  onChange,
  errors,
}: {
  schema: Record<string, unknown>;
  values: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  errors?: string[];
}) {
  const parsed = schema as AttributesSchema;
  const properties = Object.entries(parsed.properties ?? {});

  // A type that declares no attributes shows no section at all, rather than an
  // empty box the user has to wonder about.
  if (properties.length === 0) return null;

  const required = new Set(parsed.required ?? []);
  const set = (key: string, value: unknown) => onChange({ ...values, [key]: value });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {es.resources.attributesHint}
      </Typography>

      {properties.map(([key, property]) => {
        const label = `${property.title ?? key}${required.has(key) ? ' *' : ''}`;
        const value = values[key];

        if (property.type === 'boolean') {
          return (
            <FormControlLabel
              key={key}
              control={
                <Checkbox
                  checked={Boolean(value)}
                  onChange={(event) => set(key, event.target.checked)}
                />
              }
              label={label}
            />
          );
        }

        if (property.enum) {
          return (
            <TextField
              key={key}
              select
              size="small"
              label={label}
              value={value ?? ''}
              helperText={property.description}
              onChange={(event) => set(key, event.target.value)}
            >
              {property.enum.map((option) => (
                <MenuItem key={String(option)} value={option}>
                  {String(option)}
                </MenuItem>
              ))}
            </TextField>
          );
        }

        const numeric = property.type === 'integer' || property.type === 'number';

        return (
          <TextField
            key={key}
            size="small"
            type={numeric ? 'number' : 'text'}
            label={label}
            value={value ?? ''}
            helperText={property.description}
            slotProps={{ htmlInput: { min: property.minimum, max: property.maximum } }}
            onChange={(event) => {
              const raw = event.target.value;
              // An empty numeric field is "not provided", not 0. Sending 0
              // would silently satisfy a `minimum: 0` the user never answered.
              if (raw === '') return set(key, undefined);
              set(key, numeric ? Number(raw) : raw);
            }}
          />
        );
      })}

      {/* The server's ajv violations, verbatim. It knows the whole schema;
          this form only renders the part it understands. */}
      {errors?.map((error) => (
        <Typography key={error} variant="caption" sx={{ color: 'error.main' }}>
          {error}
        </Typography>
      ))}
    </Box>
  );
}

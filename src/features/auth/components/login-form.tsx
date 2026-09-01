'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { es } from '@/i18n/es';
import { signIn } from '@/lib/auth-client';
import { BrandMark } from './brand-mark';

/**
 * Shape only. Whether the credentials are correct is the server's answer, and
 * duplicating that judgement here would only produce two sources of truth
 * that disagree.
 */
const schema = z.object({
  email: z.email({ message: 'Introduce un correo válido' }),
  password: z.string().min(1, { message: 'Introduce tu contraseña' }),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const { error } = await signIn.email({
      email: values.email,
      password: values.password,
    });

    if (error) {
      // Deliberately the same message whatever the cause. Distinguishing
      // "no such user" from "wrong password" turns the login form into an
      // account enumeration oracle.
      setServerError(es.auth.invalidCredentials);
      return;
    }

    router.push('/resources');
    router.refresh();
  });

  return (
    <Paper elevation={8} sx={{ width: 400, maxWidth: '100%', p: 4 }}>
      <Box sx={{ mb: 3.5 }}>
        <BrandMark />
      </Box>

      <Box
        component="form"
        onSubmit={onSubmit}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
      >
        <TextField
          {...register('email')}
          label={es.auth.email}
          type="email"
          autoComplete="email"
          autoFocus
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          {...register('password')}
          label={es.auth.password}
          type="password"
          autoComplete="current-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        {/* role="alert" so a screen reader announces the failure instead of
            leaving the user wondering why nothing happened. */}
        {serverError && <Alert severity="error">{serverError}</Alert>}

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? es.auth.signingIn : es.auth.signIn}
        </Button>

        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          {es.auth.hint}
        </Typography>
      </Box>
    </Paper>
  );
}

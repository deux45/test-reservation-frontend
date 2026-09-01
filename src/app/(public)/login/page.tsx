import Box from '@mui/material/Box';
import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';
import { es } from '@/i18n/es';

export const metadata: Metadata = { title: `${es.auth.signInTitle} · ${es.app.name}` };

export default function LoginPage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        p: 3,
      }}
    >
      <LoginForm />
    </Box>
  );
}

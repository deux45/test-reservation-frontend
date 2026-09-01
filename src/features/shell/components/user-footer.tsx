'use client';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { es } from '@/i18n/es';
import { signOut, useSession } from '@/lib/auth-client';

/** "Ana Lopez" -> "AL". Falls back to the email when there is no name. */
function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source
    .split(/[\s.@]+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '?';
}

export function UserFooter() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width={110} />
      </Box>
    );
  }

  const user = session?.user;
  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          fontSize: 13,
          bgcolor: 'action.selected',
          color: 'text.secondary',
        }}
      >
        {initials(user.name ?? '', user.email)}
      </Avatar>

      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: 13 }}>
          {user.name || user.email}
        </Typography>
        {/* A button, not a styled div: signing out is an action, and it has to
            be reachable by keyboard. */}
        <Link
          component="button"
          type="button"
          onClick={handleSignOut}
          sx={{ fontSize: 12, cursor: 'pointer' }}
        >
          {es.auth.signOut}
        </Link>
      </Box>
    </Box>
  );
}

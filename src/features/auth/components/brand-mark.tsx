import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { es } from '@/i18n/es';

/**
 * The square "R" badge plus wordmark from the mockup.
 *
 * One component rather than two copies, because it appears in both the login
 * card and the sidebar at different sizes.
 */
export function BrandMark({
  size = 40,
  showTagline = true,
}: {
  size?: number;
  showTagline?: boolean;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: showTagline ? 1.5 : 1.25 }}>
      <Box
        aria-hidden
        sx={{
          width: size,
          height: size,
          borderRadius: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.45,
          fontWeight: 500,
          flex: 'none',
        }}
      >
        R
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="div"
          sx={{ fontSize: showTagline ? 20 : 16, fontWeight: 500, letterSpacing: '.15px' }}
        >
          {es.app.name}
        </Typography>
        {showTagline && (
          <Typography component="div" sx={{ fontSize: 13, color: 'text.secondary' }}>
            {es.app.tagline}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

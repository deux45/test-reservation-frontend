import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { es } from '@/i18n/es';

export default function HomePage() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, py: 12 }}>
        {/* MUI v9 dropped the loose system props on Typography: styling goes
            through sx, not fontWeight/color as top-level props. */}
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {es.app.name}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>{es.app.tagline}</Typography>
      </Box>
    </Container>
  );
}

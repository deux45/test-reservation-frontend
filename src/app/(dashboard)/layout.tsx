import Box from '@mui/material/Box';
import { DashboardShell } from '@/features/shell/components/dashboard-shell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      <DashboardShell>{children}</DashboardShell>
    </Box>
  );
}

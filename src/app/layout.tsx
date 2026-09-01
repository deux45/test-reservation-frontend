import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { roboto, robotoMono } from '@/theme/fonts';
import { theme } from '@/theme/theme';
import { QueryProvider } from './query-provider';
import { es } from '@/i18n/es';

export const metadata: Metadata = {
  title: es.app.name,
  description: es.app.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${roboto.variable} ${robotoMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Sets the colour scheme before first paint, so a dark-mode user
            never sees a white flash that then corrects itself. */}
        <InitColorSchemeScript attribute="data-mui-color-scheme" />

        {/* Emotion needs its cache wired to the App Router or styles are
            injected twice and the server and client markup disagree. */}
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme} defaultMode="system">
            <CssBaseline />
            <QueryProvider>{children}</QueryProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

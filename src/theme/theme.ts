'use client';

import { createTheme } from '@mui/material/styles';

/**
 * Single theme with both colour schemes.
 *
 * cssVariables + colorSchemes means MUI emits CSS custom properties and lets
 * the browser pick, so the first server-rendered paint already matches the
 * user's preference instead of flashing light and correcting on hydrate.
 */
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-mui-color-scheme' },

  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#0E6C6E' },
        secondary: { main: '#A2650B' },
        background: { default: '#F5F7F8', paper: '#FFFFFF' },
        // Semantic colours for reservation status. Kept separate from the
        // accent so a brand change never makes "cancelled" look confirmed.
        success: { main: '#2C6B3C' },
        warning: { main: '#A2650B' },
        error: { main: '#A03540' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#45B1AE' },
        secondary: { main: '#D3963C' },
        background: { default: '#0F1418', paper: '#161D22' },
        success: { main: '#71B280' },
        warning: { main: '#D3963C' },
        error: { main: '#DD7E88' },
      },
    },
  },

  shape: { borderRadius: 6 },

  typography: {
    fontFamily: 'var(--font-sans), system-ui, -apple-system, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },

  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    // Never remove the focus ring: keyboard users lose all orientation.
    MuiCssBaseline: {
      styleOverrides: {
        ':focus-visible': { outlineOffset: '2px' },
      },
    },
  },
});

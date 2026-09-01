'use client';

import { createTheme } from '@mui/material/styles';
import { roboto, robotoMono } from './fonts';

/**
 * Material Design, matching the approved mockup.
 *
 * The mockup is plain Material: #1976d2 primary, 4px radius, Roboto, the
 * standard elevation shadows. Rather than reproduce its inline styles, the
 * values are set here once so every component inherits them -- which is the
 * difference between a design that survives the next screen and one that has
 * to be re-pasted into it.
 */
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data-mui-color-scheme' },

  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#1976d2', dark: '#1565c0', contrastText: '#fff' },
        background: { default: '#fafafa', paper: '#fff' },
        text: { primary: 'rgba(0,0,0,.87)', secondary: 'rgba(0,0,0,.6)' },
        divider: 'rgba(0,0,0,.12)',
        success: { main: '#2e7d32' },
        warning: { main: '#ed6c02' },
        error: { main: '#d32f2f' },
      },
    },
    // The mockup is light-only, but the viewer's OS may not be. Rather than
    // force one, the dark scheme keeps the same hues at accessible contrast.
    dark: {
      palette: {
        primary: { main: '#90caf9', dark: '#42a5f5', contrastText: 'rgba(0,0,0,.87)' },
        background: { default: '#121212', paper: '#1e1e1e' },
        success: { main: '#66bb6a' },
        warning: { main: '#ffa726' },
        error: { main: '#f44336' },
      },
    },
  },

  shape: { borderRadius: 4 },

  typography: {
    fontFamily: `${roboto.style.fontFamily}, Helvetica, Arial, sans-serif`,
    h6: { fontSize: 20, fontWeight: 500, letterSpacing: '.15px' },
    button: { fontSize: 14, fontWeight: 500, letterSpacing: '.4px' },
    body2: { fontSize: 14 },
    caption: { fontSize: 12 },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Keep the focus ring. Removing it is the most common accessibility
        // regression in a theme override and leaves keyboard users lost.
        ':focus-visible': { outlineOffset: 2 },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: false },
      styleOverrides: { root: { textTransform: 'uppercase' } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontSize: 12,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '.5px',
          color: 'rgba(0,0,0,.6)',
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontSize: 12, fontWeight: 500, height: 24 } },
    },
  },
});

/** Monospace, used for time ranges, ids and endpoint hints. */
export const monoFontFamily = `${robotoMono.style.fontFamily}, ui-monospace, monospace`;

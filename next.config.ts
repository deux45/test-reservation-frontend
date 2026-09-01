import type { NextConfig } from 'next';

const config: NextConfig = {
  // Emits .next/standalone with only the files the server actually needs.
  // Without it the production image carries the whole node_modules tree.
  output: 'standalone',

  reactStrictMode: true,
  poweredByHeader: false,

  // MUI and Emotion ship large barrel files; this keeps the client bundle
  // from pulling every component when one is imported.
  transpilePackages: ['@mui/material', '@mui/x-data-grid', '@mui/x-date-pickers'],
};

export default config;

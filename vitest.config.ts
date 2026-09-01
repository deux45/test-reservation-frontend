import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,

    // Pinned timezone. Without it, date tests pass on a developer's machine
    // and fail in CI -- the most common failure mode in a booking app.
    env: { TZ: 'UTC' },

    // Playwright specs live in e2e/ and are run by `npm run e2e`.
    exclude: ['node_modules/**', 'e2e/**', '.next/**'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        'src/lib/api/schema.d.ts', // generated from the OpenAPI document
        'src/app/**/layout.tsx',
        '**/*.config.*',
        'e2e/**',
      ],
      thresholds: { lines: 70, functions: 70, branches: 65, statements: 70 },
    },
  },
});

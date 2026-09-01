import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom persists the document between tests in the same file; without this a
// query can match an element left over from a previous test.
afterEach(() => {
  cleanup();
});

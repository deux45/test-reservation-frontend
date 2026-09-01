'use client';

import { createAuthClient } from 'better-auth/react';
import { API_BASE_URL } from './api/client';

/**
 * Better Auth client, pointed at the API.
 *
 * It handles the session cookie itself, which is why nothing in this app ever
 * touches a token: there is none to store, so there is nothing to leak from
 * localStorage.
 *
 * Kept to the same major.minor.patch as the server's better-auth -- client and
 * server share inferred types and the session format, which is why
 * dependabot.yml excludes it from automatic updates.
 */
export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  basePath: '/api/auth',
  fetchOptions: {
    // Cross-origin in development: the SPA is on :3001 and the API on :3000.
    credentials: 'include',
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;

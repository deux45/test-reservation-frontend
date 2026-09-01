import { es } from '@/i18n/es';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/** RFC 7807 body as this API emits it. Mirrors the backend's filter. */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance: string;
  code: string;
  requestId: string;
  errors?: string[];
  conflict?: { reservationId: string; startAt: string; endAt: string };
}

export class ApiError extends Error {
  constructor(
    readonly problem: ProblemDetails,
    readonly status: number,
  ) {
    super(problem.detail ?? problem.title);
    this.name = 'ApiError';
  }
}

/**
 * The only place in the client that speaks HTTP.
 *
 * Components call hooks, hooks call a feature's api module, and that module
 * calls this. One direction, always -- so changing transport or error shape
 * is one file.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      // The Better Auth session travels as a cookie. Without this the request
      // is anonymous and every protected route returns 401.
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    // fetch only rejects on network failure, never on a 4xx/5xx.
    throw new ApiError(
      {
        type: 'about:blank',
        title: es.errors.network,
        status: 0,
        instance: path,
        code: 'NETWORK_ERROR',
        requestId: '',
      },
      0,
    );
  }

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as ProblemDetails | null;
    throw new ApiError(
      problem ?? {
        type: 'about:blank',
        title: es.errors.unexpected,
        status: response.status,
        instance: path,
        code: 'UNEXPECTED',
        requestId: '',
      },
      response.status,
    );
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

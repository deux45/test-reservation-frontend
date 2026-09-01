import { NextResponse, type NextRequest } from 'next/server';

const SESSION_COOKIE = 'better-auth.session_token';

/**
 * Keeps a signed-out visitor out of the dashboard, and a signed-in one out of
 * the login page.
 *
 * This checks only that a session cookie is PRESENT. It deliberately does not
 * validate it: the middleware runs on the edge, has no database, and a check
 * here would be a second source of truth about who is signed in. Every API
 * call is authenticated server-side regardless, so a forged cookie buys
 * nothing but an empty screen.
 *
 * Its job is not security -- it is not sending someone to a dashboard that
 * will only redirect them back.
 */
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const { pathname } = request.nextUrl;

  const isLogin = pathname.startsWith('/login');

  if (!hasSession && !isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (hasSession && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = '/resources';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Everything except Next's own assets and the favicon.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

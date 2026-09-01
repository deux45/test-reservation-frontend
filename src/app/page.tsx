import { redirect } from 'next/navigation';

/**
 * The root has no screen of its own.
 *
 * The middleware already sends a signed-out visitor to /login; this covers the
 * signed-in case, where the middleware lets `/` through and there would
 * otherwise be nothing to render.
 */
export default function RootPage() {
  redirect('/resources');
}

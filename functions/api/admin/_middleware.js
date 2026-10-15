import { verifyToken, getCookie } from './_auth.js';
import { json } from '../_lib.js';

/* Everything under /api/admin requires a valid session cookie, except login. */
export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  if (url.pathname.endsWith('/login')) return next();
  if (!(await verifyToken(env.ADMIN_PASSWORD, getCookie(request, 'bimee_admin')))) return json({ ok: false, error: 'Unauthorized' }, 401);
  return next();
}

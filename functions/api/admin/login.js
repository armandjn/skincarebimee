import { makeToken, safeEqual } from './_auth.js';
import { json } from '../_lib.js';

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) return json({ ok: false, error: 'Admin not configured' }, 503);
  let body = {};
  try { body = await request.json(); } catch {}
  const ok = safeEqual(String(body.password || ''), env.ADMIN_PASSWORD);
  if (!ok) { await new Promise((r) => setTimeout(r, 800)); return json({ ok: false, error: 'Wrong password' }, 401); }
  const token = await makeToken(env.ADMIN_PASSWORD);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json', 'set-cookie': `bimee_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200` }
  });
}
export const onRequestDelete = () => new Response(JSON.stringify({ ok: true }), {
  headers: { 'content-type': 'application/json', 'set-cookie': 'bimee_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' }
});

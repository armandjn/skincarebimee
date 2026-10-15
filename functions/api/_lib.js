export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

const clean = (v, max = 500) => String(v ?? '').trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* Shared handler: parse JSON, drop bots (honeypot "website"), validate, insert. */
export async function handle(request, env, { fields, required, emailField = 'email', insert }) {
  if (!env.DB) return json({ ok: false, error: 'Database not configured' }, 503);
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'Invalid request' }, 400); }
  if (body.website) return json({ ok: true }); // honeypot: pretend success
  const d = {};
  for (const [k, max] of Object.entries(fields)) d[k] = clean(body[k], max);
  for (const k of required) if (!d[k]) return json({ ok: false, error: `Missing ${k}` }, 400);
  if (d[emailField] && !isEmail(d[emailField])) return json({ ok: false, error: 'Invalid email' }, 400);
  await insert(env.DB, d);
  return json({ ok: true });
}

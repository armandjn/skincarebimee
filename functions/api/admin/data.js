import { json } from '../_lib.js';

const TABLES = {
  bookings: ['new', 'confirmed', 'completed', 'cancelled'],
  contacts: ['new', 'replied', 'archived'],
  gift_orders: ['pending_payment', 'paid', 'sent', 'cancelled'],
  subscribers: null
};

/* GET /api/admin/data  → rows of every table + counts */
export async function onRequestGet({ env }) {
  const out = { statuses: TABLES };
  for (const t of Object.keys(TABLES)) {
    out[t] = (await env.DB.prepare(`SELECT * FROM ${t} ORDER BY id DESC LIMIT 500`).all()).results;
  }
  return json({ ok: true, ...out });
}

/* POST {table,id,status} → update status;  DELETE {table,id} → remove row */
export async function onRequestPost({ request, env }) {
  const { table, id, status } = await request.json().catch(() => ({}));
  if (!Object.hasOwn(TABLES, table) || !TABLES[table] || !TABLES[table].includes(status) || !Number.isInteger(id)) return json({ ok: false, error: 'Bad request' }, 400);
  await env.DB.prepare(`UPDATE ${table} SET status = ? WHERE id = ?`).bind(status, id).run();
  return json({ ok: true });
}
export async function onRequestDelete({ request, env }) {
  const { table, id } = await request.json().catch(() => ({}));
  if (!Object.hasOwn(TABLES, table) || !Number.isInteger(id)) return json({ ok: false, error: 'Bad request' }, 400);
  await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
  return json({ ok: true });
}

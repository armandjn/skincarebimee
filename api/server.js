// Skincare Bimee — forms + admin API. Zero dependencies (Node 24, built-in SQLite).
import http from 'node:http';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const PORT = Number(process.env.PORT || 3000);
const DB_PATH = process.env.DB_PATH || './bimee.db';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const COOKIE_SECURE = process.env.COOKIE_SECURE === '1'; // set to 1 once the site is served over HTTPS
const MAX_BODY = 20 * 1024;

/* ---------------- database ---------------- */
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
db.exec(`
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL DEFAULT (datetime('now')),
  service TEXT NOT NULL, preferred_date TEXT, preferred_time TEXT,
  first_name TEXT NOT NULL, last_name TEXT, email TEXT NOT NULL, phone TEXT, notes TEXT,
  status TEXT NOT NULL DEFAULT 'new');
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL DEFAULT (datetime('now')),
  first_name TEXT, last_name TEXT, email TEXT NOT NULL, message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new');
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL DEFAULT (datetime('now')),
  email TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS gift_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL DEFAULT (datetime('now')),
  amount INTEGER NOT NULL, quantity INTEGER NOT NULL DEFAULT 1,
  recipient_name TEXT, recipient_email TEXT, from_name TEXT, delivery_date TEXT, message TEXT,
  your_email TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending_payment');
`);

const STATUSES = {
  bookings: ['new', 'confirmed', 'completed', 'cancelled'],
  contacts: ['new', 'replied', 'archived'],
  gift_orders: ['pending_payment', 'paid', 'sent', 'cancelled'],
  subscribers: null
};
const TABLES = Object.keys(STATUSES);

/* ---------------- helpers ---------------- */
const send = (res, status, data, headers = {}) => {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers });
  res.end(JSON.stringify(data));
};
const clean = (v, max = 500) => String(v ?? '').trim().slice(0, max);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function readJson(req) {
  return new Promise((resolve) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > MAX_BODY) { req.destroy(); resolve(null); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')); } catch { resolve(null); } });
    req.on('error', () => resolve(null));
  });
}

/* simple in-memory rate limiting: max N hits per window per IP and bucket */
const hits = new Map();
function limited(ip, bucket, max, windowMs) {
  const k = bucket + ':' + ip, now = Date.now();
  const arr = (hits.get(k) || []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(k, arr);
  return arr.length > max;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (!v.some((t) => now - t < 600000)) hits.delete(k); }, 300000).unref();

/* ---------------- admin auth (signed cookie) ---------------- */
const sign = (msg) => crypto.createHmac('sha256', ADMIN_PASSWORD).update(msg).digest('hex');
const makeToken = (hours = 12) => { const exp = Date.now() + hours * 3600000; return `${exp}.${sign('admin:' + exp)}`; };
function safeEq(a, b) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); }
function isAdmin(req) {
  if (!ADMIN_PASSWORD) return false;
  const m = (req.headers.cookie || '').match(/(?:^|; )bimee_admin=([^;]*)/);
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  return !!exp && !!sig && Number(exp) > Date.now() && safeEq(sig, sign('admin:' + exp));
}
const cookie = (value, maxAge) => `bimee_admin=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${COOKIE_SECURE ? '; Secure' : ''}`;

/* ---------------- public form endpoints ---------------- */
const FORMS = {
  '/api/book': {
    fields: { service: 60, preferred_date: 20, preferred_time: 30, first_name: 80, last_name: 80, email: 160, phone: 40, notes: 1500 },
    required: ['service', 'first_name', 'email'], emailField: 'email',
    insert: (d) => db.prepare('INSERT INTO bookings (service, preferred_date, preferred_time, first_name, last_name, email, phone, notes) VALUES (?,?,?,?,?,?,?,?)')
      .run(d.service, d.preferred_date, d.preferred_time, d.first_name, d.last_name, d.email, d.phone, d.notes)
  },
  '/api/contact': {
    fields: { first_name: 80, last_name: 80, email: 160, message: 3000 },
    required: ['email', 'message'], emailField: 'email',
    insert: (d) => db.prepare('INSERT INTO contacts (first_name, last_name, email, message) VALUES (?,?,?,?)').run(d.first_name, d.last_name, d.email, d.message)
  },
  '/api/subscribe': {
    fields: { email: 160 }, required: ['email'], emailField: 'email',
    insert: (d) => db.prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?)').run(d.email)
  },
  '/api/gift': {
    fields: { amount: 6, quantity: 3, recipient_name: 80, recipient_email: 160, from: 80, delivery_date: 20, message: 300, your_email: 160 },
    required: ['amount', 'your_email'], emailField: 'your_email',
    insert: (d) => {
      const amount = [50, 100, 150].includes(+d.amount) ? +d.amount : 100;
      const qty = Math.min(10, Math.max(1, parseInt(d.quantity, 10) || 1));
      return db.prepare('INSERT INTO gift_orders (amount, quantity, recipient_name, recipient_email, from_name, delivery_date, message, your_email) VALUES (?,?,?,?,?,?,?,?)')
        .run(amount, qty, d.recipient_name, d.recipient_email, d.from, d.delivery_date, d.message, d.your_email);
    }
  }
};

async function handleForm(req, res, form, ip) {
  if (limited(ip, 'form', 12, 60000)) return send(res, 429, { ok: false, error: 'Too many requests' });
  const body = await readJson(req);
  if (!body) return send(res, 400, { ok: false, error: 'Invalid request' });
  if (body.website) return send(res, 200, { ok: true }); // honeypot
  const d = {};
  for (const [k, max] of Object.entries(form.fields)) d[k] = clean(body[k], max);
  for (const k of form.required) if (!d[k]) return send(res, 400, { ok: false, error: `Missing ${k}` });
  if (d[form.emailField] && !isEmail(d[form.emailField])) return send(res, 400, { ok: false, error: 'Invalid email' });
  form.insert(d);
  send(res, 200, { ok: true });
}

/* ---------------- admin endpoints ---------------- */
async function handleAdmin(req, res, path, ip) {
  if (path === '/api/admin/login') {
    if (req.method === 'DELETE') return send(res, 200, { ok: true }, { 'set-cookie': cookie('', 0) });
    if (req.method !== 'POST') return send(res, 405, { ok: false });
    if (!ADMIN_PASSWORD) return send(res, 503, { ok: false, error: 'Admin not configured' });
    if (limited(ip, 'login', 8, 300000)) return send(res, 429, { ok: false, error: 'Too many attempts — try again in a few minutes' });
    const body = (await readJson(req)) || {};
    if (!safeEq(String(body.password || ''), ADMIN_PASSWORD)) {
      await new Promise((r) => setTimeout(r, 800));
      return send(res, 401, { ok: false, error: 'Wrong password' });
    }
    return send(res, 200, { ok: true }, { 'set-cookie': cookie(makeToken(), 43200) });
  }
  if (!isAdmin(req)) return send(res, 401, { ok: false, error: 'Unauthorized' });
  if (path !== '/api/admin/data') return send(res, 404, { ok: false });

  if (req.method === 'GET') {
    const out = { ok: true, statuses: STATUSES };
    for (const t of TABLES) out[t] = db.prepare(`SELECT * FROM ${t} ORDER BY id DESC LIMIT 500`).all();
    return send(res, 200, out);
  }
  const { table, id, status } = (await readJson(req)) || {};
  if (!TABLES.includes(table) || !Number.isInteger(id)) return send(res, 400, { ok: false, error: 'Bad request' });
  if (req.method === 'POST') {
    if (!STATUSES[table] || !STATUSES[table].includes(status)) return send(res, 400, { ok: false, error: 'Bad request' });
    db.prepare(`UPDATE ${table} SET status = ? WHERE id = ?`).run(status, id);
    return send(res, 200, { ok: true });
  }
  if (req.method === 'DELETE') {
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    return send(res, 200, { ok: true });
  }
  send(res, 405, { ok: false });
}

/* ---------------- server ---------------- */
const server = http.createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://x').pathname;
    const ip = (req.headers['x-real-ip'] || req.socket.remoteAddress || '').toString();
    if (path === '/api/health') return send(res, 200, { ok: true });
    if (path.startsWith('/api/admin/')) return await handleAdmin(req, res, path, ip);
    const form = FORMS[path];
    if (form) {
      if (req.method !== 'POST') return send(res, 405, { ok: false });
      return await handleForm(req, res, form, ip);
    }
    send(res, 404, { ok: false, error: 'Not found' });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) send(res, 500, { ok: false, error: 'Server error' });
  }
});
server.listen(PORT, () => console.log(`API listening on :${PORT}, db ${DB_PATH}, admin ${ADMIN_PASSWORD ? 'enabled' : 'DISABLED (no ADMIN_PASSWORD)'}`));
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => { server.close(() => { db.close(); process.exit(0); }); });

import { env } from "cloudflare:workers";

const json = (data: unknown, status = 200) =>
	new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

const clean = (v: unknown, max = 500) => String(v ?? "").trim().slice(0, max);
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

interface Options {
	fields: Record<string, number>;
	required: string[];
	emailField?: string;
	insert: (db: D1Database, d: Record<string, string>) => Promise<unknown>;
}

/** Shared form handler: parse JSON, drop bots (honeypot "website"), validate, insert into D1. */
export async function handleSubmission(request: Request, opts: Options): Promise<Response> {
	const db = (env as { DB?: D1Database }).DB;
	if (!db) return json({ ok: false, error: "Database not configured" }, 503);
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: "Invalid request" }, 400);
	}
	if (body.website) return json({ ok: true }); // honeypot: pretend success
	const d: Record<string, string> = {};
	for (const [k, max] of Object.entries(opts.fields)) d[k] = clean(body[k], max);
	for (const k of opts.required) if (!d[k]) return json({ ok: false, error: `Missing ${k}` }, 400);
	const emailField = opts.emailField ?? "email";
	if (d[emailField] && !isEmail(d[emailField])) return json({ ok: false, error: "Invalid email" }, 400);
	await opts.insert(db, d);
	return json({ ok: true });
}

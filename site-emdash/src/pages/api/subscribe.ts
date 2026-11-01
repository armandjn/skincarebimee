import type { APIRoute } from "astro";
import { handleSubmission } from "../../utils/submit";

export const prerender = false;

export const POST: APIRoute = ({ request }) =>
	handleSubmission(request, {
		fields: { email: 160 },
		required: ["email"],
		insert: (db, d) => db.prepare("INSERT OR IGNORE INTO subscribers (email) VALUES (?)").bind(d.email).run(),
	});

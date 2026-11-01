import type { APIRoute } from "astro";
import { handleSubmission } from "../../utils/submit";

export const prerender = false;

export const POST: APIRoute = ({ request }) =>
	handleSubmission(request, {
		fields: { first_name: 80, last_name: 80, email: 160, message: 3000 },
		required: ["email", "message"],
		insert: (db, d) =>
			db
				.prepare("INSERT INTO contacts (first_name, last_name, email, message) VALUES (?,?,?,?)")
				.bind(d.first_name, d.last_name, d.email, d.message)
				.run(),
	});

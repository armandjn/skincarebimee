import { handle } from './_lib.js';
export const onRequestPost = ({ request, env }) => handle(request, env, {
  fields: { email: 160 },
  required: ['email'],
  insert: (db, d) => db.prepare('INSERT OR IGNORE INTO subscribers (email) VALUES (?)').bind(d.email).run()
});

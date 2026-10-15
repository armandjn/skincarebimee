import { handle } from './_lib.js';
export const onRequestPost = ({ request, env }) => handle(request, env, {
  fields: { service: 60, preferred_date: 20, preferred_time: 30, first_name: 80, last_name: 80, email: 160, phone: 40, notes: 1500 },
  required: ['service', 'first_name', 'email'],
  insert: (db, d) => db.prepare('INSERT INTO bookings (service, preferred_date, preferred_time, first_name, last_name, email, phone, notes) VALUES (?,?,?,?,?,?,?,?)')
    .bind(d.service, d.preferred_date, d.preferred_time, d.first_name, d.last_name, d.email, d.phone, d.notes).run()
});

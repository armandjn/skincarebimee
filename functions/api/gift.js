import { handle } from './_lib.js';
/* Stores the order as "pending_payment". Payment (Stripe/Square) is a separate step. */
export const onRequestPost = ({ request, env }) => handle(request, env, {
  fields: { amount: 6, quantity: 3, recipient_name: 80, recipient_email: 160, from: 80, delivery_date: 20, message: 300, your_email: 160 },
  required: ['amount', 'your_email'],
  emailField: 'your_email',
  insert: (db, d) => {
    const amount = [50, 100, 150].includes(+d.amount) ? +d.amount : 100;
    const qty = Math.min(10, Math.max(1, parseInt(d.quantity, 10) || 1));
    return db.prepare('INSERT INTO gift_orders (amount, quantity, recipient_name, recipient_email, from_name, delivery_date, message, your_email) VALUES (?,?,?,?,?,?,?,?)')
      .bind(amount, qty, d.recipient_name, d.recipient_email, d.from, d.delivery_date, d.message, d.your_email).run();
  }
});

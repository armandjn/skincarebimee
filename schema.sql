CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  service TEXT NOT NULL, preferred_date TEXT, preferred_time TEXT,
  first_name TEXT NOT NULL, last_name TEXT, email TEXT NOT NULL, phone TEXT, notes TEXT,
  status TEXT NOT NULL DEFAULT 'new'
);
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  first_name TEXT, last_name TEXT, email TEXT NOT NULL, message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  email TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS gift_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  amount INTEGER NOT NULL, quantity INTEGER NOT NULL DEFAULT 1,
  recipient_name TEXT, recipient_email TEXT, from_name TEXT, delivery_date TEXT, message TEXT,
  your_email TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending_payment'
);

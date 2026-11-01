# Handoff — state of the project (written 2026-11-01)

> No secrets are stored in this file. Passwords/tokens were shared in chat; they are **not** reproduced here.

## 1. What exists

**Website (done):** 23 static pages — home, services (+10 service pages), virtual services, shop, gift card, book online, about, contact, blog (+3 posts), 404. Design: deep emerald / champagne gold / ivory, Cormorant Garamond + Jost, 3D hero (golden serum droplet + water ripples + gold dust in three.js over a photo with a Ken-Burns effect), tilt cards, 3D gift card, mobile menu + sticky mobile call/book bar, scroll reveals.
Content comes from `raw/` (Wix export). Added by Claude (need owner's review): the 3 blog posts, the "Skin Care Party" / "Skin Assessment" blurbs, and the new leaf logo mark (original logo was a gold maple leaf).
Two addresses exist in the source: studio at **3033 W. Parker Rd., Suite 113, Plano TX 75023 (Cross Roads Salon Suites, room 111)** and a second at **945 Stockton Dr Ste 4110, Allen TX 75013** — ask which is primary. Phone (214) 944-0191, skincarebimee@gmail.com.

**Forms + admin (done, on Cloudflare):**
- `/api/book`, `/api/contact`, `/api/subscribe`, `/api/gift` store submissions in D1. The front end falls back to a pre-filled `mailto:` if the API is unavailable (also when opened via `file://`).
- `/admin` — password login, tabs for bookings / messages / gift orders / subscribers, status changes, search, delete, CSV export. Secret `ADMIN_PASSWORD` is set on the Pages project (Production). Changing a secret requires **Retry deployment** to take effect.

## 2. Cloudflare (current production)

- Account ID `801bc0b314002b6f3cda46f70e1958d5`; Pages project `skincarebimee` → https://skincarebimee.pages.dev, connected to GitHub `armandjn/skincarebimee`, branch `main`, auto-deploy on push.
- Build config: command `node tools/dist.js`, output `dist` (so only the public site is deployed; Docker/API sources are NOT public). `functions/` at repo root is picked up automatically.
- D1 database `skincarebimee-db` (id `fc80a895-646c-4131-89b9-8b71d44852ac`), bound as `DB` for production and preview. Tables: `bookings`, `contacts`, `subscribers`, `gift_orders` (`schema.sql`).
- `_redirects` maps old Wix URLs (`/services/facial` → `/service-facial`, etc.). `_headers` sets security headers, asset caching and noindex for `/admin`.
- Custom domain `skincarebimee.com` is **not** connected yet.

## 3. Self-hosted server (parked — "set aside until told to move")

- VPS on Google Cloud, Ubuntu 26.04, 1 GB RAM, IP `35.212.198.107`, SSH user `skincarebimee` (key auth through PuTTY Pageant; keys are in `E:\Documents\keys*`, passphrase-protected — never ask for it; the user loads the key in Pageant). Host key SHA256:`1G0afoaQSNndUeH0Hi9VXd3fRWKVS5/2v7y1DqmGLiw`. Use `plink`/`pscp` from `C:\Program Files\PuTTY` with `-batch -agent -hostkey …`.
- Stack in `/home/skincarebimee/site` (docker compose): `web` (nginx, port 8080 → public) and `api` (Node 24, zero-dependency `api/server.js`, SQLite in volume `site_bimee-data`). Config in `.env` on the server (`ADMIN_PASSWORD`, `COOKIE_SECURE`, `HOST_PORT`). Currently running: http://35.212.198.107:8080 and `/admin`.
- Nightly backup: systemd timer `bimee-backup.timer` (03:30 UTC) runs `/home/skincarebimee/backup.sh` → `/home/skincarebimee/backups/*.db.gz`, 14-day retention. Restore steps were given in chat (stop api, gunzip into volume, start api). Backups are only on the same server.
- Passwordless sudo for `skincarebimee` was enabled temporarily via `/etc/sudoers.d/skincarebimee` — **remove when no longer needed**.
- GCP firewall rule `allow-8080` exists. Note: the first version targeted the network tag `skincarebimee` and did not match the VM; the user then fixed it in the console (all instances or tag added).
- Deploy flow used: `git archive` → `pscp` to `/tmp/site.tgz` → extract in `/home/skincarebimee/site` → `docker compose up -d --build`. Site is HTTP only (no domain/TLS yet): set `COOKIE_SECURE=1` once HTTPS is on.

## 4. Open tasks / next steps

1. **Force-push `main`** (history was rewritten to remove the old author email). The assistant is not permitted to run it; the user must run `git push --force origin main`. After that, verify the Cloudflare deployment: pages 200, `/admin` login, form POSTs, redirects, and that `/api/server.js` and `/Dockerfile` return 404.
2. Ask GitHub Support to purge cached views of the old commits if full removal matters.
3. Connect the domain `skincarebimee.com` to Pages (DNS), then HTTPS is automatic. For the Docker server: nginx + Let's Encrypt.
4. Email notifications for new bookings (needs Resend or similar API key from the user).
5. Gift-card payments (Stripe or Square) — orders are currently stored as `pending_payment` only.
6. Optional: replace shared-password admin with Cloudflare Access (needs Zero Trust permissions on the token); off-server backups (R2).
7. Review blog copy, Allen vs Plano address, logo.

## 5. Security to-do for the user

- Delete the Cloudflare API token that was pasted in chat (My Profile → API Tokens).
- Change every password that appeared in chat (server user/root, admin panel); disable SSH password login and root login on the VPS; remove the sudoers NOPASSWD file.
- In GitHub for `armandjn`: enable "Keep my email addresses private" and "Block command line pushes that expose my email".

## 6. Working notes / gotchas

- **Identity:** commit only as `armandjn` + `318715398+armandjn@users.noreply.github.com` (set repo-local). The global git config on this machine has a different email — never rely on it.
- The Bash tool collapses `\\` and mangles heredocs containing backslashes; write such files with the Write/Edit tools. `rm -rf $VAR/*` is blocked by a safety check — use literal paths.
- Headless Chrome (`tools/shot.sh`) works for screenshots but hangs on the WebGL hero → use `?shot&no3d`. The in-app browser pane lags; screenshots can show the previous scroll position.
- Chrome headless has a ~500px minimum width, so mobile screenshots at 390px show a clipped 500px layout; check overflow with JS in the in-app browser instead.
- Opening pages from `file://` works (links are relative `*.html`); forms fall back to `mailto:` there.
- Intersection-observer reveals have a 2.5 s failsafe so content never stays hidden; `clip-path` based reveals were removed because they never intersected.
- Permission classifier blocked, and the assistant must not retry without explicit approval: creating Cloudflare resources, force pushes, and `sudo`/password entry.

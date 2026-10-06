# Donation System (UPI QR + Automatic Bank-Email Confirmation)

How donations work on the Trust website, how to set it up, and how to run it day to day.

---

## 1. How it works

1. **Choose amount.** The donor picks a preset amount, a membership plan, or types their own amount.
2. **Enter details.** Name and email are required; mobile is optional.
3. **Create donation.** The server saves a record with an ID like `DON-20261006-A8F32`. Status: `PENDING_PAYMENT`.
4. **Pay.** The site shows a QR code for that exact amount. On phones there is also a **Pay using UPI app** button.
5. **Bank emails the Trust.** The bank sends an "amount credited" email to the Gmail inbox.
6. **Automatic match.** The site reads that email, matches it to the waiting donation by amount, and marks it `VERIFIED`. The donor's screen changes to **Payment received** and they get a confirmation email.

The donor does **not** submit a UTR or screenshot.

**Main rule:** only a bank email (or an admin) can mark a donation `VERIFIED`. Showing a QR or clicking "I have paid" never does.

```
PENDING_PAYMENT ──(bank "credited" email matched)──► VERIFIED ──► confirmation email
       │
       ├─ two donations fit one bank email: admin picks which on the dashboard
       └─ older than 48 hours ──► CANCELLED (daily cleanup)
```

### How matching works

- **Unique amounts.** Bank emails rarely include the donation ID, so the match is by **amount and time**. While a donation is waiting, no other waiting donation gets the same amount. A second ₹500 becomes ₹500.01, a third ₹500.02, and so on.
- **Which donations can match.** Only donations created in the last `AUTO_MATCH_WINDOW_MINUTES` (default 120) can be matched automatically.
- **Unsure cases go to an admin.** If two donations could match, or none can, the email is listed on the dashboard under **Bank payment alerts → Need review**. The admin types the Donation ID and clicks **Match**.
- **Fake emails.** An email only counts if Gmail confirms it really came from a bank domain (DMARC or DKIM pass). Anyone can send an email that looks like a bank alert; those are ignored.
- **When the inbox is checked.** While a donor is waiting on the payment screen, the site checks the inbox at most every 15 seconds. The daily cleanup job also checks it, and the admin can click **Check bank emails now**.

---

## 2. Tech stack

Small and secure, with no Redis and no separate backend server.

| What | Tool |
|---|---|
| Backend | Next.js Route Handlers in `app/api/` |
| Database | Neon Postgres + Prisma 6 (`engineType = "client"` with the `pg` driver, so there is no native engine binary) |
| Rate limiting | A `RateLimit` table in Postgres (atomic counter, no Redis) |
| Admin passwords | Node's built-in `scrypt` (no extra package) |
| Admin sessions | Random token in an httpOnly cookie; only its SHA-256 hash is stored in the database |
| Payment confirmation | Bank "credited" emails read from Gmail over IMAP (`imapflow` + `mailparser`) |
| Email sending | Gmail SMTP with an app password (`nodemailer`); Resend is an optional fallback |
| Screenshots (only for the optional manual proof route) | `local` = private folder on the server; `r2` = private Cloudflare R2 bucket |
| Email | Resend REST API (no SDK) |
| Validation | zod, shared by the form and the API |
| QR | qrcode.react, generated from the link the server returns |

---

## 3. Setup (first time)

### Step 1: Neon database
1. Create a project at neon.tech.
2. Open **Connect** and copy two connection strings:
   - **Pooled** (the host contains `-pooler`) → `DATABASE_URL`
   - **Direct** → `DIRECT_URL`

### Step 2: `.env` file
```bash
cp .env.example .env
```
Fill in `DATABASE_URL`, `DIRECT_URL` and the UPI details. Leave the rest for now.

Copy the UPI details **from the bank's own QR code**, so the site's QR matches what the bank expects. The Trust's Yes Bank QR decodes to `upi://pay?mc=8211&pa=yespay.smessi49188@yesbankltd&pn=NAMO BHAGWATE VASUDEVAYA TRUST`, which gives:

| Setting | Value | From |
|---|---|---|
| `UPI_ID` | `yespay.smessi49188@yesbankltd` | `pa=` |
| `UPI_NAME` | `NAMO BHAGWATE VASUDEVAYA TRUST` | `pn=` |
| `UPI_MCC` | `8211` | `mc=` |
| `UPI_ACCOUNT_LABEL` | `Current account • 0330` | shown on the payment card |

The site adds the exact amount (`am=`) and the donation ID as the payment note (`tn=`).

### Step 3: Create the tables
```bash
npm install            # also runs "prisma generate"
npm run db:deploy      # creates the tables in Neon
```

### Step 4: Create an admin login
```bash
npm run admin:create -- you@example.org "Your Name"
```
It asks for a password (at least 12 characters). Run the same command again to reset a password; that also logs the admin out everywhere.

### Step 5: Run it
```bash
npm run dev
```
- Donate: http://localhost:3000/donate
- Admin: http://localhost:3000/admin

Screenshots are saved in `.private-uploads/`. This folder is git-ignored and not public.

---

## 3a. Turn on bank email alerts (required for automatic confirmation)

The site can only confirm payments the bank tells it about.

1. Find out which bank account is linked to the receiving UPI ID. Open PhonePe → Profile → Bank accounts.
2. In that bank's net banking or app, turn on **email alerts for credits / UPI transactions**.
3. Choose where the alerts go:
   - send them straight to the Gmail in `GMAIL_USER`, **or**
   - if the bank's registered email is a different address, set up **auto-forwarding** from that inbox to the `GMAIL_USER` address.
4. Leave the alerts in the Gmail **Inbox**. Don't add a filter that archives them.
5. Send ₹1 to the UPI ID. Within a minute, an email from the bank should reach the Gmail inbox. If the bank's email domain isn't in the default list, add it to `BANK_ALERT_DOMAINS`.

If the bank never sends credit emails (some only send SMS), automatic confirmation can't work for that account. Admins can still confirm donations by hand.

## 4. Before going live (Vercel)

1. **Screenshots → R2.** Vercel has no permanent disk, so local storage won't work there.
   - In Cloudflare, create an R2 bucket and keep public access **off**.
   - Create an API token with read/write access to **that bucket only**.
   - Set `STORAGE_DRIVER=r2` and the four `R2_*` variables.
2. **Email → Resend.**
   - Add the Trust's domain in Resend and add the DNS records (SPF/DKIM) it shows.
   - Set `RESEND_API_KEY` and `EMAIL_FROM` (an address on that domain).
3. **Cron.** Set `CRON_SECRET` to a long random string. `vercel.json` already runs `/api/cron/cleanup` once a day.
4. **Environment variables.** Add every variable from `.env` to Vercel → Project → Settings → Environment Variables.
5. **Migrations.** Run `npm run db:deploy` whenever the schema changes.
6. **Real payment test.** Make a real ₹10 donation from a phone, then verify it from `/admin`.

---

## 5. API routes

| Method | Route | Who | What it does |
|---|---|---|---|
| POST | `/api/donations` | Anyone (10 per 10 min per IP) | Creates the donation and returns the QR link and a secret `submitToken` |
| POST | `/api/donations/[id]/payment-proof` | Holder of the `submitToken` | Saves the UTR and screenshot |
| POST | `/api/admin/login` | Anyone (5 tries per 15 min per email) | Logs an admin in |
| POST | `/api/admin/logout` | Admin | Logs the admin out |
| POST | `/api/admin/donations/[id]/verify` | Admin | Marks the donation VERIFIED and sends the email |
| POST | `/api/admin/donations/[id]/reject` | Admin | Marks it REJECTED and frees the UTR |
| POST | `/api/admin/donations/[id]/resend-email` | Admin | Sends the confirmation email again |
| POST | `/api/admin/bank-sync` | Admin | "Check bank emails now": reads the inbox and confirms matching donations |
| POST | `/api/admin/alerts/[alertId]/match` | Admin | Links a bank email that matched more than one donation |
| POST | `/api/donations/[id]/status` | Donor's browser (secret token) | Polled by the payment screen; triggers the automatic inbox check |
| GET | `/api/admin/donations/[id]/screenshot` | Admin | Shows the screenshot (R2: a link that expires in 60 seconds) |
| GET | `/api/cron/cleanup` | Vercel Cron (`CRON_SECRET`) | Cancels intents older than 48 hours and clears expired limits and sessions |

---

## 6. Security (what is in place)

- [x] Screenshots are private, never in `/public`, and only admins can see them.
- [x] Every admin page and API checks the session in the database. `proxy.ts` is only a quick first check.
- [x] Admin POST requests are rejected if they come from another website (Origin check).
- [x] Amounts are checked **on the server**, and membership prices come from the server.
- [x] Submitting proof needs the secret token that was given only to the donor's browser.
- [x] Files are checked by their actual bytes (JPG/PNG/WEBP only) and by size.
- [x] Each UTR can be used only once. A `UtrClaim` table enforces this in the database, even for simultaneous requests. Only an admin override can bypass it.
- [x] Submitting twice or refreshing never creates a second record.
- [x] Clicking Verify twice never sends a second email.
- [x] The email is sent **only** from Verify (or the Resend button), and every attempt is logged.
- [x] Rate limits apply to creating donations, submitting proof and admin login.
- [x] Admin passwords are hashed with scrypt, and the login takes the same time whether the email exists or not.

**Self-hosting note:** IP-based limits read the `x-forwarded-for` header. Vercel sets this header itself, so donors can't fake it. On your own server, put Nginx or Cloudflare in front so it is set correctly. The per-email login limit works either way.

---

## 7. Where things are

```
prisma/schema.prisma                 database tables
prisma/migrations/                   SQL for the tables
lib/donation-config.ts               preset amounts, membership prices  ← edit here
lib/validation/donation.ts           form + API validation rules
lib/server/                          server-only code (env, db, auth, email, storage, rate limit)
app/api/                             API routes
app/admin/                           admin pages (login, dashboard, donation detail)
app/(site)/                          public website pages (URLs unchanged)
components/DonateModal.tsx           the 4-step donate popup
components/admin/                    admin buttons and forms
scripts/create-admin.mjs             create or reset an admin login
proxy.ts                             redirects logged-out visitors away from /admin
vercel.json                          daily cleanup schedule
```

---

## 8. Questions for the Trust

- Do we have a **merchant UPI ID**? If yes, set `UPI_IS_MERCHANT=true` so the QR includes the `tr=` reference.
- Are the **preset amounts** right? They are ₹500, 1,100, 2,100, 5,100 and 11,000, set in `lib/donation-config.ts`.
- Does the Trust issue **80G receipts**? If yes, we need a PAN field.
- Who should get **admin logins**?
- Which **email address** should confirmation emails come from?

---

> **Remember:** a UTR and a screenshot are only evidence. Always find the money in the Trust's bank statement before clicking **Verify**.

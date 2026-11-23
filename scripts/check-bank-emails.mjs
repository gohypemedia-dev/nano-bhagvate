// Lists recent "payment received / credited" emails in the GMAIL_USER inbox and says
// whether the site will trust each sender (BANK_ALERT_DOMAINS). Read-only.
//
//   npm run bank:check            (last 3 days)
//   npm run bank:check -- 7       (last 7 days)
import { ImapFlow } from "imapflow";

// Keep in sync with the BANK_ALERT_DOMAINS default in lib/server/env.ts.
const DEFAULT_DOMAINS =
  "bank.in,hdfcbank.net,hdfcbank.com,icicibank.com,axisbank.com,kotak.com,sbi.co.in,yesbank.in,idfcfirstbank.com," +
  "indusind.com,pnb.co.in,bankofbaroda.com,bankofbaroda.co.in,unionbankofindia.bank.in,unionbankofindia.co.in," +
  "canarabank.com,aubank.in,federalbank.co.in,rblbank.com,bandhanbank.com,dbs.com,sc.com,idbibank.co.in";

const user = process.env.GMAIL_USER?.trim();
const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
if (!user || !pass) {
  console.error("Set GMAIL_USER and GMAIL_APP_PASSWORD in .env first.");
  process.exit(1);
}
const days = Math.max(1, Number.parseInt(process.argv[2] ?? "3", 10) || 3);
const allowed = (process.env.BANK_ALERT_DOMAINS?.trim() || DEFAULT_DOMAINS)
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);
const isAllowed = (domain) => allowed.some((d) => domain === d || domain.endsWith(`.${d}`));

const client = new ImapFlow({ host: "imap.gmail.com", port: 993, secure: true, auth: { user, pass }, logger: false });
try {
  await client.connect();
} catch (e) {
  console.error(`Could not log in to ${user}: ${e.responseText ?? e.message}`);
  console.error("Use a Gmail *app password* for this account (Google Account → Security → App passwords), and check IMAP is on.");
  process.exit(1);
}

try {
  const boxes = await client.list();
  const mailbox = boxes.find((b) => b.specialUse === "\\All")?.path ?? "INBOX";
  const lock = await client.getMailboxLock(mailbox, { readOnly: true });
  try {
    const query = `newer_than:${days}d (credited OR received OR "payment received" OR UPI)`;
    const uids = (await client.search({ gmraw: query }, { uid: true })) || [];
    console.log(`Inbox: ${user} — ${uids.length} payment-like email(s) in the last ${days} day(s)\n`);
    const bySender = new Map();
    for await (const m of client.fetch(uids, { envelope: true }, { uid: true })) {
      const from = m.envelope?.from?.[0]?.address?.toLowerCase() ?? "(unknown)";
      const domain = from.split("@")[1] ?? "";
      const entry = bySender.get(from) ?? { domain, count: 0, samples: [] };
      entry.count++;
      if (entry.samples.length < 3) entry.samples.push(`${m.envelope?.date?.toISOString() ?? "?"}  ${m.envelope?.subject ?? ""}`);
      bySender.set(from, entry);
    }
    for (const [from, e] of bySender) {
      console.log(`${isAllowed(e.domain) ? "TRUSTED  " : "IGNORED  "} ${from}  (${e.count})`);
      for (const s of e.samples) console.log(`            ${s}`);
    }
    const untrusted = [...bySender.values()].filter((e) => !isAllowed(e.domain)).map((e) => e.domain);
    if (untrusted.length) {
      console.log(
        `\nIf one of the IGNORED senders is your bank, add its domain to BANK_ALERT_DOMAINS in .env ` +
          `(keep the defaults too), e.g.\nBANK_ALERT_DOMAINS=${[...new Set([...allowed, ...untrusted])].join(",")}`,
      );
      console.log("Only add real bank domains: anyone who can send mail from an allowed domain can confirm donations.");
    }
  } finally {
    lock.release();
  }
} finally {
  await client.logout().catch(() => {});
}

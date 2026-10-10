import "server-only";
import { createHash } from "node:crypto";
import { ImapFlow } from "imapflow";
import { simpleParser, type ParsedMail } from "mailparser";
import type { DonationStatus } from "@prisma/client";
import { env } from "./env";
import { prisma } from "./prisma";
import { sendApprovedNoticeEmail, sendConfirmationEmail } from "./email";
import { isUniqueViolation } from "./http";

// Automatic payment confirmation from bank "amount credited" emails.
//
// The Trust's bank emails an alert to the Gmail inbox for every incoming UPI
// payment. We read those alerts over IMAP, trust only ones that Gmail itself
// authenticated as coming from a bank domain, and match each alert to the one
// pending donation with the same amount (amounts are kept unique while pending).

export interface ParsedAlert {
  messageId: string;
  fromAddress: string;
  subject: string;
  amountPaise: number;
  utr?: string;
  payer?: string;
  donationRef?: string;
  receivedAt: Date;
}

type ParseResult = { ok: true; alert: ParsedAlert } | { ok: false; reason: string };

const domainOf = (address: string) => address.split("@")[1]?.toLowerCase() ?? "";
const inDomains = (domain: string, allowed: string[]) => allowed.some((d) => domain === d || domain.endsWith(`.${d}`));

// Gmail adds its own Authentication-Results header at the top of every message.
// Only that first header is trusted; a sender can forge additional ones lower down.
function senderIsAuthentic(mail: ParsedMail, fromDomain: string, allowed: string[]) {
  const first = mail.headerLines.find((h) => h.key === "authentication-results");
  if (!first) return false;
  const value = first.line.slice(first.line.indexOf(":") + 1).trim().toLowerCase();
  if (!value.startsWith("mx.google.com")) return false;

  if (/\bdmarc=pass\b/.test(value) && value.includes(`header.from=${fromDomain}`)) return true;

  // No DMARC record: accept a passing DKIM signature from an allowed domain aligned with From.
  for (const m of value.matchAll(/\bdkim=pass\b[^;]*?header\.(?:i=@|d=)([a-z0-9.-]+)/g)) {
    const signer = m[1];
    const aligned = signer === fromDomain || fromDomain.endsWith(`.${signer}`) || signer.endsWith(`.${fromDomain}`);
    if (aligned && inDomains(signer, allowed)) return true;
  }
  return false;
}

function plainText(mail: ParsedMail) {
  const html = typeof mail.html === "string" ? mail.html : "";
  const text =
    mail.text ||
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&#8377;|&#x20b9;/gi, "₹");
  return text.replace(/\s+/g, " ").trim();
}

const CREDIT = /\b(credited|received|deposited)\b/i;
const DEBIT = /\b(debited|withdrawn|spent)\b/i;

// Outgoing-payment alerts often mention the other side too ("debited … credited to VPA"),
// so whichever word comes first decides.
function isCreditAlert(text: string) {
  const credit = text.search(CREDIT);
  const debit = text.search(DEBIT);
  return credit !== -1 && (debit === -1 || credit < debit);
}
const AMOUNT = /(?:rs\.?|inr|₹)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i;
const UTR_NEAR_LABEL = /(?:utr|rrn|ref(?:erence)?|txn|transaction)[^0-9]{0,30}?(\d{12})(?!\d)/i;
const VPA = /\b([a-z0-9._-]{2,64}@[a-z]{2,64})(?![.\w])/gi;
const DONATION_REF = /DON-\d{8}-[A-Z2-9]{5}/;

export function parseBankAlert(mail: ParsedMail, allowedDomains: string[], ownUpiId?: string): ParseResult {
  const fromAddress = mail.from?.value?.[0]?.address?.toLowerCase() ?? "";
  const fromDomain = domainOf(fromAddress);
  if (!fromDomain || !inDomains(fromDomain, allowedDomains)) return { ok: false, reason: `sender ${fromAddress} is not an allowed bank domain` };
  if (!senderIsAuthentic(mail, fromDomain, allowedDomains)) return { ok: false, reason: `sender ${fromAddress} failed Gmail authentication` };

  const subject = mail.subject ?? "";
  const body = plainText(mail);
  // The body describes the actual transaction; the subject is only a fallback.
  const decisive = CREDIT.test(body) || DEBIT.test(body) ? body : subject;
  if (!isCreditAlert(decisive)) return { ok: false, reason: "not a credit alert" };
  const text = `${body} ${subject}`;

  const amountMatch = text.match(AMOUNT);
  const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, "")) : NaN;
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, reason: "no amount found" };

  const utr = text.match(UTR_NEAR_LABEL)?.[1] ?? (/\bupi\b/i.test(text) ? text.match(/(?<!\d)(\d{12})(?!\d)/)?.[1] : undefined);
  const payer = [...text.matchAll(VPA)].map((m) => m[1].toLowerCase()).find((v) => v !== ownUpiId?.toLowerCase());
  const messageId =
    mail.messageId ?? createHash("sha256").update(`${fromAddress}|${mail.date?.toISOString()}|${subject}|${text}`).digest("hex");

  return {
    ok: true,
    alert: {
      messageId,
      fromAddress,
      subject: subject.slice(0, 300),
      amountPaise: Math.round(amount * 100),
      utr,
      payer,
      donationRef: text.match(DONATION_REF)?.[0],
      receivedAt: mail.date ?? new Date(),
    },
  };
}

class NotPayable extends Error {}
class UtrInUse extends Error {}

// Marks a donation as paid (VERIFIED), emails the donor their confirmation and tells
// the approvers who approved it. Used by the approval email link, an admin matching a
// bank alert by hand, and (only when AUTO_CONFIRM_BANK_EMAILS=true) the automatic matcher.
export async function confirmPayment(
  donationDbId: string,
  opts: { utr?: string; alertId?: string; adminId?: string; source: "BANK_EMAIL" | "ADMIN"; approvedBy: string },
): Promise<{ ok: true } | { ok: false; reason: "not-payable" | "utr-in-use" }> {
  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.donation.updateMany({
        where: { id: donationDbId, status: { in: ["PENDING_PAYMENT", "PENDING_VERIFICATION"] } },
        data: {
          status: "VERIFIED",
          verificationSource: opts.source,
          verifiedAt: new Date(),
          verifiedById: opts.adminId ?? null,
          ...(opts.utr ? { utr: opts.utr } : {}),
        },
      });
      if (updated.count === 0) throw new NotPayable();
      if (opts.utr) {
        await tx.utrClaim.deleteMany({ where: { donationId: donationDbId } });
        try {
          await tx.utrClaim.create({ data: { utr: opts.utr, donationId: donationDbId } });
        } catch (e) {
          if (isUniqueViolation(e)) throw new UtrInUse();
          throw e;
        }
      }
      if (opts.alertId) {
        await tx.paymentAlert.update({ where: { id: opts.alertId }, data: { status: "MATCHED", donationId: donationDbId } });
      }
    });
  } catch (e) {
    if (e instanceof NotPayable) return { ok: false, reason: "not-payable" };
    if (e instanceof UtrInUse) return { ok: false, reason: "utr-in-use" };
    throw e;
  }

  await sendConfirmationEmail(await prisma.donation.findUniqueOrThrow({ where: { id: donationDbId } }));
  // Re-read so the notice reports whether the donor email went out.
  await sendApprovedNoticeEmail(await prisma.donation.findUniqueOrThrow({ where: { id: donationDbId } }), opts.approvedBy);
  return { ok: true };
}

// Donations whose money may still arrive: QR shown, or donor has tapped "I have paid".
const AWAITING: DonationStatus[] = ["PENDING_PAYMENT", "PENDING_VERIFICATION"];

// Stores an alert and, when exactly one pending donation fits, confirms it.
export async function recordAndMatch(alert: ParsedAlert) {
  const config = env();
  const from = new Date(alert.receivedAt.getTime() - config.AUTO_MATCH_WINDOW_MINUTES * 60_000);
  const to = new Date(alert.receivedAt.getTime() + 5 * 60_000);

  let candidates: { id: string; donationId: string }[] = [];
  if (alert.donationRef) {
    candidates = await prisma.donation.findMany({
      where: { donationId: alert.donationRef, status: { in: AWAITING }, amountPaise: alert.amountPaise },
      select: { id: true, donationId: true },
    });
  }
  if (candidates.length === 0) {
    candidates = await prisma.donation.findMany({
      where: { status: { in: AWAITING }, amountPaise: alert.amountPaise, createdAt: { gte: from, lte: to } },
      select: { id: true, donationId: true },
      take: 5,
    });
  }

  const status = candidates.length === 1 ? "MATCHED" : candidates.length > 1 ? "AMBIGUOUS" : "UNMATCHED";
  let row;
  try {
    row = await prisma.paymentAlert.create({
      data: {
        messageId: alert.messageId,
        fromAddress: alert.fromAddress,
        subject: alert.subject,
        amountPaise: alert.amountPaise,
        utr: alert.utr,
        payer: alert.payer,
        receivedAt: alert.receivedAt,
        // Stored as unmatched until confirmPayment links it, so a failure never leaves a false match.
        status: status === "MATCHED" ? "UNMATCHED" : status,
        note: status === "AMBIGUOUS" ? `Possible donations: ${candidates.map((c) => c.donationId).join(", ")}` : null,
      },
    });
  } catch (e) {
    if (isUniqueViolation(e, "messageId")) return { messageId: alert.messageId, status: "DUPLICATE" as const };
    throw e;
  }

  if (status !== "MATCHED") return { messageId: alert.messageId, status };

  // By default the donor is only emailed after a person approves. The alert waits under
  // "Need review" so an admin can click Match (or approve from the email link).
  if (!config.AUTO_CONFIRM_BANK_EMAILS) {
    await prisma.paymentAlert.update({
      where: { id: row.id },
      data: { note: `Looks like ${candidates[0].donationId}. Approve it from the email link or click Match.` },
    });
    return { messageId: alert.messageId, status: "UNMATCHED" as const };
  }

  const result = await confirmPayment(candidates[0].id, { utr: alert.utr, alertId: row.id, source: "BANK_EMAIL", approvedBy: "Bank payment email (automatic)" });
  if (!result.ok) {
    const note =
      result.reason === "utr-in-use"
        ? `UTR ${alert.utr} is already linked to another donation; check before matching.`
        : `${candidates[0].donationId} was no longer awaiting payment.`;
    await prisma.paymentAlert.update({ where: { id: row.id }, data: { status: "AMBIGUOUS", note } });
    return { messageId: alert.messageId, status: "AMBIGUOUS" as const };
  }
  return { messageId: alert.messageId, status: "MATCHED" as const, donationId: candidates[0].donationId };
}

const SYNC_ID = "bank-email";

export async function lastBankSync() {
  return (await prisma.syncState.findUnique({ where: { id: SYNC_ID } }))?.lastRunAt ?? null;
}

// Reads recent bank alerts from Gmail. Throttled across all server instances so
// that many donors waiting at once still cause at most one inbox check per interval.
export async function syncBankAlerts(opts: { force?: boolean } = {}) {
  const config = env();
  if (!config.GMAIL_USER || !config.GMAIL_APP_PASSWORD) return { ran: false as const, reason: "Gmail is not configured" };

  const wait = `${opts.force ? 0 : config.BANK_SYNC_INTERVAL_SECONDS} seconds`;
  const acquired = await prisma.$executeRaw`
    INSERT INTO "SyncState" ("id", "lastRunAt") VALUES (${SYNC_ID}, now() AT TIME ZONE 'UTC')
    ON CONFLICT ("id") DO UPDATE SET "lastRunAt" = EXCLUDED."lastRunAt"
    WHERE "SyncState"."lastRunAt" <= (now() AT TIME ZONE 'UTC') - ${wait}::interval`;
  if (!acquired) return { ran: false as const, reason: "checked recently" };

  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user: config.GMAIL_USER, pass: config.GMAIL_APP_PASSWORD },
    logger: false,
    socketTimeout: 25_000,
  });

  const results: Awaited<ReturnType<typeof recordAndMatch>>[] = [];
  const skipped: string[] = [];
  await client.connect();
  try {
    // "All Mail" also covers alerts that a Gmail filter archived or labelled.
    const boxes = await client.list();
    const mailbox = boxes.find((b) => b.specialUse === "\\All")?.path ?? "INBOX";
    const lock = await client.getMailboxLock(mailbox, { readOnly: true });
    try {
      // Let Gmail do the filtering (its own search syntax), so a busy inbox stays fast.
      const days = Math.max(2, Math.ceil(config.AUTO_MATCH_WINDOW_MINUTES / 1440) + 1);
      const query = `newer_than:${days}d from:(${config.BANK_ALERT_DOMAINS.join(" OR ")})`;
      const uids = (await client.search({ gmraw: query }, { uid: true })) || [];
      if (uids.length) {
        const fromBanks: { uid: number; messageId?: string }[] = [];
        for await (const m of client.fetch(uids, { envelope: true }, { uid: true })) {
          const address = m.envelope?.from?.[0]?.address?.toLowerCase() ?? "";
          if (inDomains(domainOf(address), config.BANK_ALERT_DOMAINS)) fromBanks.push({ uid: m.uid, messageId: m.envelope?.messageId });
        }
        const ids = fromBanks.map((m) => m.messageId).filter((x): x is string => Boolean(x));
        const known = new Set(
          (await prisma.paymentAlert.findMany({ where: { messageId: { in: ids } }, select: { messageId: true } })).map((a) => a.messageId),
        );
        for (const m of fromBanks) {
          if (m.messageId && known.has(m.messageId)) continue;
          const msg = await client.fetchOne(String(m.uid), { source: true }, { uid: true });
          if (!msg || !msg.source) continue;
          const parsed = parseBankAlert(await simpleParser(msg.source), config.BANK_ALERT_DOMAINS, config.UPI_ID);
          if (!parsed.ok) {
            skipped.push(parsed.reason);
            continue;
          }
          results.push(await recordAndMatch(parsed.alert));
        }
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => {});
  }

  if (skipped.length) console.info(`[bank-alerts] skipped ${skipped.length} bank email(s): ${[...new Set(skipped)].join("; ")}`);
  return { ran: true as const, processed: results, skipped: skipped.length };
}

// Recent alerts an admin still has to look at (shown on the dashboard).
export async function alertsNeedingReview() {
  return prisma.paymentAlert.findMany({
    where: { status: { in: ["AMBIGUOUS", "UNMATCHED"] }, receivedAt: { gte: new Date(Date.now() - 30 * 86_400_000) } },
    orderBy: { receivedAt: "desc" },
    take: 20,
  });
}

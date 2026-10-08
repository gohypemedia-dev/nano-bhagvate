import "server-only";
import type { Donation } from "@prisma/client";
import nodemailer, { type Transporter } from "nodemailer";
import { env, type Env } from "./env";
import { prisma } from "./prisma";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const rupees = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: paise % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

const istDate = (d: Date) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "long", year: "numeric" }).format(d);

function confirmationEmail(d: Donation, ngoName: string) {
  const amount = rupees(d.amountPaise);
  const date = istDate(d.verifiedAt ?? new Date());
  const rows: [string, string][] = [
    ["Donation ID", d.donationId],
    ["Amount", amount],
    ["Transaction / UTR", d.utr ?? "-"],
    ["Date", date],
  ];
  if (d.program) rows.splice(1, 0, ["Towards", d.program]);

  const subject = `Donation Confirmation – ${ngoName}`;
  const text = [
    `Dear ${d.donorName},`,
    "",
    `Thank you for your generous donation of ${amount} to ${ngoName}.`,
    "",
    "Your payment has been successfully verified.",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "We sincerely appreciate your support.",
    "",
    "Regards,",
    ngoName,
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#FFF9F2;font-family:Arial,Helvetica,sans-serif;color:#2B201A">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #E7D8C8;border-radius:12px" cellpadding="0" cellspacing="0">
<tr><td style="padding:28px 28px 8px">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#B8893E;font-weight:bold">${escapeHtml(ngoName)}</p>
<h1 style="margin:0 0 16px;font-size:22px;color:#2B201A">Donation confirmed</h1>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6">Dear ${escapeHtml(d.donorName)},</p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6">Thank you for your generous donation of <strong>${amount}</strong> to ${escapeHtml(ngoName)}. Your payment has been successfully verified.</p>
</td></tr>
<tr><td style="padding:8px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF2E7;border-radius:8px">
${rows.map(([k, v]) => `<tr><td style="padding:10px 14px;font-size:13px;color:#6B5B4E">${k}</td><td style="padding:10px 14px;font-size:14px;font-weight:bold;text-align:right">${escapeHtml(v)}</td></tr>`).join("")}
</table>
</td></tr>
<tr><td style="padding:16px 28px 28px">
<p style="margin:0 0 12px;font-size:15px;line-height:1.6">We sincerely appreciate your support.</p>
<p style="margin:0;font-size:15px;line-height:1.6">Regards,<br>${escapeHtml(ngoName)}</p>
</td></tr>
</table></td></tr></table></body></html>`;

  return { subject, text, html };
}

function approvalRequestEmail(d: Donation, approveUrl: string, ngoName: string, upiId: string) {
  const amount = rupees(d.amountPaise);
  const ist = (date: Date) =>
    new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }).format(date);
  // Usually sent the moment the QR is shown; older donations get it when the donor taps "I have paid".
  const markedPaid = d.status === "PENDING_VERIFICATION";
  const rows: [string, string][] = [
    ["Donor", d.donorName],
    ["Amount", amount],
    ["Donation ID", d.donationId],
    ["Towards", d.program ?? "-"],
    ["Email", d.donorEmail],
    ["Mobile", d.donorMobile ?? "-"],
    markedPaid ? ["Marked as paid", ist(d.proofSubmittedAt ?? new Date())] : ["QR shown", ist(d.createdAt)],
  ];
  const lead = markedPaid
    ? `${d.donorName} says they have paid ${amount} to ${upiId}.`
    : `${d.donorName} is paying ${amount} to ${upiId} by UPI (the QR has just been shown to them).`;

  const subject = `Payment to approve: ${amount} from ${d.donorName} (${d.donationId})`;
  const text = [
    lead,
    "",
    "When the money shows up in your UPI app or bank statement, approve the payment",
    "and the donor will get their confirmation email:",
    "",
    approveUrl,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "If the payment never arrives, open the same link and reject it.",
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#FFF9F2;font-family:Arial,Helvetica,sans-serif;color:#2B201A">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #E7D8C8;border-radius:12px" cellpadding="0" cellspacing="0">
<tr><td style="padding:28px 28px 8px">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#B8893E;font-weight:bold">${escapeHtml(ngoName)}</p>
<h1 style="margin:0 0 16px;font-size:22px;color:#2B201A">${markedPaid ? "Payment waiting for your approval" : "New donation: approve when received"}</h1>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6">${escapeHtml(lead)}</p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6">When the money shows up in your UPI app or bank statement, approve it and the donor will get their confirmation email.</p>
</td></tr>
<tr><td style="padding:8px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF2E7;border-radius:8px">
${rows.map(([k, v]) => `<tr><td style="padding:10px 14px;font-size:13px;color:#6B5B4E">${k}</td><td style="padding:10px 14px;font-size:14px;font-weight:bold;text-align:right">${escapeHtml(v)}</td></tr>`).join("")}
</table>
</td></tr>
<tr><td align="center" style="padding:20px 28px 28px">
<a href="${escapeHtml(approveUrl)}" style="display:inline-block;background:#2F5A43;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:12px 28px;border-radius:8px">Review &amp; approve payment</a>
<p style="margin:14px 0 0;font-size:12px;color:#6B5B4E">Payment never arrived? Open the same link and reject it.</p>
</td></tr>
</table></td></tr></table></body></html>`;

  return { subject, text, html };
}

// The people who approve payments: the UPI owner's inbox (GMAIL_USER) plus APPROVAL_EMAILS.
function approvers(config: Env) {
  const all = [config.GMAIL_USER, ...config.APPROVAL_EMAILS].filter((e): e is string => Boolean(e));
  return [...new Set(all.map((e) => e.toLowerCase()))];
}

async function sendToApprovers(donation: Donation, msg: Omit<Message, "to">, what: string) {
  const config = env();
  const recipients = approvers(config);
  if (recipients.length === 0) {
    console.warn(`[email] No GMAIL_USER or APPROVAL_EMAILS set; ${what} not sent for`, donation.donationId);
    return;
  }
  for (const to of recipients) {
    try {
      const sent = await deliver(config, { to, ...msg });
      if (!sent.ok) console.warn(`[email] ${sent.error} (${what} for ${donation.donationId} to ${to})`);
    } catch (e) {
      console.error(`[email] ${what} for ${donation.donationId} to ${to} failed:`, e instanceof Error ? e.message : e);
    }
  }
}

// Tells the approvers that a payment was approved and the donor has been emailed.
// `approvedBy` is e.g. "Aniket (dashboard)" or "the approval email link". Never throws.
export async function sendApprovedNoticeEmail(donation: Donation, approvedBy: string) {
  const config = env();
  const amount = rupees(donation.amountPaise);
  const donorEmail =
    donation.emailStatus === "SENT"
      ? `The confirmation email was sent to ${donation.donorEmail}.`
      : `The confirmation email to ${donation.donorEmail} FAILED. Use "Resend email" on the dashboard.`;
  const rows: [string, string][] = [
    ["Donor", donation.donorName],
    ["Amount", amount],
    ["Donation ID", donation.donationId],
    ["Approved by", approvedBy],
  ];
  const subject = `Approved: ${amount} from ${donation.donorName} (${donation.donationId})`;
  const text = [`This payment has been approved.`, donorEmail, "", ...rows.map(([k, v]) => `${k}: ${v}`)].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#FFF9F2;font-family:Arial,Helvetica,sans-serif;color:#2B201A">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #E7D8C8;border-radius:12px" cellpadding="0" cellspacing="0">
<tr><td style="padding:28px 28px 8px">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#B8893E;font-weight:bold">${escapeHtml(config.NGO_NAME)}</p>
<h1 style="margin:0 0 16px;font-size:22px;color:#2F5A43">Payment approved</h1>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6">${escapeHtml(donorEmail)}</p>
</td></tr>
<tr><td style="padding:8px 28px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF2E7;border-radius:8px">
${rows.map(([k, v]) => `<tr><td style="padding:10px 14px;font-size:13px;color:#6B5B4E">${k}</td><td style="padding:10px 14px;font-size:14px;font-weight:bold;text-align:right">${escapeHtml(v)}</td></tr>`).join("")}
</table>
</td></tr>
</table></td></tr></table></body></html>`;
  await sendToApprovers(donation, { subject, text, html }, "approved notice");
}

// Tells the approvers (UPI owner + admins) that a donor has marked their payment as done,
// with a link to approve it. Never throws.
export async function sendApprovalRequestEmail(donation: Donation, approveUrl: string) {
  const config = env();
  const msg = approvalRequestEmail(donation, approveUrl, config.NGO_NAME, config.UPI_ID ?? "the Trust's UPI ID");
  await sendToApprovers(donation, msg, "approval request");
}

// Sends the confirmation email, records the attempt in EmailLog and updates
// the donation's email status. Never throws; returns the outcome.
export async function sendConfirmationEmail(donation: Donation) {
  const config = env();
  const { subject, text, html } = confirmationEmail(donation, config.NGO_NAME);

  let status: "SENT" | "FAILED" = "FAILED";
  let providerId: string | undefined;
  let error: string | undefined;

  try {
    const sent = await deliver(config, { to: donation.donorEmail, subject, text, html });
    if (sent.ok) {
      status = "SENT";
      providerId = sent.id;
    } else {
      error = sent.error;
      console.warn(`[email] ${error} ("${subject}" to ${donation.donorEmail})`);
    }
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.emailLog.create({
      data: { donationId: donation.id, to: donation.donorEmail, status, providerId, error: error?.slice(0, 500) },
    }),
    prisma.donation.update({
      where: { id: donation.id },
      data: { emailStatus: status, emailSentAt: status === "SENT" ? now : undefined },
    }),
  ]);

  return { status, error };
}

type Message = { to: string; subject: string; text: string; html: string };
type Delivery = { ok: true; id?: string } | { ok: false; error: string };

let gmail: Transporter | undefined;

// Gmail (app password) when configured, otherwise Resend.
async function deliver(config: Env, msg: Message): Promise<Delivery> {
  if (config.GMAIL_USER && config.GMAIL_APP_PASSWORD) {
    gmail ??= nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: config.GMAIL_USER, pass: config.GMAIL_APP_PASSWORD },
    });
    // Gmail only sends as the signed-in address, so the From address is fixed to it.
    const info = await gmail.sendMail({
      from: { name: config.NGO_NAME, address: config.GMAIL_USER },
      replyTo: config.EMAIL_REPLY_TO,
      ...msg,
    });
    return { ok: true, id: info.messageId };
  }

  if (config.RESEND_API_KEY && config.EMAIL_FROM) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...msg, from: config.EMAIL_FROM, to: [msg.to], reply_to: config.EMAIL_REPLY_TO }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    return res.ok ? { ok: true, id: body.id } : { ok: false, error: `Resend ${res.status}: ${body.message ?? res.statusText}` };
  }

  return { ok: false, error: "Email is not configured (set GMAIL_USER and GMAIL_APP_PASSWORD)." };
}

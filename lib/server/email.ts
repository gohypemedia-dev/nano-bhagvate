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

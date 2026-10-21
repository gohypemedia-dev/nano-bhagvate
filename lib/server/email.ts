import "server-only";
import type { Donation, Event, Order } from "@prisma/client";
import nodemailer, { type Transporter } from "nodemailer";
import { membershipValidUntil, planForProgram } from "@/lib/donation-config";
import { certificateKey, certificateNumber, generateCertificatePdf } from "./certificate";
import { generateEventPassPdf } from "./pass";
import { publicBaseUrl } from "./donation";
import { env, type Env } from "./env";
import { prisma } from "./prisma";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const rupees = (paise: number) =>
  `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: paise % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

const istDate = (d: Date) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "long", year: "numeric" }).format(d);

function confirmationEmail(
  d: Donation,
  ngoName: string,
  certificate: { url: string; attached: boolean },
  pass?: { url: string; attached: boolean; event: Event | null }
) {
  const amount = rupees(d.amountPaise);
  const date = istDate(d.verifiedAt ?? new Date());
  const member = d.type === "MEMBERSHIP";
  const hasPass = Boolean(pass);
  const eventName = pass?.event?.title || d.program || "Spiritual Gathering";

  const rows: [string, string][] = [
    [member ? "Membership ID" : hasPass ? "Pass & Donation ID" : "Donation ID", d.donationId],
    ["Amount", amount],
    ["Payment", d.utr ? `UPI · UTR ${d.utr}` : "UPI"],
    [member ? "Approved on" : "Date", date],
  ];
  if (member) {
    const plan = planForProgram(d.program);
    const until = membershipValidUntil(plan, d.verifiedAt ?? new Date());
    rows.splice(1, 0, ["Membership", `${plan.title} (${plan.name})`], ["Valid until", until ? istDate(until) : "Lifetime"]);
  } else if (d.program) rows.splice(1, 0, [hasPass ? "Event / Program" : "Towards", d.program]);

  const thanks = member
    ? `Thank you for becoming a ${planForProgram(d.program).title} of ${ngoName}. We received your contribution of ${amount}.`
    : hasPass
    ? `Jai Shri Krishna! Your registration and contribution of ${amount} for "${eventName}" has been successfully approved.`
    : `Thank you for your generous donation of ${amount} to ${ngoName}.`;

  const certName = member ? "membership certificate" : "donation certificate";

  const subject = member
    ? `Welcome! Membership Confirmation – ${ngoName}`
    : hasPass
    ? `🎫 Official Event Entry Pass: ${eventName} – ${ngoName}`
    : `Donation Confirmation – ${ngoName}`;

  const textLines = [
    `Dear ${d.donorName},`,
    "",
    thanks,
    "",
    "Your payment has been successfully verified.",
    "",
  ];

  if (hasPass) {
    textLines.push(
      "──────────────────────────────────────────────",
      "✦ OFFICIAL EVENT ENTRY PASS · प्रवेश पत्र ✦",
      `Pass ID: PASS-${d.donationId}`,
      `Devotee: ${d.donorName}`,
      `Event: ${eventName}`,
      `Date: ${pass?.event?.startDate ? istDate(new Date(pass.event.startDate)) : date}`,
      pass?.event?.timeText ? `Timing: ${pass.event.timeText}` : "",
      `Venue: ${pass?.event?.location || "Trust Ashram & Satsang Kendra"}`,
      `Pass Link: ${pass?.url}`,
      "Please show this pass at the Ashram gate for entry & Mahaprasad.",
      "──────────────────────────────────────────────",
      ""
    );
  }

  textLines.push(
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    certificate.attached
      ? `Your ${certName} is attached to this email as a PDF.`
      : `Your ${certName} is ready to view and download:`,
    certificate.url,
    "",
    "We sincerely appreciate your support.",
    "",
    "Regards,",
    ngoName
  );

  const text = textLines.filter(Boolean).join("\n");

  const passCardHtml = hasPass
    ? `<tr><td style="padding:0 28px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFDF8;border:2px dashed #B8893E;border-radius:12px;overflow:hidden">
<tr><td style="background:#2B201A;padding:10px 16px;text-align:center">
  <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1.5px;color:#B8893E;text-transform:uppercase">✦ OFFICIAL EVENT ENTRY PASS · प्रवेश पत्र ✦</p>
</td></tr>
<tr><td style="padding:16px 20px">
  <div style="text-align:center;margin-bottom:12px">
    <span style="display:inline-block;background:#E86F1D;color:#ffffff;font-size:11px;font-weight:bold;padding:3px 10px;border-radius:4px;text-transform:uppercase">${escapeHtml(eventName)}</span>
    <h2 style="margin:8px 0 2px;font-size:18px;color:#2B201A">${escapeHtml(d.donorName)}</h2>
    <p style="margin:0;font-size:11px;color:#2F5A43;font-weight:bold">PASS ID: PASS-${escapeHtml(d.donationId)} · STATUS: VERIFIED</p>
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF2E7;border-radius:8px;font-size:12px;margin-bottom:14px">
    <tr><td style="padding:7px 12px;color:#6B5B4E">Date:</td><td style="padding:7px 12px;font-weight:bold;text-align:right">${escapeHtml(pass?.event?.startDate ? istDate(new Date(pass.event.startDate)) : date)}</td></tr>
    ${pass?.event?.timeText ? `<tr><td style="padding:7px 12px;color:#6B5B4E">Timing:</td><td style="padding:7px 12px;font-weight:bold;text-align:right">${escapeHtml(pass.event.timeText)}</td></tr>` : ""}
    <tr><td style="padding:7px 12px;color:#6B5B4E">Venue:</td><td style="padding:7px 12px;font-weight:bold;text-align:right">${escapeHtml(pass?.event?.location || "Trust Ashram & Satsang Kendra")}</td></tr>
    <tr><td style="padding:7px 12px;color:#6B5B4E">Contribution:</td><td style="padding:7px 12px;font-weight:bold;text-align:right;color:#2F5A43">${amount}</td></tr>
  </table>
  <div style="text-align:center">
    <a href="${escapeHtml(pass?.url ?? "")}" style="display:inline-block;background:#E86F1D;color:#ffffff;text-decoration:none;font-weight:bold;font-size:13px;padding:9px 20px;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,0.15)">View & Download Entry Pass</a>
  </div>
  <p style="margin:10px 0 0;font-size:11px;color:#6B5B4E;text-align:center">Show this digital pass or attached PDF at the ashram gate for entry & Mahaprasad coupon.</p>
</td></tr>
</table>
</td></tr>`
    : "";

  const html = `<!doctype html><html><body style="margin:0;background:#FFF9F2;font-family:Arial,Helvetica,sans-serif;color:#2B201A">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #E7D8C8;border-radius:12px" cellpadding="0" cellspacing="0">
<tr><td style="padding:28px 28px 8px">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#B8893E;font-weight:bold">${escapeHtml(ngoName)}</p>
<h1 style="margin:0 0 16px;font-size:22px;color:#2B201A">${member ? "Membership confirmed" : hasPass ? "Event Pass & Confirmation" : "Donation confirmed"}</h1>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6">Dear ${escapeHtml(d.donorName)},</p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6">${escapeHtml(thanks).replace(escapeHtml(amount), `<strong>${amount}</strong>`)} Your payment has been successfully verified.</p>
</td></tr>
${passCardHtml}
<tr><td style="padding:8px 28px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF2E7;border-radius:8px">
${rows.map(([k, v]) => `<tr><td style="padding:10px 14px;font-size:13px;color:#6B5B4E">${k}</td><td style="padding:10px 14px;font-size:14px;font-weight:bold;text-align:right">${escapeHtml(v)}</td></tr>`).join("")}
</table>
</td></tr>
<tr><td align="center" style="padding:20px 28px 4px">
<p style="margin:0 0 14px;font-size:15px;line-height:1.6">${certificate.attached ? `Your <strong>${certName}</strong> is attached to this email as a PDF.` : `Your <strong>${certName}</strong> is ready.`}</p>
<a href="${escapeHtml(certificate.url)}" style="display:inline-block;background:#2F5A43;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:11px 24px;border-radius:8px">View certificate online</a>
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
  const member = d.type === "MEMBERSHIP";
  const rows: [string, string][] = [
    [member ? "Member" : "Donor", d.donorName],
    ["Amount", amount],
    [member ? "Membership ID" : "Donation ID", d.donationId],
    [member ? "Membership plan" : "Towards", d.program ?? "-"],
    ["Email", d.donorEmail],
    ["Mobile", d.donorMobile ?? "-"],
    markedPaid ? ["Marked as paid", ist(d.proofSubmittedAt ?? new Date())] : ["QR shown", ist(d.createdAt)],
  ];
  const lead = markedPaid
    ? `${d.donorName} has tapped "I have completed the payment" for ${amount} to ${upiId}.`
    : `${d.donorName} is paying ${amount} to ${upiId} by UPI (the QR has just been shown to them).`;
  const who = member ? "member" : "donor";

  // Same subject for both emails (QR shown, then "has paid"), so they are easy to match up.
  const subject = `${member ? "Membership payment" : "Payment"} to approve: ${amount} from ${d.donorName} (${d.donationId})`;
  const text = [
    lead,
    "",
    "When the money shows up in your UPI app or bank statement, approve the payment",
    `and the ${who} will get their confirmation email:`,
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
<h1 style="margin:0 0 16px;font-size:22px;color:#2B201A">${markedPaid ? `${escapeHtml(d.donorName)} has paid: please approve` : member ? `New ${escapeHtml(d.program ?? "membership")}: approve when received` : "New donation: approve when received"}</h1>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6">${escapeHtml(lead)}</p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6">When the money shows up in your UPI app or bank statement, approve it and the ${who} will get their confirmation email.</p>
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

// The people who approve payments: APPROVAL_EMAILS only. GMAIL_USER (the sending inbox)
// is used only when APPROVAL_EMAILS is empty, so approvals are never lost.
function approvers(config: Env) {
  const all = config.APPROVAL_EMAILS.length > 0 ? config.APPROVAL_EMAILS : [config.GMAIL_USER].filter((e): e is string => Boolean(e));
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
    [donation.type === "MEMBERSHIP" ? "Member" : "Donor", donation.donorName],
    ["Amount", amount],
    [donation.type === "MEMBERSHIP" ? "Membership ID" : "Donation ID", donation.donationId],
    ...(donation.type === "MEMBERSHIP" ? [["Membership plan", donation.program ?? "-"] as [string, string]] : []),
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

// Tells the approvers (APPROVAL_EMAILS) about a payment to approve, with the approve link:
// when the QR is shown and again when the donor marks it as paid. Never throws.
export async function sendApprovalRequestEmail(donation: Donation, approveUrl: string) {
  const config = env();
  const msg = approvalRequestEmail(donation, approveUrl, config.NGO_NAME, config.UPI_ID ?? "the Trust's UPI ID");
  await sendToApprovers(donation, msg, "approval request");
}

// Sends the confirmation email, records the attempt in EmailLog and updates
// the donation's email status. Never throws; returns the outcome.
export async function sendConfirmationEmail(donation: Donation) {
  const config = env();
  const k = certificateKey(donation);
  const certificateUrl = `${publicBaseUrl()}/certificate/${donation.donationId}?k=${k}`;
  const passUrl = `${publicBaseUrl()}/pass/${donation.donationId}?k=${k}`;

  // Find linked event if program is set
  let event: Event | null = null;
  if (donation.program) {
    try {
      event = await prisma.event.findFirst({
        where: { title: { equals: donation.program, mode: "insensitive" } },
      });
    } catch {}
  }

  // QR Code on pass redirects directly to the event on the website:
  const eventSlug = event?.slug || "shrimad-bhagwat-katha-2026";
  const eventRedirectUrl = `${publicBaseUrl()}/?event=${encodeURIComponent(eventSlug)}#events`;

  // A certificate that fails to render must not hold up the confirmation itself.
  let pdf: Uint8Array | null = null;
  try {
    pdf = await generateCertificatePdf(donation, certificateUrl);
  } catch (e) {
    console.error(`[certificate] ${donation.donationId}:`, e instanceof Error ? e.message : e);
  }

  // Generate Event Pass PDF with QR Code linking to the Event
  let passPdf: Uint8Array | null = null;
  if (donation.program || event) {
    try {
      passPdf = await generateEventPassPdf(donation, event, eventRedirectUrl);
    } catch (e) {
      console.error(`[event-pass] ${donation.donationId}:`, e instanceof Error ? e.message : e);
    }
  }

  const passInfo = donation.program || event
    ? { url: eventRedirectUrl, attached: Boolean(passPdf), event }
    : undefined;

  const { subject, text, html } = confirmationEmail(
    donation,
    config.NGO_NAME,
    { url: certificateUrl, attached: Boolean(pdf) },
    passInfo
  );

  const attachments: Attachment[] = [];
  if (passPdf) {
    attachments.push({
      filename: `Event-Pass-${donation.donationId}.pdf`,
      content: Buffer.from(passPdf),
      contentType: "application/pdf",
    });
  }
  if (pdf) {
    attachments.push({
      filename: `${donation.type === "MEMBERSHIP" ? "Membership" : "Donation"}-Certificate-${certificateNumber(donation.donationId).replace(/\//g, "-")}.pdf`,
      content: Buffer.from(pdf),
      contentType: "application/pdf",
    });
  }

  let status: "SENT" | "FAILED" = "FAILED";
  let providerId: string | undefined;
  let error: string | undefined;

  try {
    const sent = await deliver(config, { to: donation.donorEmail, subject, text, html, attachments });
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

type Attachment = { filename: string; content: Buffer; contentType: string };
// Tells the customer that a refund for their cancelled book order was started or has been sent. Never throws.
export async function sendOrderRefundEmail(order: Order, stage: "initiated" | "completed") {
  const config = env();
  const amount = `₹${order.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  const done = stage === "completed";
  const subject = done
    ? `Refund sent for order ${order.orderNumber} – ${config.NGO_NAME}`
    : `Order ${order.orderNumber} cancelled – refund in progress`;
  const intro = done
    ? `We have sent your refund of ${amount} for the cancelled order ${order.orderNumber} to the UPI account you paid from.`
    : `Your order ${order.orderNumber} has been cancelled. A refund of ${amount} will be sent to the UPI account you paid from. We will email you again once it has been sent.`;
  const rows: [string, string][] = [
    ["Order", order.orderNumber],
    ["Refund amount", amount],
    ["Refund status", done ? "Refunded" : "In progress"],
    ...(done && order.refundedAt ? [["Refunded on", istDate(order.refundedAt)] as [string, string]] : []),
    ...(done && order.refundReference ? [["UPI reference", order.refundReference] as [string, string]] : []),
  ];
  const accountUrl = `${publicBaseUrl()}/account`;
  const text = [`Dear ${order.shippingName},`, "", intro, "", ...rows.map(([k, v]) => `${k}: ${v}`), "", `Track your orders: ${accountUrl}`].join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#FFF9F2;font-family:Arial,Helvetica,sans-serif;color:#2B201A">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #E7D8C8;border-radius:12px" cellpadding="0" cellspacing="0">
<tr><td style="padding:28px 28px 8px">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#B8893E;font-weight:bold">${escapeHtml(config.NGO_NAME)}</p>
<h1 style="margin:0 0 16px;font-size:22px;color:${done ? "#2F5A43" : "#B45309"}">${done ? "Refund sent" : "Refund in progress"}</h1>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6">Dear ${escapeHtml(order.shippingName)},</p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6">${escapeHtml(intro)}</p>
</td></tr>
<tr><td style="padding:8px 28px 8px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FBF2E7;border-radius:8px">
${rows.map(([k, v]) => `<tr><td style="padding:10px 14px;font-size:13px;color:#6B5B4E">${k}</td><td style="padding:10px 14px;font-size:14px;font-weight:bold;text-align:right">${escapeHtml(v)}</td></tr>`).join("")}
</table>
</td></tr>
<tr><td style="padding:16px 28px 28px"><a href="${accountUrl}" style="display:inline-block;background:#E86F1D;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:10px 18px;border-radius:8px">View my orders</a></td></tr>
</table></td></tr></table></body></html>`;

  try {
    const sent = await deliver(config, { to: order.shippingEmail, subject, text, html });
    if (!sent.ok) console.warn(`[email] ${sent.error} (refund ${stage} for ${order.orderNumber})`);
  } catch (e) {
    console.error(`[email] refund ${stage} for ${order.orderNumber} failed:`, e instanceof Error ? e.message : e);
  }
}

type Message = { to: string; subject: string; text: string; html: string; attachments?: Attachment[] };
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
      body: JSON.stringify({
        ...msg,
        from: config.EMAIL_FROM,
        to: [msg.to],
        reply_to: config.EMAIL_REPLY_TO,
        attachments: msg.attachments?.map((a) => ({ filename: a.filename, content: a.content.toString("base64") })),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    return res.ok ? { ok: true, id: body.id } : { ok: false, error: `Resend ${res.status}: ${body.message ?? res.statusText}` };
  }

  return { ok: false, error: "Email is not configured (set GMAIL_USER and GMAIL_APP_PASSWORD)." };
}

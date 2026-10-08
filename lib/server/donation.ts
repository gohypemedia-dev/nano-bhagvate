import "server-only";
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { env } from "./env";

// No 0/O, 1/I/L so IDs can be read out over the phone.
const ID_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function istDateStamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date); // 2026-10-06
  return parts.replaceAll("-", "");
}

export function generateDonationId() {
  let suffix = "";
  for (let i = 0; i < 5; i++) suffix += ID_ALPHABET[randomInt(ID_ALPHABET.length)];
  return `DON-${istDateStamp()}-${suffix}`;
}

export function generateToken() {
  return randomBytes(32).toString("base64url");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function tokenMatchesHash(token: string, hash: string) {
  const a = Buffer.from(sha256(token), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

// The approver opens this link from their phone/inbox, so it must be the public site:
// NEXT_PUBLIC_APP_URL, else the Vercel production domain (set by Vercel), else this request's origin.
// A localhost NEXT_PUBLIC_APP_URL (e.g. copied from a dev .env into Vercel) is ignored when the
// site itself runs on a real domain, so live emails never link to localhost.
export function publicBaseUrl(request?: Request) {
  const isLocal = (url: string) => /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(url);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const origin = request ? new URL(request.url).origin : "http://localhost:3000";
  const fallback = vercel ? `https://${vercel}` : origin;
  const configured = env().NEXT_PUBLIC_APP_URL;
  const base = configured && !(isLocal(configured) && !isLocal(fallback)) ? configured : fallback;
  return base.replace(/\/+$/, "");
}

export function approvalLink(request: Request, approvalToken: string) {
  return `${publicBaseUrl(request)}/admin/approve/${approvalToken}`;
}

export function buildUpiUri(upiId: string, donationId: string, amountPaise: number) {
  const config = env();
  // Same fields, in the same order, as the bank's printed QR, plus amount and note.
  const params: [string, string][] = [
    ...(config.UPI_MCC ? ([["mc", config.UPI_MCC]] as [string, string][]) : []),
    ["pa", upiId],
    ["pn", config.UPI_NAME],
    ["am", (amountPaise / 100).toFixed(2)],
    ["cu", "INR"],
    ["tn", donationId],
  ];
  // `tr` is only reliable on merchant UPI IDs; on personal IDs some apps decline the payment.
  if (config.UPI_IS_MERCHANT) params.push(["tr", donationId]);
  // Keep "@" literal in the UPI ID: a few UPI apps don't decode %40.
  const query = params.map(([k, v]) => `${k}=${encodeURIComponent(v).replace(/%40/g, "@")}`).join("&");
  return `upi://pay?${query}`;
}

import "server-only";
// @pdf-lib/fontkit's Indic shaper (needed for Hindi names) expects this global.
import "regenerator-runtime/runtime.js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, degrees, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import QRCode from "qrcode";
import type { Donation } from "@prisma/client";
import { createHash } from "node:crypto";
import { env } from "./env";

// Donation certificate: one A4 landscape page, attached to the donor's confirmation
// email after a payment is approved, and downloadable from /certificate/[donationId].

export const TRUST = {
  name: "Namo Bhagwate Vasudevaya Trust",
  address: "P6/10, 4th Floor, DLF Phase 2, Gurugram, Haryana 122008, India",
  phone: "+91 88606 65000",
  email: "help@namobhagwatevasudevaya.com",
};

// The public certificate link carries this key so certificates can't be looked up by guessing IDs.
// It is derived from the donation's secret submit-token hash, which never leaves the server.
export function certificateKey(d: Pick<Donation, "donationId" | "submitTokenHash">) {
  return createHash("sha256").update(`certificate:${d.donationId}:${d.submitTokenHash}`).digest("hex").slice(0, 20);
}

export function certificateNumber(donationId: string) {
  return `NBVT/CERT/${donationId.replace(/^DON-/, "")}`;
}

// Rupees (and paise) in words, Indian numbering: 110000 → "One Lakh Ten Thousand".
export function amountInWords(paise: number) {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (n: number) => (n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ""}`);
  const three = (n: number) => [n >= 100 ? `${ones[Math.floor(n / 100)]} Hundred` : "", two(n % 100)].filter(Boolean).join(" ");
  const words = (n: number) => {
    if (n === 0) return "Zero";
    const parts: string[] = [];
    const crore = Math.floor(n / 1e7), lakh = Math.floor((n % 1e7) / 1e5), thousand = Math.floor((n % 1e5) / 1e3), rest = n % 1e3;
    if (crore) parts.push(`${words(crore)} Crore`);
    if (lakh) parts.push(`${two(lakh)} Lakh`);
    if (thousand) parts.push(`${two(thousand)} Thousand`);
    if (rest) parts.push(three(rest));
    return parts.join(" ");
  };
  const rupees = Math.floor(paise / 100), p = paise % 100;
  return `Rupees ${words(rupees)}${p ? ` and ${two(p)} Paise` : ""} Only`;
}

const hex = (h: string): RGB => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const C = {
  paper: hex("#FFFBF3"),
  gold: hex("#B8893E"),
  goldLight: hex("#D9BC7A"),
  green: hex("#14532D"),
  saffron: hex("#B4531A"),
  ink: hex("#2B201A"),
  muted: hex("#6B5B4E"),
};

const ASSET_DIR = path.join(process.cwd(), "assets", "certificate");
let assets: Promise<Record<string, Uint8Array>> | undefined;
function loadAssets() {
  const files = {
    medium: "CormorantGaramond-Medium.ttf",
    semibold: "CormorantGaramond-SemiBold.ttf",
    bold: "CormorantGaramond-Bold.ttf",
    italic: "CormorantGaramond-MediumItalic.ttf",
    semiboldItalic: "CormorantGaramond-SemiBoldItalic.ttf",
    deva: "NotoSerifDevanagari-SemiBold.ttf",
    logo: "logo.png", // transparent, so it sits cleanly on the cream paper
  };
  assets ??= Promise.all(
    Object.entries(files).map(async ([k, f]) => [k, new Uint8Array(await readFile(path.join(ASSET_DIR, f)))] as const),
  ).then(Object.fromEntries);
  return assets;
}

// An optional scanned signature (transparent PNG) placed above the signatory's name.
async function loadSignature() {
  try {
    return new Uint8Array(await readFile(path.join(ASSET_DIR, "signature.png")));
  } catch {
    return null;
  }
}

const hasDevanagari = (s: string) => /[ऀ-ॿ]/.test(s);

export async function generateCertificatePdf(d: Donation, verifyUrl: string) {
  const config = env();
  const a = await loadAssets();
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`Donation Certificate ${certificateNumber(d.donationId)}`);
  doc.setAuthor(TRUST.name);
  doc.setSubject(`Donation by ${d.donorName}`);
  doc.setCreator(TRUST.name);

  // The Cormorant files in assets/ are trimmed to Latin + ₹ with fontTools (the full Google Fonts
  // files crash @pdf-lib/fontkit). lnum: full-height numbers for amounts, IDs and dates.
  const latin = { subset: true, features: { lnum: true } };
  const f = {
    medium: await doc.embedFont(a.medium, latin),
    semibold: await doc.embedFont(a.semibold, latin),
    bold: await doc.embedFont(a.bold, latin),
    italic: await doc.embedFont(a.italic, latin),
    semiboldItalic: await doc.embedFont(a.semiboldItalic, latin),
    deva: await doc.embedFont(a.deva, { subset: true }),
  };
  const logo = await doc.embedPng(a.logo);
  const sigBytes = await loadSignature();
  const signature = sigBytes ? await doc.embedPng(sigBytes) : null;

  const W = 842, H = 595; // A4 landscape
  const page = doc.addPage([W, H]);
  const cx = W / 2;
  // Hindi text needs the Devanagari font; it also covers Latin, so mixed strings work.
  const pick = (font: PDFFont, s: string) => (hasDevanagari(s) ? f.deva : font);

  const centered = (s: string, y: number, font: PDFFont, size: number, color: RGB) => {
    const fo = pick(font, s);
    page.drawText(s, { x: cx - fo.widthOfTextAtSize(s, size) / 2, y, size, font: fo, color });
  };
  const centeredAt = (s: string, x: number, y: number, font: PDFFont, size: number, color: RGB) => {
    const fo = pick(font, s);
    page.drawText(s, { x: x - fo.widthOfTextAtSize(s, size) / 2, y, size, font: fo, color });
  };
  // Letter-spaced capitals for the trust name and labels.
  const spaced = (s: string, x: number, y: number, font: PDFFont, size: number, tracking: number, color: RGB) => {
    const width = [...s].reduce((w, ch) => w + font.widthOfTextAtSize(ch, size) + tracking, -tracking);
    let at = x - width / 2;
    for (const ch of s) {
      page.drawText(ch, { x: at, y, size, font, color });
      at += font.widthOfTextAtSize(ch, size) + tracking;
    }
  };
  // Shrinks text to fit a width (long donor names, programs).
  const fitSize = (s: string, font: PDFFont, size: number, maxWidth: number, min: number) => {
    let sz = size;
    while (sz > min && pick(font, s).widthOfTextAtSize(s, sz) > maxWidth) sz -= 0.5;
    return sz;
  };

  // ── Paper, borders and corner ornaments ─────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.paper });
  page.drawRectangle({ x: 14, y: 14, width: W - 28, height: H - 28, borderColor: C.gold, borderWidth: 5 });
  page.drawRectangle({ x: 24, y: 24, width: W - 48, height: H - 48, borderColor: C.green, borderWidth: 1.2 });
  page.drawRectangle({ x: 28, y: 28, width: W - 56, height: H - 56, borderColor: C.goldLight, borderWidth: 0.6 });
  for (const [x, y] of [[28, 28], [W - 28, 28], [28, H - 28], [W - 28, H - 28]]) cornerOrnament(page, x, y);

  // Faint emblem behind the text.
  const wm = 330;
  page.drawImage(logo, { x: cx - wm / 2, y: H / 2 - wm / 2 - 20, width: wm, height: wm, opacity: 0.05 });

  // ── Header ──────────────────────────────────────────────────────────
  const logoSize = 74;
  page.drawImage(logo, { x: cx - logoSize / 2, y: H - 44 - logoSize, width: logoSize, height: logoSize });
  spaced("NAMO BHAGWATE VASUDEVAYA TRUST", cx, H - 140, f.bold, 17, 2.2, C.green);
  spaced("BHAKTI  •  SEVA  •  SANSKAR  •  SAMARPAN", cx, H - 155, f.semibold, 8, 1.6, C.gold);

  // ── Title ───────────────────────────────────────────────────────────
  centered("Certificate of Donation", H - 197, f.bold, 38, C.ink);
  divider(page, cx, H - 212, 120);

  // ── Recipient ───────────────────────────────────────────────────────
  centered("This certificate is gratefully presented to", H - 238, f.italic, 14, C.muted);
  const nameSize = fitSize(d.donorName, f.semiboldItalic, hasDevanagari(d.donorName) ? 30 : 36, 560, 20);
  centered(d.donorName, H - 278, f.semiboldItalic, nameSize, C.saffron);
  page.drawLine({ start: { x: cx - 190, y: H - 290 }, end: { x: cx + 190, y: H - 290 }, thickness: 0.8, color: C.gold });

  // ── Contribution ────────────────────────────────────────────────────
  const amount = `₹${(d.amountPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: d.amountPaise % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
  const date = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "long", year: "numeric" }).format(
    d.verifiedAt ?? new Date(),
  );
  const program = d.program?.trim() || "General Donation";
  centered("in grateful recognition of a generous contribution of", H - 314, f.medium, 13.5, C.ink);
  centered(`${amount}  ·  ${amountInWords(d.amountPaise)}`, H - 336, f.bold, fitSize(`${amount}  ·  ${amountInWords(d.amountPaise)}`, f.bold, 17, 640, 12), C.green);
  const towards = `towards ${program}, received on ${date}.`;
  centered(towards, H - 358, f.medium, fitSize(towards, f.medium, 13.5, 640, 10), C.ink);
  centered("Your kindness sustains our work in spiritual education, community service and compassionate action.", H - 378, f.italic, 11.5, C.muted);

  // ── Reference details ───────────────────────────────────────────────
  const cells: [string, string][] = [
    ["CERTIFICATE NO.", certificateNumber(d.donationId)],
    ["DONATION ID", d.donationId],
    ["PAYMENT", d.utr ? `UPI · UTR ${d.utr}` : "UPI"],
    ["DATE OF DONATION", date],
  ];
  const bandW = 620, bandY = 168, cellW = bandW / cells.length, bandX = cx - bandW / 2;
  page.drawLine({ start: { x: bandX, y: bandY + 36 }, end: { x: bandX + bandW, y: bandY + 36 }, thickness: 0.6, color: C.goldLight });
  page.drawLine({ start: { x: bandX, y: bandY - 6 }, end: { x: bandX + bandW, y: bandY - 6 }, thickness: 0.6, color: C.goldLight });
  cells.forEach(([label, value], i) => {
    const x = bandX + cellW * i + cellW / 2;
    if (i > 0) page.drawLine({ start: { x: bandX + cellW * i, y: bandY - 2 }, end: { x: bandX + cellW * i, y: bandY + 32 }, thickness: 0.5, color: C.goldLight });
    spaced(label, x, bandY + 20, f.semibold, 7, 1.2, C.gold);
    centeredAt(value, x, bandY + 3, f.semibold, fitSize(value, f.semibold, 11.5, cellW - 12, 8), C.ink);
  });

  // ── Seal (left), verification QR (centre), signature (right) ────────
  drawSeal(page, 190, 106, 48, f.bold, f.semibold, date);

  const qrSize = 58;
  await drawQr(page, verifyUrl, cx - qrSize / 2, 82, qrSize);
  centeredAt("Scan to verify", cx, 70, f.semibold, 8.5, C.muted);

  const sx = W - 200;
  if (signature) {
    const sw = 120, sh = (signature.height / signature.width) * sw;
    page.drawImage(signature, { x: sx - sw / 2, y: 104, width: sw, height: Math.min(sh, 42) });
  }
  page.drawLine({ start: { x: sx - 95, y: 102 }, end: { x: sx + 95, y: 102 }, thickness: 0.8, color: C.ink });
  centeredAt(config.CERT_SIGNATORY_NAME, sx, 86, f.bold, 13, C.ink);
  centeredAt(config.CERT_SIGNATORY_TITLE, sx, 73, f.italic, 10.5, C.muted);

  // ── Footer ──────────────────────────────────────────────────────────
  const reg = [
    config.TRUST_REGISTRATION_NO && `Regd. No. ${config.TRUST_REGISTRATION_NO}`,
    config.TRUST_PAN && `PAN ${config.TRUST_PAN}`,
    config.TRUST_80G_NO && `80G ${config.TRUST_80G_NO}`,
  ].filter(Boolean).join("   ·   ");
  centered(`${TRUST.address}   ·   ${TRUST.phone}   ·   ${TRUST.email}`, 46, f.medium, 8, C.muted);
  centered(
    reg ? `${reg}   ·   Computer-generated certificate; verify by scanning the QR code.` : "This is a computer-generated certificate. Verify its authenticity by scanning the QR code.",
    36,
    f.italic,
    7.5,
    C.muted,
  );

  return doc.save();
}

function divider(page: PDFPage, cx: number, y: number, half: number) {
  page.drawLine({ start: { x: cx - half, y }, end: { x: cx - 9, y }, thickness: 0.8, color: C.gold });
  page.drawLine({ start: { x: cx + 9, y }, end: { x: cx + half, y }, thickness: 0.8, color: C.gold });
  diamond(page, cx, y, 4.5, C.gold);
  diamond(page, cx - half - 5, y, 2, C.gold);
  diamond(page, cx + half + 5, y, 2, C.gold);
}

function diamond(page: PDFPage, x: number, y: number, r: number, color: RGB) {
  page.drawSvgPath(`M 0 ${-r} L ${r} 0 L 0 ${r} L ${-r} 0 Z`, { x, y, color });
}

// Small L-shaped flourish with a diamond, pointing into the page from a corner.
function cornerOrnament(page: PDFPage, x: number, y: number) {
  const sx = x < 421 ? 1 : -1, sy = y < 297 ? 1 : -1;
  const len = 46;
  page.drawLine({ start: { x: x + sx * 8, y: y + sy * 8 }, end: { x: x + sx * len, y: y + sy * 8 }, thickness: 1, color: C.gold });
  page.drawLine({ start: { x: x + sx * 8, y: y + sy * 8 }, end: { x: x + sx * 8, y: y + sy * len }, thickness: 1, color: C.gold });
  page.drawLine({ start: { x: x + sx * 13, y: y + sy * 13 }, end: { x: x + sx * (len - 12), y: y + sy * 13 }, thickness: 0.5, color: C.green });
  page.drawLine({ start: { x: x + sx * 13, y: y + sy * 13 }, end: { x: x + sx * 13, y: y + sy * (len - 12) }, thickness: 0.5, color: C.green });
  diamond(page, x + sx * 8, y + sy * 8, 4, C.green);
  diamond(page, x + sx * 8, y + sy * 8, 1.8, C.gold);
}

// Round trust seal with the name set along the rim.
function drawSeal(page: PDFPage, x: number, y: number, r: number, bold: PDFFont, semibold: PDFFont, date: string) {
  page.drawCircle({ x, y, size: r, borderColor: C.green, borderWidth: 2, opacity: 0, borderOpacity: 0.9 });
  page.drawCircle({ x, y, size: r - 4, borderColor: C.green, borderWidth: 0.6, opacity: 0, borderOpacity: 0.9 });
  page.drawCircle({ x, y, size: r - 16, borderColor: C.green, borderWidth: 0.6, opacity: 0, borderOpacity: 0.9 });
  // Name across the top ~210°, place along the bottom; a diamond in each gap.
  arcText(page, "NAMO BHAGWATE VASUDEVAYA TRUST", x, y, r - 10, bold, 5.6, 195, -15, C.green);
  arcText(page, "GURUGRAM", x, y, r - 10, bold, 5.6, 240, 300, C.green, true);
  diamond(page, x + (r - 10) * Math.cos((-38 * Math.PI) / 180), y + (r - 10) * Math.sin((-38 * Math.PI) / 180), 1.4, C.green);
  diamond(page, x + (r - 10) * Math.cos((218 * Math.PI) / 180), y + (r - 10) * Math.sin((218 * Math.PI) / 180), 1.4, C.green);
  const label = (s: string, dy: number, font: PDFFont, size: number) =>
    page.drawText(s, { x: x - font.widthOfTextAtSize(s, size) / 2, y: y + dy, size, font, color: C.green });
  label("DONATION", 4, bold, 8);
  label("VERIFIED", -6, bold, 8);
  label(date.replace(/^0/, ""), -15, semibold, 5.2);
}

// Draws text along a circle between two angles (degrees, 0 = east, counter-clockwise).
// Top arcs run clockwise (start > end); bottom arcs are drawn upright with `bottom`.
function arcText(page: PDFPage, s: string, cx: number, cy: number, radius: number, font: PDFFont, size: number,
  start: number, end: number, color: RGB, bottom = false) {
  const chars = [...s];
  const widths = chars.map((ch) => font.widthOfTextAtSize(ch, size) + 0.7);
  const total = widths.reduce((t, w) => t + w, 0);
  const span = (total / radius) * (180 / Math.PI);
  const mid = (start + end) / 2;
  let angle = bottom ? mid - span / 2 : mid + span / 2;
  chars.forEach((ch, i) => {
    const step = (widths[i] / radius) * (180 / Math.PI);
    const centre = bottom ? angle + step / 2 : angle - step / 2;
    const rad = (centre * Math.PI) / 180;
    const rot = bottom ? centre + 90 : centre - 90;
    const half = font.widthOfTextAtSize(ch, size) / 2;
    const rr = bottom ? radius + size * 0.7 : radius - size * 0.35;
    const px = cx + rr * Math.cos(rad), py = cy + rr * Math.sin(rad);
    const rotRad = (rot * Math.PI) / 180;
    page.drawText(ch, {
      x: px - half * Math.cos(rotRad),
      y: py - half * Math.sin(rotRad),
      size,
      font,
      color,
      rotate: degrees(rot),
    });
    angle = bottom ? angle + step : angle - step;
  });
}

async function drawQr(page: PDFPage, text: string, x: number, y: number, size: number) {
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const cell = size / n;
  page.drawRectangle({ x: x - 3, y: y - 3, width: size + 6, height: size + 6, color: rgb(1, 1, 1) });
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.modules.get(r, c)) {
        page.drawRectangle({ x: x + c * cell, y: y + size - (r + 1) * cell, width: cell + 0.05, height: cell + 0.05, color: C.ink });
      }
    }
  }
}


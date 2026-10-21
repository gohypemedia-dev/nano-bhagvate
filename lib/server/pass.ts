import "server-only";
import "regenerator-runtime/runtime.js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import QRCode from "qrcode";
import type { Donation, Event } from "@prisma/client";
import { TRUST } from "./certificate";
import { env } from "./env";

const hex = (h: string): RGB =>
  rgb(
    parseInt(h.slice(1, 3), 16) / 255,
    parseInt(h.slice(3, 5), 16) / 255,
    parseInt(h.slice(5, 7), 16) / 255
  );

const C = {
  paper: hex("#FFFDF8"),
  cardBg: hex("#FFF9F2"),
  gold: hex("#B8893E"),
  goldLight: hex("#E7D8C8"),
  green: hex("#14532D"),
  greenLight: hex("#2F5A43"),
  saffron: hex("#B4531A"),
  saffronLight: hex("#E86F1D"),
  ink: hex("#2B201A"),
  muted: hex("#6B5B4E"),
  white: hex("#FFFFFF"),
};

const ASSET_DIR = path.join(process.cwd(), "assets", "certificate");
let assets: Promise<Record<string, Uint8Array>> | undefined;

function loadAssets() {
  const files = {
    medium: "CormorantGaramond-Medium.ttf",
    semibold: "CormorantGaramond-SemiBold.ttf",
    bold: "CormorantGaramond-Bold.ttf",
    italic: "CormorantGaramond-MediumItalic.ttf",
    deva: "NotoSerifDevanagari-SemiBold.ttf",
    logo: "logo.png",
  };
  assets ??= Promise.all(
    Object.entries(files).map(
      async ([k, f]) => [k, new Uint8Array(await readFile(path.join(ASSET_DIR, f)))] as const
    )
  ).then(Object.fromEntries);
  return assets;
}

const hasDevanagari = (s: string) => /[ऀ-ॿ]/.test(s);

export async function generateEventPassPdf(
  donation: Donation,
  event: Event | null,
  verifyUrl: string
): Promise<Uint8Array> {
  const config = env();
  const a = await loadAssets();
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const eventName = event?.title || donation.program || "Spiritual Gathering";
  const passNum = `PASS-${donation.donationId}`;

  doc.setTitle(`Event Entry Pass - ${eventName} - ${donation.donorName}`);
  doc.setAuthor(TRUST.name);
  doc.setSubject(`Entry Pass for ${donation.donorName}`);
  doc.setCreator(TRUST.name);

  const latin = { subset: true, features: { lnum: true } };
  const f = {
    medium: await doc.embedFont(a.medium, latin),
    semibold: await doc.embedFont(a.semibold, latin),
    bold: await doc.embedFont(a.bold, latin),
    italic: await doc.embedFont(a.italic, latin),
    deva: await doc.embedFont(a.deva, { subset: true }),
  };
  const logo = await doc.embedPng(a.logo);

  // Generate QR Code PNG
  const qrPng = await QRCode.toBuffer(verifyUrl, {
    margin: 1,
    width: 250,
    errorCorrectionLevel: "M",
    color: { dark: "#2B201A", light: "#FFF9F2" },
  });
  const qrImage = await doc.embedPng(qrPng);

  // Dimensions: Standard A4 Landscape
  const W = 842,
    H = 595;
  const page = doc.addPage([W, H]);

  const pick = (font: PDFFont, s: string) => (hasDevanagari(s) ? f.deva : font);

  const centeredAt = (s: string, x: number, y: number, font: PDFFont, size: number, color: RGB) => {
    const fo = pick(font, s);
    page.drawText(s, { x: x - fo.widthOfTextAtSize(s, size) / 2, y, size, font: fo, color });
  };

  const spaced = (
    s: string,
    x: number,
    y: number,
    font: PDFFont,
    size: number,
    tracking: number,
    color: RGB
  ) => {
    const width = [...s].reduce((w, ch) => w + font.widthOfTextAtSize(ch, size) + tracking, -tracking);
    let at = x - width / 2;
    for (const ch of s) {
      page.drawText(ch, { x: at, y, size, font, color });
      at += font.widthOfTextAtSize(ch, size) + tracking;
    }
  };

  // Background
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.paper });

  // Outer Decorative Borders
  page.drawRectangle({
    x: 18,
    y: 18,
    width: W - 36,
    height: H - 36,
    borderColor: C.gold,
    borderWidth: 3,
  });
  page.drawRectangle({
    x: 24,
    y: 24,
    width: W - 48,
    height: H - 48,
    borderColor: C.saffronLight,
    borderWidth: 1,
  });

  // Top Saffron Banner
  const topY = H - 30;
  page.drawRectangle({
    x: 26,
    y: topY - 78,
    width: W - 52,
    height: 76,
    color: hex("#2B201A"),
  });

  // Logo in Top Left
  const logoH = 54;
  const logoW = (logo.width / logo.height) * logoH;
  page.drawImage(logo, { x: 44, y: topY - 66, width: logoW, height: logoH });

  // Header Title
  spaced("NAMO BHAGWATE VASUDEVAYA TRUST", W / 2, topY - 34, f.bold, 18, 2, C.gold);
  spaced(
    "DHARMA  •  SEVA  •  SANSKAR  •  SATSANG",
    W / 2,
    topY - 52,
    f.semibold,
    9,
    1.5,
    hex("#E7D8C8")
  );

  // Badge: OFFICIAL EVENT ENTRY PASS
  const badgeY = topY - 110;
  page.drawRectangle({
    x: W / 2 - 140,
    y: badgeY,
    width: 280,
    height: 24,
    color: C.saffronLight,
    borderColor: C.gold,
    borderWidth: 1,
  });
  centeredAt("OFFICIAL EVENT ENTRY PASS · प्रवेश पत्र", W / 2, badgeY + 6, f.bold, 11, C.white);

  // Event Name Header
  const eventTitleY = badgeY - 34;
  centeredAt(eventName, W / 2, eventTitleY, f.bold, 24, C.ink);
  if (event?.titleHi) {
    centeredAt(event.titleHi, W / 2, eventTitleY - 20, f.deva, 14, C.gold);
  }

  // Two Column Layout
  // Left: Devotee & Venue Details (Width: 480)
  // Right: QR Code & Verification Box (Width: 240)
  const contentY = badgeY - 75;
  const leftX = 54;

  // Devotee Box
  page.drawRectangle({
    x: leftX,
    y: contentY - 88,
    width: 460,
    height: 88,
    color: hex("#FBF2E7"),
    borderColor: C.goldLight,
    borderWidth: 1,
  });

  page.drawText("PASS HOLDER / DEVOTEE NAME", {
    x: leftX + 16,
    y: contentY - 22,
    size: 9,
    font: f.semibold,
    color: C.muted,
  });
  page.drawText(donation.donorName, {
    x: leftX + 16,
    y: contentY - 44,
    size: 20,
    font: pick(f.bold, donation.donorName),
    color: C.ink,
  });

  page.drawText(`Email: ${donation.donorEmail}`, {
    x: leftX + 16,
    y: contentY - 64,
    size: 10,
    font: f.medium,
    color: C.ink,
  });
  if (donation.donorMobile) {
    page.drawText(`Phone: ${donation.donorMobile}`, {
      x: leftX + 260,
      y: contentY - 64,
      size: 10,
      font: f.medium,
      color: C.ink,
    });
  }

  // Event Schedule & Venue Box
  const venueBoxY = contentY - 235;
  page.drawRectangle({
    x: leftX,
    y: venueBoxY,
    width: 460,
    height: 135,
    color: hex("#FFFFFF"),
    borderColor: C.goldLight,
    borderWidth: 1,
  });

  // Table rows in Venue Box
  // Five rows must fit inside the 135pt box: first baseline at +110, last at +22.
  const rowH = 22;
  const startRowY = venueBoxY + 110;

  const eventDateStr = event?.startDate
    ? new Date(event.startDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(donation.verifiedAt ?? new Date());

  const rows: [string, string][] = [
    ["Event Date:", eventDateStr],
    ["Timing:", event?.timeText || "4:00 PM – 7:30 PM IST Daily"],
    ["Venue:", event?.location || "Trust Ashram & Satsang Kendra"],
    ["Address:", event?.address || TRUST.address],
    [
      "Contribution:",
      `₹${(donation.amountPaise / 100).toLocaleString("en-IN")} (Verified & Confirmed)`,
    ],
  ];

  rows.forEach(([label, val], idx) => {
    const curY = startRowY - idx * rowH;
    page.drawText(label, { x: leftX + 16, y: curY, size: 10, font: f.bold, color: C.muted });
    const valFont = pick(f.semibold, val);
    const shortVal = val.length > 55 ? val.slice(0, 52) + "..." : val;
    page.drawText(shortVal, {
      x: leftX + 110,
      y: curY,
      size: idx === 4 ? 11 : 10,
      font: valFont,
      color: idx === 4 ? C.greenLight : C.ink,
    });
  });

  // Right Column: QR Code & Gate Verification Box
  const qrBoxX = 534;
  const qrBoxW = 254;
  const qrBoxH = 227;
  const qrBoxY = venueBoxY;

  page.drawRectangle({
    x: qrBoxX,
    y: qrBoxY,
    width: qrBoxW,
    height: qrBoxH,
    color: hex("#FBF2E7"),
    borderColor: C.goldLight,
    borderWidth: 1,
  });

  // Pass Number
  page.drawRectangle({
    x: qrBoxX + 14,
    y: qrBoxY + qrBoxH - 34,
    width: qrBoxW - 28,
    height: 22,
    color: hex("#2F5A43"),
  });
  centeredAt(passNum, qrBoxX + qrBoxW / 2, qrBoxY + qrBoxH - 26, f.bold, 11, C.white);

  // QR Code Image
  const qrSize = 120;
  page.drawImage(qrImage, {
    x: qrBoxX + (qrBoxW - qrSize) / 2,
    y: qrBoxY + 54,
    width: qrSize,
    height: qrSize,
  });

  centeredAt("SCAN TO VERIFY PASS", qrBoxX + qrBoxW / 2, qrBoxY + 36, f.bold, 8.5, C.saffronLight);
  centeredAt("Verified Official Pass", qrBoxX + qrBoxW / 2, qrBoxY + 22, f.italic, 8, C.muted);

  // Security & Instructions Footer Strip
  const footerY = 32;
  page.drawRectangle({
    x: 26,
    y: footerY,
    width: W - 52,
    height: 48,
    color: hex("#FBF2E7"),
    borderColor: C.goldLight,
    borderWidth: 0.5,
  });

  page.drawText(
    "INSTRUCTIONS: 1. Present this digital pass or printout at the ashram reception for entry and Mahaprasad coupon.",
    { x: 38, y: footerY + 30, size: 7.5, font: f.semibold, color: C.ink }
  );
  page.drawText(
    `2. Seating is arranged on a first-come basis. For assistance, contact Ashram Helpline: ${event?.contactPhone || TRUST.phone} · ${TRUST.email}`,
    { x: 38, y: footerY + 16, size: 7.5, font: f.medium, color: C.muted }
  );

  return doc.save();
}

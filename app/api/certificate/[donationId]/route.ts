import { certificateKey, generateCertificatePdf } from "@/lib/server/certificate";
import { publicBaseUrl } from "@/lib/server/donation";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import { donationIdSchema } from "@/lib/validation/donation";
import { getCurrentUser } from "@/lib/server/user-auth";
import { getAdmin } from "@/lib/server/auth";

// Downloads the donation (or membership) certificate PDF. Needs the key from the certificate link
// (/certificate/[donationId]?k=...), or authenticated owner/admin session, and only works once the payment is approved.
export async function GET(request: Request, { params }: { params: Promise<{ donationId: string }> }) {
  const limit = await rateLimit("certificate-ip", clientIp(request), 60, 10 * 60);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const { donationId } = await params;
  const key = new URL(request.url).searchParams.get("k") ?? "";
  if (!donationIdSchema.safeParse(donationId).success) return jsonError("Certificate not found.", 404);

  const donation = await prisma.donation.findUnique({ where: { donationId } });
  if (!donation || donation.status !== "VERIFIED") {
    return jsonError("Certificate not found.", 404);
  }

  const [currentUser, admin] = await Promise.all([
    getCurrentUser().catch(() => null),
    getAdmin().catch(() => null),
  ]);

  const isOwner = Boolean(
    currentUser &&
      (currentUser.email.toLowerCase() === donation.donorEmail.toLowerCase() ||
        (currentUser.phone && donation.donorMobile && currentUser.phone === donation.donorMobile))
  );
  const isAdmin = Boolean(admin);
  const keyMatches = key === certificateKey(donation);

  if (!keyMatches && !isOwner && !isAdmin) {
    return jsonError("Certificate not found.", 404);
  }

  const effectiveKey = keyMatches ? key : certificateKey(donation);
  const verifyUrl = `${publicBaseUrl(request)}/certificate/${donationId}?k=${effectiveKey}`;
  const pdf = await generateCertificatePdf(donation, verifyUrl);
  const download = new URL(request.url).searchParams.has("download");
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${donation.type === "MEMBERSHIP" ? "Membership" : "Donation"}-Certificate-${donationId}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

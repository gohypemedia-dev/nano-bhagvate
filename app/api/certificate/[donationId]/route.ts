import { certificateKey, generateCertificatePdf } from "@/lib/server/certificate";
import { publicBaseUrl } from "@/lib/server/donation";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";
import { donationIdSchema } from "@/lib/validation/donation";

// Downloads the donation certificate PDF. Needs the key from the certificate link
// (/certificate/[donationId]?k=...), and only works once the payment is approved.
export async function GET(request: Request, { params }: { params: Promise<{ donationId: string }> }) {
  const limit = await rateLimit("certificate-ip", clientIp(request), 60, 10 * 60);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const { donationId } = await params;
  const key = new URL(request.url).searchParams.get("k") ?? "";
  if (!donationIdSchema.safeParse(donationId).success) return jsonError("Certificate not found.", 404);

  const donation = await prisma.donation.findUnique({ where: { donationId } });
  if (!donation || key !== certificateKey(donation) || donation.status !== "VERIFIED") {
    return jsonError("Certificate not found.", 404);
  }

  const verifyUrl = `${publicBaseUrl(request)}/certificate/${donationId}?k=${key}`;
  const pdf = await generateCertificatePdf(donation, verifyUrl);
  const download = new URL(request.url).searchParams.has("download");
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="Donation-Certificate-${donationId}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

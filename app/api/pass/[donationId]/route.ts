import { prisma } from "@/lib/server/prisma";
import { certificateKey } from "@/lib/server/certificate";
import { generateEventPassPdf } from "@/lib/server/pass";
import { publicBaseUrl } from "@/lib/server/donation";
import { donationCategory } from "@/lib/server/donation-category";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ donationId: string }> }
) {
  const { donationId } = await params;
  const url = new URL(request.url);
  const k = url.searchParams.get("k");

  const donation = await prisma.donation.findUnique({
    where: { donationId },
  });

  if (!donation || !k || k !== certificateKey(donation)) {
    return new Response("Unauthorized or invalid pass link.", { status: 403 });
  }

  if (donation.status !== "VERIFIED") {
    return new Response("Payment not yet approved by the Trust.", { status: 400 });
  }

  // Entry passes exist only for event registrations; members and donors get a certificate instead.
  const category = await donationCategory(donation);
  if (category.kind !== "event") {
    return new Response("This payment is not an event registration, so it has no entry pass.", { status: 404 });
  }

  const passUrl = `${publicBaseUrl()}/pass/${donation.donationId}?k=${k}`;
  const pdfBytes = await generateEventPassPdf(donation, category.event, passUrl);

  return new Response(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Event-Pass-${donation.donationId}.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

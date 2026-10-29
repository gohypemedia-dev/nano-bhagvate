import { prisma } from "@/lib/server/prisma";
import { certificateKey } from "@/lib/server/certificate";
import { generateEventPassPdf } from "@/lib/server/pass";
import { publicBaseUrl } from "@/lib/server/donation";
import { donationCategory } from "@/lib/server/donation-category";
import { getCurrentUser } from "@/lib/server/user-auth";
import { getAdmin } from "@/lib/server/auth";

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

  if (!donation) {
    return new Response("Pass not found.", { status: 404 });
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
  const keyMatches = Boolean(k && k === certificateKey(donation));

  if (!keyMatches && !isOwner && !isAdmin) {
    return new Response("Unauthorized or invalid pass link.", { status: 403 });
  }

  if (donation.status !== "VERIFIED") {
    return new Response("Payment not yet approved by the Trust.", { status: 400 });
  }

  // Entry passes exist for event registrations
  const category = await donationCategory(donation);
  if (category.kind !== "event") {
    return new Response("This payment is not an event registration, so it has no entry pass PDF.", { status: 404 });
  }

  const effectiveKey = keyMatches ? k : certificateKey(donation);
  const passUrl = `${publicBaseUrl()}/pass/${donation.donationId}?k=${effectiveKey}`;
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

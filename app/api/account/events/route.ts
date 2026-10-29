import { getCurrentUser } from "@/lib/server/user-auth";
import { prisma } from "@/lib/server/prisma";
import { certificateKey } from "@/lib/server/certificate";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Fetch all events to match titles
  const allEvents = await prisma.event.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      titleHi: true,
      summary: true,
      summaryHi: true,
      description: true,
      startDate: true,
      endDate: true,
      timeText: true,
      location: true,
      address: true,
      image: true,
      contactPhone: true,
      isPublished: true,
    },
  });

  const eventTitleMap = new Map(allEvents.map((e) => [e.title.toLowerCase().trim(), e]));
  const eventTitles = allEvents.map((e) => e.title);

  // 2. Fetch donations made by this user that correspond to events
  const userDonations = await prisma.donation.findMany({
    where: {
      OR: [
        { donorEmail: user.email },
        { donorEmail: user.email.toLowerCase() },
        ...(user.phone ? [{ donorMobile: user.phone }] : []),
      ],
      program: { in: eventTitles },
    },
    orderBy: { createdAt: "desc" },
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const bookings = userDonations
    .map((donation) => {
      const progKey = (donation.program || "").toLowerCase().trim();
      const event = eventTitleMap.get(progKey);
      if (!event) return null;

      // Determine if completed (past) or upcoming
      const end = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
      // Give leeway until end of the day
      end.setUTCHours(23, 59, 59, 999);
      const isCompleted = end < today;

      return {
        donationId: donation.donationId,
        program: donation.program,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        amountPaise: donation.amountPaise,
        status: donation.status,
        createdAt: donation.createdAt.toISOString(),
        verifiedAt: donation.verifiedAt?.toISOString() || null,
        certificateKey: certificateKey(donation),
        isCompleted,
        event: {
          id: event.id,
          slug: event.slug,
          title: event.title,
          titleHi: event.titleHi,
          summary: event.summary,
          summaryHi: event.summaryHi,
          startDate: event.startDate.toISOString(),
          endDate: event.endDate ? event.endDate.toISOString() : null,
          timeText: event.timeText,
          location: event.location,
          address: event.address,
          image: event.image,
          contactPhone: event.contactPhone,
        },
      };
    })
    .filter(Boolean);

  return Response.json({
    events: bookings,
    total: bookings.length,
    upcomingCount: bookings.filter((b) => !b?.isCompleted).length,
    completedCount: bookings.filter((b) => b?.isCompleted).length,
  });
}


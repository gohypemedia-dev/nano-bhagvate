import { prisma } from "@/lib/server/prisma";
import EventsClientView from "@/components/events/EventsClientView";
import type { EventItem } from "@/components/EventDetailsModal";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const all = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { startDate: "asc" },
  });

  // Upcoming and ongoing events first (soonest first), then past events (most recent first).
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const isPast = (e: (typeof all)[number]) => (e.endDate ?? e.startDate) < today;
  const events = [...all.filter((e) => !isPast(e)), ...all.filter(isPast).reverse()];

  const serializedEvents: EventItem[] = events.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    titleHi: e.titleHi,
    summary: e.summary,
    summaryHi: e.summaryHi,
    description: e.description,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate ? e.endDate.toISOString() : null,
    timeText: e.timeText,
    location: e.location,
    address: e.address,
    mapUrl: e.mapUrl,
    image: e.image,
    contactPhone: e.contactPhone,
    isPublished: e.isPublished,
  }));

  return <EventsClientView initialEvents={serializedEvents} />;
}

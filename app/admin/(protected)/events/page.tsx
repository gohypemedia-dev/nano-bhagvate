import { requireAdminPage } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import EventManager, { AdminEventItem } from "@/components/admin/events/EventManager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Events Management | Namo Bhagwate Admin",
};

export default async function AdminEventsPage() {
  await requireAdminPage();

  const rawEvents = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
  });

  const formattedEvents: AdminEventItem[] = rawEvents.map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    titleHi: item.titleHi,
    summary: item.summary,
    summaryHi: item.summaryHi,
    description: item.description,
    startDate: item.startDate.toISOString(),
    endDate: item.endDate ? item.endDate.toISOString() : null,
    timeText: item.timeText,
    location: item.location,
    address: item.address,
    mapUrl: item.mapUrl,
    image: item.image,
    contactPhone: item.contactPhone,
    isPublished: item.isPublished,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return <EventManager initialEvents={formattedEvents} />;
}

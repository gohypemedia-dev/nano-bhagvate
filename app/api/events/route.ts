import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const all = await prisma.event.findMany({
      where: { isPublished: true },
      orderBy: { startDate: "asc" },
    });

    // Upcoming and ongoing events first (soonest first), then past events (most recent first).
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const isPast = (e: (typeof all)[number]) => (e.endDate ?? e.startDate) < today;
    const events = [...all.filter((e) => !isPast(e)), ...all.filter(isPast).reverse()];

    // Cache at Edge for 60s, stale-while-revalidate for 5 minutes
    return Response.json(
      { events },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return Response.json({ events: [], error: "Failed to fetch events" }, { status: 500 });
  }
}

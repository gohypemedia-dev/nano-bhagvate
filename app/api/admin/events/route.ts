import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function cleanUrl(val?: string | null): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

const eventSchema = z.object({
  slug: z.string().trim().optional().nullable().or(z.literal("")),
  title: z.string().trim().min(1, "Title is required").max(200),
  titleHi: z.string().trim().max(200).optional().nullable(),
  summary: z.string().trim().min(1, "Summary is required").max(1000),
  summaryHi: z.string().trim().max(500).optional().nullable(),
  description: z.string().trim().default(""),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  timeText: z.string().trim().max(100).optional().nullable(),
  location: z.string().trim().min(1, "Location is required").max(200),
  address: z.string().trim().max(300).optional().nullable(),
  mapUrl: z.string().trim().optional().nullable(),
  image: z.string().trim().optional().nullable(),
  contactPhone: z.string().trim().max(50).optional().nullable(),
  isPublished: z.boolean().default(true),
});

export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const events = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
  });

  return Response.json({ events }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminApi(request);
    if (admin instanceof Response) return admin;

    const body = await request.json().catch(() => null);
    if (!body) return jsonError("No request body provided.", 400);

    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      return jsonError(message, 400);
    }

    const data = parsed.data;
    let finalSlug = data.slug && data.slug.trim().length >= 2 ? slugify(data.slug) : slugify(data.title);
    if (!finalSlug || finalSlug.length < 2) finalSlug = `event-${Date.now()}`;

    // Ensure unique slug
    let slugConflict = await prisma.event.findUnique({ where: { slug: finalSlug } });
    if (slugConflict) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    let startDateObj = new Date(data.startDate);
    if (isNaN(startDateObj.getTime())) {
      startDateObj = new Date();
    }

    let endDateObj = data.endDate && data.endDate.trim() ? new Date(data.endDate) : null;
    if (endDateObj && isNaN(endDateObj.getTime())) {
      endDateObj = null;
    }

    const newEvent = await prisma.event.create({
      data: {
        slug: finalSlug,
        title: data.title,
        titleHi: data.titleHi?.trim() || null,
        summary: data.summary,
        summaryHi: data.summaryHi?.trim() || null,
        description: data.description || "",
        startDate: startDateObj,
        endDate: endDateObj,
        timeText: data.timeText?.trim() || null,
        location: data.location,
        address: data.address?.trim() || null,
        mapUrl: cleanUrl(data.mapUrl),
        image: data.image?.trim() || null,
        contactPhone: data.contactPhone?.trim() || null,
        isPublished: Boolean(data.isPublished),
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/events");

    return Response.json({ success: true, event: newEvent }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create event:", error);
    return jsonError(error.message || "Failed to create event in database.", 500);
  }
}

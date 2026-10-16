import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

function cleanUrl(val?: string | null): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

const updateEventSchema = z.object({
  slug: z.string().trim().optional().nullable().or(z.literal("")),
  title: z.string().trim().min(1, "Title is required").max(200).optional(),
  titleHi: z.string().trim().max(200).optional().nullable(),
  summary: z.string().trim().min(1, "Summary is required").max(1000).optional(),
  summaryHi: z.string().trim().max(500).optional().nullable(),
  description: z.string().trim().optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().optional().nullable(),
  timeText: z.string().trim().max(100).optional().nullable(),
  location: z.string().trim().min(1).max(200).optional(),
  address: z.string().trim().max(300).optional().nullable(),
  mapUrl: z.string().trim().optional().nullable(),
  image: z.string().trim().optional().nullable(),
  contactPhone: z.string().trim().max(50).optional().nullable(),
  isPublished: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return jsonError("Event not found.", 404);

  return Response.json({ event });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminApi(request);
    if (admin instanceof Response) return admin;

    const { id } = await params;
    const body = await request.json().catch(() => null);
    if (!body) return jsonError("No request body provided.", 400);

    const parsed = updateEventSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      return jsonError(message, 400);
    }

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) return jsonError("Event not found.", 404);

    const data = parsed.data;

    let startDateObj: Date | undefined;
    if (data.startDate) {
      const d = new Date(data.startDate);
      if (!isNaN(d.getTime())) startDateObj = d;
    }

    let endDateObj: Date | null | undefined;
    if (data.endDate !== undefined) {
      if (data.endDate && data.endDate.trim()) {
        const d = new Date(data.endDate);
        endDateObj = isNaN(d.getTime()) ? null : d;
      } else {
        endDateObj = null;
      }
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(data.slug && data.slug.trim().length >= 2 ? { slug: data.slug.trim() } : {}),
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.titleHi !== undefined ? { titleHi: data.titleHi?.trim() || null } : {}),
        ...(data.summary !== undefined ? { summary: data.summary } : {}),
        ...(data.summaryHi !== undefined ? { summaryHi: data.summaryHi?.trim() || null } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(startDateObj ? { startDate: startDateObj } : {}),
        ...(endDateObj !== undefined ? { endDate: endDateObj } : {}),
        ...(data.timeText !== undefined ? { timeText: data.timeText?.trim() || null } : {}),
        ...(data.location !== undefined ? { location: data.location } : {}),
        ...(data.address !== undefined ? { address: data.address?.trim() || null } : {}),
        ...(data.mapUrl !== undefined ? { mapUrl: cleanUrl(data.mapUrl) } : {}),
        ...(data.image !== undefined ? { image: data.image?.trim() || null } : {}),
        ...(data.contactPhone !== undefined ? { contactPhone: data.contactPhone?.trim() || null } : {}),
        ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/events");

    return Response.json({ success: true, event: updated });
  } catch (error: any) {
    console.error("Failed to update event:", error);
    return jsonError(error.message || "Failed to update event in database.", 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) return jsonError("Event not found.", 404);

  await prisma.event.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/events");

  return Response.json({ success: true, message: "Event deleted successfully." });
}

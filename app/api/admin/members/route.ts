import { z } from "zod";
import { requireAdminApi } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";

const memberSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email").optional().nullable().or(z.literal("")),
  phone: z.string().trim().max(30).optional().nullable().or(z.literal("")),
  tier: z.enum(["FREE", "BASIC", "SILVER", "GOLD", "PLATINUM"]).default("BASIC"),
  status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]).default("ACTIVE"),
  role: z.string().trim().max(100).optional().nullable(),
  address: z.string().trim().max(300).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  pincode: z.string().trim().max(10).optional().nullable(),
  photoUrl: z.string().trim().optional().nullable(),
});

export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.trim().toLowerCase();
  const tier = url.searchParams.get("tier")?.trim().toUpperCase();

  const members = await prisma.member.findMany({
    where: {
      ...(tier && tier !== "ALL" ? { tier } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { city: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ members });
}

export async function POST(request: Request) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const body = await request.json().catch(() => null);
  const parsed = memberSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid member data.", 400);
  }

  const { name, email, phone, tier, status, role, address, city, state, pincode, photoUrl } = parsed.data;

  const member = await prisma.member.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      tier,
      status,
      role: role || "Devotee Member",
      address: address || null,
      city: city || null,
      state: state || null,
      pincode: pincode || null,
      photoUrl: photoUrl || null,
    },
  });

  return Response.json({ success: true, member }, { status: 201 });
}


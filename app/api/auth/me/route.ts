import { z } from "zod";
import { getCurrentUser } from "@/lib/server/user-auth";
import { prisma } from "@/lib/server/prisma";
import { jsonError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ user: null });
  }
  return Response.json({ user });
}

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().max(20).optional(),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  pincode: z.string().trim().max(10).optional(),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Unauthorized. Please log in.", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid data.", 400);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone || null } : {}),
      ...(parsed.data.address !== undefined ? { address: parsed.data.address || null } : {}),
      ...(parsed.data.city !== undefined ? { city: parsed.data.city || null } : {}),
      ...(parsed.data.state !== undefined ? { state: parsed.data.state || null } : {}),
      ...(parsed.data.pincode !== undefined ? { pincode: parsed.data.pincode || null } : {}),
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      pincode: true,
      createdAt: true,
    },
  });

  return Response.json({ success: true, user: updated });
}

import { z } from "zod";
import { requireAdminApi } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { jsonError } from "@/lib/server/http";

const updateOrderSchema = z.object({
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED"]).optional(),
  status: z.enum(["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateOrderSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Invalid update data.", 400);
  }

  const existing = await prisma.order.findUnique({
    where: { id },
  });

  if (!existing) {
    return jsonError("Order not found.", 404);
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      ...(parsed.data.paymentStatus ? { paymentStatus: parsed.data.paymentStatus } : {}),
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
    },
    include: {
      items: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return Response.json({
    success: true,
    order: updatedOrder,
    message: "Order updated successfully.",
  });
}

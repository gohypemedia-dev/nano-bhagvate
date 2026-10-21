import { z } from "zod";
import type { RefundStatus } from "@prisma/client";
import { requireAdminApi } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { jsonError } from "@/lib/server/http";
import { sendOrderRefundEmail } from "@/lib/server/email";

const updateOrderSchema = z.object({
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED"]).optional(),
  status: z.enum(["PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  // "COMPLETED" = refund money sent; "PENDING" = undo a refund marked by mistake.
  refundStatus: z.enum(["PENDING", "COMPLETED"]).optional(),
  refundReference: z.string().trim().max(100).optional(),
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

  const status = parsed.data.status ?? existing.status;
  const paymentStatus = parsed.data.paymentStatus ?? existing.paymentStatus;

  // A refund is owed when an order paid online (not cash on delivery) ends up cancelled.
  const refundDue = status === "CANCELLED" && paymentStatus === "PAID" && existing.paymentMethod !== "COD";

  let refundStatus: RefundStatus | null = existing.refundStatus;
  let refundReference = existing.refundReference;
  let refundedAt = existing.refundedAt;

  if (parsed.data.refundStatus === "COMPLETED") {
    if (!refundDue) return jsonError("Only cancelled orders paid by UPI can be marked as refunded.", 400);
    refundStatus = "COMPLETED";
    refundReference = parsed.data.refundReference || null;
    refundedAt = new Date();
  } else if (parsed.data.refundStatus === "PENDING" && refundDue) {
    refundStatus = "PENDING";
    refundReference = null;
    refundedAt = null;
  } else if (refundDue && !refundStatus) {
    refundStatus = "PENDING";
  } else if (!refundDue && refundStatus === "PENDING") {
    // Order un-cancelled (or payment reverted) before any money was sent back.
    refundStatus = null;
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: {
      ...(parsed.data.paymentStatus ? { paymentStatus: parsed.data.paymentStatus } : {}),
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      refundStatus,
      refundReference,
      refundedAt,
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

  if (refundStatus !== existing.refundStatus) {
    if (refundStatus === "PENDING" && !existing.refundStatus) await sendOrderRefundEmail(updatedOrder, "initiated");
    if (refundStatus === "COMPLETED") await sendOrderRefundEmail(updatedOrder, "completed");
  }

  return Response.json({
    success: true,
    order: updatedOrder,
    message: "Order updated successfully.",
  });
}

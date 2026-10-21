import { requireAdminPage } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import AdminOrdersManager from "@/components/admin/AdminOrdersManager";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdminPage();

  const orders = await prisma.order.findMany({
    include: {
      items: true,
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    totalAmount: o.totalAmount,
    currency: o.currency,
    status: o.status,
    paymentStatus: o.paymentStatus as "PENDING" | "PAID" | "FAILED",
    paymentMethod: o.paymentMethod as "PREPAID" | "COD",
    shippingName: o.shippingName,
    shippingEmail: o.shippingEmail,
    shippingPhone: o.shippingPhone,
    shippingAddress: o.shippingAddress,
    shippingCity: o.shippingCity,
    shippingState: o.shippingState,
    shippingPincode: o.shippingPincode,
    refundStatus: o.refundStatus,
    refundReference: o.refundReference,
    refundedAt: o.refundedAt?.toISOString() ?? null,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      bookId: i.bookId,
      title: i.title,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
    })),
    user: o.user,
  }));

  return <AdminOrdersManager initialOrders={serializedOrders} />;
}

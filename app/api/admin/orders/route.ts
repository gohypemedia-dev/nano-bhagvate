import { requireAdminApi } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  const url = new URL(request.url);
  const paymentStatus = url.searchParams.get("paymentStatus");
  const status = url.searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }
  if (status) {
    where.status = status;
  }

  const orders = await prisma.order.findMany({
    where,
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
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ orders });
}

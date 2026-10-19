import { z } from "zod";
import { getCurrentUser } from "@/lib/server/user-auth";
import { prisma } from "@/lib/server/prisma";
import { jsonError } from "@/lib/server/http";
import { randomInt } from "node:crypto";

export const dynamic = "force-dynamic";

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateOrderNumber() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()).replaceAll("-", "");

  let suffix = "";
  for (let i = 0; i < 5; i++) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `ORD-${parts}-${suffix}`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Unauthorized. Please log in.", 401);
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ orders });
}

const createOrderSchema = z.object({
  shippingName: z.string().trim().min(2, "Name required").max(100),
  shippingEmail: z.string().trim().email("Valid email required"),
  shippingPhone: z.string().trim().min(8, "Valid phone number required").max(20),
  shippingAddress: z.string().trim().min(5, "Delivery address required").max(300),
  shippingCity: z.string().trim().min(2, "City required").max(100),
  shippingState: z.string().trim().min(2, "State required").max(100),
  shippingPincode: z.string().trim().min(4, "Pincode required").max(10),
  paymentMethod: z.enum(["PREPAID", "COD"]).default("PREPAID"),
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
      image: z.string().optional(),
    })
  ).min(1, "Cart cannot be empty"),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonError("You must be logged in to place an order.", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return jsonError(firstIssue?.message ?? "Invalid order data.", 400);
  }

  const {
    shippingName,
    shippingEmail,
    shippingPhone,
    shippingAddress,
    shippingCity,
    shippingState,
    shippingPincode,
    paymentMethod,
    items,
  } = parsed.data;

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Generate unique order number
  let orderNumber = generateOrderNumber();
  for (let attempt = 0; attempt < 5; attempt++) {
    const exists = await prisma.order.findUnique({ where: { orderNumber } });
    if (!exists) break;
    orderNumber = generateOrderNumber();
  }

  const order = await prisma.$transaction(async (tx) => {
    // Also save address to user's profile if user doesn't have one
    await tx.user.update({
      where: { id: user.id },
      data: {
        phone: user.phone || shippingPhone,
        address: user.address || shippingAddress,
        city: user.city || shippingCity,
        state: user.state || shippingState,
        pincode: user.pincode || shippingPincode,
      },
    });

    return tx.order.create({
      data: {
        orderNumber,
        userId: user.id,
        totalAmount,
        currency: "INR",
        status: "PLACED",
        paymentStatus: "PENDING",
        paymentMethod,
        shippingName,
        shippingEmail,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingPincode,
        items: {
          create: items.map((item) => ({
            bookId: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  });

  return Response.json(
    {
      success: true,
      message: "Order placed successfully.",
      order,
    },
    { status: 201 }
  );
}

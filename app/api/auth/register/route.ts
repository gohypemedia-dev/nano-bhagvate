import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { createUserSession, hashPassword } from "@/lib/server/user-auth";
import { jsonError } from "@/lib/server/http";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().trim().max(20).optional(),
  address: z.string().trim().max(300).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  pincode: z.string().trim().max(10).optional(),
});

export async function POST(request: Request) {
  try {
    const limit = await rateLimit("register-ip", clientIp(request), 10, 10 * 60);
    if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return jsonError(firstIssue?.message ?? "Invalid details.", 400);
    }

    const { name, email, password, phone, address, city, state, pincode } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return jsonError("An account with this email already exists. Please log in.", 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
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
      },
    });

    await createUserSession(user.id);

    return Response.json(
      {
        success: true,
        message: "Account created successfully.",
        user,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("[register error]", err);
    return Response.json(
      {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 500 }
    );
  }
}

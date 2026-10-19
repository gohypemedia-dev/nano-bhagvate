import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { createUserSession, verifyPassword } from "@/lib/server/user-auth";
import { jsonError } from "@/lib/server/http";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Please enter your password"),
});

export async function POST(request: Request) {
  const limit = await rateLimit("login-ip", clientIp(request), 15, 10 * 60);
  if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return jsonError(firstIssue?.message ?? "Invalid credentials.", 400);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return jsonError("Invalid email or password.", 401);
  }

  const matches = await verifyPassword(password, user.passwordHash);
  if (!matches) {
    return jsonError("Invalid email or password.", 401);
  }

  await createUserSession(user.id);

  return Response.json(
    {
      success: true,
      message: "Logged in successfully.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
      },
    },
    { status: 200 }
  );
}

import { z } from "zod";
import { createSession, getDummyHash, sameOrigin, verifyPassword } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";
import { prisma } from "@/lib/server/prisma";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/server/rate-limit";

const schema = z.object({
  email: z.string().trim().toLowerCase().max(254),
  password: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Invalid request origin.", 403);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("Please enter your email and password.", 400);
  const { email, password } = parsed.data;

  const byIp = await rateLimit("login-ip", clientIp(request), 20, 15 * 60);
  if (!byIp.ok) return tooManyRequests(byIp.retryAfterSeconds);
  const byEmail = await rateLimit("login-email", email, 5, 15 * 60);
  if (!byEmail.ok) return tooManyRequests(byEmail.retryAfterSeconds);

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  // Always run the hash so unknown emails take as long as wrong passwords.
  const valid = await verifyPassword(password, admin?.passwordHash ?? (await getDummyHash()));
  if (!admin || !valid) return jsonError("Incorrect email or password.", 401);

  await createSession(admin.id);
  return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}

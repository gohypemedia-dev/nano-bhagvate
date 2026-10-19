import { z } from "zod";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/server/prisma";
import { createUserSession } from "@/lib/server/user-auth";
import { jsonError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const schema = z.object({
  credential: z.string().min(10, "Credential required"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid credential payload.", 400);
  }

  const { credential } = parsed.data;

  try {
    // Verify token with Google's tokeninfo API
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );

    if (!verifyRes.ok) {
      return jsonError("Invalid Google credential.", 401);
    }

    const payload = await verifyRes.json();
    const email = payload.email?.toLowerCase().trim();
    const name = payload.name || payload.given_name || "Devotee";
    const googleId = payload.sub;
    const picture = payload.picture;

    if (!email) {
      return jsonError("No email associated with this Google account.", 400);
    }

    // Upsert user in database
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleId }],
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || googleId,
          image: user.image || picture || null,
        },
      });
    } else {
      const placeholderHash = "oauth$google$" + randomBytes(32).toString("hex");
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          image: picture || null,
          passwordHash: placeholderHash,
        },
      });
    }

    await createUserSession(user.id);

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err: unknown) {
    console.error("Google verify token error:", err);
    return jsonError("Failed to authenticate with Google.", 500);
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/server/prisma";
import { createUserSession } from "@/lib/server/user-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const isLocalhost = url.origin.includes("localhost") || url.origin.includes("127.0.0.1");
  const appUrl = isLocalhost ? url.origin : (process.env.NEXT_PUBLIC_APP_URL || url.origin);

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error || "Google login was cancelled.")}`, appUrl)
    );
  }

  // Validate state cookie
  const store = await cookies();
  const savedState = store.get("nbvt_oauth_state")?.value;
  store.delete("nbvt_oauth_state");

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Invalid OAuth state. Please try again.")}`, appUrl)
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Google OAuth credentials missing on server.")}`, appUrl)
    );
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.text();
      console.error("Google token exchange error:", errData);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Failed to exchange Google token.")}`, appUrl)
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Fetch user profile from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("Failed to fetch Google profile.")}`, appUrl)
      );
    }

    const profile = await userRes.json();
    const email = profile.email?.toLowerCase().trim();
    const name = profile.name || profile.given_name || "Devotee";
    const googleId = profile.sub;
    const picture = profile.picture;

    if (!email) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent("No email returned from Google account.")}`, appUrl)
      );
    }

    // Upsert user in database
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { googleId }],
      },
    });

    if (user) {
      // Update googleId and image if not already set
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId || googleId,
          image: user.image || picture || null,
        },
      });
    } else {
      // Create new user with safe placeholder password hash
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

    // Create session and set cookie
    await createUserSession(user.id);

    const savedReturnUrl = store.get("nbvt_oauth_return_url")?.value || "/";
    store.delete("nbvt_oauth_return_url");

    return NextResponse.redirect(new URL(savedReturnUrl, appUrl));
  } catch (err: unknown) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Internal server error during Google login.")}`, appUrl)
    );
  }
}

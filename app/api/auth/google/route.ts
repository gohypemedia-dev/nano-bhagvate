import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { getBaseUrl } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  const appUrl = getBaseUrl(request);

  if (!clientId) {
    const errorMsg = "Google OAuth is not configured yet. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel Environment Variables.";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorMsg)}`, appUrl));
  }

  const redirectUri = `${appUrl}/api/auth/google/callback`;

  const requestUrl = new URL(request.url);
  const returnUrl = requestUrl.searchParams.get("returnUrl") || requestUrl.searchParams.get("redirect") || "/";
  const finalDestination = returnUrl;

  const state = randomBytes(16).toString("hex");
  const store = await cookies();
  store.set("nbvt_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
    sameSite: "lax",
  });

  store.set("nbvt_oauth_return_url", finalDestination, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
    sameSite: "lax",
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state,
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

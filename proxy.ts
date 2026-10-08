import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: sends visitors without a session cookie to the login
// page. The real check (requireAdminPage / requireAdminApi) runs on every
// admin page and API route.
const SESSION_COOKIE = "nbvt_admin"; // keep in sync with lib/server/auth.ts

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // /admin/approve/<token> is opened from the approval email; the token is the credential.
  if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/approve/")) return NextResponse.next();
  if (!request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

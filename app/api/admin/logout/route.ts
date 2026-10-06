import { destroySession, sameOrigin } from "@/lib/server/auth";
import { jsonError } from "@/lib/server/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("Invalid request origin.", 403);
  await destroySession();
  return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}

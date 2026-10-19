import { destroyUserSession } from "@/lib/server/user-auth";

export async function POST() {
  await destroyUserSession();
  return Response.json({ success: true, message: "Logged out successfully." });
}

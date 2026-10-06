import { requireAdminApi } from "@/lib/server/auth";
import { syncBankAlerts } from "@/lib/server/bank-alerts";
import { jsonError } from "@/lib/server/http";

export const maxDuration = 30;

// "Check bank emails now" on the admin dashboard.
export async function POST(request: Request) {
  const admin = await requireAdminApi(request);
  if (admin instanceof Response) return admin;

  try {
    const result = await syncBankAlerts({ force: true });
    if (!result.ran) return jsonError(result.reason, 503);
    const matched = result.processed.filter((p) => p.status === "MATCHED").length;
    const needsReview = result.processed.filter((p) => p.status === "AMBIGUOUS" || p.status === "UNMATCHED").length;
    return Response.json(
      { success: true, newAlerts: result.processed.length, matched, needsReview, skipped: result.skipped },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[bank-alerts] manual check failed:", message);
    return jsonError(`Couldn't read the Gmail inbox: ${message}`, 502);
  }
}

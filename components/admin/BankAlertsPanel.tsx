"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MailSearch } from "lucide-react";

export interface AlertRow {
  id: string;
  amount: string;
  receivedAt: string;
  utr: string | null;
  payer: string | null;
  status: "AMBIGUOUS" | "UNMATCHED";
  note: string | null;
}

type Message = { kind: "ok" | "error"; text: string } | null;

export default function BankAlertsPanel({ lastSync, alerts }: { lastSync: string | null; alerts: AlertRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [ids, setIds] = useState<Record<string, string>>({});

  async function post(url: string, body?: object) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) router.replace("/admin/login");
    return { res, data: await res.json().catch(() => ({})) };
  }

  async function checkNow() {
    setBusy("sync");
    setMessage(null);
    try {
      const { res, data } = await post("/api/admin/bank-sync");
      if (!res.ok) {
        setMessage({ kind: "error", text: data.error ?? "Couldn't check the inbox." });
      } else if (data.newAlerts === 0) {
        setMessage({ kind: "ok", text: "No new bank payment emails." });
      } else {
        setMessage({
          kind: "ok",
          text: `${data.newAlerts} new payment email(s): ${data.matched} confirmed automatically, ${data.needsReview} need review.`,
        });
      }
      router.refresh();
    } catch {
      setMessage({ kind: "error", text: "Couldn't reach the server." });
    } finally {
      setBusy(null);
    }
  }

  async function match(alertId: string) {
    const donationId = (ids[alertId] ?? "").trim().toUpperCase();
    setBusy(alertId);
    setMessage(null);
    try {
      const { res, data } = await post(`/api/admin/alerts/${alertId}/match`, { donationId });
      if (!res.ok) {
        setMessage({ kind: "error", text: data.error ?? "Couldn't match this payment." });
      } else {
        setMessage({ kind: "ok", text: `${donationId} confirmed and the donor has been emailed.` });
        router.refresh();
      }
    } catch {
      setMessage({ kind: "error", text: "Couldn't reach the server." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="rounded-xl border border-[#E7D8C8] bg-white p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-bold text-[#2B201A]">Bank payment alerts</h2>
          <p className="text-xs text-[#2B201A]/60">
            Payments are confirmed automatically from the bank&apos;s &quot;amount credited&quot; emails.{" "}
            {lastSync ? `Inbox last checked ${lastSync}.` : "The inbox hasn't been checked yet."}
          </p>
        </div>
        <button type="button" onClick={checkNow} disabled={busy !== null} className="btn-outline min-h-10! px-4! text-xs shrink-0 disabled:opacity-50">
          {busy === "sync" ? <Loader2 className="w-4 h-4 animate-spin" /> : <MailSearch className="w-4 h-4" />}
          Check bank emails now
        </button>
      </div>

      {message && (
        <p role="status" className={`text-sm font-semibold ${message.kind === "ok" ? "text-[#2F5A43]" : "text-[#B3261E]"}`}>
          {message.text}
        </p>
      )}

      {alerts.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#7A5A12]">Need review ({alerts.length})</p>
          <ul className="divide-y divide-[#E7D8C8] rounded-lg border border-[#E7D8C8]">
            {alerts.map((a) => (
              <li key={a.id} className="p-3 flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex-1 min-w-0 text-sm">
                  <p className="font-bold text-[#2B201A] tabular-nums">
                    {a.amount}{" "}
                    <span className="font-normal text-[#2B201A]/60">
                      received {a.receivedAt}
                      {a.utr ? ` · UTR ${a.utr}` : ""}
                      {a.payer ? ` · from ${a.payer}` : ""}
                    </span>
                  </p>
                  <p className="text-xs text-[#2B201A]/60">
                    {a.status === "AMBIGUOUS" ? a.note ?? "More than one donation could match." : "No waiting donation had this amount."}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <input
                    id={`match-${a.id}`}
                    aria-label="Donation ID to match"
                    placeholder="DON-20261006-XXXXX"
                    value={ids[a.id] ?? ""}
                    onChange={(e) => setIds((m) => ({ ...m, [a.id]: e.target.value }))}
                    className="input-warm min-h-10! py-2! text-sm font-mono w-52"
                  />
                  <button
                    type="button"
                    onClick={() => match(a.id)}
                    disabled={busy !== null || !(ids[a.id] ?? "").trim()}
                    className="btn-secondary min-h-10! px-4! text-xs disabled:opacity-50"
                  >
                    {busy === a.id && <Loader2 className="w-4 h-4 animate-spin" />}
                    Match
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-[#2B201A]/60">Every bank payment email so far has been matched.</p>
      )}
    </section>
  );
}

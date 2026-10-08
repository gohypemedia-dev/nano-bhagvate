"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MailSearch } from "lucide-react";

interface Props {
  donationId: string;
  status: string;
  amount: string;
  utr: string | null;
  emailStatus: string;
  donorEmail: string;
}

type Message = { kind: "ok" | "error"; text: string } | null;

export default function DonationActions({ donationId, status, amount, utr, emailStatus, donorEmail }: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [checked, setChecked] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);

  async function call(action: string, body: object) {
    setBusy(action);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/donations/${encodeURIComponent(donationId)}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.replace("/admin/login");
        return null;
      }
      if (!res.ok) {
        setMessage({ kind: "error", text: data.error ?? "Something went wrong." });
        return { ok: false, data };
      }
      return { ok: true, data };
    } catch {
      setMessage({ kind: "error", text: "Couldn't reach the server." });
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function verify() {
    const r = await call("verify", { note: note || undefined });
    if (r?.ok) {
      setMessage(
        r.data.emailStatus === "SENT"
          ? { kind: "ok", text: `Verified. Confirmation email sent to ${donorEmail}.` }
          : { kind: "error", text: `Verified, but the email failed: ${r.data.emailError ?? "unknown error"}. Use Resend email below.` },
      );
      router.refresh();
    }
  }

  async function reject() {
    if (!confirmReject) {
      setConfirmReject(true);
      return;
    }
    const r = await call("reject", { note: note || undefined });
    setConfirmReject(false);
    if (r?.ok) {
      setMessage({ kind: "ok", text: "Donation rejected. No email was sent." });
      router.refresh();
    }
  }

  async function resend() {
    const r = await call("resend-email", {});
    if (r?.ok) {
      setMessage({ kind: "ok", text: `Confirmation email sent to ${donorEmail}.` });
      router.refresh();
    } else if (r) {
      router.refresh();
    }
  }

  // Runs the same automatic bank-email check the donor's screen triggers, right now.
  async function checkBankEmails() {
    setBusy("bank-sync");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/bank-sync", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        setMessage({ kind: "error", text: data.error ?? "Couldn't check the inbox." });
      } else {
        setMessage({
          kind: "ok",
          text: data.newAlerts ? `${data.newAlerts} new bank email(s) checked.` : "No new bank payment emails yet.",
        });
        router.refresh();
      }
    } catch {
      setMessage({ kind: "error", text: "Couldn't reach the server." });
    } finally {
      setBusy(null);
    }
  }

  const feedback = message && (
    <p role="status" className={`text-sm font-semibold ${message.kind === "ok" ? "text-[#2F5A43]" : "text-[#B3261E]"}`}>
      {message.text}
    </p>
  );

  if (status === "PENDING_VERIFICATION") {
    return (
      <section className="rounded-xl border-2 border-[#B8893E]/60 bg-white p-4 sm:p-5 space-y-4">
        <h2 className="font-bold text-[#2B201A]">Review payment</h2>
        <p className="text-sm text-[#2B201A]/75">
          The donor says they have paid. Open the Trust&apos;s UPI app or bank statement and look for a credit of{" "}
          <strong>{amount}</strong>
          {utr ? (
            <>
              {" "}with UTR <strong className="font-mono">{utr}</strong>
            </>
          ) : null}
          . If it arrived, verify it and the donor gets their confirmation email.
        </p>
        <div>
          <label htmlFor="admin-note" className="block text-xs font-semibold text-[#2B201A]/80 mb-1">Admin note (optional)</label>
          <textarea id="admin-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} rows={3} className="input-warm min-h-0! text-sm" placeholder="e.g. Matched in SBI statement, 6 Oct" />
        </div>
        <label className="flex items-start gap-2.5 text-sm text-[#2B201A] cursor-pointer">
          <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-1 w-4 h-4 accent-[#2F5A43]" />
          <span>I found {amount}{utr ? " with this UTR" : ""} in the Trust&apos;s UPI account or bank statement.</span>
        </label>
        {feedback}
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={verify} disabled={!checked || busy !== null} className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed">
            {busy === "verify" && <Loader2 className="w-4 h-4 animate-spin" />}
            Verify payment
          </button>
          <button
            type="button"
            onClick={reject}
            disabled={busy !== null}
            className={`btn-outline disabled:opacity-50 ${confirmReject ? "border-[#B3261E]! text-[#B3261E]!" : ""}`}
          >
            {busy === "reject" && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmReject ? "Click again to reject" : "Reject payment"}
          </button>
        </div>
      </section>
    );
  }

  if (status === "VERIFIED") {
    return (
      <section className="rounded-xl border border-[#E7D8C8] bg-white p-4 sm:p-5 space-y-3">
        <h2 className="font-bold text-[#2B201A]">Confirmation email</h2>
        <p className="text-sm text-[#2B201A]/75">
          Status:{" "}
          <strong className={emailStatus === "SENT" ? "text-[#2F5A43]" : "text-[#B3261E]"}>
            {emailStatus === "SENT" ? "Sent" : emailStatus === "FAILED" ? "Failed" : "Not sent"}
          </strong>
        </p>
        {feedback}
        <button type="button" onClick={resend} disabled={busy !== null} className="btn-outline disabled:opacity-50">
          {busy === "resend-email" && <Loader2 className="w-4 h-4 animate-spin" />}
          {emailStatus === "SENT" ? "Send email again" : "Resend email"}
        </button>
      </section>
    );
  }

  if (status === "PENDING_PAYMENT") {
    return (
      <section className="rounded-xl border border-[#E7D8C8] bg-white p-4 sm:p-5 space-y-3">
        <h2 className="font-bold text-[#2B201A]">Waiting for payment</h2>
        <p className="text-sm text-[#2B201A]/75">
          This donation will be confirmed automatically as soon as the bank&apos;s &quot;amount credited&quot; email for{" "}
          <strong>{amount}</strong> reaches the inbox. The donor then gets their confirmation email.
        </p>
        {feedback}
        <button type="button" onClick={checkBankEmails} disabled={busy !== null} className="btn-outline disabled:opacity-50">
          {busy === "bank-sync" ? <Loader2 className="w-4 h-4 animate-spin" /> : <MailSearch className="w-4 h-4" />}
          Check bank emails now
        </button>
      </section>
    );
  }

  return null;
}

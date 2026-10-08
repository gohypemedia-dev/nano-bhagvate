import type { Metadata } from "next";
import { CheckCircle2, CircleX, Clock } from "lucide-react";
import { sha256 } from "@/lib/server/donation";
import { env } from "@/lib/server/env";
import { prisma } from "@/lib/server/prisma";
import { formatIST, rupeesFromPaise } from "@/lib/admin-format";

export const metadata: Metadata = {
  title: "Approve payment | Namo Bhagwate Vasudevaya Trust",
  robots: { index: false, follow: false },
  // The token is in the URL; don't leak it to other sites. Not "no-referrer": that makes
  // browsers send "Origin: null" on the approve/reject form, which the origin check rejects.
  referrer: "same-origin",
};

// Opened from the "payment to approve" email. No login needed: the one-time link is the key.
// Opening the page changes nothing (mail scanners prefetch links); only the buttons do.
export default async function ApprovePaymentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const donation = /^[\w-]{40,64}$/.test(token)
    ? await prisma.donation.findUnique({ where: { approvalTokenHash: sha256(token) } })
    : null;

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#E7D8C8] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <p className="text-xs font-bold uppercase tracking-widest text-[#B8893E]">Namo Bhagwate Vasudevaya Trust</p>
        {!donation ? (
          <>
            <h1 className="font-editorial text-2xl font-bold text-[#2B201A]">Link not valid</h1>
            <p className="text-sm text-[#2B201A]/75">This approval link is wrong or incomplete. Open it again from the email, or review the donation in the admin dashboard.</p>
          </>
        ) : (
          <Body donation={donation} token={token} />
        )}
      </div>
    </div>
  );
}

type Donation = NonNullable<Awaited<ReturnType<typeof prisma.donation.findUnique>>>;

function Body({ donation: d, token }: { donation: Donation; token: string }) {
  const amount = rupeesFromPaise(d.amountPaise);
  const rows: [string, string][] = [
    ["Donor", d.donorName],
    ["Amount", amount],
    ["Donation ID", d.donationId],
    ["Towards", d.program ?? "—"],
    ["Email", d.donorEmail],
    ["Mobile", d.donorMobile ?? "—"],
    ["Marked as paid", d.proofSubmittedAt ? formatIST(d.proofSubmittedAt) : "—"],
  ];
  const details = (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm bg-[#FBF2E7] border border-[#E7D8C8] rounded-xl p-4">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-[#2B201A]/60">{k}</dt>
          <dd className="font-semibold text-right break-all">{v}</dd>
        </div>
      ))}
    </dl>
  );

  if (d.status === "VERIFIED") {
    return (
      <>
        <CheckCircle2 className="w-12 h-12 text-[#2F5A43]" aria-hidden="true" />
        <h1 className="font-editorial text-2xl font-bold text-[#2B201A]">Payment approved</h1>
        <p className="text-sm text-[#2B201A]/75">
          {d.emailStatus === "SENT"
            ? `A confirmation email has been sent to ${d.donorEmail}.`
            : "The confirmation email could not be sent. Use “Resend email” on this donation in the admin dashboard."}
        </p>
        {details}
      </>
    );
  }

  if (d.status === "REJECTED" || d.status === "CANCELLED") {
    return (
      <>
        <CircleX className="w-12 h-12 text-[#B3261E]" aria-hidden="true" />
        <h1 className="font-editorial text-2xl font-bold text-[#2B201A]">Payment {d.status === "REJECTED" ? "rejected" : "cancelled"}</h1>
        <p className="text-sm text-[#2B201A]/75">No confirmation email was sent to the donor.</p>
        {details}
      </>
    );
  }

  const action = `/api/admin/approve/${encodeURIComponent(token)}`;
  return (
    <>
      <div className="space-y-1">
        <h1 className="font-editorial text-2xl font-bold text-[#2B201A]">Approve this payment?</h1>
        <p className="text-sm text-[#2B201A]/75">
          <strong>{d.donorName}</strong> says they paid <strong>{amount}</strong> to <strong>{env().UPI_ID ?? "the Trust's UPI ID"}</strong>.
          Check your UPI app or bank statement for this credit before approving.
        </p>
      </div>
      {details}
      <form method="post" action={action} className="space-y-3">
        <button type="submit" name="action" value="approve" className="btn-secondary w-full">
          <CheckCircle2 className="w-4 h-4" />
          Yes, I received {amount}. Approve
        </button>
        <details className="text-sm">
          <summary className="cursor-pointer text-center font-semibold text-[#2B201A]/60 hover:text-[#2B201A] py-1">Payment not received?</summary>
          <div className="mt-3 space-y-2">
            <p className="flex gap-2 text-xs text-[#2B201A]/70">
              <Clock className="w-4 h-4 shrink-0" /> UPI credits sometimes show up a few minutes late. Check again before rejecting.
            </p>
            <button type="submit" name="action" value="reject" className="btn-outline w-full border-[#B3261E]! text-[#B3261E]!">
              Reject: payment not received
            </button>
          </div>
        </details>
      </form>
    </>
  );
}

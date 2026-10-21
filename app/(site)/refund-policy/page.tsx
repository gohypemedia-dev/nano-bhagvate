import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Section } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Refund, Return & Cancellation Policy | ${LEGAL.trustName}`,
  description: `Cancellations, returns and refunds for book orders, donations and memberships at ${LEGAL.trustName}.`,
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund, Return & Cancellation Policy"
      current="/refund-policy"
      intro={
        <>
          This policy explains when you can cancel a book order, return a book, and get a refund, and how refunds for
          donations and memberships are handled. You can follow the status of every order and refund on your{" "}
          <Link href="/account" className="text-[#E86F1D] underline">
            My Account
          </Link>{" "}
          page.
        </>
      }
    >
      <Section n={1} title="Cancelling a book order">
        <ul>
          <li>
            <strong>Before dispatch:</strong> you can cancel by emailing or calling us with your order number. If you
            have already paid by UPI, you get a full refund.
          </li>
          <li>
            <strong>After dispatch:</strong> the order can no longer be cancelled. If the book arrives damaged or wrong,
            see &quot;Returns and replacements&quot; below.
          </li>
          <li>
            <strong>Cancelled by the Trust:</strong> we may cancel an order if a book is out of stock, the address cannot
            be served, or the payment cannot be verified. If you have paid, you get a full refund.
          </li>
          <li>
            <strong>Cash on delivery:</strong> please do not refuse a cash on delivery parcel without telling us. Repeated
            refusals may mean we stop offering cash on delivery to you.
          </li>
        </ul>
      </Section>

      <Section n={2} title="Returns and replacements">
        <p>
          Books can be returned only if they arrive <strong>damaged, defective (for example missing or misprinted
          pages) or different from what you ordered</strong>.
        </p>
        <ul>
          <li>
            Tell us within <strong>{LEGAL.returnReportDays} days of delivery</strong>, with your order number and photos
            of the book and the package.
          </li>
          <li>
            Once we confirm the problem, we will send a replacement free of charge or, if a replacement is not available,
            give you a full refund. We will tell you if we need the book returned, and we cover the return cost.
          </li>
          <li>
            Books in good condition cannot be returned because you changed your mind or ordered by mistake.
          </li>
        </ul>
      </Section>

      <Section n={3} title="How refunds are paid">
        <ul>
          <li>
            <strong>Paid by UPI:</strong> the refund is sent to the same UPI account you paid from, within{" "}
            <strong>{LEGAL.refundDays} working days</strong> of the cancellation or of us approving your return.
          </li>
          <li>
            <strong>Cash on delivery:</strong> if a refund is due on an order you paid in cash, we will ask for your UPI ID
            or bank details and send it within {LEGAL.refundDays} working days of receiving them.
          </li>
          <li>
            When a refund is started and again when it has been sent, we email you, and your order on the My Account page
            shows &quot;Refund in progress&quot; or &quot;Refunded&quot; with the UPI reference number.
          </li>
          <li>Once sent, your bank may take a few days to show the amount in your account.</li>
        </ul>
      </Section>

      <Section n={4} title="Donations and memberships">
        <p>
          Donations and membership contributions are voluntary and are used for the Trust&apos;s charitable work, so they
          are generally <strong>not refundable</strong>. We will refund:
        </p>
        <ul>
          <li>a payment made twice by mistake (duplicate payment), or</li>
          <li>a payment of the wrong amount because of a typing error,</li>
        </ul>
        <p>
          if you tell us within <strong>{LEGAL.donationErrorReportDays} days</strong> of the payment, with the UTR / UPI
          reference. The refund is sent to the account you paid from within {LEGAL.refundDays} working days of us
          confirming it. If a receipt or certificate was issued for that payment, it will be cancelled.
        </p>
      </Section>

      <Section n={5} title="How to ask for a cancellation, return or refund">
        <p>
          Email <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> or call <a href={LEGAL.phoneHref}>{LEGAL.phone}</a>{" "}
          with your order number or donation ID, what went wrong, and photos if relevant. For delivery times, see our{" "}
          <Link href="/shipping-policy">Shipping Policy</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}

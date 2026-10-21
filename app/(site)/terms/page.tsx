import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Section } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Terms of Service | ${LEGAL.trustName}`,
  description: `Terms for using the ${LEGAL.trustName} website, donating, becoming a member and ordering books.`,
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      current="/terms"
      intro={
        <>
          These terms apply when you use this website, create an account, donate, become a member or order books from{" "}
          {LEGAL.trustName} (Reg. No. {LEGAL.registration}), {LEGAL.address}. By using the website you agree to these
          terms, our <Link href="/privacy-policy" className="text-[#E86F1D] underline">Privacy Policy</Link> and our{" "}
          <Link href="/refund-policy" className="text-[#E86F1D] underline">Refund &amp; Cancellation Policy</Link>.
        </>
      }
    >
      <Section n={1} title="Your account">
        <ul>
          <li>You need an account to order books. You can register with email or sign in with Google.</li>
          <li>Please give accurate details and keep your password private. You are responsible for activity on your account.</li>
          <li>If you are under 18, please use the website with the consent and involvement of a parent or guardian.</li>
          <li>We may suspend accounts that are used for fraud, abuse or to break these terms.</li>
        </ul>
      </Section>

      <Section n={2} title="Donations and memberships">
        <ul>
          <li>
            Donations and membership contributions are voluntary contributions to the Trust&apos;s charitable, spiritual
            and educational work. They are not payment for goods or services.
          </li>
          <li>
            Payments are made by UPI directly to the Trust&apos;s account. A donation or membership is confirmed only after
            the Trust verifies the payment; you then receive a confirmation email and, where applicable, a certificate or
            event pass.
          </li>
          <li>
            Please donate only from your own account or with the account holder&apos;s permission, and enter the correct
            UTR / UPI reference. Payments that cannot be verified may be rejected.
          </li>
          <li>
            Membership benefits and validity are as described on the{" "}
            <Link href="/membership">Membership</Link> page at the time you join.
          </li>
          <li>
            Refunds are limited to duplicate or wrong-amount payments, as described in our{" "}
            <Link href="/refund-policy">Refund &amp; Cancellation Policy</Link>.
          </li>
        </ul>
      </Section>

      <Section n={3} title="Ordering books">
        <ul>
          <li>Prices are in Indian Rupees (INR) and are those shown at checkout when you place your order.</li>
          <li>
            You can pay by UPI (verified by the Trust before dispatch) or cash on delivery where available. An order is
            accepted once UPI payment is verified or, for cash on delivery, once we confirm it.
          </li>
          <li>
            We may cancel an order and refund any payment if a book is unavailable, a price or description was shown
            incorrectly, the address cannot be served or the payment cannot be verified.
          </li>
          <li>
            Delivery, cancellation, return and refund terms are in our <Link href="/shipping-policy">Shipping Policy</Link>{" "}
            and <Link href="/refund-policy">Refund &amp; Cancellation Policy</Link>.
          </li>
        </ul>
      </Section>

      <Section n={4} title="Events">
        <p>
          Event details (dates, times and venues) may change. We will try to inform registered participants of changes.
          Event passes are for the named person and may be checked at entry.
        </p>
      </Section>

      <Section n={5} title="Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>use the website for anything unlawful or fraudulent, including false payment references or screenshots;</li>
          <li>try to access other people&apos;s accounts or the admin area, or interfere with the website&apos;s security;</li>
          <li>copy, scrape or misuse the website&apos;s content or other users&apos; information.</li>
        </ul>
      </Section>

      <Section n={6} title="Content and intellectual property">
        <p>
          The text, images, logos, books and other content on this website belong to the Trust or are used with
          permission. You may view and share them for personal, non-commercial purposes with credit to the Trust, but
          you may not reproduce or sell them without our written permission.
        </p>
      </Section>

      <Section n={7} title="Limitation of liability">
        <p>
          We work to keep the website accurate and available, but it is provided &quot;as is&quot; and may sometimes be
          unavailable or contain errors. To the extent the law allows, the Trust is not liable for indirect or
          consequential losses arising from the use of the website. Our total liability for any order is limited to the
          amount you paid for that order. Nothing in these terms limits your rights as a consumer under Indian law.
        </p>
      </Section>

      <Section n={8} title="Governing law and disputes">
        <p>
          These terms are governed by the laws of India. Please contact our Grievance Officer first (details below) so
          we can try to resolve any complaint. Subject to your rights under consumer protection law, the courts at
          Gurugram, Haryana have jurisdiction.
        </p>
      </Section>

      <Section n={9} title="Changes to these terms">
        <p>
          We may update these terms from time to time. The &quot;Last updated&quot; date at the top shows when they last
          changed. Orders and donations are governed by the terms in force when they were made.
        </p>
      </Section>
    </LegalPage>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Section } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Privacy Policy | ${LEGAL.trustName}`,
  description: `How ${LEGAL.trustName} collects, uses, stores and protects your personal information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      current="/privacy-policy"
      intro={
        <>
          {LEGAL.trustName} (&quot;the Trust&quot;, &quot;we&quot;) respects your privacy. This policy explains what
          personal information we collect through this website, why we collect it, who we share it with, and the
          choices and rights you have. It is published under the Information Technology Act, 2000 and its rules, and
          the Digital Personal Data Protection Act, 2023.
        </>
      }
    >
      <Section n={1} title="Information we collect">
        <p>We only collect information you give us, or that is created when you use the site:</p>
        <ul>
          <li>
            <strong>Account:</strong> name, email address, phone number and, if you save it, your delivery address. If
            you register with email, we store your password only in an encrypted (hashed) form.
          </li>
          <li>
            <strong>Google sign-in:</strong> if you choose &quot;Continue with Google&quot;, Google shares your name,
            email address, profile photo and Google account ID with us. We do not receive your Google password.
          </li>
          <li>
            <strong>Book orders:</strong> the books you order, amounts, payment method (UPI or cash on delivery),
            payment and refund status, and the delivery name, phone, email and address you enter.
          </li>
          <li>
            <strong>Donations and memberships:</strong> your name, email, mobile number (optional), amount, chosen
            programme or plan, the UPI transaction reference (UTR) and any payment screenshot you upload.
          </li>
          <li>
            <strong>Payment confirmations:</strong> to confirm UPI payments, we match them against the payment alerts our
            bank sends us, which may include the payer&apos;s name or UPI ID and the amount.
          </li>
          <li>
            <strong>Messages:</strong> anything you send us through the contact form, email or phone.
          </li>
        </ul>
        <p>
          We do not collect card numbers, UPI PINs or bank passwords. UPI payments are made in your own UPI app,
          directly to the Trust&apos;s account.
        </p>
      </Section>

      <Section n={2} title="How we use it">
        <ul>
          <li>To create and manage your account and keep you signed in.</li>
          <li>To process, dispatch and deliver book orders, and to handle cancellations, returns and refunds.</li>
          <li>To verify donations and membership payments and send receipts, certificates and event passes.</li>
          <li>To send you emails about your orders, donations, memberships and refunds.</li>
          <li>To reply to your questions and complaints.</li>
          <li>To keep the website secure, prevent fraud and misuse, and meet our legal and accounting obligations.</li>
        </ul>
        <p>We do not sell or rent your personal information, and we do not use it for third-party advertising.</p>
      </Section>

      <Section n={3} title="Who we share it with">
        <p>We share personal information only with service providers who help us run the website, and only as needed:</p>
        <ul>
          <li>
            <strong>Website hosting and storage:</strong> Vercel (hosting), Neon (database) and Cloudflare R2 (file
            storage, e.g. payment screenshots and images).
          </li>
          <li>
            <strong>Email:</strong> our email provider (Google Gmail and/or Resend) to send you order, donation and refund
            emails.
          </li>
          <li>
            <strong>Google:</strong> only if you use Google sign-in.
          </li>
          <li>
            <strong>Courier / India Post:</strong> your delivery name, phone and address, to deliver your books.
          </li>
          <li>
            <strong>Authorities:</strong> when required by law, a court order or a government authority.
          </li>
        </ul>
        <p>
          Some of these providers may store data on servers outside India. They process it on our behalf and may not
          use it for their own purposes.
        </p>
      </Section>

      <Section n={4} title="Cookies and local storage">
        <p>We use only the cookies the website needs to work:</p>
        <ul>
          <li>
            <strong>Sign-in cookie</strong> that keeps you logged in to your account.
          </li>
          <li>
            <strong>Security cookie</strong> used for a few minutes during Google sign-in to protect against fraudulent
            login attempts.
          </li>
          <li>
            <strong>Local storage</strong> in your browser to remember the books in your cart.
          </li>
        </ul>
        <p>We do not use advertising or third-party tracking cookies.</p>
      </Section>

      <Section n={5} title="How long we keep it">
        <p>
          We keep your account information while your account is active. Order, donation and payment records are kept
          for as long as Indian tax, accounting and trust laws require, even if you close your account. Other
          information is deleted when it is no longer needed.
        </p>
      </Section>

      <Section n={6} title="Your rights">
        <p>You can ask us to:</p>
        <ul>
          <li>tell you what personal information we hold about you;</li>
          <li>correct or update it (you can also edit your profile and address on the My Account page);</li>
          <li>delete your account and personal information, except records we must keep by law;</li>
          <li>withdraw your consent to us using your information (this may mean we cannot serve you further).</li>
        </ul>
        <p>
          To make a request, email <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> from the email address on your
          account. If you are not satisfied with our response, you may complain to the Data Protection Board of India.
        </p>
      </Section>

      <Section n={7} title="Security">
        <p>
          The website uses HTTPS encryption, passwords are stored hashed, and access to admin tools is restricted to
          authorised Trust staff. No method of storing or sending data is completely secure, but we take reasonable
          steps to protect your information and will inform you and the authorities of a data breach as required by law.
        </p>
      </Section>

      <Section n={8} title="Children">
        <p>
          The website is meant for adults. If you are under 18, please use it with the involvement and consent of a
          parent or guardian.
        </p>
      </Section>

      <Section n={9} title="Changes to this policy">
        <p>
          We may update this policy from time to time. The &quot;Last updated&quot; date at the top shows when it last
          changed. See also our <Link href="/terms">Terms of Service</Link> and{" "}
          <Link href="/refund-policy">Refund &amp; Cancellation Policy</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}

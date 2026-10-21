import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Section } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: `Shipping Policy | ${LEGAL.trustName}`,
  description: `Delivery areas, charges and timelines for books ordered from ${LEGAL.trustName}.`,
};

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Shipping Policy"
      current="/shipping-policy"
      intro={<>How and when books ordered from the Trust&apos;s website are delivered.</>}
    >
      <Section n={1} title="Where we deliver">
        <p>We deliver to addresses within India only.</p>
      </Section>

      <Section n={2} title="Shipping charges">
        <p>
          We currently do not charge for shipping within India. If this changes, the delivery charge will be shown
          clearly at checkout before you place your order.
        </p>
      </Section>

      <Section n={3} title="Dispatch and delivery times">
        <ul>
          <li>
            <strong>UPI orders</strong> are dispatched within <strong>{LEGAL.dispatchDays}</strong> after we verify your
            payment.
          </li>
          <li>
            <strong>Cash on delivery orders</strong> are dispatched within <strong>{LEGAL.dispatchDays}</strong> of the
            order being placed.
          </li>
          <li>
            Delivery usually takes <strong>{LEGAL.deliveryDays}</strong> after dispatch, depending on your location.
            Remote areas may take longer.
          </li>
          <li>
            Working days exclude Sundays and public holidays. Festivals, weather or courier problems can cause delays; we
            will let you know if your order is significantly delayed.
          </li>
        </ul>
      </Section>

      <Section n={4} title="How we ship and how to track your order">
        <p>
          Books are sent by courier or India Post. You can see your order status (Placed, Processing, Shipped,
          Delivered) on your <Link href="/account">My Account</Link> page. For courier tracking details, contact us with
          your order number.
        </p>
      </Section>

      <Section n={5} title="Address and failed deliveries">
        <ul>
          <li>Please check that your name, phone number, address and PIN code are correct before placing the order.</li>
          <li>
            If you need to change the address, contact us before the order is dispatched. We cannot change it after
            dispatch.
          </li>
          <li>
            If a parcel comes back to us because the address was wrong or nobody was available, we will contact you to
            arrange re-delivery. For paid orders, we may ask you to cover the re-delivery cost.
          </li>
        </ul>
      </Section>

      <Section n={6} title="Damaged or wrong books">
        <p>
          If your book arrives damaged or you receive the wrong book, tell us within {LEGAL.returnReportDays} days of
          delivery. See our <Link href="/refund-policy">Refund, Return &amp; Cancellation Policy</Link>.
        </p>
      </Section>
    </LegalPage>
  );
}

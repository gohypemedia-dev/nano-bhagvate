// Facts shared by the policy pages (privacy, terms, refunds, shipping). Change them here once.
// Have the Trust's CA / lawyer review the policy pages before relying on them.

export const LEGAL = {
  trustName: "Namo Bhagwate Vasudevaya Trust",
  registration: "Trust/2019/NBVT",
  address: "P6/10, 4th Floor, DLF Phase 2, Gurugram, Haryana 122008, India",
  email: "help@namobhagwatevasudevaya.com",
  phone: "+91 88606 65000",
  phoneHref: "tel:+918860665000",
  lastUpdated: "21 October 2026",

  // Required by the Consumer Protection (E-Commerce) Rules, 2020.
  // TODO: replace with the name of the person the Trust appoints before going live.
  grievanceOfficer: "Grievance Officer, Namo Bhagwate Vasudevaya Trust",
  grievanceAckHours: 48,
  grievanceResolveDays: 30,

  // Books
  dispatchDays: "3–5 working days",
  deliveryDays: "5–10 working days",
  returnReportDays: 7,
  refundDays: 7,

  // Donations and memberships: refunds only for mistakes reported within this many days.
  donationErrorReportDays: 7,
} as const;

export const POLICY_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/refund-policy", label: "Refund & Cancellation" },
  { href: "/shipping-policy", label: "Shipping Policy" },
] as const;

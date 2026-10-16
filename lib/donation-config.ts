// Shared by the donate modal and the API. Contains no secrets.

export const PRESET_AMOUNTS = [499, 999, 1499, 2100, 5100, 11000];

// Membership prices live here so the server, not the browser, decides what a plan costs.
// Shown on the membership page's plan cards and printed on the membership certificate:
// `period`, `description`, `badge` and `benefits` as on the cards; `title`, `term` (validity)
// and `color` on the certificate.
export const MEMBERSHIP_PLANS = [
  {
    id: "basic", name: "Membership", price: 1100, title: "Member", term: "year", color: "#B4531A",
    period: "per year",
    description: "Ideal for devotees starting their journey of seva and spiritual learning.",
    badge: "MEMBERSHIP TIER",
    benefits: [
      "Annual Trust Membership Certificate",
      "Monthly Spiritual Newsletter & E-books",
      "Invitation to Annual Spiritual Gathering",
      "Direct Seva Participation Opportunities",
    ],
  },
  {
    id: "silver", name: "Silver Membership", price: 5100, title: "Silver Member", term: "year", color: "#5F6B7D",
    period: "per year",
    description: "For dedicated supporters wishing to sponsor education and health camps.",
    badge: "SILVER TIER",
    benefits: [
      "All Basic Membership Benefits",
      "Sponsorship of 1 Gurukul Student Education",
      "Special Prasad & Blessing Card from Ashram",
      "Priority Seat Booking at Bhagwat Katha Events",
    ],
  },
  {
    id: "gold", name: "Gold Membership", price: 11000, title: "Gold Member", term: "year", color: "#A8721C",
    period: "per year",
    description: "Empowering women skill workshops and farmer advisory guidance.",
    badge: "MOST POPULAR TIER",
    benefits: [
      "All Silver Membership Benefits",
      "Sponsorship of Women Skill Training Kit",
      "Special Recognition on Trust Member Roll",
      "Direct Advisory Updates from Trust Board",
    ],
  },
  {
    id: "platinum", name: "Platinum Membership", price: 51000, title: "Platinum Patron", term: "lifetime", color: "#2B3545",
    period: "lifetime / patron",
    description: "Patron level partnership supporting major infrastructure & medical camps.",
    badge: "PATRON TIER",
    benefits: [
      "Lifetime Trustee Honor & Framed Scroll",
      "Full Sponsorship of Rural Health Camp",
      "VIP Seating & Stage Felicitation",
      "Permanent Inscription at Ashram Wall",
    ],
  },
] as const;

export type MembershipPlanId = (typeof MEMBERSHIP_PLANS)[number]["id"];
export type MembershipPlan = (typeof MEMBERSHIP_PLANS)[number];

export function findPlan(id: string) {
  return MEMBERSHIP_PLANS.find((p) => p.id === id);
}

// Memberships store the plan's name in `program`. Unknown names fall back to the basic plan.
export function planForProgram(program: string | null | undefined): MembershipPlan {
  return MEMBERSHIP_PLANS.find((p) => p.name.toLowerCase() === program?.trim().toLowerCase()) ?? MEMBERSHIP_PLANS[0];
}

// Last day of a yearly membership that starts on `start`; null for lifetime plans.
export function membershipValidUntil(plan: MembershipPlan, start: Date): Date | null {
  if (plan.term === "lifetime") return null;
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  end.setDate(end.getDate() - 1);
  return end;
}

export const MAX_DONATION_AMOUNT = 1_000_000; // ₹10,00,000 per transaction

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const UTR_PATTERN = /^\d{12}$/;

// ₹1,000 for whole rupees, ₹1,000.01 when there are paise.
export function formatINR(rupees: number) {
  const paise = Math.round(rupees * 100) % 100 !== 0;
  return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: paise ? 2 : 0, maximumFractionDigits: 2 })}`;
}

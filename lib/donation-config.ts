// Shared by the donate modal and the API. Contains no secrets.

export const PRESET_AMOUNTS = [500, 1100, 2100, 5100, 11000];

// Membership prices live here so the server, not the browser, decides what a plan costs.
export const MEMBERSHIP_PLANS = [
  { id: "basic", name: "Membership", price: 1100 },
  { id: "silver", name: "Silver Membership", price: 5100 },
  { id: "gold", name: "Gold Membership", price: 11000 },
  { id: "platinum", name: "Platinum Membership", price: 51000 },
] as const;

export type MembershipPlanId = (typeof MEMBERSHIP_PLANS)[number]["id"];

export function findPlan(id: string) {
  return MEMBERSHIP_PLANS.find((p) => p.id === id);
}

export const MAX_DONATION_AMOUNT = 1_000_000; // ₹10,00,000 per transaction

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const UTR_PATTERN = /^\d{12}$/;

// ₹1,000 for whole rupees, ₹1,000.01 when there are paise.
export function formatINR(rupees: number) {
  const paise = Math.round(rupees * 100) % 100 !== 0;
  return `₹${rupees.toLocaleString("en-IN", { minimumFractionDigits: paise ? 2 : 0, maximumFractionDigits: 2 })}`;
}

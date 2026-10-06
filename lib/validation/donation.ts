import { z } from "zod";
import { MAX_DONATION_AMOUNT, MEMBERSHIP_PLANS, UTR_PATTERN } from "@/lib/donation-config";

const planIds = MEMBERSHIP_PLANS.map((p) => p.id) as [string, ...string[]];

export const donorNameSchema = z
  .string()
  .trim()
  .min(2, "Please enter your full name.")
  .max(100, "Name is too long.")
  .regex(/^[\p{L}\p{M} .'-]+$/u, "Name can only contain letters, spaces, dots, apostrophes and hyphens.");

export const donorEmailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email("Please enter a valid email address."));

export const donorMobileSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number."));

export function amountSchema(minAmount: number) {
  return z
    .number({ error: "Please enter an amount." })
    .int("Please enter a whole rupee amount.")
    .min(minAmount, `The minimum donation is ₹${minAmount.toLocaleString("en-IN")}.`)
    .max(MAX_DONATION_AMOUNT, `For donations above ₹${MAX_DONATION_AMOUNT.toLocaleString("en-IN")}, please contact the Trust.`);
}

export function createDonationSchema(minAmount: number) {
  // For memberships the plan decides the price, so any amount sent alongside is ignored.
  const dropAmountForPlans = (v: unknown) =>
    v && typeof v === "object" && "planId" in v && (v as { planId?: unknown }).planId !== undefined
      ? { ...(v as object), amount: undefined }
      : v;

  return z.preprocess(dropAmountForPlans, z
    .object({
      name: donorNameSchema,
      email: donorEmailSchema,
      mobile: z.union([z.literal(""), donorMobileSchema]).optional(),
      program: z.string().trim().max(120).optional(),
      amount: amountSchema(minAmount).optional(),
      planId: z.enum(planIds).optional(),
    })
    .refine((d) => d.planId !== undefined || d.amount !== undefined, {
      message: "Please choose an amount.",
      path: ["amount"],
    }));
}

export type CreateDonationInput = z.infer<ReturnType<typeof createDonationSchema>>;

export const utrSchema = z
  .string()
  .trim()
  .regex(UTR_PATTERN, "The UTR is the 12-digit number in your UPI app's payment details.");

export const donationIdSchema = z.string().regex(/^DON-\d{8}-[A-Z2-9]{5}$/);

// Parses a whole-rupee amount typed by the donor. Returns null for anything that
// is not a plain positive integer (decimals, signs, letters, empty).
export function parseRupees(input: string): number | null {
  const v = input.trim();
  if (!/^\d{1,7}$/.test(v)) return null;
  return Number(v);
}

import { z } from "zod";
import { MAX_DONATION_AMOUNT, MEMBERSHIP_PLANS, UTR_PATTERN } from "@/lib/donation-config";

const planIds = MEMBERSHIP_PLANS.map((p) => p.id) as [string, ...string[]];

export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function sanitizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function sanitizeMobile(mobile: string): string {
  return mobile.replace(/\D/g, "").slice(0, 10);
}

export function validateName(name: string): string | null {
  const cleaned = sanitizeName(name);
  if (!cleaned || cleaned.length < 2 || cleaned.length > 60) {
    return "Please enter your full name.";
  }
  if (/\d/.test(cleaned)) {
    return "Please enter your full name.";
  }
  if (!/^[a-zA-Z\u0900-\u097F\s.'-]+$/.test(cleaned) || !/[a-zA-Z\u0900-\u097F]/.test(cleaned)) {
    return "Please enter your full name.";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const cleaned = sanitizeEmail(email);
  if (!cleaned || cleaned.length > 254) {
    return "Please enter a valid email address.";
  }
  if (!EMAIL_REGEX.test(cleaned)) {
    return "Please enter a valid email address.";
  }
  return null;
}

export function validateMobile(mobile: string, required = false): string | null {
  const digits = sanitizeMobile(mobile);
  if (!digits) {
    if (required) return "Please enter a valid 10-digit mobile number.";
    return null;
  }
  if (!MOBILE_REGEX.test(digits)) {
    return "Please enter a valid 10-digit mobile number.";
  }
  return null;
}

export function validateAmount(amount: number | null | undefined, minAmount = 1): string | null {
  if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
    return "Please enter a valid contribution amount.";
  }
  if (!Number.isInteger(amount) || amount < minAmount || amount <= 0) {
    return "Please enter a valid contribution amount.";
  }
  if (amount > MAX_DONATION_AMOUNT) {
    return `For donations above ₹${MAX_DONATION_AMOUNT.toLocaleString("en-IN")}, please contact the Trust.`;
  }
  return null;
}

export const donorNameSchema = z
  .string()
  .transform((v) => sanitizeName(v))
  .refine((v) => validateName(v) === null, {
    message: "Please enter your full name.",
  });

export const donorEmailSchema = z
  .string()
  .transform((v) => sanitizeEmail(v))
  .refine((v) => validateEmail(v) === null, {
    message: "Please enter a valid email address.",
  });

export const donorMobileSchema = z
  .string()
  .transform((v) => sanitizeMobile(v))
  .refine((v) => validateMobile(v, false) === null, {
    message: "Please enter a valid 10-digit mobile number.",
  });

export function amountSchema(minAmount: number) {
  return z
    .number({ error: "Please enter a valid contribution amount." })
    .int("Please enter a valid contribution amount.")
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
      message: "Please enter a valid contribution amount.",
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
  if (typeof input !== "string") return null;
  const v = input.replace(/\D/g, "");
  if (!v || v.length > 7) return null;
  const num = Number(v);
  if (!Number.isFinite(num) || num <= 0 || !Number.isInteger(num)) return null;
  return num;
}


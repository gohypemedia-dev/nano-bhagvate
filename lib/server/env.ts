import "server-only";
import { z } from "zod";

const optional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : undefined));

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    // Optional so admin tools keep working before it is set; new donations are refused until then.
    UPI_ID: optional.pipe(z.string().regex(/^[\w.-]+@[\w.-]+$/, "UPI_ID must look like name@bank").optional()),
    UPI_NAME: z.string().min(1).max(50),
    // Merchant category code from the bank's own QR (mc=...). Leave empty for a personal UPI ID.
    UPI_MCC: optional.pipe(z.string().regex(/^\d{4}$/, "UPI_MCC must be 4 digits").optional()),
    // Shown under the UPI ID on the payment card, e.g. "Current account • 0330".
    UPI_ACCOUNT_LABEL: optional,
    UPI_IS_MERCHANT: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),

    MIN_DONATION_AMOUNT: z.coerce.number().int().min(1).default(10),
    MAX_UPLOAD_MB: z.coerce.number().min(0.5).max(4.5).default(4),

    STORAGE_DRIVER: z.enum(["local", "r2"]).default("local"),
    LOCAL_STORAGE_DIR: z.string().default(".private-uploads"),
    R2_ACCOUNT_ID: optional,
    R2_ACCESS_KEY_ID: optional,
    R2_SECRET_ACCESS_KEY: optional,
    R2_BUCKET: optional,

    // Gmail account used to send confirmations (SMTP) and to read bank alerts (IMAP).
    GMAIL_USER: optional,
    GMAIL_APP_PASSWORD: optional.transform((v) => v?.replace(/\s+/g, "")),
    RESEND_API_KEY: optional,
    EMAIL_FROM: optional,
    EMAIL_REPLY_TO: optional,
    NGO_NAME: z.string().default("Namo Bhagwate Vasudevaya Trust"),
    // Who gets the "donor says they paid, please approve" email (comma-separated).
    // Defaults to GMAIL_USER, the inbox of the UPI account owner.
    APPROVAL_EMAILS: z
      .string()
      .optional()
      .transform((v) => (v ?? "").split(",").map((e) => e.trim()).filter(Boolean)),

    // Bank alert emails are trusted only from these domains (subdomains included),
    // and only when Gmail reports a DMARC/DKIM pass for that domain.
    BANK_ALERT_DOMAINS: z
      .string()
      .default(
        // bank.in: RBI's restricted domain for banks (e.g. kotak.bank.in); only verified banks can register it.
        "bank.in,hdfcbank.net,hdfcbank.com,icicibank.com,axisbank.com,kotak.com,sbi.co.in,yesbank.in,idfcfirstbank.com," +
          "indusind.com,pnb.co.in,bankofbaroda.com,bankofbaroda.co.in,unionbankofindia.bank.in,unionbankofindia.co.in," +
          "canarabank.com,aubank.in,federalbank.co.in,rblbank.com,bandhanbank.com,dbs.com,sc.com,idbibank.co.in",
      )
      .transform((v) => v.split(",").map((d) => d.trim().toLowerCase()).filter(Boolean)),
    // How far back a bank alert may match a donation, and how often the inbox may be checked.
    AUTO_MATCH_WINDOW_MINUTES: z.coerce.number().int().min(5).max(24 * 60).default(120),
    BANK_SYNC_INTERVAL_SECONDS: z.coerce.number().int().min(5).max(3600).default(15),
    // false (default): a matching bank email never confirms a donation by itself; the donor
    // is emailed only after the UPI owner or an admin approves (email link or dashboard).
    AUTO_CONFIRM_BANK_EMAILS: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),

    // Donation certificate (PDF). Registration numbers are printed only when set.
    CERT_SIGNATORY_NAME: z.string().default("Vijeshanand Saraswati Ji"),
    CERT_SIGNATORY_TITLE: z.string().default("Founder & Authorised Signatory"),
    // Same number as in the site footer (components/Footer.tsx).
    TRUST_REGISTRATION_NO: z.string().default("Trust/2019/NBVT"),
    TRUST_PAN: optional,
    TRUST_80G_NO: optional,

    CRON_SECRET: optional,
    NEXT_PUBLIC_APP_URL: optional,
  })
  .superRefine((env, ctx) => {
    if (env.STORAGE_DRIVER === "r2") {
      for (const key of ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"] as const) {
        if (!env[key]) ctx.addIssue({ code: "custom", path: [key], message: `${key} is required when STORAGE_DRIVER=r2` });
      }
    }
  });

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

// Validated lazily so `next build` works without secrets; the first request
// that needs configuration fails loudly if something is missing.
export function env(): Env {
  // Cache in production only, so .env edits apply immediately during development.
  if (cached && process.env.NODE_ENV === "production") return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

// Non-secret values the donate modal needs. Safe to call at build time.
export function publicDonationConfig() {
  const min = Number.parseInt(process.env.MIN_DONATION_AMOUNT ?? "", 10);
  const maxMb = Number.parseFloat(process.env.MAX_UPLOAD_MB ?? "");
  return {
    minAmount: Number.isFinite(min) && min >= 1 ? min : 10,
    maxUploadMb: Number.isFinite(maxMb) && maxMb > 0 ? Math.min(maxMb, 4.5) : 4,
  };
}

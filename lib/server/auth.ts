import "server-only";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { generateToken, sha256 } from "./donation";

export const SESSION_COOKIE = "nbvt_admin";
const SESSION_HOURS = 12;

// Password format: scrypt$N$r$p$salt$hash (base64). Keep in sync with scripts/create-admin.mjs.
const SCRYPT = { N: 1 << 15, r: 8, p: 1, keyLen: 64 };

function scryptAsync(password: string, salt: Buffer, N: number, r: number, p: number, keyLen: number) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, keyLen, { N, r, p, maxmem: 128 * N * r * 2 }, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, SCRYPT.N, SCRYPT.r, SCRYPT.p, SCRYPT.keyLen);
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString("base64"), hash.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string) {
  const [algo, N, r, p, saltB64, hashB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scryptAsync(password, Buffer.from(saltB64, "base64"), Number(N), Number(r), Number(p), expected.length);
  return timingSafeEqual(actual, expected);
}

// Used when the email doesn't exist, so a wrong email takes as long as a wrong password.
let dummyHash: Promise<string> | undefined;
export function getDummyHash() {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
  return dummyHash;
}

export async function createSession(adminId: string) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  await prisma.adminSession.create({ data: { tokenHash: sha256(token), adminId, expiresAt } });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await prisma.adminSession.deleteMany({ where: { tokenHash: sha256(token) } });
  store.delete(SESSION_COOKIE);
}

export async function getAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: sha256(token) },
    include: { admin: { select: { id: true, email: true, name: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.admin;
}

export type Admin = NonNullable<Awaited<ReturnType<typeof getAdmin>>>;

// For admin pages: sends logged-out visitors to the login page.
export async function requireAdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

// For admin API routes. Returns the admin, or a Response to send back.
export async function requireAdminApi(request: Request): Promise<Admin | Response> {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Please log in again." }, { status: 401 });
  return admin;
}

// Blocks cross-site form posts. Browsers always send Origin on POST.
export function sameOrigin(request: Request) {
  if (request.method === "GET" || request.method === "HEAD") return true;
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

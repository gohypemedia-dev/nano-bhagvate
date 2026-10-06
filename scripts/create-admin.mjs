// Creates an admin account, or resets the password of an existing one.
//
//   npm run admin:create -- admin@example.org "Full Name"
//
// You will be asked for the password (min 12 characters).
import { randomBytes, scrypt } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Must match lib/server/auth.ts
const N = 1 << 15, r = 8, p = 1, keyLen = 64;

const [email, ...nameParts] = process.argv.slice(2);
const name = nameParts.join(" ").trim();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name) {
  console.error('Usage: npm run admin:create -- admin@example.org "Full Name"');
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = process.env.ADMIN_PASSWORD || (await rl.question("Password (min 12 characters): "));
rl.close();
if (password.length < 12) {
  console.error("Password must be at least 12 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = await new Promise((resolve, reject) =>
  scrypt(password, salt, keyLen, { N, r, p, maxmem: 128 * N * r * 2 }, (err, key) => (err ? reject(err) : resolve(key))),
);
const passwordHash = ["scrypt", N, r, p, salt.toString("base64"), hash.toString("base64")].join("$");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const normalized = email.trim().toLowerCase();
const admin = await prisma.adminUser.upsert({
  where: { email: normalized },
  create: { email: normalized, name, passwordHash },
  update: { name, passwordHash },
});
// Log out any existing sessions for this admin after a password change.
await prisma.adminSession.deleteMany({ where: { adminId: admin.id } });
await prisma.$disconnect();
console.log(`Admin ready: ${admin.email} (${admin.name})`);

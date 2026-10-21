import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    // Prisma stores DateTime as UTC; make the session agree so DB defaults and raw SQL do too.
    options: "-c TimeZone=UTC",
  });
  return new PrismaClient({ adapter });
}

// Reuse one client across hot reloads in development. After `prisma generate` the PrismaClient
// class is a new one, so a client cached from the old generation fails instanceof and is replaced.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma instanceof PrismaClient
    ? globalForPrisma.prisma
    : (globalForPrisma.prisma = createClient());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


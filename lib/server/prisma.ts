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

// Bump schema version to force re-instantiation on dev server hot-reloads
const SCHEMA_VERSION = "2026-11-02-events-customAmounts-v3";
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  _schemaVersion?: string;
};

if (globalForPrisma._schemaVersion !== SCHEMA_VERSION) {
  globalForPrisma.prisma = undefined;
  globalForPrisma._schemaVersion = SCHEMA_VERSION;
}

export const prisma =
  globalForPrisma.prisma instanceof PrismaClient
    ? globalForPrisma.prisma
    : (globalForPrisma.prisma = createClient());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


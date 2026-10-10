import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { execSync } from "node:child_process";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  console.log("Applying Gallery schema changes to PostgreSQL...");

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "GalleryMediaType" AS ENUM ('PHOTO', 'VIDEO');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "GalleryItem" (
      "id" TEXT NOT NULL,
      "type" "GalleryMediaType" NOT NULL DEFAULT 'PHOTO',
      "title" TEXT NOT NULL,
      "titleHi" TEXT,
      "event" TEXT,
      "eventHi" TEXT,
      "src" TEXT NOT NULL,
      "thumbnail" TEXT NOT NULL,
      "alt" TEXT NOT NULL,
      "videoProvider" TEXT,
      "focalPoint" TEXT,
      "aspectRatio" TEXT,
      "displayOrder" INTEGER NOT NULL DEFAULT 0,
      "date" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "GalleryItem_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "GalleryItem_isActive_displayOrder_idx" ON "GalleryItem"("isActive", "displayOrder");
  `);

  console.log("Gallery table and enum ready in database.");
  await prisma.$disconnect();

  console.log("Regenerating Prisma client...");
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("Prisma client regenerated successfully!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

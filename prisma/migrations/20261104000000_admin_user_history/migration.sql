-- Account tables already exist in the application schema. Keep login history
-- independently of sessions, without storing session tokens or password hashes.
BEGIN;

CREATE TYPE "UserActivityType" AS ENUM ('REGISTER', 'LOGIN', 'LOGOUT', 'PROFILE_UPDATED');

CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "UserActivityType" NOT NULL,
    "provider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserActivity_userId_createdAt_idx" ON "UserActivity"("userId", "createdAt");
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Recover only known sign-ins. Sessions deleted before this migration cannot be recovered.
INSERT INTO "UserActivity" ("id", "userId", "type", "createdAt")
SELECT 'legacy-session-' || "id", "userId", 'LOGIN'::"UserActivityType", "createdAt"
FROM "UserSession";

ALTER TABLE "Donation" ADD COLUMN "userId" TEXT;
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Donation_userId_createdAt_idx" ON "Donation"("userId", "createdAt");
CREATE INDEX "UserSession_userId_expiresAt_idx" ON "UserSession"("userId", "expiresAt");

COMMIT;

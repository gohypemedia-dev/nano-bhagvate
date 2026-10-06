-- CreateEnum
CREATE TYPE "VerificationSource" AS ENUM ('ADMIN', 'BANK_EMAIL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('MATCHED', 'AMBIGUOUS', 'UNMATCHED');

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "verificationSource" "VerificationSource";

-- CreateTable
CREATE TABLE "PaymentAlert" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "utr" TEXT,
    "payer" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "status" "AlertStatus" NOT NULL,
    "donationId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncState" (
    "id" TEXT NOT NULL,
    "lastRunAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAlert_messageId_key" ON "PaymentAlert"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentAlert_donationId_key" ON "PaymentAlert"("donationId");

-- CreateIndex
CREATE INDEX "PaymentAlert_status_receivedAt_idx" ON "PaymentAlert"("status", "receivedAt");

-- AddForeignKey
ALTER TABLE "PaymentAlert" ADD CONSTRAINT "PaymentAlert_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE SET NULL ON UPDATE CASCADE;


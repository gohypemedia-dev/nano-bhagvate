-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "approvalTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Donation_approvalTokenHash_key" ON "Donation"("approvalTokenHash");

-- CreateEnum
CREATE TYPE "VerificationPurpose" AS ENUM ('SIGNUP', 'PASSWORD_RESET');

-- DropIndex
DROP INDEX "VerificationCode_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "VerificationCode" ADD COLUMN     "purpose" "VerificationPurpose" NOT NULL DEFAULT 'SIGNUP';

-- CreateIndex
CREATE INDEX "VerificationCode_userId_purpose_createdAt_idx" ON "VerificationCode"("userId", "purpose", "createdAt");

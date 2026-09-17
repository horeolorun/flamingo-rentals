-- AlterTable
ALTER TABLE "User" ADD COLUMN     "marketingEmailsOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marketingEmailsOptInAt" TIMESTAMP(3),
ADD COLUMN     "passwordHash" TEXT;

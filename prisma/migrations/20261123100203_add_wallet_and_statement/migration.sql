/*
  Warnings:

  - A unique constraint covering the columns `[availableWalletId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[depositWalletId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[availableWalletId]` on the table `VendorProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pendingWalletId]` on the table `VendorProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "WalletPurpose" AS ENUM ('CUSTOMER_AVAILABLE', 'CUSTOMER_DEPOSIT', 'VENDOR_AVAILABLE', 'VENDOR_PENDING', 'PLATFORM_REVENUE', 'PLATFORM_SUSPENSE', 'PLATFORM_REFUND');

-- CreateEnum
CREATE TYPE "WalletStatus" AS ENUM ('ACTIVE', 'FROZEN', 'CLOSED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "availableWalletId" TEXT,
ADD COLUMN     "depositWalletId" TEXT;

-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "availableWalletId" TEXT,
ADD COLUMN     "pendingWalletId" TEXT;

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "purpose" "WalletPurpose" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" "WalletStatus" NOT NULL DEFAULT 'ACTIVE',
    "balance" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "minimumBalance" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "transfersAllowed" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Statement" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "inflow" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "outflow" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "balance" DECIMAL(19,4) NOT NULL,
    "narration" TEXT NOT NULL,
    "reference" TEXT,
    "transactionId" TEXT,
    "transactionUnitId" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Statement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Wallet_purpose_idx" ON "Wallet"("purpose");

-- CreateIndex
CREATE INDEX "Wallet_status_idx" ON "Wallet"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Statement_transactionUnitId_key" ON "Statement"("transactionUnitId");

-- CreateIndex
CREATE INDEX "Statement_walletId_postedAt_idx" ON "Statement"("walletId", "postedAt");

-- CreateIndex
CREATE INDEX "Statement_transactionId_idx" ON "Statement"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_availableWalletId_key" ON "User"("availableWalletId");

-- CreateIndex
CREATE UNIQUE INDEX "User_depositWalletId_key" ON "User"("depositWalletId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_availableWalletId_key" ON "VendorProfile"("availableWalletId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_pendingWalletId_key" ON "VendorProfile"("pendingWalletId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_availableWalletId_fkey" FOREIGN KEY ("availableWalletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_depositWalletId_fkey" FOREIGN KEY ("depositWalletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorProfile" ADD CONSTRAINT "VendorProfile_availableWalletId_fkey" FOREIGN KEY ("availableWalletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorProfile" ADD CONSTRAINT "VendorProfile_pendingWalletId_fkey" FOREIGN KEY ("pendingWalletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;




ALTER TABLE "Statement"
  ADD CONSTRAINT statement_wallet_fk
  FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT;

ALTER TABLE "Wallet"
  ADD CONSTRAINT wallet_balance_above_minimum
  CHECK ("balance" >= "minimumBalance");

ALTER TABLE "Statement"
  ADD CONSTRAINT statement_inflow_xor_outflow
  CHECK (
    "inflow" >= 0 AND "outflow" >= 0 AND
    (("inflow" > 0 AND "outflow" = 0) OR ("inflow" = 0 AND "outflow" > 0))
  );

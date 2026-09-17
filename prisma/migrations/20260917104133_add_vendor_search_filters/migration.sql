-- CreateEnum
CREATE TYPE "AvailabilityBlockSource" AS ENUM ('MANUAL', 'BOOKING');

-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Nigeria',
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "state" TEXT;

-- CreateTable
CREATE TABLE "VendorAvailabilityBlock" (
    "id" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "source" "AvailabilityBlockSource" NOT NULL DEFAULT 'MANUAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorAvailabilityBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorAvailabilityBlock_vendorProfileId_idx" ON "VendorAvailabilityBlock"("vendorProfileId");

-- CreateIndex
CREATE INDEX "VendorAvailabilityBlock_startDate_idx" ON "VendorAvailabilityBlock"("startDate");

-- CreateIndex
CREATE INDEX "VendorAvailabilityBlock_endDate_idx" ON "VendorAvailabilityBlock"("endDate");

-- CreateIndex
CREATE INDEX "VendorAvailabilityBlock_vendorProfileId_startDate_endDate_idx" ON "VendorAvailabilityBlock"("vendorProfileId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "Listing_category_idx" ON "Listing"("category");

-- CreateIndex
CREATE INDEX "Listing_priceKobo_idx" ON "Listing"("priceKobo");

-- CreateIndex
CREATE INDEX "Listing_isAvailable_idx" ON "Listing"("isAvailable");

-- CreateIndex
CREATE INDEX "Listing_category_priceKobo_idx" ON "Listing"("category", "priceKobo");

-- CreateIndex
CREATE INDEX "VendorProfile_state_idx" ON "VendorProfile"("state");

-- CreateIndex
CREATE INDEX "VendorProfile_city_idx" ON "VendorProfile"("city");

-- CreateIndex
CREATE INDEX "VendorProfile_averageRating_idx" ON "VendorProfile"("averageRating");

-- CreateIndex
CREATE INDEX "VendorProfile_kycStatus_idx" ON "VendorProfile"("kycStatus");

-- AddForeignKey
ALTER TABLE "VendorAvailabilityBlock" ADD CONSTRAINT "VendorAvailabilityBlock_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

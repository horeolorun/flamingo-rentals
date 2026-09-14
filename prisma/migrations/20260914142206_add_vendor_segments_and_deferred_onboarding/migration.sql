-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "segments" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "businessName" DROP NOT NULL;

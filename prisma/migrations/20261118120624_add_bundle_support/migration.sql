-- CreateEnum
CREATE TYPE "BundleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CartBundleType" AS ENUM ('VENDOR', 'CUSTOMER');

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "isSelected" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "VendorBundle" (
    "id" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priceKobo" INTEGER NOT NULL,
    "status" "BundleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorBundleItem" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorBundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartBundle" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "type" "CartBundleType" NOT NULL,
    "vendorBundleId" TEXT,
    "title" TEXT NOT NULL,
    "packagePriceKobo" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "isSelected" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartBundleItem" (
    "id" TEXT NOT NULL,
    "cartBundleId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceKobo" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartBundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorBundle_vendorProfileId_idx" ON "VendorBundle"("vendorProfileId");

-- CreateIndex
CREATE INDEX "VendorBundle_status_idx" ON "VendorBundle"("status");

-- CreateIndex
CREATE INDEX "VendorBundleItem_listingId_idx" ON "VendorBundleItem"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "VendorBundleItem_bundleId_listingId_key" ON "VendorBundleItem"("bundleId", "listingId");

-- CreateIndex
CREATE INDEX "CartBundle_cartId_idx" ON "CartBundle"("cartId");

-- CreateIndex
CREATE INDEX "CartBundle_vendorBundleId_idx" ON "CartBundle"("vendorBundleId");

-- CreateIndex
CREATE INDEX "CartBundle_type_idx" ON "CartBundle"("type");

-- CreateIndex
CREATE INDEX "CartBundleItem_listingId_idx" ON "CartBundleItem"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "CartBundleItem_cartBundleId_listingId_key" ON "CartBundleItem"("cartBundleId", "listingId");

-- AddForeignKey
ALTER TABLE "VendorBundle" ADD CONSTRAINT "VendorBundle_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorBundleItem" ADD CONSTRAINT "VendorBundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "VendorBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorBundleItem" ADD CONSTRAINT "VendorBundleItem_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartBundle" ADD CONSTRAINT "CartBundle_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartBundle" ADD CONSTRAINT "CartBundle_vendorBundleId_fkey" FOREIGN KEY ("vendorBundleId") REFERENCES "VendorBundle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartBundleItem" ADD CONSTRAINT "CartBundleItem_cartBundleId_fkey" FOREIGN KEY ("cartBundleId") REFERENCES "CartBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartBundleItem" ADD CONSTRAINT "CartBundleItem_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

import "dotenv/config";
import { db } from "../app/lib/db";
import { SAMPLE_VENDORS } from "../app/data/seedVendors";

async function main() {
  for (const entry of SAMPLE_VENDORS) {
    const user = await db.user.upsert({
      where: { email: entry.user.email },
      update: {
        fullName: entry.user.fullName,
        state: entry.user.state,
        city: entry.user.city,
        role: "VENDOR",
        status: "ACTIVE",
      },
      create: {
        id: entry.user.id,
        fullName: entry.user.fullName,
        state: entry.user.state,
        city: entry.user.city,
        email: entry.user.email,
        phone: entry.user.phone,
        passwordHash: null,
        marketingEmailsOptIn: false,
        role: "VENDOR",
        status: "ACTIVE",
        emailVerifiedAt: new Date(),
      },
    });

    const profile = await db.vendorProfile.upsert({
      where: { userId: user.id },
      update: {
        businessName: entry.profile.businessName,
        logoUrl: entry.profile.logoUrl,
        isFeatured: entry.profile.isFeatured,
        primaryCategory: entry.profile.primaryCategory,
        segments: entry.profile.segments,
        country: entry.profile.country,
        state: entry.profile.state,
        city: entry.profile.city,
        averageRating: entry.profile.averageRating,
        reviewCount: entry.profile.reviewCount,
        kycStatus: "VERIFIED",
        payoutStatus: "VERIFIED",
      },
      create: {
        id: entry.profile.id,
        userId: user.id,
        businessName: entry.profile.businessName,
        logoUrl: entry.profile.logoUrl,
        isFeatured: entry.profile.isFeatured,
        primaryCategory: entry.profile.primaryCategory,
        segments: entry.profile.segments,
        country: entry.profile.country,
        state: entry.profile.state,
        city: entry.profile.city,
        averageRating: entry.profile.averageRating,
        reviewCount: entry.profile.reviewCount,
        kycStatus: "VERIFIED",
        payoutStatus: "VERIFIED",
      },
    });

    for (const listing of entry.listings) {
      await db.listing.upsert({
        where: {
          vendorProfileId_slug: {
            vendorProfileId: profile.id,
            slug: listing.slug,
          },
        },
        update: {
          title: listing.title,
          description: listing.description,
          category: listing.category,
          priceKobo: listing.priceKobo,
          totalQuantity: listing.totalQuantity,
          pricingUnit: listing.pricingUnit,
          status: "ACTIVE",
          isAvailable: true,
        },
        create: {
          id: listing.id,
          vendorProfileId: profile.id,
          title: listing.title,
          slug: listing.slug,
          description: listing.description,
          category: listing.category,
          priceKobo: listing.priceKobo,
          totalQuantity: listing.totalQuantity,
          pricingUnit: listing.pricingUnit,
          status: "ACTIVE",
          isAvailable: true,
        },
      });
    }
  }

  console.log(`Seeded ${SAMPLE_VENDORS.length} sample vendors.`);
}

main()
  .catch((error) => {
    console.error("Failed to seed sample vendors:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

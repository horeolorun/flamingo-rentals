import { SAMPLE_VENDORS } from "./seedVendors";

export const vendors = SAMPLE_VENDORS.map((entry) => ({
  id: entry.profile.id,
  businessName: entry.profile.businessName,
  slug: entry.profile.id,
  category: entry.profile.primaryCategory,
  city: entry.profile.city,
  region: entry.profile.state,
  rating: entry.profile.averageRating,
  customerCount: entry.profile.reviewCount,
  imageUrl: entry.profile.logoUrl,
  verified: true,
}));
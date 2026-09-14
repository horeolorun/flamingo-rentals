export const vendorSegments = [
  "Rentals",
  "Catering",
  "Decor",
  "Sound & DJ",
  "Photography & Video",
  "Venues",
  "Event Planning",
  "Entertainment",
  "Other",
] as const;

export type VendorSegment =
  (typeof vendorSegments)[number];
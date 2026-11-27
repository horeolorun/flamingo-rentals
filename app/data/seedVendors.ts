export type SeedVendorDefinition = {
  user: {
    id: string;
    fullName: string;
    state: string;
    city: string;
    email: string;
    phone: string;
  };
  profile: {
    id: string;
    businessName: string;
    logoUrl: string;
    isFeatured: boolean;
    primaryCategory: string;
    segments: string[];
    country: string;
    state: string;
    city: string;
    averageRating: number;
    reviewCount: number;
  };
  listings: Array<{
    id: string;
    title: string;
    slug: string;
    description: string;
    category: string;
    priceKobo: number;
    totalQuantity: number;
    pricingUnit: string;
  }>;
};

export const SAMPLE_VENDORS: SeedVendorDefinition[] = [
  {
    user: {
      id: "vendor-user-1",
      fullName: "Amaka Okafor",
      state: "Lagos",
      city: "Lekki",
      email: "royal@flamingorentals.test",
      phone: "08030000001",
    },
    profile: {
      id: "vendor-royal-events",
      businessName: "Royal Events & Rentals",
      logoUrl: "/vendors/royal-events.jpg",
      isFeatured: true,
      primaryCategory: "Rentals",
      segments: ["Rentals", "Decor"],
      country: "Nigeria",
      state: "Lagos",
      city: "Lekki",
      averageRating: 4.9,
      reviewCount: 42,
    },
    listings: [
      {
        id: "listing-chiavari-chairs",
        title: "Gold Chiavari Chairs (Set of 10)",
        slug: "gold-chiavari-chairs-set-10",
        description:
          "Elegant gold Chiavari chairs with white cushioned seats, ideal for weddings, receptions, and corporate galas.",
        category: "Rentals",
        priceKobo: 2500000,
        totalQuantity: 10,
        pricingUnit: "set of 10",
      },
      {
        id: "listing-marquee-tent",
        title: "200-Seater White Marquee Tent",
        slug: "200-seater-white-marquee-tent",
        description:
          "Weatherproof luxury white marquee tent with professional setup and teardown included.",
        category: "Rentals",
        priceKobo: 18000000,
        totalQuantity: 2,
        pricingUnit: "event",
      },
      {
        id: "listing-banquet-tables",
        title: "Round Banquet Tables & Linen (Set of 5)",
        slug: "round-banquet-tables-linen-set-5",
        description:
          "60-inch round banquet tables dressed with crisp ivory floor-length tablecloths.",
        category: "Rentals",
        priceKobo: 3500000,
        totalQuantity: 8,
        pricingUnit: "set of 5",
      },
    ],
  },
  {
    user: {
      id: "vendor-user-2",
      fullName: "Tunde Adeyemi",
      state: "Lagos",
      city: "Ikeja",
      email: "tasty@flamingorentals.test",
      phone: "08030000002",
    },
    profile: {
      id: "vendor-tasty-bites",
      businessName: "Tasty Bites Catering",
      logoUrl: "/vendors/tasty-bites.jpg",
      isFeatured: true,
      primaryCategory: "Catering",
      segments: ["Catering"],
      country: "Nigeria",
      state: "Lagos",
      city: "Ikeja",
      averageRating: 4.8,
      reviewCount: 31,
    },
    listings: [
      {
        id: "listing-jollof-buffet",
        title: "Classic Nigerian Buffet (50 Guests)",
        slug: "classic-nigerian-buffet-50",
        description:
          "Smoky party jollof, fried rice, grilled chicken, beef skewers, and chilled zobo served warm by uniformed staff.",
        category: "Catering",
        priceKobo: 22000000,
        totalQuantity: 3,
        pricingUnit: "package",
      },
      {
        id: "listing-small-chops-station",
        title: "Live Small Chops & Grill Station (100 Guests)",
        slug: "live-small-chops-grill-station-100",
        description:
          "Freshly fried puff-puff, samosas, spring rolls, peppered gizzard, and barbecue wings prepared on-site.",
        category: "Catering",
        priceKobo: 14500000,
        totalQuantity: 4,
        pricingUnit: "package",
      },
    ],
  },
  {
    user: {
      id: "vendor-user-3",
      fullName: "Chidi Nwosu",
      state: "Federal Capital Territory",
      city: "Abuja",
      email: "vibetunes@flamingorentals.test",
      phone: "08030000003",
    },
    profile: {
      id: "vendor-vibetunes",
      businessName: "VibeTunes Sound & DJ",
      logoUrl: "/vendors/vibetunes.jpg",
      isFeatured: true,
      primaryCategory: "Sound & DJ",
      segments: ["Sound & DJ", "Entertainment"],
      country: "Nigeria",
      state: "Federal Capital Territory",
      city: "Abuja",
      averageRating: 4.7,
      reviewCount: 19,
    },
    listings: [
      {
        id: "listing-pro-dj-rig",
        title: "Live DJ & Full Line-Array Sound System",
        slug: "live-dj-full-sound-system",
        description:
          "Experienced event DJ with dual subwoofers, wireless microphones, and ambient stage lighting.",
        category: "Sound & DJ",
        priceKobo: 15000000,
        totalQuantity: 1,
        pricingUnit: "event",
      },
      {
        id: "listing-ambient-uplighting",
        title: "Wireless DMX Ambient Uplighting (16 Lights)",
        slug: "wireless-dmx-ambient-uplighting-16",
        description:
          "Custom colour-matched LED uplighting package to transform reception halls and outdoor tents.",
        category: "Sound & DJ",
        priceKobo: 6500000,
        totalQuantity: 3,
        pricingUnit: "event",
      },
    ],
  },
  {
    user: {
      id: "vendor-user-4",
      fullName: "Kemi Balogun",
      state: "Lagos",
      city: "Victoria Island",
      email: "velvetpetal@flamingorentals.test",
      phone: "08030000004",
    },
    profile: {
      id: "vendor-velvet-petal",
      businessName: "Velvet Petal Decor & Styling",
      logoUrl: "/home/hero-detail.jpg",
      isFeatured: true,
      primaryCategory: "Decor",
      segments: ["Decor", "Event Planning"],
      country: "Nigeria",
      state: "Lagos",
      city: "Victoria Island",
      averageRating: 4.9,
      reviewCount: 38,
    },
    listings: [
      {
        id: "listing-luxury-bridal-stage",
        title: "Bespoke Floral Stage & Sweetheart Table Styling",
        slug: "bespoke-floral-stage-sweetheart-table",
        description:
          "Custom arch backdrop, lush silk and fresh florals, crystal chandeliers, and elevated stage styling.",
        category: "Decor",
        priceKobo: 35000000,
        totalQuantity: 2,
        pricingUnit: "event",
      },
      {
        id: "listing-floral-centerpieces",
        title: "Fresh Rose & Candle Table Centerpieces (Set of 10)",
        slug: "fresh-rose-candle-centerpieces-10",
        description:
          "Tall gold floral stands arranged with seasonal blooms and glass hurricane candles.",
        category: "Decor",
        priceKobo: 9500000,
        totalQuantity: 5,
        pricingUnit: "set of 10",
      },
      {
        id: "listing-drapery-backdrop",
        title: "Ceiling Fairy Lights & Chiffon Draping",
        slug: "ceiling-fairy-lights-chiffon-draping",
        description:
          "Warm canopy lighting and flowing ceiling drapery tailored to your venue floor plan.",
        category: "Decor",
        priceKobo: 14000000,
        totalQuantity: 3,
        pricingUnit: "event",
      },
    ],
  },
  {
    user: {
      id: "vendor-user-5",
      fullName: "Femi Adesina",
      state: "Lagos",
      city: "Surulere",
      email: "lenscraft@flamingorentals.test",
      phone: "08030000005",
    },
    profile: {
      id: "vendor-lenscraft",
      businessName: "LensCraft Studios",
      logoUrl: "/home/vendor-cta.jpg",
      isFeatured: true,
      primaryCategory: "Photography & Video",
      segments: ["Photography & Video"],
      country: "Nigeria",
      state: "Lagos",
      city: "Surulere",
      averageRating: 4.9,
      reviewCount: 27,
    },
    listings: [
      {
        id: "listing-full-day-photo-video",
        title: "Full-Day Event Photography & 4K Highlight Film",
        slug: "full-day-event-photo-4k-film",
        description:
          "Two lead photographers, one cinema videographer, drone coverage, and an edited online gallery within 7 days.",
        category: "Photography & Video",
        priceKobo: 28000000,
        totalQuantity: 2,
        pricingUnit: "event",
      },
      {
        id: "listing-360-photobooth",
        title: "360° Spinning Photo Booth with Props",
        slug: "360-spinning-photo-booth-props",
        description:
          "Instant slow-motion video booth with studio ring light, custom overlay branding, and on-site attendant.",
        category: "Photography & Video",
        priceKobo: 11000000,
        totalQuantity: 3,
        pricingUnit: "event",
      },
    ],
  },
  {
    user: {
      id: "vendor-user-6",
      fullName: "Ngozi Eze",
      state: "Lagos",
      city: "Ikoyi",
      email: "opalatrium@flamingorentals.test",
      phone: "08030000006",
    },
    profile: {
      id: "vendor-opal-atrium",
      businessName: "Opal Atrium & Gardens",
      logoUrl: "/home/hero-venue.jpg",
      isFeatured: true,
      primaryCategory: "Venues",
      segments: ["Venues"],
      country: "Nigeria",
      state: "Lagos",
      city: "Ikoyi",
      averageRating: 4.8,
      reviewCount: 35,
    },
    listings: [
      {
        id: "listing-opal-main-hall",
        title: "Opal Grand Ballroom (500-Guest Indoor Hall)",
        slug: "opal-grand-ballroom-500",
        description:
          "Pillarless air-conditioned ballroom with bridal suite, backup generator power, and secure valet parking.",
        category: "Venues",
        priceKobo: 85000000,
        totalQuantity: 1,
        pricingUnit: "day",
      },
      {
        id: "listing-opal-garden-lawn",
        title: "Waterfront Garden Lawn (250 Guests)",
        slug: "waterfront-garden-lawn-250",
        description:
          "Manicured outdoor garden overlooking the lagoon, suited to ceremonies, cocktail receptions, and sundowners.",
        category: "Venues",
        priceKobo: 52000000,
        totalQuantity: 1,
        pricingUnit: "day",
      },
    ],
  },
  {
    user: {
      id: "vendor-user-7",
      fullName: "Sadiq Bello",
      state: "Federal Capital Territory",
      city: "Abuja",
      email: "savannahgrill@flamingorentals.test",
      phone: "08030000007",
    },
    profile: {
      id: "vendor-savannah-grill",
      businessName: "Savannah Grill & Cocktail Bar",
      logoUrl: "/home/hero-catering.jpg",
      isFeatured: true,
      primaryCategory: "Catering",
      segments: ["Catering"],
      country: "Nigeria",
      state: "Federal Capital Territory",
      city: "Abuja",
      averageRating: 4.7,
      reviewCount: 24,
    },
    listings: [
      {
        id: "listing-abuja-cocktail-bar",
        title: "Craft Mocktails & Mobile Cocktail Bar (100 Guests)",
        slug: "craft-mocktails-mobile-bar-100",
        description:
          "Custom LED mobile bar staffed by two mixologists serving signature cocktails, chapman, and fresh fruit blends.",
        category: "Catering",
        priceKobo: 16000000,
        totalQuantity: 3,
        pricingUnit: "event",
      },
      {
        id: "listing-suya-platter-service",
        title: "Charcoal Suya & Asun Carving Station",
        slug: "charcoal-suya-asun-carving-station",
        description:
          "Live grill chefs serving spiced beef suya, peppered asun, and roasted plantain for evening receptions.",
        category: "Catering",
        priceKobo: 13000000,
        totalQuantity: 4,
        pricingUnit: "package",
      },
    ],
  },
  {
    user: {
      id: "vendor-user-8",
      fullName: "Bisi Akintola",
      state: "Oyo",
      city: "Ibadan",
      email: "signaturesoiree@flamingorentals.test",
      phone: "08030000008",
    },
    profile: {
      id: "vendor-signature-soiree",
      businessName: "Signature Soirée Planners",
      logoUrl: "/home/hero-detail.jpg",
      isFeatured: false,
      primaryCategory: "Event Planning",
      segments: ["Event Planning", "Decor"],
      country: "Nigeria",
      state: "Oyo",
      city: "Ibadan",
      averageRating: 4.8,
      reviewCount: 22,
    },
    listings: [
      {
        id: "listing-day-of-coordination",
        title: "Full Day-of Event Coordination (2 Coordinators)",
        slug: "full-day-of-coordination-2",
        description:
          "Timeline management, vendor check-in, guest seating supervision, and seamless run-of-show execution.",
        category: "Event Planning",
        priceKobo: 17500000,
        totalQuantity: 3,
        pricingUnit: "event",
      },
      {
        id: "listing-end-to-end-planning",
        title: "Complete End-to-End Event Planning",
        slug: "complete-end-to-end-event-planning",
        description:
          "Budgeting, vendor sourcing, contract reviews, creative direction, and full on-site production.",
        category: "Event Planning",
        priceKobo: 48000000,
        totalQuantity: 2,
        pricingUnit: "project",
      },
    ],
  },
  {
    user: {
      id: "vendor-user-9",
      fullName: "Dapo Ogunleye",
      state: "Lagos",
      city: "Yaba",
      email: "owanbelive@flamingorentals.test",
      phone: "08030000009",
    },
    profile: {
      id: "vendor-owanbe-live",
      businessName: "Owanbe Live Band & MCs",
      logoUrl: "/vendors/vibetunes.jpg",
      isFeatured: false,
      primaryCategory: "Entertainment",
      segments: ["Entertainment", "Sound & DJ"],
      country: "Nigeria",
      state: "Lagos",
      city: "Yaba",
      averageRating: 4.9,
      reviewCount: 29,
    },
    listings: [
      {
        id: "listing-7-piece-live-band",
        title: "7-Piece Afrobeats & Highlife Live Band (4 Hours)",
        slug: "7-piece-afrobeats-highlife-band",
        description:
          "High-energy live band performing classic highlife, juju, Afrobeats, and contemporary party hits.",
        category: "Entertainment",
        priceKobo: 32000000,
        totalQuantity: 1,
        pricingUnit: "event",
      },
      {
        id: "listing-bilingual-mc",
        title: "Professional Event Compere / MC",
        slug: "professional-event-compere-mc",
        description:
          "Engaging corporate and wedding host keeping programmes on schedule and guests entertained.",
        category: "Entertainment",
        priceKobo: 12000000,
        totalQuantity: 2,
        pricingUnit: "event",
      },
    ],
  },
  {
    user: {
      id: "vendor-user-10",
      fullName: "Tariq Briggs",
      state: "Rivers",
      city: "Port Harcourt",
      email: "grandcanopy@flamingorentals.test",
      phone: "08030000010",
    },
    profile: {
      id: "vendor-grand-canopy",
      businessName: "Grand Canopy & Marquee Co.",
      logoUrl: "/vendors/royal-events.jpg",
      isFeatured: false,
      primaryCategory: "Rentals",
      segments: ["Rentals"],
      country: "Nigeria",
      state: "Rivers",
      city: "Port Harcourt",
      averageRating: 4.6,
      reviewCount: 17,
    },
    listings: [
      {
        id: "listing-vip-dome-tent",
        title: "Clear-Span VIP Dome Tent (300 Guests)",
        slug: "clear-span-vip-dome-tent-300",
        description:
          "Heavy-duty clear-span event marquee with wooden flooring option and full rigging support.",
        category: "Rentals",
        priceKobo: 32000000,
        totalQuantity: 1,
        pricingUnit: "event",
      },
      {
        id: "listing-cooling-mist-fans",
        title: "Industrial Cooling Mist Fans (Pair)",
        slug: "industrial-cooling-mist-fans-pair",
        description:
          "Quiet outdoor misting fans to keep tented receptions and garden guests cool all afternoon.",
        category: "Rentals",
        priceKobo: 4500000,
        totalQuantity: 6,
        pricingUnit: "day",
      },
    ],
  },
  {
    user: {
      id: "vendor-user-11",
      fullName: "Musa Ibrahim",
      state: "Federal Capital Territory",
      city: "Abuja",
      email: "zumahills@flamingorentals.test",
      phone: "08030000011",
    },
    profile: {
      id: "vendor-zuma-hills",
      businessName: "Zuma Hills Event Centre",
      logoUrl: "/home/hero-venue.jpg",
      isFeatured: false,
      primaryCategory: "Venues",
      segments: ["Venues"],
      country: "Nigeria",
      state: "Federal Capital Territory",
      city: "Abuja",
      averageRating: 4.6,
      reviewCount: 14,
    },
    listings: [
      {
        id: "listing-zuma-conference-hall",
        title: "Executive Banquet & Conference Hall (350 Guests)",
        slug: "executive-banquet-conference-hall-350",
        description:
          "Modern multipurpose venue in central Abuja with built-in stage, projector screen, and VIP lounge.",
        category: "Venues",
        priceKobo: 60000000,
        totalQuantity: 1,
        pricingUnit: "day",
      },
    ],
  },
  {
    user: {
      id: "vendor-user-12",
      fullName: "Seun Babatunde",
      state: "Lagos",
      city: "Ikeja",
      email: "swiftvalet@flamingorentals.test",
      phone: "08030000012",
    },
    profile: {
      id: "vendor-swiftvalet",
      businessName: "SwiftValet & Event Security",
      logoUrl: "/home/vendor-cta.jpg",
      isFeatured: false,
      primaryCategory: "Other",
      segments: ["Other"],
      country: "Nigeria",
      state: "Lagos",
      city: "Ikeja",
      averageRating: 4.7,
      reviewCount: 16,
    },
    listings: [
      {
        id: "listing-bouncer-protocol-team",
        title: "Uniformed Protocol & Event Security Team (6 Officers)",
        slug: "uniformed-protocol-security-team-6",
        description:
          "Trained guest access control, VIP escort, and crowd management officers for private and corporate events.",
        category: "Other",
        priceKobo: 11500000,
        totalQuantity: 4,
        pricingUnit: "event",
      },
      {
        id: "listing-valet-parking-crew",
        title: "Red-Carpet Valet Parking Team (4 Attendants)",
        slug: "red-carpet-valet-parking-crew-4",
        description:
          "Insured valet drivers with ticket tags and traffic marshals for smooth guest arrival and departure.",
        category: "Other",
        priceKobo: 9500000,
        totalQuantity: 3,
        pricingUnit: "event",
      },
    ],
  },
];

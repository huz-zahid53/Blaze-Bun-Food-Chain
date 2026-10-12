export type DealKind = "combo" | "bogo" | "midnight" | "student" | "family";

export interface Deal {
  id: string;
  slug: string;
  title: string;
  kicker: string;
  description: string;
  price: number;
  originalPrice: number;
  image?: string;
  hue: number;
  glyph: string;
  kind: DealKind;
  badge?: string;
  validUntil?: string;
  /** Clock window for time-gated drops, KFC-midnight style. */
  window?: string;
  terms: string[];
  itemSlugs: string[];
  accent: string;
}

export const deals: Deal[] = [
  {
    id: "deal-bucket-drop",
    slug: "bucket-drop",
    title: "The Bucket Drop",
    kicker: "Save Rs 870",
    description:
      "16 wings, a full rack of loaded fries and three dips in one bucket. Built for the match, the mehndi, or the 1 AM hunger.",
    price: 2150,
    originalPrice: 3020,
    image: "/media/hero/hero-3.jpg",
    hue: 20,
    glyph: "bucket",
    kind: "family",
    badge: "Weekend only",
    validUntil: "2026-11-30",
    accent: "from-ember to-flame",
    terms: [
      "Valid Fri–Sun, all day",
      "Not combinable with other offers",
      "Subject to branch availability",
    ],
    itemSlugs: ["wing-storm-bucket", "blaze-loaded-fries"],
  },
  {
    id: "deal-two-for-one",
    slug: "smash-bogo",
    title: "Smash 2-for-1",
    kicker: "Buy 1, get 1 free",
    description:
      "Order any Signature Smash after 3 PM and the second one is on us. Every single weekday. Yes, really.",
    price: 1150,
    originalPrice: 2300,
    image: "/media/items/blaze-signature-smash.jpg",
    hue: 12,
    glyph: "burger",
    kind: "bogo",
    badge: "Mon–Fri, after 3 PM",
    window: "15:00 — 23:59",
    accent: "from-flame to-gold",
    terms: [
      "Valid Monday to Friday, 3 PM to close",
      "Cheapest burger is free",
      "Dine-in, takeaway and delivery",
    ],
    itemSlugs: ["blaze-signature-smash", "karachi-double-masala"],
  },
  {
    id: "deal-midnight",
    slug: "midnight-munch",
    title: "Midnight Munch Box",
    kicker: "Drops at 12:00 AM",
    description:
      "Burger, four wings, fries, dip and a drink for Rs 1,250. Only exists between midnight and 4 AM — like all good decisions.",
    price: 1250,
    originalPrice: 1620,
    image: "/media/hero/hero-2.jpg",
    hue: 268,
    glyph: "bucket",
    kind: "midnight",
    badge: "12 AM — 4 AM only",
    window: "00:00 — 04:00",
    accent: "from-indigo-500 to-ember",
    terms: [
      "Orderable between 12:00 AM and 4:00 AM only",
      "Limited nightly stock per branch",
      "Delivery surcharge applies after 1 AM",
    ],
    itemSlugs: ["midnight-munch-box"],
  },
  {
    id: "deal-student",
    slug: "student-blaze",
    title: "Student Blaze Card",
    kicker: "20% off, always",
    description:
      "Flash a valid student card and take 20% off your entire order, every day, at every branch. No minimum spend.",
    price: 0,
    originalPrice: 0,
    image: "/media/items/crispy-fiery-chicken-burger.jpg",
    hue: 210,
    glyph: "burger",
    kind: "student",
    badge: "Valid student ID",
    accent: "from-chill to-ember",
    terms: [
      "Valid student ID required at pickup or delivery",
      "Maximum discount Rs 600 per order",
      "Cannot be combined with 2-for-1",
    ],
    itemSlugs: ["crispy-fiery-chicken-burger", "peri-peri-fries"],
  },
  {
    id: "deal-family-feast",
    slug: "family-feast",
    title: "Sunday Family Feast",
    kicker: "Feeds 5 · Save Rs 870",
    description:
      "Four burgers, twelve wings, two large fries, four dips and a 1.5L drink. The whole table sorted for Rs 3,450.",
    price: 3450,
    originalPrice: 4320,
    image: "/media/hero/hero-1.jpg",
    hue: 30,
    glyph: "bucket",
    kind: "family",
    badge: "Sundays",
    accent: "from-ember to-gold",
    terms: [
      "Available every Sunday, all day",
      "Feeds 4–5 people",
      "Free delivery within 8 km",
    ],
    itemSlugs: ["blaze-family-feast"],
  },
];

export const dealKindMeta: Record<DealKind, { label: string; tone: string }> = {
  combo: { label: "Combo", tone: "bg-flame/15 text-ember-dark" },
  bogo: { label: "2 for 1", tone: "bg-fresh/15 text-green-700" },
  midnight: { label: "Midnight", tone: "bg-indigo-500/15 text-indigo-700" },
  student: { label: "Student", tone: "bg-chill/15 text-sky-700" },
  family: { label: "Family", tone: "bg-gold/20 text-amber-700" },
};

export const getDeal = (slug: string) => deals.find((d) => d.slug === slug);

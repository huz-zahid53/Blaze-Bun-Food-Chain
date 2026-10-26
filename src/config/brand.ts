/**
 * ============================================================
 *  BRAND CONFIG — rename the entire website from this one file.
 * ============================================================
 */

export const brand = {
  /* ---- Identity ---- */
  name: "Blaze & Bun",
  shortName: "B&B",
  tagline: "Gourmet Burgers",
  descriptor: "Flame-seared. Built bold.",
  founded: 2019,
  voice:
    "We sear every patty over open flame, stack it stupidly high, and hand it over hot. No shortcuts, no sad burgers.",

  /* ---- Contact ---- */
  phone: "021-111-BLAZE",
  phoneHref: "tel:+922111125293",
  whatsapp: "+92 300 1234567",
  email: "hello@blazeandbun.pk",
  supportEmail: "support@blazeandbun.pk",
  careersEmail: "careers@blazeandbun.pk",
  franchiseEmail: "franchise@blazeandbun.pk",
  headOffice: "Plot 14-C, Khayaban-e-Ittehad, Phase VI, DHA, Karachi",

  /* ---- Operations ---- */
  hours: "12:00 PM — 03:00 AM",
  hoursNote: "Open till 3 AM, every single night",
  deliveryFee: 149,
  freeDeliveryOver: 2500,
  minOrder: 500,
  avgPrepTime: "25–35 min",
  serviceChargeRate: 0.0,
  taxRate: 0.05, // 5% SST on prepared food (PK)

  /* ---- Social ---- */
  social: {
    instagram: "https://instagram.com/blazeandbun",
    facebook: "https://facebook.com/blazeandbun",
    tiktok: "https://tiktok.com/@blazeandbun",
    x: "https://x.com/blazeandbun",
  },

  /* ---- Loyalty (KFC-style rewards) ---- */
  loyalty: {
    name: "Blaze Rewards",
    pointsPerRupee: 0.02, // 2% back
    rupeePerPoint: 1,
    joinBonus: 150,
    tiers: [
      { name: "Spark", min: 0, perk: "Member deals" },
      { name: "Ember", min: 1500, perk: "Free fries Fridays" },
      { name: "Inferno", min: 5000, perk: "Priority delivery + 2x points" },
    ],
  },
} as const;

export type OrderType = "delivery" | "pickup" | "catering";

export const orderTypes: {
  id: OrderType;
  label: string;
  blurb: string;
  icon: "delivery" | "pickup" | "catering";
}[] = [
  {
    id: "delivery",
    label: "Delivery",
    blurb: "Hot & fast to your door",
    icon: "delivery",
  },
  {
    id: "pickup",
    label: "Pick-Up",
    blurb: "Skip the queue, grab & go",
    icon: "pickup",
  },
  {
    id: "catering",
    label: "Catering",
    blurb: "Feed the whole crew",
    icon: "catering",
  },
];

/** Serviceable cities — drives the location picker. */
export const cities = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
] as const;

export const paymentMethods = [
  {
    id: "cod",
    label: "Cash on Delivery",
    blurb: "Pay the rider when it arrives",
    fee: 0,
    kind: "cash" as const,
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    blurb: "Visa, Mastercard, UnionPay",
    fee: 0,
    kind: "card" as const,
  },
  {
    id: "jazzcash",
    label: "JazzCash",
    blurb: "Mobile account or voucher",
    fee: 0,
    kind: "wallet" as const,
  },
  {
    id: "easypaisa",
    label: "EasyPaisa",
    blurb: "Mobile account or voucher",
    fee: 0,
    kind: "wallet" as const,
  },
  {
    id: "bank",
    label: "Bank Transfer",
    blurb: "1Link / Raast instant transfer",
    fee: 0,
    kind: "bank" as const,
  },
] as const;

export const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/deals", label: "Deals" },
  { href: "/locations", label: "Locations" },
  { href: "/about", label: "Our Story" },
  { href: "/blog", label: "Journal" },
  { href: "/franchise", label: "Franchise" },
  { href: "/contact", label: "Contact" },
] as const;

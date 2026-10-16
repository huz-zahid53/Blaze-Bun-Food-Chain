export type DealKind =
  | "solo"
  | "duo"
  | "family"
  | "student"
  | "midnight"
  | "lunch"
  | "bogo"
  | "combo";

export interface DealSlotChoice {
  id: string;
  name: string;
  surcharge?: number; // delta in PKR (e.g. 0 for standard, 80 for upgrade)
  badge?: string;
}

export interface DealSlot {
  id: string;
  title: string; // e.g. "Choose Burger 1", "Choose Side", "Choose Drink"
  required?: boolean;
  choices: DealSlotChoice[];
}

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
  contents: string[];
  accent: string;
  itemSlugs?: string[];
  slots: DealSlot[];
}

export const deals: Deal[] = [
  /* ---------------- 1. Solo Deal ---------------- */
  {
    id: "deal-solo-crunch-combo",
    slug: "solo-crunch-combo",
    title: "Deal 1 – Solo Fiery Combo",
    kicker: "Save Rs 470 · Single Feast",
    description:
      "1 Signature burger or crispy twister wrap, hot peri peri fries, and a chilled drink. The ultimate solo lunch or dinner drop.",
    price: 1190,
    originalPrice: 1660,
    image: "/media/items/crispy-fiery-chicken-burger.jpg",
    hue: 18,
    glyph: "burger",
    kind: "solo",
    badge: "Top Seller",
    accent: "from-flame to-ember",
    contents: ["1 Smashed / Crispy Burger", "1 Regular Peri Peri Fries", "1 Chilled Drink 345ml"],
    terms: ["Dine-in, takeaway, and delivery", "Customise with cheese or upgrade drink"],
    slots: [
      {
        id: "burger",
        title: "Choose Burger / Main",
        required: true,
        choices: [
          { id: "crispy-fiery", name: "Crispy Fiery Chicken Burger", surcharge: 0 },
          { id: "blaze-signature", name: "Blaze Signature Smash", surcharge: 0 },
          { id: "crispy-twister", name: "Crispy Chicken Twister Wrap", surcharge: 0 },
          { id: "double-inferno", name: "Double Inferno Smash (+2 Patties)", surcharge: 160 },
          { id: "truffle-mushroom", name: "Truffle Mushroom Melt", surcharge: 140 },
        ],
      },
      {
        id: "side",
        title: "Choose Side",
        required: true,
        choices: [
          { id: "peri-fries", name: "Peri Peri Seasoned Fries", surcharge: 0 },
          { id: "house-slaw", name: "Crunchy House Slaw", surcharge: 0 },
          { id: "loaded-fries", name: "Upgrade to Blaze Loaded Fries", surcharge: 150 },
          { id: "onion-rings", name: "Upgrade to Crispy Onion Rings", surcharge: 80 },
        ],
      },
      {
        id: "drink",
        title: "Choose Drink",
        required: true,
        choices: [
          { id: "cola", name: "Classic Chilled Cola 345ml", surcharge: 0 },
          { id: "zero-cola", name: "Diet Zero Cola 345ml", surcharge: 0 },
          { id: "lemonade", name: "Fresh Mint Lemonade 400ml", surcharge: 80 },
          { id: "mango", name: "Mango Blast Crush", surcharge: 120 },
        ],
      },
    ],
  },

  /* ---------------- 2. Duo / Couple Deal ---------------- */
  {
    id: "deal-duo-smash-box",
    slug: "duo-smash-box",
    title: "Deal 2 – Duo Flame Box",
    kicker: "Save Rs 960 · For Two",
    description:
      "Two signature burgers of your choice, large crispy fries, two drinks, and a tub of signature fire sauce. Designed for date night or hungry duo.",
    price: 2150,
    originalPrice: 3110,
    image: "/media/items/double-inferno-smash.jpg",
    hue: 12,
    glyph: "burger",
    kind: "duo",
    badge: "Duo Favourite",
    accent: "from-ember to-flame",
    contents: ["2 Flame Burgers / Wraps", "1 Large Peri Peri Fries", "2 Soft Drinks", "1 Blaze Fire Dip"],
    terms: ["Any two burgers or wraps eligible", "Valid all branches, all days"],
    slots: [
      {
        id: "burger-1",
        title: "Choose Burger 1",
        required: true,
        choices: [
          { id: "blaze-signature", name: "Blaze Signature Smash", surcharge: 0 },
          { id: "crispy-fiery", name: "Crispy Fiery Chicken Burger", surcharge: 0 },
          { id: "peri-peri-grilled", name: "Peri Peri Grilled Burger", surcharge: 0 },
          { id: "double-inferno", name: "Double Inferno Smash", surcharge: 140 },
        ],
      },
      {
        id: "burger-2",
        title: "Choose Burger 2",
        required: true,
        choices: [
          { id: "blaze-signature", name: "Blaze Signature Smash", surcharge: 0 },
          { id: "crispy-fiery", name: "Crispy Fiery Chicken Burger", surcharge: 0 },
          { id: "crispy-twister", name: "Crispy Chicken Twister Wrap", surcharge: 0 },
          { id: "truffle-mushroom", name: "Truffle Mushroom Melt", surcharge: 140 },
        ],
      },
      {
        id: "side",
        title: "Choose Duo Side",
        required: true,
        choices: [
          { id: "large-peri-fries", name: "Large Peri Peri Fries", surcharge: 0 },
          { id: "loaded-fries", name: "Upgrade to Blaze Loaded Cheesy Fries", surcharge: 130 },
          { id: "jalapeno-bites", name: "Upgrade to Cheesy Jalapeño Bites (6pc)", surcharge: 150 },
        ],
      },
      {
        id: "drink-1",
        title: "Choose Drink 1",
        required: true,
        choices: [
          { id: "cola-1", name: "Classic Cola 345ml", surcharge: 0 },
          { id: "zero-cola-1", name: "Diet Zero Cola 345ml", surcharge: 0 },
          { id: "lemonade-1", name: "Mint Lemonade", surcharge: 80 },
        ],
      },
      {
        id: "drink-2",
        title: "Choose Drink 2",
        required: true,
        choices: [
          { id: "cola-2", name: "Classic Cola 345ml", surcharge: 0 },
          { id: "zero-cola-2", name: "Diet Zero Cola 345ml", surcharge: 0 },
          { id: "mango-2", name: "Mango Blast Crush", surcharge: 110 },
        ],
      },
      {
        id: "dip",
        title: "Choose Dip",
        required: true,
        choices: [
          { id: "fire-dip", name: "Blaze Secret Fire Dip", surcharge: 0 },
          { id: "garlic-aioli", name: "Roasted Garlic Aioli", surcharge: 0 },
          { id: "ranch", name: "Creamy Buttermilk Ranch", surcharge: 0 },
          { id: "cheddar-melt", name: "Warm Molten Cheddar Dip", surcharge: 40 },
        ],
      },
    ],
  },

  /* ---------------- 3. Family / Party Deal ---------------- */
  {
    id: "deal-family-party-feast",
    slug: "family-party-feast",
    title: "Deal 3 – Mega Family Party Feast",
    kicker: "Feeds 5–6 · Save Rs 1,480",
    description:
      "4 Burgers of choice, 8 hot sauced wings, 2 large fries, 3 signature dips, and a 1.5L sharing drink bottle. The whole crew satisfied.",
    price: 3650,
    originalPrice: 5130,
    image: "/media/items/blaze-family-feast.jpg",
    hue: 30,
    glyph: "bucket",
    kind: "family",
    badge: "Big Saver",
    accent: "from-ember to-gold",
    contents: ["4 Burgers / Wraps", "8 Inferno or BBQ Wings", "2 Large Fries", "3 Dips", "1.5L Chilled Drink"],
    terms: ["Available every day", "Free doorstep delivery included", "Feeds 4–6 persons"],
    slots: [
      {
        id: "burger-1",
        title: "Choose Burger 1",
        required: true,
        choices: [
          { id: "blaze-signature-1", name: "Blaze Signature Smash", surcharge: 0 },
          { id: "crispy-fiery-1", name: "Crispy Fiery Chicken Burger", surcharge: 0 },
        ],
      },
      {
        id: "burger-2",
        title: "Choose Burger 2",
        required: true,
        choices: [
          { id: "blaze-signature-2", name: "Blaze Signature Smash", surcharge: 0 },
          { id: "crispy-fiery-2", name: "Crispy Fiery Chicken Burger", surcharge: 0 },
        ],
      },
      {
        id: "burger-3",
        title: "Choose Burger 3",
        required: true,
        choices: [
          { id: "crispy-twister-3", name: "Crispy Chicken Twister Wrap", surcharge: 0 },
          { id: "peri-peri-grilled-3", name: "Peri Peri Grilled Burger", surcharge: 0 },
        ],
      },
      {
        id: "burger-4",
        title: "Choose Burger 4",
        required: true,
        choices: [
          { id: "crispy-twister-4", name: "Crispy Chicken Twister Wrap", surcharge: 0 },
          { id: "double-inferno-4", name: "Double Inferno Smash", surcharge: 120 },
          { id: "halloumi-veg-4", name: "Spiced Halloumi & Paneer (Veg)", surcharge: 0 },
        ],
      },
      {
        id: "wings",
        title: "Choose 8pc Wings Flavour",
        required: true,
        choices: [
          { id: "wings-inferno", name: "Inferno Hot Buffalo Wings", surcharge: 0 },
          { id: "wings-sriracha", name: "Honey Sriracha Glazed Wings", surcharge: 0 },
          { id: "wings-bbq", name: "Smoky Hickory BBQ Wings", surcharge: 0 },
        ],
      },
      {
        id: "sides-choice",
        title: "Sides Package",
        required: true,
        choices: [
          { id: "sides-regular", name: "2× Large Peri Peri Fries", surcharge: 0 },
          { id: "sides-upgrade-1", name: "1 Large Fries + 1 Blaze Loaded Fries", surcharge: 140 },
          { id: "sides-upgrade-all", name: "2× Blaze Loaded Cheesy Fries", surcharge: 260 },
        ],
      },
      {
        id: "drink",
        title: "1.5L Sharing Drink",
        required: true,
        choices: [
          { id: "cola-1500", name: "Classic Cola 1.5 Litre", surcharge: 0 },
          { id: "zero-1500", name: "Diet Zero Cola 1.5 Litre", surcharge: 0 },
          { id: "sprite-1500", name: "Lemon-Lime Soda 1.5 Litre", surcharge: 0 },
        ],
      },
    ],
  },

  /* ---------------- 4. Student Deal ---------------- */
  {
    id: "deal-student-saver-box",
    slug: "student-saver-box",
    title: "Deal 4 – Student Saver Box",
    kicker: "Valid Student ID · Save 35%",
    description:
      "Pocket-friendly power box crafted for students. Choice of crispy burger or twister, hot fries, and an ice-cold drink at unbeatable pricing.",
    price: 890,
    originalPrice: 1370,
    image: "/media/items/crispy-fiery-chicken-burger.jpg",
    hue: 210,
    glyph: "burger",
    kind: "student",
    badge: "Student Only",
    accent: "from-chill to-ember",
    contents: ["1 Burger or Twister Wrap", "1 Regular Fries", "1 Chilled Drink"],
    terms: [
      "Flash valid student card at delivery or pickup",
      "Available 7 days a week, 11 AM to 11 PM",
    ],
    slots: [
      {
        id: "main",
        title: "Choose Main Item",
        required: true,
        choices: [
          { id: "crispy-fiery", name: "Crispy Fiery Chicken Burger", surcharge: 0 },
          { id: "crispy-twister", name: "Crispy Chicken Twister Wrap", surcharge: 0 },
          { id: "blaze-signature", name: "Blaze Signature Smash", surcharge: 60 },
        ],
      },
      {
        id: "side",
        title: "Choose Side",
        required: true,
        choices: [
          { id: "peri-fries", name: "Peri Peri Seasoned Fries", surcharge: 0 },
          { id: "onion-rings", name: "Crispy Golden Onion Rings", surcharge: 60 },
        ],
      },
      {
        id: "drink",
        title: "Choose Drink",
        required: true,
        choices: [
          { id: "cola", name: "Classic Cola 345ml", surcharge: 0 },
          { id: "zero", name: "Zero Sugar Cola 345ml", surcharge: 0 },
          { id: "lemonade", name: "Mint Lemonade 400ml", surcharge: 60 },
        ],
      },
    ],
  },

  /* ---------------- 5. Midnight Deal ---------------- */
  {
    id: "deal-midnight-munch-box",
    slug: "midnight-munch-box",
    title: "Deal 5 – Midnight Munch Box",
    kicker: "Drops 12 AM — 4 AM · Save Rs 590",
    description:
      "Burger of choice, 4 fiery wings, peri peri fries, secret garlic dip, and an ice-cold drink. Built for post-midnight cravings.",
    price: 1290,
    originalPrice: 1880,
    image: "/media/items/midnight-munch-box.jpg",
    hue: 268,
    glyph: "bucket",
    kind: "midnight",
    badge: "12 AM – 4 AM",
    window: "00:00 — 04:00",
    accent: "from-indigo-600 to-ember",
    contents: ["1 Burger of Choice", "4 Fiery Wings", "1 Peri Peri Fries", "1 Dip", "1 Drink"],
    terms: ["Orderable between 12:00 AM and 4:00 AM only", "Subject to nightly kitchen availability"],
    slots: [
      {
        id: "burger",
        title: "Choose Midnight Burger",
        required: true,
        choices: [
          { id: "blaze-signature", name: "Blaze Signature Smash", surcharge: 0 },
          { id: "double-inferno", name: "Double Inferno Smash", surcharge: 90 },
          { id: "crispy-fiery", name: "Crispy Fiery Chicken Burger", surcharge: 0 },
        ],
      },
      {
        id: "wings",
        title: "Choose Wings Flavour",
        required: true,
        choices: [
          { id: "inferno-wings", name: "4pc Inferno Hot Wings", surcharge: 0 },
          { id: "sriracha-wings", name: "4pc Honey Sriracha Wings", surcharge: 0 },
          { id: "tenders", name: "3pc Crispy Chicken Tenders", surcharge: 0 },
        ],
      },
      {
        id: "dip",
        title: "Choose Dip",
        required: true,
        choices: [
          { id: "garlic-aioli", name: "Roasted Garlic Aioli", surcharge: 0 },
          { id: "fire-dip", name: "Blaze Secret Fire Dip", surcharge: 0 },
          { id: "molten-cheddar", name: "Warm Molten Cheddar Dip", surcharge: 40 },
        ],
      },
      {
        id: "drink",
        title: "Choose Chilled Drink",
        required: true,
        choices: [
          { id: "cola", name: "Classic Cola 345ml", surcharge: 0 },
          { id: "zero", name: "Zero Sugar Cola 345ml", surcharge: 0 },
          { id: "iced-coffee", name: "Blaze Cold Brew Iced Coffee", surcharge: 90 },
        ],
      },
    ],
  },

  /* ---------------- 6. Lunch Deal (time-limited) ---------------- */
  {
    id: "deal-lunch-rush-combo",
    slug: "power-lunch-rush",
    title: "Deal 6 – Power Lunch Rush",
    kicker: "12 PM — 4 PM Weekdays · Save Rs 420",
    description:
      "Quick, hot and high-energy lunch drop. Choice of juicy flame burger or toasted twister, hot fries, and a refreshing beverage.",
    price: 990,
    originalPrice: 1410,
    image: "/media/items/peri-peri-grilled-burger.jpg",
    hue: 45,
    glyph: "burger",
    kind: "lunch",
    badge: "12 PM – 4 PM",
    window: "12:00 — 16:00",
    accent: "from-amber-500 to-flame",
    contents: ["1 Burger or Toasted Wrap", "1 Regular Peri Peri Fries", "1 Chilled Drink"],
    terms: ["Monday to Friday, 12:00 PM to 4:00 PM", "Express prep guaranteed under 12 mins"],
    slots: [
      {
        id: "main",
        title: "Choose Lunch Main",
        required: true,
        choices: [
          { id: "peri-peri-grilled", name: "Peri Peri Grilled Burger", surcharge: 0 },
          { id: "crispy-twister", name: "Crispy Chicken Twister Wrap", surcharge: 0 },
          { id: "fajita-roll", name: "Flame-Grilled Fajita Roll", surcharge: 0 },
          { id: "blaze-signature", name: "Blaze Signature Smash", surcharge: 70 },
        ],
      },
      {
        id: "side",
        title: "Choose Lunch Side",
        required: true,
        choices: [
          { id: "peri-fries", name: "Peri Peri Fries", surcharge: 0 },
          { id: "house-slaw", name: "Crunchy House Slaw", surcharge: 0 },
          { id: "loaded-fries", name: "Blaze Loaded Cheesy Fries", surcharge: 140 },
        ],
      },
      {
        id: "drink",
        title: "Choose Beverage",
        required: true,
        choices: [
          { id: "cola", name: "Classic Cola 345ml", surcharge: 0 },
          { id: "lemonade", name: "Fresh Mint Lemonade 400ml", surcharge: 60 },
          { id: "zero", name: "Zero Sugar Cola 345ml", surcharge: 0 },
        ],
      },
    ],
  },

  /* ---------------- 7. Buy 1 Get 1 (BOGO) ---------------- */
  {
    id: "deal-bogo-smash-duo",
    slug: "bogo-smash-duo",
    title: "Deal 7 – BOGO Smash Duo",
    kicker: "Buy 1 Get 1 Free · Mon–Fri 3 PM+",
    description:
      "Order your favourite flame burger and get a second burger completely on the house, plus large fries. Every weekday afternoon drop.",
    price: 1350,
    originalPrice: 2500,
    image: "/media/items/blaze-signature-smash.jpg",
    hue: 15,
    glyph: "burger",
    kind: "bogo",
    badge: "Buy 1 Get 1",
    window: "15:00 — 23:59",
    accent: "from-fresh to-emerald-600",
    contents: ["1 Signature Smashed Burger", "1 Free Burger of Choice", "1 Large Fries"],
    terms: ["Valid Monday to Friday from 3 PM onwards", "Cheapest burger item is complimentary"],
    slots: [
      {
        id: "primary-burger",
        title: "Choose Primary Burger",
        required: true,
        choices: [
          { id: "blaze-signature", name: "Blaze Signature Smash", surcharge: 0 },
          { id: "double-inferno", name: "Double Inferno Smash", surcharge: 100 },
          { id: "truffle-mushroom", name: "Truffle Mushroom Melt", surcharge: 120 },
        ],
      },
      {
        id: "free-burger",
        title: "Choose Free Burger (On Us!)",
        required: true,
        choices: [
          { id: "free-signature", name: "Blaze Signature Smash (FREE)", surcharge: 0 },
          { id: "free-crispy", name: "Crispy Fiery Chicken Burger (FREE)", surcharge: 0 },
          { id: "free-masala", name: "Karachi Double Masala Burger (FREE)", surcharge: 0 },
        ],
      },
      {
        id: "side",
        title: "Choose Side",
        required: true,
        choices: [
          { id: "large-fries", name: "Large Peri Peri Fries", surcharge: 0 },
          { id: "loaded-fries", name: "Upgrade to Blaze Loaded Fries", surcharge: 150 },
          { id: "nuggets", name: "Upgrade to 6pc Chicken Nuggets", surcharge: 120 },
        ],
      },
    ],
  },
];

export const dealKindMeta: Record<DealKind, { label: string; tone: string }> = {
  solo: { label: "Solo Combo", tone: "bg-flame/15 text-ember-dark" },
  duo: { label: "Duo Feast", tone: "bg-ember/15 text-ember-dark" },
  family: { label: "Family / Party", tone: "bg-gold/25 text-amber-800" },
  student: { label: "Student Saver", tone: "bg-chill/15 text-sky-700" },
  midnight: { label: "Midnight Drop", tone: "bg-indigo-500/20 text-indigo-700" },
  lunch: { label: "Lunch Rush", tone: "bg-amber-500/20 text-amber-800" },
  bogo: { label: "Buy 1 Get 1", tone: "bg-fresh/20 text-green-800" },
  combo: { label: "Combo", tone: "bg-flame/15 text-ember-dark" },
};

export const getDeal = (slug: string) => deals.find((d) => d.slug === slug);

export type CategoryIcon =
  | "burger"
  | "flame"
  | "drumstick"
  | "bucket"
  | "fries"
  | "cup"
  | "dessert";

export type ItemTag =
  | "bestseller"
  | "new"
  | "spicy"
  | "veg"
  | "limited"
  | "chef"
  | "midnight";

export interface SizeVariant {
  label: string;
  delta: number;
  serves: string;
}

export interface AddOn {
  id: string;
  label: string;
  price: number;
}

export interface OptionChoice {
  id: string;
  label: string;
  delta: number;
}

export interface ItemOption {
  id: string;
  label: string;
  type: "single" | "multi";
  required?: boolean;
  choices: OptionChoice[];
}

export interface MenuItem {
  slug: string;
  name: string;
  blurb: string;
  story?: string;
  categoryId: string;
  price: number;
  compareAt?: number;
  /** Path under /public — if absent a generative flavour tile is rendered. */
  image?: string;
  /** Hue (deg) used to generate the flavour tile when no photo exists. */
  hue: number;
  glyph: string;
  tags: ItemTag[];
  spice: 0 | 1 | 2 | 3;
  calories: number;
  prepMinutes: number;
  rating: number;
  reviews: number;
  sizes?: SizeVariant[];
  addOns?: AddOn[];
  options?: ItemOption[];
  allergens: string[];
  /** e.g. "00:00" — enables KFC-style midnight drops. */
  availableFrom?: string;
  availableTo?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  blurb: string;
  icon: CategoryIcon;
  hue: number;
  /** Path under /public — photorealistic category image. */
  image?: string;
  /** Scale factor for the category image inside the circle.
   *  1 = original size, 0.7 = zoom out, 1.3 = zoom in.
   *  Defaults to 1 if omitted. */
  imageScale?: number;
}

/* ============================================================
   CATEGORIES
   ============================================================ */

export const categories: MenuCategory[] = [
  {
    id: "signature-burgers",
    name: "Signature Burgers",
    blurb: "Smashed on 400°C steel, seared over open flame",
    icon: "burger",
    hue: 18,
    image: "/categories/signature-burgers.png",
    imageScale: 3.75,
  },
  {
    id: "flame-grilled-chicken",
    name: "Flame-Grilled Chicken",
    blurb: "Marinated 24h, charred over live coals",
    icon: "flame",
    hue: 32,
    image: "/categories/flame-grilled-chicken.png",
  },
  {
    id: "wings-bites",
    name: "Wings & Bites",
    blurb: "Tossed in sauce, served blazing hot",
    icon: "drumstick",
    hue: 8,
    image: "/categories/wings-bites.png",
  },
  {
    id: "sharing-buckets",
    name: "Sharing Buckets",
    blurb: "Built for the table, priced for the crew",
    icon: "bucket",
    hue: 42,
    image: "/categories/sharing-buckets.png",
  },
  {
    id: "sides-fries",
    name: "Sides & Fries",
    blurb: "The supporting cast that steals the show",
    icon: "fries",
    hue: 46,
    image: "/categories/sides-fries.png",
  },
  {
    id: "beverages",
    name: "Beverages",
    blurb: "Ice-cold, poured tall",
    icon: "cup",
    hue: 200,
    image: "/categories/beverages.png",
  },
  {
    id: "desserts",
    name: "Desserts",
    blurb: "Finish molten, finish loud",
    icon: "dessert",
    hue: 340,
    image: "/categories/desserts.png",
  },
];

/* ============================================================
   SHARED OPTION SETS
   ============================================================ */

const fryChoice: ItemOption = {
  id: "side",
  label: "Choose your side",
  type: "single",
  required: true,
  choices: [
    { id: "fries", label: "Peri Peri Fries", delta: 0 },
    { id: "slaw", label: "House Slaw", delta: 0 },
    { id: "loaded", label: "Blaze Loaded Fries", delta: 180 },
    { id: "rings", label: "Crispy Onion Rings", delta: 120 },
    { id: "salad", label: "Garden Salad", delta: 0 },
  ],
};

const drinkChoice: ItemOption = {
  id: "drink",
  label: "Add a drink",
  type: "single",
  choices: [
    { id: "none", label: "No drink", delta: 0 },
    { id: "cola", label: "Classic Cola 345ml", delta: 180 },
    { id: "mango", label: "Mango Blast 400ml", delta: 320 },
    { id: "lemonade", label: "Mint Lemonade 400ml", delta: 290 },
  ],
};

const spiceLevel: ItemOption = {
  id: "heat",
  label: "Heat level",
  type: "single",
  required: true,
  choices: [
    { id: "mild", label: "Mild — a whisper", delta: 0 },
    { id: "medium", label: "Medium — proper kick", delta: 0 },
    { id: "hot", label: "Hot — bring water", delta: 0 },
    { id: "inferno", label: "Inferno — no refunds", delta: 40 },
  ],
};

const commonAddOns: AddOn[] = [
  { id: "cheese", label: "Extra aged cheddar", price: 120 },
  { id: "bacon", label: "Smoked beef bacon", price: 190 },
  { id: "patty", label: "Extra smashed patty", price: 320 },
  { id: "jalapeno", label: "Pickled jalapeños", price: 70 },
  { id: "sauce", label: "Blaze secret sauce", price: 60 },
];

const wingAddOns: AddOn[] = [
  { id: "ranch", label: "Creamy ranch dip", price: 90 },
  { id: "garlic", label: "Garlic aioli dip", price: 90 },
  { id: "bbq", label: "Smoky BBQ dip", price: 90 },
  { id: "extra", label: "4 extra wings", price: 430 },
];

/* ============================================================
   ITEMS
   ============================================================ */

export const menuItems: MenuItem[] = [
  /* ---------------- Signature Burgers ---------------- */
  {
    slug: "blaze-signature-smash",
    name: "Blaze Signature Smash",
    blurb:
      "Double smashed patty, aged cheddar, caramelised onion, house pickles, Blaze secret sauce.",
    story:
      "The one that started it all. Two 100g patties smashed hard onto 400°C steel for that lacy, crackling crust, then finished over open flame so the fat renders into smoke.",
    categoryId: "signature-burgers",
    price: 1150,
    compareAt: 1320,
    image: "/media/items/blaze-signature-smash.jpg",
    hue: 18,
    glyph: "burger",
    tags: ["bestseller", "chef"],
    spice: 1,
    calories: 880,
    prepMinutes: 14,
    rating: 4.9,
    reviews: 2418,
    sizes: [
      { label: "Single", delta: 0, serves: "1 hungry human" },
      { label: "Double", delta: 340, serves: "1 very hungry human" },
      { label: "Triple", delta: 680, serves: "Share it. Or don't." },
    ],
    options: [fryChoice, drinkChoice],
    addOns: commonAddOns,
    allergens: ["Gluten", "Dairy", "Egg", "Sesame"],
  },
  {
    slug: "double-inferno-smash",
    name: "Double Inferno Smash",
    blurb:
      "Triple stack, molten pepper jack, bacon, fried onion strings, inferno hot sauce.",
    story:
      "Our hottest build. Three patties, three slices of pepper jack, and a hot sauce we make in-house from ghost pepper and smoked paprika. We're not responsible for what happens next.",
    categoryId: "signature-burgers",
    price: 1490,
    image: "/media/items/double-inferno-smash.jpg",
    hue: 6,
    glyph: "burger",
    tags: ["bestseller", "spicy"],
    spice: 3,
    calories: 1240,
    prepMinutes: 16,
    rating: 4.8,
    reviews: 1602,
    sizes: [
      { label: "Double", delta: 0, serves: "Bragging rights" },
      { label: "Triple", delta: 320, serves: "Regret, eventually" },
    ],
    options: [spiceLevel, fryChoice, drinkChoice],
    addOns: commonAddOns,
    allergens: ["Gluten", "Dairy", "Egg", "Sesame"],
  },
  {
    slug: "peri-peri-grilled-burger",
    name: "Peri Peri Grilled Burger",
    blurb:
      "Char-grilled peri peri fillet, garlic mayo, lettuce, tomato, red onion, lime.",
    story:
      "Marinated a full 24 hours in our peri peri blend — African bird's eye chilli, lemon, garlic, smoked paprika — then charred over live coals until the edges blacken.",
    categoryId: "signature-burgers",
    price: 1050,
    image: "/media/items/peri-peri-grilled-burger.jpg",
    hue: 26,
    glyph: "burger",
    tags: ["chef"],
    spice: 2,
    calories: 720,
    prepMinutes: 15,
    rating: 4.7,
    reviews: 1189,
    options: [spiceLevel, fryChoice, drinkChoice],
    addOns: commonAddOns,
    allergens: ["Gluten", "Egg", "Sesame"],
  },
  {
    slug: "crispy-fiery-chicken-burger",
    name: "Crispy Fiery Chicken Burger",
    blurb:
      "Double-crusted buttermilk fillet, spicy slaw, pickles, fiery mayo, brioche.",
    story:
      "Buttermilk brine for 12 hours, then dredged twice for a crust that shatters. The spicy slaw is there to cool you down. It only half works.",
    categoryId: "signature-burgers",
    price: 990,
    compareAt: 1150,
    image: "/media/items/crispy-fiery-chicken-burger.jpg",
    hue: 34,
    glyph: "burger",
    tags: ["bestseller"],
    spice: 2,
    calories: 810,
    prepMinutes: 14,
    rating: 4.8,
    reviews: 1932,
    options: [spiceLevel, fryChoice, drinkChoice],
    addOns: commonAddOns,
    allergens: ["Gluten", "Dairy", "Egg", "Sesame"],
  },
  {
    slug: "truffle-mushroom-melt",
    name: "Truffle Mushroom Melt",
    blurb:
      "Charred portobello, grilled halloumi, gruyère, truffle aioli, wild rocket.",
    story:
      "Built for the vegetarians who were tired of being handed a sad veggie patty. Charred portobello has more umami than beef, and we'll die on that hill.",
    categoryId: "signature-burgers",
    price: 1250,
    hue: 96,
    glyph: "burger",
    tags: ["veg", "chef"],
    spice: 0,
    calories: 690,
    prepMinutes: 15,
    rating: 4.7,
    reviews: 746,
    options: [fryChoice, drinkChoice],
    addOns: [
      { id: "halloumi", label: "Extra grilled halloumi", price: 260 },
      { id: "truffle", label: "Extra truffle aioli", price: 110 },
      { id: "avocado", label: "Smashed avocado", price: 180 },
    ],
    allergens: ["Gluten", "Dairy", "Egg", "Sesame"],
  },
  {
    slug: "karachi-double-masala",
    name: "Karachi Double Masala",
    blurb:
      "Masala-spiced smash patty, green chutney, fried onion, achari mayo, sesame bun.",
    story:
      "A love letter to Bundha Road. We grind green chilli, coriander and chaat masala straight into the beef before it hits the steel.",
    categoryId: "signature-burgers",
    price: 1090,
    hue: 40,
    glyph: "burger",
    tags: ["new", "chef"],
    spice: 2,
    calories: 850,
    prepMinutes: 15,
    rating: 4.6,
    reviews: 388,
    options: [spiceLevel, fryChoice, drinkChoice],
    addOns: commonAddOns,
    allergens: ["Gluten", "Dairy", "Egg", "Sesame"],
  },

  /* ---------------- Flame-Grilled Chicken ---------------- */
  {
    slug: "blaze-peri-peri-quarter",
    name: "Blaze Peri Peri Quarter",
    blurb: "Quarter chicken, 24h peri peri marinade, charred over coals.",
    story:
      "Brined, marinated, then grilled over charcoal until the skin blisters. Basted three times with the marinade while it cooks.",
    categoryId: "flame-grilled-chicken",
    price: 890,
    image: "/media/items/blaze-peri-peri-quarter.jpg",
    hue: 28,
    glyph: "chicken",
    tags: ["bestseller"],
    spice: 2,
    calories: 640,
    prepMinutes: 22,
    rating: 4.8,
    reviews: 1511,
    sizes: [
      { label: "Quarter", delta: 0, serves: "1 person" },
      { label: "Half", delta: 460, serves: "2 people" },
      { label: "Full", delta: 1050, serves: "3–4 people" },
    ],
    options: [spiceLevel, fryChoice, drinkChoice],
    addOns: wingAddOns,
    allergens: ["Dairy"],
  },
  {
    slug: "flame-grilled-half-chicken",
    name: "Flame-Grilled Half Chicken",
    blurb: "Half bird, smoky char, two sides, garlic aioli, house pickles.",
    story:
      "Slow-grilled for 28 minutes so the smoke gets all the way to the bone. Comes with two sides because one is never enough.",
    categoryId: "flame-grilled-chicken",
    price: 1350,
    hue: 20,
    glyph: "chicken",
    tags: ["chef"],
    spice: 1,
    calories: 980,
    prepMinutes: 28,
    rating: 4.7,
    reviews: 902,
    options: [spiceLevel, fryChoice, drinkChoice],
    addOns: wingAddOns,
    allergens: ["Dairy"],
  },
  {
    slug: "charcoal-tikka-platter",
    name: "Charcoal Tikka Platter",
    blurb: "Six tikka skewers, naan, mint chutney, charred onion, lemon.",
    story:
      "Tikka done the way a proper BBQ night does it — bone-in, heavily charred, finished with a squeeze of lemon and a dusting of chaat masala.",
    categoryId: "flame-grilled-chicken",
    price: 1450,
    hue: 14,
    glyph: "chicken",
    tags: ["chef", "spicy"],
    spice: 2,
    calories: 1120,
    prepMinutes: 26,
    rating: 4.9,
    reviews: 654,
    options: [spiceLevel],
    addOns: wingAddOns,
    allergens: ["Dairy", "Gluten"],
  },
  {
    slug: "chicken-and-chips",
    name: "Chicken & Chips",
    blurb: "Four flame-grilled pieces, big basket of peri peri fries, two dips.",
    story: "The honest, uncomplicated classic. Grilled chicken, proper chips, two dips, zero fuss.",
    categoryId: "flame-grilled-chicken",
    price: 1150,
    compareAt: 1290,
    hue: 36,
    glyph: "chicken",
    tags: [],
    spice: 1,
    calories: 1010,
    prepMinutes: 20,
    rating: 4.6,
    reviews: 1087,
    options: [spiceLevel, drinkChoice],
    addOns: wingAddOns,
    allergens: ["Dairy", "Gluten"],
  },

  /* ---------------- Wings & Bites ---------------- */
  {
    slug: "inferno-hot-wings",
    name: "Inferno Hot Wings",
    blurb: "8 wings, ghost pepper glaze, toasted sesame, cooling ranch on the side.",
    story:
      "Tossed to order in a glaze built from ghost pepper, smoked paprika and honey. The honey is a trap — it makes you go faster.",
    categoryId: "wings-bites",
    price: 950,
    image: "/media/items/inferno-hot-wings.jpg",
    hue: 4,
    glyph: "wing",
    tags: ["bestseller", "spicy"],
    spice: 3,
    calories: 720,
    prepMinutes: 18,
    rating: 4.8,
    reviews: 1733,
    sizes: [
      { label: "8 pieces", delta: 0, serves: "1–2 people" },
      { label: "16 pieces", delta: 880, serves: "3–4 people" },
      { label: "24 pieces", delta: 1690, serves: "A party" },
    ],
    options: [spiceLevel],
    addOns: wingAddOns,
    allergens: ["Gluten", "Dairy", "Sesame"],
  },
  {
    slug: "honey-sriracha-wings",
    name: "Honey Sriracha Wings",
    blurb: "8 wings, sticky honey sriracha glaze, spring onion, toasted sesame.",
    story:
      "The sweet-heat option. Sticky, glossy, and completely impossible to eat politely. We include extra napkins as a courtesy.",
    categoryId: "wings-bites",
    price: 990,
    hue: 12,
    glyph: "wing",
    tags: [],
    spice: 1,
    calories: 690,
    prepMinutes: 18,
    rating: 4.7,
    reviews: 812,
    sizes: [
      { label: "8 pieces", delta: 0, serves: "1–2 people" },
      { label: "16 pieces", delta: 900, serves: "3–4 people" },
    ],
    options: [spiceLevel],
    addOns: wingAddOns,
    allergens: ["Gluten", "Sesame", "Soy"],
  },
  {
    slug: "crispy-chicken-tenders",
    name: "Crispy Chicken Tenders",
    blurb: "5 buttermilk tenders, double-crusted, your choice of two dips.",
    story:
      "All-white meat, brined in buttermilk overnight, hand-dredged. The craggy bits are the whole point.",
    categoryId: "wings-bites",
    price: 850,
    hue: 38,
    glyph: "wing",
    tags: [],
    spice: 0,
    calories: 610,
    prepMinutes: 15,
    rating: 4.6,
    reviews: 967,
    sizes: [
      { label: "5 pieces", delta: 0, serves: "1 person" },
      { label: "10 pieces", delta: 720, serves: "2–3 people" },
    ],
    addOns: wingAddOns,
    allergens: ["Gluten", "Dairy", "Egg"],
  },
  {
    slug: "loaded-nacho-bites",
    name: "Loaded Nacho Bites",
    blurb: "Tortilla bites, molten cheese, jalapeño, salsa, sour cream, lime.",
    story: "Built to be demolished in the first four minutes. Structural integrity not guaranteed.",
    categoryId: "wings-bites",
    price: 780,
    hue: 44,
    glyph: "wing",
    tags: ["veg"],
    spice: 1,
    calories: 640,
    prepMinutes: 12,
    rating: 4.5,
    reviews: 523,
    addOns: [
      { id: "beef", label: "Seasoned minced beef", price: 210 },
      { id: "guac", label: "Fresh guacamole", price: 170 },
      { id: "cheese", label: "Extra molten cheese", price: 130 },
    ],
    allergens: ["Dairy", "Gluten"],
  },

  /* ---------------- Sharing Buckets ---------------- */
  {
    slug: "blaze-family-feast",
    name: "The Blaze Family Feast",
    blurb: "4 burgers, 12 wings, 2 large fries, 4 dips, 1.5L drink. Feeds 4–5.",
    story:
      "The full spread. Built for Eid nights, match nights, and the nights when nobody feels like cooking.",
    categoryId: "sharing-buckets",
    price: 3450,
    compareAt: 4320,
    image: "/media/items/blaze-family-feast.jpg",
    hue: 24,
    glyph: "bucket",
    tags: ["bestseller"],
    spice: 1,
    calories: 4200,
    prepMinutes: 30,
    rating: 4.9,
    reviews: 1284,
    options: [spiceLevel, drinkChoice],
    addOns: wingAddOns,
    allergens: ["Gluten", "Dairy", "Egg", "Sesame"],
  },
  {
    slug: "wing-storm-bucket",
    name: "Wing Storm Bucket",
    blurb: "16 wings, two glazes, loaded fries, 3 dips. Feeds 3–4.",
    story: "Sixteen wings in a bucket, half inferno, half honey sriracha. Pick a side — we can't help you further.",
    categoryId: "sharing-buckets",
    price: 2150,
    compareAt: 2560,
    hue: 8,
    glyph: "bucket",
    tags: ["spicy"],
    spice: 2,
    calories: 2860,
    prepMinutes: 26,
    rating: 4.8,
    reviews: 743,
    options: [spiceLevel],
    addOns: wingAddOns,
    allergens: ["Gluten", "Dairy", "Sesame"],
  },
  {
    slug: "double-date-box",
    name: "Double Date Box",
    blurb: "2 burgers, 6 wings, 2 fries, 2 dips, 2 drinks. Feeds 2.",
    story: "Two burgers, two fries, two drinks, and enough wings that nobody has to share if they don't want to.",
    categoryId: "sharing-buckets",
    price: 2250,
    compareAt: 2680,
    hue: 350,
    glyph: "bucket",
    tags: [],
    spice: 1,
    calories: 2380,
    prepMinutes: 22,
    rating: 4.7,
    reviews: 611,
    options: [drinkChoice],
    addOns: commonAddOns,
    allergens: ["Gluten", "Dairy", "Egg", "Sesame"],
  },
  {
    slug: "midnight-munch-box",
    name: "Midnight Munch Box",
    blurb: "1 burger, 4 wings, fries, dip, drink. Only after midnight.",
    story:
      "Dropped at 12:00 AM sharp and gone by 4. Built for the 2 AM hunger that no amount of willpower defeats.",
    categoryId: "sharing-buckets",
    price: 1250,
    compareAt: 1620,
    hue: 260,
    glyph: "bucket",
    tags: ["midnight", "limited"],
    spice: 2,
    calories: 1390,
    prepMinutes: 16,
    rating: 4.8,
    reviews: 429,
    availableFrom: "00:00",
    availableTo: "04:00",
    options: [drinkChoice],
    addOns: commonAddOns,
    allergens: ["Gluten", "Dairy", "Egg", "Sesame"],
  },

  /* ---------------- Sides & Fries ---------------- */
  {
    slug: "blaze-loaded-fries",
    name: "Blaze Loaded Fries",
    blurb: "Skin-on fries, molten cheese, beef bacon, jalapeño, secret sauce.",
    story: "The dish that has ruined plain fries for an entire generation of Karachi.",
    categoryId: "sides-fries",
    price: 650,
    image: "/media/items/blaze-loaded-fries.jpg",
    hue: 30,
    glyph: "fries",
    tags: ["bestseller"],
    spice: 1,
    calories: 780,
    prepMinutes: 10,
    rating: 4.9,
    reviews: 2011,
    sizes: [
      { label: "Regular", delta: 0, serves: "1 person" },
      { label: "Large", delta: 260, serves: "2–3 people" },
    ],
    addOns: [
      { id: "cheese", label: "Extra molten cheese", price: 130 },
      { id: "bacon", label: "Extra beef bacon", price: 190 },
      { id: "chicken", label: "Grilled chicken topping", price: 280 },
    ],
    allergens: ["Dairy"],
  },
  {
    slug: "peri-peri-fries",
    name: "Peri Peri Fries",
    blurb: "Skin-on fries tossed in peri peri dust, sea salt, parsley.",
    story: "Dusted the second they leave the fryer so the spice actually sticks.",
    categoryId: "sides-fries",
    price: 450,
    hue: 34,
    glyph: "fries",
    tags: ["veg"],
    spice: 1,
    calories: 420,
    prepMinutes: 8,
    rating: 4.6,
    reviews: 1388,
    sizes: [
      { label: "Regular", delta: 0, serves: "1 person" },
      { label: "Large", delta: 220, serves: "2–3 people" },
    ],
    allergens: [],
  },
  {
    slug: "cheesy-jalapeno-bites",
    name: "Cheesy Jalapeño Bites",
    blurb: "6 crisp bites, molten cheese centre, pickled jalapeño, ranch dip.",
    story: "The molten centre is a genuine hazard. We're legally fine, you're emotionally not.",
    categoryId: "sides-fries",
    price: 620,
    hue: 40,
    glyph: "fries",
    tags: ["veg"],
    spice: 1,
    calories: 520,
    prepMinutes: 10,
    rating: 4.7,
    reviews: 874,
    allergens: ["Gluten", "Dairy", "Egg"],
  },
  {
    slug: "crispy-onion-rings",
    name: "Crispy Onion Rings",
    blurb: "Thick-cut onion, beer batter, smoked paprika salt, garlic aioli.",
    story: "Thick cut, never the sad thin ones. Beer batter keeps them shattering-crisp.",
    categoryId: "sides-fries",
    price: 420,
    hue: 42,
    glyph: "fries",
    tags: ["veg"],
    spice: 0,
    calories: 380,
    prepMinutes: 9,
    rating: 4.5,
    reviews: 692,
    allergens: ["Gluten", "Egg"],
  },
  {
    slug: "house-slaw",
    name: "House Slaw",
    blurb: "Cabbage, carrot, spring onion, cider dressing, toasted seeds.",
    story: "The palate cleanser. Sharp, crunchy, and the only thing standing between you and the inferno sauce.",
    categoryId: "sides-fries",
    price: 320,
    hue: 120,
    glyph: "fries",
    tags: ["veg"],
    spice: 0,
    calories: 180,
    prepMinutes: 5,
    rating: 4.4,
    reviews: 341,
    allergens: ["Egg"],
  },

  /* ---------------- Beverages ---------------- */
  {
    slug: "classic-cola",
    name: "Classic Cola",
    blurb: "Ice-cold, 345ml can or 1.5L bottle, poured over ice.",
    story: "The correct answer to a spicy burger.",
    categoryId: "beverages",
    price: 220,
    hue: 200,
    glyph: "drink",
    tags: ["veg"],
    spice: 0,
    calories: 140,
    prepMinutes: 2,
    rating: 4.5,
    reviews: 1122,
    sizes: [
      { label: "345ml can", delta: 0, serves: "1 person" },
      { label: "1.5L bottle", delta: 220, serves: "3–4 people" },
    ],
    allergens: [],
  },
  {
    slug: "mango-blast",
    name: "Mango Blast",
    blurb: "Alphonso mango pulp, crushed ice, lime, mint. 400ml.",
    story: "Sindhri in peak season, Alphonso the rest of the year. Blended thick, served frosty.",
    categoryId: "beverages",
    price: 380,
    image: "/media/items/mango-blast.jpg",
    hue: 38,
    glyph: "drink",
    tags: ["bestseller", "veg"],
    spice: 0,
    calories: 210,
    prepMinutes: 4,
    rating: 4.8,
    reviews: 1403,
    allergens: ["Dairy"],
  },
  {
    slug: "mint-lemonade",
    name: "Mint Lemonade",
    blurb: "Hand-squeezed lemon, fresh mint, cane sugar, soda. 400ml.",
    story: "Squeezed to order, never from concentrate. The mint gets slapped first, obviously.",
    categoryId: "beverages",
    price: 340,
    hue: 96,
    glyph: "drink",
    tags: ["veg"],
    spice: 0,
    calories: 160,
    prepMinutes: 4,
    rating: 4.7,
    reviews: 758,
    allergens: [],
  },
  {
    slug: "blaze-iced-coffee",
    name: "Blaze Iced Coffee",
    blurb: "Cold brew, vanilla cream, smoked sea salt foam. 400ml.",
    story: "18-hour cold brew, vanilla cream, and a smoked salt foam that shouldn't work but absolutely does.",
    categoryId: "beverages",
    price: 520,
    hue: 24,
    glyph: "drink",
    tags: ["new", "veg"],
    spice: 0,
    calories: 190,
    prepMinutes: 5,
    rating: 4.6,
    reviews: 289,
    allergens: ["Dairy"],
  },

  /* ---------------- Desserts ---------------- */
  {
    slug: "molten-lava-cake",
    name: "Molten Lava Cake",
    blurb: "Warm chocolate fondant, liquid centre, vanilla bean ice cream.",
    story: "Six minutes in the oven, thirty seconds to the table, and one molten centre that waits for nobody.",
    categoryId: "desserts",
    price: 590,
    image: "/media/items/molten-lava-cake.jpg",
    hue: 350,
    glyph: "dessert",
    tags: ["bestseller"],
    spice: 0,
    calories: 620,
    prepMinutes: 8,
    rating: 4.9,
    reviews: 1642,
    addOns: [
      { id: "icecream", label: "Extra vanilla bean scoop", price: 140 },
      { id: "caramel", label: "Salted caramel drizzle", price: 80 },
    ],
    allergens: ["Gluten", "Dairy", "Egg"],
  },
  {
    slug: "churro-bites",
    name: "Churro Bites",
    blurb: "Cinnamon-sugar churros, dark chocolate dip, dulce de leche.",
    story: "Fried to order and rolled in cinnamon sugar while still too hot to touch.",
    categoryId: "desserts",
    price: 480,
    hue: 26,
    glyph: "dessert",
    tags: ["veg"],
    spice: 0,
    calories: 540,
    prepMinutes: 9,
    rating: 4.7,
    reviews: 806,
    allergens: ["Gluten", "Dairy", "Egg"],
  },
  {
    slug: "blaze-brownie-sundae",
    name: "Blaze Brownie Sundae",
    blurb: "Fudgy brownie, two scoops, hot fudge, roasted pistachio.",
    story: "Brownie warmed, ice cream cold, fudge hot. The temperature fight is the entire appeal.",
    categoryId: "desserts",
    price: 560,
    hue: 340,
    glyph: "dessert",
    tags: [],
    spice: 0,
    calories: 700,
    prepMinutes: 6,
    rating: 4.8,
    reviews: 934,
    allergens: ["Gluten", "Dairy", "Egg", "Nuts"],
  },
];

/* ============================================================
   HELPERS
   ============================================================ */

export const getCategory = (id: string) =>
  categories.find((c) => c.id === id);

export const getItem = (slug: string) =>
  menuItems.find((i) => i.slug === slug);

export const itemsByCategory = (id: string) =>
  menuItems.filter((i) => i.categoryId === id);

export const bestSellers = menuItems
  .filter((i) => i.tags.includes("bestseller"))
  .slice(0, 8);

export const newArrivals = menuItems.filter((i) => i.tags.includes("new"));

export const midnightDrops = menuItems.filter((i) =>
  i.tags.includes("midnight"),
);

/** Highest and lowest prices, used by the POS dashboard. */
export const priceRange = menuItems.reduce(
  (acc, i) => ({
    min: Math.min(acc.min, i.price),
    max: Math.max(acc.max, i.price),
  }),
  { min: Infinity, max: 0 },
);

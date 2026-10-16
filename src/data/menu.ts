import { deals, type Deal, type DealSlot } from "./deals";

export type CategoryIcon =
  | "burger"
  | "flame"
  | "drumstick"
  | "bucket"
  | "fries"
  | "cup"
  | "dessert"
  | "wrap"
  | "sauce"
  | "addon";

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
  subCategory?: "beef" | "chicken" | "veg";
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
  isDeal?: boolean;
  dealContents?: string[];
  dealSlots?: DealSlot[];
}

export interface MenuCategory {
  id: string;
  name: string;
  blurb: string;
  icon: CategoryIcon;
  hue: number;
  /** Path under /public — photorealistic category image. */
  image?: string;
  /** Scale factor for the category image inside the circle. */
  imageScale?: number;
  badge?: string;
  isVirtual?: boolean;
}

/* ============================================================
   CATEGORIES — EXACT POPULARITY & UP-SELL ORDER (1 to 10)
   ============================================================ */

export const categories: MenuCategory[] = [
  {
    id: "deals",
    name: "Deals / Offers",
    blurb: "Signature combo bundles, midnight drops & party feasts",
    icon: "bucket",
    hue: 15,
    image: "/categories/sharing-buckets.png",
    badge: "Main Savings",
  },
  {
    id: "best-sellers",
    name: "Best Sellers / Trending",
    blurb: "Crowd favourites ordered again and again across the city",
    icon: "flame",
    hue: 24,
    image: "/categories/signature-burgers.png",
    badge: "Trending",
    isVirtual: true,
  },
  {
    id: "burgers",
    name: "Burgers",
    blurb: "Smashed on 400°C steel, seared over open flame",
    icon: "burger",
    hue: 18,
    image: "/categories/signature-burgers.png",
    imageScale: 3.75,
  },
  {
    id: "chicken",
    name: "Chicken",
    blurb: "Crispy fried, fiery wings, crunchy tenders & sharing buckets",
    icon: "drumstick",
    hue: 32,
    image: "/categories/flame-grilled-chicken.png",
  },
  {
    id: "wraps",
    name: "Wraps / Rolls / Twisters",
    blurb: "Toasted tortilla, charred fillings & house garlic mayo",
    icon: "wrap",
    hue: 38,
    image: "/categories/wings-bites.png",
  },
  {
    id: "sides",
    name: "Sides",
    blurb: "Peri peri fries, loaded cheese, golden nuggets & fresh slaw",
    icon: "fries",
    hue: 46,
    image: "/categories/sides-fries.png",
  },
  {
    id: "sauces",
    name: "Sauces & Dips",
    blurb: "House-crafted dips to dunk, drizzle, and drench",
    icon: "sauce",
    hue: 8,
    image: "/categories/sides-fries.png",
  },
  {
    id: "desserts",
    name: "Desserts",
    blurb: "Finish molten, finish sweet, finish loud",
    icon: "dessert",
    hue: 340,
    image: "/categories/desserts.png",
  },
  {
    id: "beverages",
    name: "Beverages",
    blurb: "Ice-cold sodas, fresh lemonades & thick shakes",
    icon: "cup",
    hue: 200,
    image: "/categories/beverages.png",
  },
  {
    id: "addons",
    name: "Add-ons / Extras",
    blurb: "Extra patties, smoked beef bacon, double cheddar & jalapeños",
    icon: "addon",
    hue: 28,
    image: "/categories/signature-burgers.png",
  },
];

/* ============================================================
   SHARED OPTION SETS & ADD-ONS
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

const commonAddOns: AddOn[] = [
  { id: "cheese", label: "Extra aged cheddar", price: 120 },
  { id: "bacon", label: "Smoked beef bacon", price: 190 },
  { id: "patty", label: "Extra smashed patty", price: 320 },
  { id: "jalapeno", label: "Pickled jalapeños", price: 70 },
  { id: "sauce", label: "Blaze secret sauce", price: 60 },
];

/* ============================================================
   REGULAR MENU ITEMS (Approx 38-40 total items)
   ============================================================ */

export const regularMenuItems: MenuItem[] = [
  /* ---------------- 3. Burgers (8 items: 4 Beef, 3 Chicken, 1 Veg) ---------------- */
  {
    slug: "blaze-signature-smash",
    name: "Blaze Signature Smash",
    blurb: "Double smashed patty, aged cheddar, caramelised onion, house pickles, Blaze secret sauce.",
    story: "Two 100g beef patties smashed hard onto 400°C steel for that crackling crust, then finished over open flame.",
    categoryId: "burgers",
    subCategory: "beef",
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
      { label: "Triple", delta: 680, serves: "Big appetite" },
    ],
    options: [fryChoice, drinkChoice],
    addOns: commonAddOns,
    allergens: ["Gluten", "Dairy", "Egg", "Sesame"],
  },
  {
    slug: "double-inferno-smash",
    name: "Double Inferno Smash",
    blurb: "Triple stack, molten pepper jack, beef bacon, fried onion strings, inferno hot sauce.",
    story: "Three beef patties, three slices of pepper jack, and a hot sauce made in-house from smoked ghost peppers.",
    categoryId: "burgers",
    subCategory: "beef",
    price: 1480,
    compareAt: 1690,
    image: "/media/items/double-inferno-smash.jpg",
    hue: 10,
    glyph: "flame",
    tags: ["spicy", "bestseller"],
    spice: 3,
    calories: 1140,
    prepMinutes: 16,
    rating: 4.8,
    reviews: 1840,
    options: [fryChoice, drinkChoice],
    addOns: commonAddOns,
    allergens: ["Gluten", "Dairy", "Egg"],
  },
  {
    slug: "truffle-mushroom-melt",
    name: "Truffle Mushroom Melt",
    blurb: "Double smash patty, butter-sautéed portobellos, Swiss gruyère, black truffle mayo.",
    story: "Earth meets flame. Rich buttery portobellos with earthy black truffle aioli over smashed beef.",
    categoryId: "burgers",
    subCategory: "beef",
    price: 1380,
    image: "/media/items/truffle-mushroom-melt.jpg",
    hue: 28,
    glyph: "burger",
    tags: ["chef"],
    spice: 0,
    calories: 920,
    prepMinutes: 15,
    rating: 4.7,
    reviews: 890,
    options: [fryChoice, drinkChoice],
    addOns: commonAddOns,
    allergens: ["Gluten", "Dairy", "Egg"],
  },
  {
    slug: "karachi-double-masala",
    name: "Karachi Double Masala",
    blurb: "Two smash patties dusted with roasted cumin and crushed coriander, mint raita, onion rings.",
    story: "A Karachi street burger reimagined with prime beef and local crushed spice aromatics.",
    categoryId: "burgers",
    subCategory: "beef",
    price: 1190,
    image: "/media/items/karachi-double-masala.jpg",
    hue: 15,
    glyph: "burger",
    tags: ["spicy", "new"],
    spice: 2,
    calories: 890,
    prepMinutes: 13,
    rating: 4.7,
    reviews: 620,
    options: [fryChoice, drinkChoice],
    addOns: commonAddOns,
    allergens: ["Gluten", "Dairy", "Sesame"],
  },
  {
    slug: "crispy-fiery-chicken-burger",
    name: "Crispy Fiery Chicken Burger",
    blurb: "Buttermilk fried thigh, double-dipped in fire oil, spicy slaw, dill pickles on brioche.",
    story: "24h buttermilk marinated whole chicken thigh coated in spiced potato starch and fried to golden shatter.",
    categoryId: "burgers",
    subCategory: "chicken",
    price: 990,
    compareAt: 1180,
    image: "/media/items/crispy-fiery-chicken-burger.jpg",
    hue: 24,
    glyph: "burger",
    tags: ["bestseller", "spicy"],
    spice: 2,
    calories: 780,
    prepMinutes: 12,
    rating: 4.9,
    reviews: 2120,
    options: [fryChoice, drinkChoice],
    addOns: commonAddOns,
    allergens: ["Gluten", "Dairy", "Egg"],
  },
  {
    slug: "peri-peri-grilled-burger",
    name: "Peri Peri Grilled Burger",
    blurb: "Flame-grilled boneless chicken breast in 24h peri marinade, lime aioli, crisp iceberg.",
    story: "Charred over red-hot coals, brushed with birds-eye chilli butter for clean, smoky citrus heat.",
    categoryId: "burgers",
    subCategory: "chicken",
    price: 950,
    image: "/media/items/peri-peri-grilled-burger.jpg",
    hue: 34,
    glyph: "flame",
    tags: ["chef"],
    spice: 2,
    calories: 640,
    prepMinutes: 12,
    rating: 4.7,
    reviews: 1340,
    options: [fryChoice, drinkChoice],
    addOns: commonAddOns,
    allergens: ["Gluten", "Egg"],
  },
  {
    slug: "buttermilk-crunch-burger",
    name: "Buttermilk Crunch Burger",
    blurb: "Golden fried chicken fillet, double cheddar, garlic butter mayo, sweet pickles.",
    story: "Comfort food at its peak: ultra crunchy golden chicken with creamy garlic mayo on toasted brioche.",
    categoryId: "burgers",
    subCategory: "chicken",
    price: 920,
    image: "/media/items/buttermilk-crunch-burger.jpg",
    hue: 30,
    glyph: "burger",
    tags: ["new"],
    spice: 0,
    calories: 720,
    prepMinutes: 11,
    rating: 4.8,
    reviews: 430,
    options: [fryChoice, drinkChoice],
    addOns: commonAddOns,
    allergens: ["Gluten", "Dairy", "Egg"],
  },
  {
    slug: "halloumi-crunch-burger",
    name: "Spiced Halloumi & Paneer",
    blurb: "Thick-cut charred halloumi slab, spiced paneer crunch, grilled bell pepper, mint labneh.",
    story: "Our flagship vegetarian showstopper. Crispy griddled halloumi with smoky pepper chutney.",
    categoryId: "burgers",
    subCategory: "veg",
    price: 980,
    image: "/media/items/halloumi-crunch-burger.jpg",
    hue: 52,
    glyph: "burger",
    tags: ["veg"],
    spice: 1,
    calories: 680,
    prepMinutes: 11,
    rating: 4.8,
    reviews: 410,
    options: [fryChoice, drinkChoice],
    addOns: commonAddOns,
    allergens: ["Gluten", "Dairy"],
  },

  /* ---------------- 4. Chicken (6 items: KFC-style core) ---------------- */
  {
    slug: "golden-crispy-chicken",
    name: "Golden Crispy Fried Chicken",
    blurb: "Bone-in chicken marinated in 11 secret herbs & spices, fried to a deafening crunch.",
    categoryId: "chicken",
    price: 790,
    compareAt: 920,
    image: "/media/items/golden-crispy-chicken.jpg",
    hue: 35,
    glyph: "drumstick",
    tags: ["bestseller"],
    spice: 1,
    calories: 720,
    prepMinutes: 14,
    rating: 4.9,
    reviews: 1620,
    sizes: [
      { label: "3 Pieces", delta: 0, serves: "1 person" },
      { label: "6 Pieces", delta: 690, serves: "2 persons" },
      { label: "9 Pieces", delta: 1290, serves: "3-4 persons" },
    ],
    options: [fryChoice, drinkChoice],
    allergens: ["Gluten", "Dairy", "Egg"],
  },
  {
    slug: "inferno-hot-wings",
    name: "Inferno Hot Buffalo Wings",
    blurb: "Crispy fried wings tossed in our ghost pepper buffalo glaze, served with buttermilk ranch.",
    categoryId: "chicken",
    price: 820,
    compareAt: 980,
    image: "/media/items/inferno-hot-wings.jpg",
    hue: 8,
    glyph: "flame",
    tags: ["spicy", "bestseller"],
    spice: 3,
    calories: 690,
    prepMinutes: 12,
    rating: 4.9,
    reviews: 1980,
    sizes: [
      { label: "8 Wings", delta: 0, serves: "Solo fix" },
      { label: "12 Wings", delta: 390, serves: "Shareable" },
      { label: "16 Wings", delta: 750, serves: "Party size" },
    ],
    allergens: ["Gluten", "Dairy"],
  },
  {
    slug: "honey-sriracha-wings",
    name: "Honey Sriracha Wings",
    blurb: "Glazed in sweet wild honey, fermented red sriracha, toasted sesame seeds and scallions.",
    categoryId: "chicken",
    price: 840,
    image: "/media/items/honey-sriracha-wings.jpg",
    hue: 16,
    glyph: "drumstick",
    tags: ["chef"],
    spice: 1,
    calories: 740,
    prepMinutes: 12,
    rating: 4.8,
    reviews: 1430,
    sizes: [
      { label: "8 Wings", delta: 0, serves: "Solo" },
      { label: "12 Wings", delta: 390, serves: "Shareable" },
    ],
    allergens: ["Gluten", "Sesame"],
  },
  {
    slug: "crispy-chicken-tenders",
    name: "Crispy Tender Strips (5pc)",
    blurb: "Five hand-breaded whole chicken breast tenderloins, fried golden with honey mustard dip.",
    categoryId: "chicken",
    price: 760,
    image: "/media/items/crispy-chicken-tenders.jpg",
    hue: 36,
    glyph: "drumstick",
    tags: ["bestseller"],
    spice: 0,
    calories: 590,
    prepMinutes: 10,
    rating: 4.8,
    reviews: 1120,
    options: [fryChoice, drinkChoice],
    allergens: ["Gluten", "Egg"],
  },
  {
    slug: "nashville-hot-strips",
    name: "Nashville Hot Strips (4pc)",
    blurb: "Giant crispy chicken breast tenders dunked in spicy cayenne oil, topped with sliced pickles.",
    categoryId: "chicken",
    price: 790,
    image: "/media/items/nashville-hot-strips.jpg",
    hue: 6,
    glyph: "flame",
    tags: ["spicy", "new"],
    spice: 3,
    calories: 660,
    prepMinutes: 11,
    rating: 4.7,
    reviews: 580,
    allergens: ["Gluten", "Dairy"],
  },
  {
    slug: "blaze-12pc-party-bucket",
    name: "Blaze 12-Piece Party Bucket",
    blurb: "12 pieces of golden crispy bone-in fried chicken, 2 large fries, 4 warm buns and 3 dips.",
    categoryId: "chicken",
    price: 2950,
    compareAt: 3600,
    image: "/media/items/blaze-12pc-party-bucket.jpg",
    hue: 22,
    glyph: "bucket",
    tags: ["bestseller", "limited"],
    spice: 1,
    calories: 2840,
    prepMinutes: 20,
    rating: 4.9,
    reviews: 950,
    allergens: ["Gluten", "Dairy", "Egg"],
  },

  /* ---------------- 5. Wraps / Rolls / Twisters (3 items) ---------------- */
  {
    slug: "crispy-chicken-twister",
    name: "Crispy Chicken Twister Wrap",
    blurb: "Crispy chicken strips, shredded lettuce, diced tomato, pepper mayo rolled in toasted tortilla.",
    categoryId: "wraps",
    price: 790,
    compareAt: 920,
    image: "/media/items/crispy-chicken-twister.jpg",
    hue: 38,
    glyph: "wrap",
    tags: ["bestseller"],
    spice: 1,
    calories: 620,
    prepMinutes: 9,
    rating: 4.8,
    reviews: 1420,
    options: [fryChoice, drinkChoice],
    allergens: ["Gluten", "Egg"],
  },
  {
    slug: "flame-fajita-chicken-roll",
    name: "Flame-Grilled Fajita Roll",
    blurb: "Charred grilled chicken breast, sautéed peppers, caramelised onions, garlic herb crema in paratha.",
    categoryId: "wraps",
    price: 840,
    image: "/media/items/flame-fajita-chicken-roll.jpg",
    hue: 30,
    glyph: "wrap",
    tags: ["chef"],
    spice: 2,
    calories: 670,
    prepMinutes: 10,
    rating: 4.7,
    reviews: 790,
    options: [fryChoice, drinkChoice],
    allergens: ["Gluten", "Dairy"],
  },
  {
    slug: "spicy-paneer-crunch-wrap",
    name: "Spicy Paneer Crunch Wrap",
    blurb: "Golden fried spiced cottage cheese, chipotle slaw, pickled jalapeños and fire garlic mayo.",
    categoryId: "wraps",
    price: 750,
    image: "/media/items/spicy-paneer-crunch-wrap.jpg",
    hue: 48,
    glyph: "wrap",
    tags: ["veg"],
    spice: 2,
    calories: 610,
    prepMinutes: 9,
    rating: 4.8,
    reviews: 410,
    options: [fryChoice, drinkChoice],
    allergens: ["Gluten", "Dairy"],
  },

  /* ---------------- 6. Sides (6 items) ---------------- */
  {
    slug: "peri-peri-fries",
    name: "Peri Peri Seasoned Fries",
    blurb: "Skin-on potato fries tossed in our secret dried bird's eye chilli and herb dust.",
    categoryId: "sides",
    price: 360,
    image: "/media/items/peri-peri-fries.jpg",
    hue: 44,
    glyph: "fries",
    tags: ["bestseller"],
    spice: 1,
    calories: 380,
    prepMinutes: 6,
    rating: 4.8,
    reviews: 3100,
    sizes: [
      { label: "Regular", delta: 0, serves: "1 person" },
      { label: "Large", delta: 120, serves: "2 persons" },
    ],
    allergens: [],
  },
  {
    slug: "blaze-loaded-fries",
    name: "Blaze Loaded Cheesy Fries",
    blurb: "Crispy fries layered with hot cheddar cheese sauce, smashed beef bits, pickled jalapeños.",
    categoryId: "sides",
    price: 680,
    compareAt: 790,
    image: "/media/items/blaze-loaded-fries.jpg",
    hue: 40,
    glyph: "fries",
    tags: ["bestseller"],
    spice: 2,
    calories: 780,
    prepMinutes: 8,
    rating: 4.9,
    reviews: 2450,
    allergens: ["Dairy"],
  },
  {
    slug: "golden-crispy-nuggets",
    name: "Golden Crispy Nuggets (6pc)",
    blurb: "100% chicken breast nuggets in crunchy golden coating, served with sweet BBQ dip.",
    categoryId: "sides",
    price: 490,
    image: "/media/items/golden-crispy-nuggets.jpg",
    hue: 36,
    glyph: "drumstick",
    tags: ["new"],
    spice: 0,
    calories: 420,
    prepMinutes: 7,
    rating: 4.7,
    reviews: 820,
    sizes: [
      { label: "6 Pieces", delta: 0, serves: "1 person" },
      { label: "10 Pieces", delta: 240, serves: "2 persons" },
    ],
    allergens: ["Gluten", "Egg"],
  },
  {
    slug: "cheesy-jalapeno-bites",
    name: "Cheesy Jalapeño Bites (6pc)",
    blurb: "Crisp panko balls stuffed with molten cheddar, pepper jack, and diced pickled jalapeños.",
    categoryId: "sides",
    price: 520,
    image: "/media/items/cheesy-jalapeno-bites.jpg",
    hue: 48,
    glyph: "fries",
    tags: ["spicy"],
    spice: 2,
    calories: 440,
    prepMinutes: 7,
    rating: 4.8,
    reviews: 910,
    allergens: ["Gluten", "Dairy"],
  },
  {
    slug: "crispy-onion-rings",
    name: "Crispy Golden Onion Rings",
    blurb: "Thick hand-cut white onion rings coated in seasoned batter and fried golden.",
    categoryId: "sides",
    price: 390,
    image: "/media/items/crispy-onion-rings.jpg",
    hue: 38,
    glyph: "fries",
    tags: ["veg"],
    spice: 0,
    calories: 340,
    prepMinutes: 6,
    rating: 4.6,
    reviews: 640,
    allergens: ["Gluten"],
  },
  {
    slug: "house-slaw",
    name: "Signature House Slaw",
    blurb: "Shredded green and red cabbage, sweet carrots, tangy cider vinegar cream dressing.",
    categoryId: "sides",
    price: 240,
    image: "/media/items/house-slaw.jpg",
    hue: 90,
    glyph: "fries",
    tags: ["veg"],
    spice: 0,
    calories: 140,
    prepMinutes: 3,
    rating: 4.6,
    reviews: 580,
    allergens: ["Dairy", "Egg"],
  },

  /* ---------------- 7. Sauces & Dips (5 items) ---------------- */
  {
    slug: "blaze-secret-fire-dip",
    name: "Blaze Secret Fire Dip",
    blurb: "Our house signature spicy mayo infused with charred habanero, smoked paprika & lime.",
    categoryId: "sauces",
    price: 90,
    image: "/media/items/blaze-secret-fire-dip.jpg",
    hue: 8,
    glyph: "sauce",
    tags: ["bestseller", "spicy"],
    spice: 2,
    calories: 120,
    prepMinutes: 1,
    rating: 4.9,
    reviews: 1450,
    allergens: ["Egg"],
  },
  {
    slug: "roasted-garlic-aioli",
    name: "Roasted Garlic Aioli",
    blurb: "Creamy whipped egg-and-oil emulsion folded with slow-roasted confit garlic cloves.",
    categoryId: "sauces",
    price: 90,
    image: "/media/items/roasted-garlic-aioli.jpg",
    hue: 42,
    glyph: "sauce",
    tags: ["chef"],
    spice: 0,
    calories: 130,
    prepMinutes: 1,
    rating: 4.9,
    reviews: 1210,
    allergens: ["Egg"],
  },
  {
    slug: "creamy-buttermilk-ranch",
    name: "Creamy Buttermilk Ranch",
    blurb: "Cultured buttermilk dip packed with fresh dill, chives, garlic, and cracked black pepper.",
    categoryId: "sauces",
    price: 90,
    image: "/media/items/creamy-buttermilk-ranch.jpg",
    hue: 110,
    glyph: "sauce",
    tags: [],
    spice: 0,
    calories: 110,
    prepMinutes: 1,
    rating: 4.8,
    reviews: 890,
    allergens: ["Dairy", "Egg"],
  },
  {
    slug: "smoky-hickory-bbq",
    name: "Smoky Hickory BBQ Dip",
    blurb: "Sweet and tangy tomato glaze simmered with dark molasses, apple cider, and liquid smoke.",
    categoryId: "sauces",
    price: 90,
    image: "/media/items/smoky-hickory-bbq.jpg",
    hue: 20,
    glyph: "sauce",
    tags: [],
    spice: 0,
    calories: 95,
    prepMinutes: 1,
    rating: 4.7,
    reviews: 670,
    allergens: [],
  },
  {
    slug: "warm-molten-cheddar-dip",
    name: "Warm Molten Cheddar Melt",
    blurb: "Rich, thick, melted sharp cheddar cheese sauce. Poured warm for immediate dipping.",
    categoryId: "sauces",
    price: 140,
    image: "/media/items/warm-molten-cheddar-dip.jpg",
    hue: 45,
    glyph: "sauce",
    tags: ["bestseller"],
    spice: 0,
    calories: 180,
    prepMinutes: 2,
    rating: 4.9,
    reviews: 1680,
    allergens: ["Dairy"],
  },

  /* ---------------- 8. Desserts (3 items) ---------------- */
  {
    slug: "molten-lava-cake",
    name: "Molten Dark Lava Cake",
    blurb: "Single-origin Belgian chocolate cake with a molten core that bursts warm on your spoon.",
    categoryId: "desserts",
    price: 490,
    image: "/media/items/molten-lava-cake.jpg",
    hue: 14,
    glyph: "dessert",
    tags: ["bestseller"],
    spice: 0,
    calories: 520,
    prepMinutes: 5,
    rating: 4.9,
    reviews: 2190,
    allergens: ["Gluten", "Dairy", "Egg"],
  },
  {
    slug: "churro-bites",
    name: "Cinnamon Sugar Churro Bites",
    blurb: "6 crispy fried dough pillows dusted in cinnamon sugar, served with warm dulce de leche.",
    categoryId: "desserts",
    price: 420,
    image: "/media/items/churro-bites.jpg",
    hue: 32,
    glyph: "dessert",
    tags: ["chef"],
    spice: 0,
    calories: 440,
    prepMinutes: 6,
    rating: 4.8,
    reviews: 1140,
    allergens: ["Gluten", "Dairy"],
  },
  {
    slug: "blaze-brownie-sundae",
    name: "Fudge Brownie Sundae",
    blurb: "Warm chocolate walnut brownie slab, vanilla soft serve, hot fudge drizzle, toasted nuts.",
    categoryId: "desserts",
    price: 540,
    image: "/media/items/blaze-brownie-sundae.jpg",
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

  /* ---------------- 9. Beverages (4 items) ---------------- */
  {
    slug: "classic-cola",
    name: "Classic Chilled Cola",
    blurb: "Ice-cold fountain classic served with fresh lemon slice.",
    categoryId: "beverages",
    price: 180,
    image: "/media/items/classic-cola.jpg",
    hue: 15,
    glyph: "cup",
    tags: ["bestseller"],
    spice: 0,
    calories: 140,
    prepMinutes: 2,
    rating: 4.7,
    reviews: 2900,
    sizes: [
      { label: "Regular 345ml", delta: 0, serves: "1" },
      { label: "Large 500ml", delta: 60, serves: "1" },
    ],
    allergens: [],
  },
  {
    slug: "mango-blast",
    name: "Mango Blast Crush",
    blurb: "Alphonso mango purée blended with crushed ice and a splash of sparkling soda.",
    categoryId: "beverages",
    price: 380,
    image: "/media/items/mango-blast.jpg",
    hue: 38,
    glyph: "cup",
    tags: ["bestseller"],
    spice: 0,
    calories: 220,
    prepMinutes: 4,
    rating: 4.9,
    reviews: 1840,
    allergens: [],
  },
  {
    slug: "mint-lemonade",
    name: "Fresh Mint Lemonade",
    blurb: "Freshly squeezed lemons, mint leaves, crushed black rock salt and sparkling water.",
    categoryId: "beverages",
    price: 320,
    image: "/media/items/mint-lemonade.jpg",
    hue: 140,
    glyph: "cup",
    tags: ["chef"],
    spice: 0,
    calories: 120,
    prepMinutes: 4,
    rating: 4.8,
    reviews: 1490,
    allergens: [],
  },
  {
    slug: "blaze-iced-coffee",
    name: "Blaze Cold Brew Iced Coffee",
    blurb: "16h steeped cold brew Arabica, condensed milk, poured over cracked ice.",
    categoryId: "beverages",
    price: 420,
    image: "/media/items/blaze-iced-coffee.jpg",
    hue: 24,
    glyph: "cup",
    tags: [],
    spice: 0,
    calories: 180,
    prepMinutes: 3,
    rating: 4.7,
    reviews: 820,
    allergens: ["Dairy"],
  },

  /* ---------------- 10. Add-ons / Extras (4 items: cart & menu upsells) ---------------- */
  {
    slug: "extra-smashed-patty",
    name: "Extra Smashed Beef Patty",
    blurb: "Add an extra 100g seared beef patty with melted cheddar onto any burger or deal.",
    categoryId: "addons",
    price: 320,
    image: "/media/items/extra-smashed-patty.jpg",
    hue: 22,
    glyph: "addon",
    tags: ["bestseller"],
    spice: 0,
    calories: 280,
    prepMinutes: 4,
    rating: 4.9,
    reviews: 1620,
    allergens: ["Dairy"],
  },
  {
    slug: "smoked-beef-bacon",
    name: "Smoked Beef Bacon Strips",
    blurb: "Two crispy strips of wood-smoked beef bacon for irresistible crunch.",
    categoryId: "addons",
    price: 190,
    image: "/media/items/smoked-beef-bacon.jpg",
    hue: 12,
    glyph: "addon",
    tags: [],
    spice: 0,
    calories: 140,
    prepMinutes: 3,
    rating: 4.8,
    reviews: 840,
    allergens: [],
  },
  {
    slug: "melted-cheddar-slice",
    name: "Double Melted Cheddar Slice",
    blurb: "Two extra thick slices of hot melted aged cheddar cheese.",
    categoryId: "addons",
    price: 120,
    image: "/media/items/melted-cheddar-slice.jpg",
    hue: 45,
    glyph: "addon",
    tags: [],
    spice: 0,
    calories: 110,
    prepMinutes: 2,
    rating: 4.9,
    reviews: 1100,
    allergens: ["Dairy"],
  },
  {
    slug: "pickled-jalapenos",
    name: "Pickled Fire Jalapeños",
    blurb: "Generous portion of tangy, hot, house-pickled green jalapeño rings.",
    categoryId: "addons",
    price: 70,
    image: "/media/items/pickled-jalapenos.jpg",
    hue: 120,
    glyph: "addon",
    tags: ["spicy"],
    spice: 2,
    calories: 25,
    prepMinutes: 1,
    rating: 4.7,
    reviews: 650,
    allergens: [],
  },
];

/* ============================================================
   DEALS AS MENU ITEMS (Seamless server repricing & unified cart)
   ============================================================ */

export const dealMenuItems: MenuItem[] = deals.map((d: Deal) => ({
  slug: d.slug,
  name: d.title,
  blurb: d.description,
  story: d.description,
  categoryId: "deals",
  price: d.price,
  compareAt: d.originalPrice,
  image: d.image,
  hue: d.hue,
  glyph: d.glyph,
  tags: [d.kind === "midnight" ? "midnight" : "bestseller"],
  spice: 1,
  calories: 1400,
  prepMinutes: 15,
  rating: 4.9,
  reviews: 1850,
  isDeal: true,
  dealContents: d.contents,
  dealSlots: d.slots,
  allergens: ["Gluten", "Dairy"],
  options: d.slots.map((s) => ({
    id: s.id,
    label: s.title,
    type: "single",
    required: s.required,
    choices: s.choices.map((c) => ({
      id: c.id,
      label: c.name,
      delta: c.surcharge || 0,
    })),
  })),
}));

/* Complete catalog combining regular items and deals */
export const menuItems: MenuItem[] = [...dealMenuItems, ...regularMenuItems];

/* ============================================================
   HELPERS
   ============================================================ */

export const getCategory = (id: string) =>
  categories.find((c) => c.id === id);

export const getItem = (slug: string) =>
  menuItems.find((i) => i.slug === slug);

export const itemsByCategory = (id: string) => {
  if (id === "deals") {
    return menuItems.filter((i) => i.categoryId === "deals" || i.isDeal);
  }
  if (id === "best-sellers") {
    return regularMenuItems.filter((i) => i.tags.includes("bestseller"));
  }
  return menuItems.filter((i) => i.categoryId === id);
};

export const bestSellers = regularMenuItems
  .filter((i) => i.tags.includes("bestseller"))
  .slice(0, 8);

export const newArrivals = regularMenuItems.filter((i) =>
  i.tags.includes("new"),
);

export const midnightDrops = menuItems.filter(
  (i) => i.tags.includes("midnight") || i.slug.includes("midnight"),
);

/** Highest and lowest prices, used by the POS dashboard. */
export const priceRange = menuItems.reduce(
  (acc, i) => ({
    min: Math.min(acc.min, i.price),
    max: Math.max(acc.max, i.price),
  }),
  { min: Infinity, max: 0 },
);

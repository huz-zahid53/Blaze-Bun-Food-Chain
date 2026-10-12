export interface Testimonial {
  id: string;
  name: string;
  handle: string;
  city: string;
  rating: number;
  quote: string;
  item: string;
  initials: string;
  hue: number;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Bilal A.",
    handle: "@bilal.eats",
    city: "Karachi",
    rating: 5,
    quote:
      "Ordered the Inferno Smash at 1:30 AM expecting something average. It arrived hot, the cheese was still molten, and I have thought about it every day since.",
    item: "Double Inferno Smash",
    initials: "BA",
    hue: 12,
  },
  {
    id: "t2",
    name: "Sana M.",
    handle: "@sanamalik",
    city: "Lahore",
    rating: 5,
    quote:
      "The Family Feast fed five of us for Rs 3,450 and there were leftovers. My mother, who distrusts all fast food, asked for the branch location.",
    item: "The Blaze Family Feast",
    initials: "SM",
    hue: 30,
  },
  {
    id: "t3",
    name: "Usman K.",
    handle: "@uskhan",
    city: "Islamabad",
    rating: 5,
    quote:
      "Finally a vegetarian burger that isn't an afterthought. The truffle mushroom melt genuinely holds up next to the beef ones.",
    item: "Truffle Mushroom Melt",
    initials: "UK",
    hue: 96,
  },
  {
    id: "t4",
    name: "Hira Z.",
    handle: "@hirazee",
    city: "Karachi",
    rating: 5,
    quote:
      "Student card gets 20% off and they actually honour it on delivery. As a uni student with Rs 800 to my name, this is the single most important fact about this restaurant.",
    item: "Student Blaze Card",
    initials: "HZ",
    hue: 210,
  },
  {
    id: "t5",
    name: "Daniyal R.",
    handle: "@dani.r",
    city: "Rawalpindi",
    rating: 4,
    quote:
      "Loaded fries are a genuine problem. I have ordered them eleven times this month. The app has started suggesting them before I even open the menu.",
    item: "Blaze Loaded Fries",
    initials: "DR",
    hue: 40,
  },
  {
    id: "t6",
    name: "Ayesha N.",
    handle: "@ayeshan",
    city: "Faisalabad",
    rating: 5,
    quote:
      "Catered my sister's mehndi for 80 people. Everything arrived on time, hot, and labelled. The peri peri quarter was gone in nine minutes.",
    item: "Catering — 80 guests",
    initials: "AN",
    hue: 340,
  },
];

/* ============================================================
   FAQS
   ============================================================ */

export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: "How long does delivery usually take?",
    a: "Most orders land in 25–35 minutes. During peak hours (8–10 PM and after midnight) it can stretch to 45. You'll see a live ETA on the tracking page the moment your order hits the grill.",
  },
  {
    q: "What's the minimum order for delivery?",
    a: "Rs 500. Delivery is Rs 149 flat, and it's free on orders over Rs 2,500.",
  },
  {
    q: "Do you deliver after midnight?",
    a: "Yes — every branch runs until at least 1 AM, and our Karachi and Lahore branches go to 3 AM. The Midnight Munch Box becomes orderable at exactly 12:00 AM.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cash on delivery, all major credit and debit cards, JazzCash, EasyPaisa and instant bank transfer via Raast. Card and wallet payments are processed securely — we never store your card details.",
  },
  {
    q: "Can I customise my order?",
    a: "Almost everything. Swap sides, pick your heat level, add extra patties or bacon, and leave a note for the kitchen. If there's something specific you need, write it in the instructions box and we'll do our best.",
  },
  {
    q: "Do you cater for events?",
    a: "We do. Our catering team handles everything from 20-person office lunches to 200-guest weddings. Give us 48 hours' notice via the catering page and we'll build a custom package.",
  },
  {
    q: "Is your meat halal?",
    a: "100%. All our beef and chicken is halal certified, and our supplier certificates are displayed in every branch. We don't serve pork in any form, and no alcohol is used in any recipe.",
  },
  {
    q: "How do I report a problem with my order?",
    a: "Use the Contact page or call the branch directly. We refund or re-deliver, no interrogation. If something went wrong, that's our problem to fix, not yours to justify.",
  },
];

/* ============================================================
   VALUES (About page)
   ============================================================ */

export const values = [
  {
    id: "flame",
    title: "Real fire, always",
    body: "Every patty touches steel at 400°C and every chicken order finishes over live coals. No flat-tops, no heat lamps, no reheat.",
    stat: "400°C",
    statLabel: "Searing temperature",
    hue: 12,
  },
  {
    id: "grind",
    title: "Ground in-house daily",
    body: "We grind 80/20 chuck every morning in every branch. Never frozen, never pre-formed, never shipped in.",
    stat: "06:00",
    statLabel: "Daily grind starts",
    hue: 30,
  },
  {
    id: "marinade",
    title: "24-hour marinade",
    body: "Peri peri chicken sits in its marinade for a full day before it sees heat. There is no rush version of this.",
    stat: "24h",
    statLabel: "Minimum marinade",
    hue: 44,
  },
  {
    id: "halal",
    title: "Halal, completely",
    body: "Certified halal supply chain, no pork, no alcohol in any recipe, certificates on the wall of every branch.",
    stat: "100%",
    statLabel: "Halal certified",
    hue: 140,
  },
];

/* ============================================================
   TIMELINE (About page)
   ============================================================ */

export const timeline = [
  {
    year: "2019",
    title: "One grill, Friday nights",
    body: "A folding table outside a Clifton café. Forty-one burgers sold on night one. Buns ran out at 11 PM.",
  },
  {
    year: "2021",
    title: "First real branch",
    body: "DHA Phase VI opens with 84 seats and a rent payment that kept the founder awake. Breaks even in month four.",
  },
  {
    year: "2022",
    title: "Lahore",
    body: "MM Alam Road opens with a rooftop. Longest queue in the company's history: 2 hours 40 minutes.",
  },
  {
    year: "2023",
    title: "Islamabad + the midnight menu",
    body: "F-7 opens. The Midnight Munch Box drops and immediately becomes 18% of all orders.",
  },
  {
    year: "2025",
    title: "Ten branches, zero investors",
    body: "Every branch funded from the profits of the ones before it. Still no outside money.",
  },
  {
    year: "2026",
    title: "Twelve branches, four cities",
    body: "Rawalpindi, Faisalabad and Multan join. Catering launches for events up to 200 guests.",
  },
];

/* ============================================================
   CAREERS
   ============================================================ */

export const openings = [
  {
    id: "grill-master",
    title: "Grill Master",
    type: "Restaurant",
    location: "Karachi — DHA Phase VI",
    commitment: "Full-time",
    salary: "Rs 45,000 – 65,000 / month",
    body: "You own the flame. Two-plus years on a commercial grill, and the ability to hold consistency across a 200-cover Friday night.",
  },
  {
    id: "shift-lead",
    title: "Shift Lead",
    type: "Restaurant",
    location: "Lahore — MM Alam Road",
    commitment: "Full-time",
    salary: "Rs 55,000 – 75,000 / month",
    body: "Run the floor, own the shift, and be the person the new hires learn from. Previous supervisory experience required.",
  },
  {
    id: "rider",
    title: "Delivery Rider",
    type: "Operations",
    location: "Multiple cities",
    commitment: "Part-time / Full-time",
    salary: "Rs 30,000 – 48,000 / month + fuel",
    body: "Own bike, valid licence, smartphone, and a working knowledge of your city's shortcuts. Tips are yours.",
  },
  {
    id: "brand-design",
    title: "Brand Designer",
    type: "Office",
    location: "Karachi — Head Office",
    commitment: "Full-time",
    salary: "Rs 120,000 – 180,000 / month",
    body: "Packaging, menus, campaigns and the odd unhinged social post. Three-plus years and a portfolio that shows range.",
  },
  {
    id: "ops-analyst",
    title: "Operations Analyst",
    type: "Office",
    location: "Karachi — Head Office",
    commitment: "Full-time",
    salary: "Rs 140,000 – 200,000 / month",
    body: "Turn twelve branches' worth of messy data into decisions. SQL required, dbt or similar a strong plus.",
  },
  {
    id: "franchise-manager",
    title: "Franchise Development Manager",
    type: "Office",
    location: "Karachi — Head Office",
    commitment: "Full-time",
    salary: "Competitive + commission",
    body: "Find, qualify and onboard franchise partners across Pakistan. Prior F&B franchise experience strongly preferred.",
  },
];

/* ============================================================
   MARQUEE TICKER
   ============================================================ */

export const ticker = [
  "Free delivery over Rs 2,500",
  "Open till 3 AM in Karachi",
  "Halal certified — 100%",
  "Ground in-house every morning",
  "Student card = 20% off",
  "Midnight Munch Box drops at 12 AM",
  "12 branches · 4 cities",
  "24-hour peri peri marinade",
];

/* ============================================================
   STATS
   ============================================================ */

export const heroStats = [
  { value: "12", suffix: "", label: "Branches" },
  { value: "4", suffix: "", label: "Cities" },
  { value: "1.8", suffix: "M", label: "Burgers served" },
  { value: "28", suffix: " min", label: "Average delivery" },
];

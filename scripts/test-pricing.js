// The compiled output still contains "@/..." alias requires (tsc does not
// rewrite paths). Map them onto the compiled tree before loading anything.
const path = require("node:path");
const Module = require("node:module");

// Compiled TS output lives at <repo>/.tmp-test (see tsconfig.test.json)
const OUT = path.join(__dirname, "..", ".tmp-test");
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) {
    return origResolve.call(this, path.join(OUT, `${request.slice(2)}.js`), ...rest);
  }
  return origResolve.call(this, request, ...rest);
};

// zustand's persist middleware expects a storage API; give it a no-op one so
// the module can load outside a browser. computeTotals is pure regardless.
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const { computeTotals } = require(path.join(OUT, "store/useStore.js"));
const { brand } = require(path.join(OUT, "config/brand.js"));
const { menuItems } = require(path.join(OUT, "data/menu.js"));

let pass = 0;
let fail = 0;

function check(name, actual, expected, tol = 0.01) {
  const ok =
    typeof expected === "number"
      ? Math.abs(actual - expected) <= tol
      : actual === expected;
  if (ok) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}\n          expected ${expected}, got ${actual}`);
  }
}

const line = (price, qty = 1) => ({ unitPrice: price, qty });

console.log("\n=== SUBTOTAL & ITEM COUNT ===");
{
  const t = computeTotals([line(1150, 2), line(450, 1)], "pickup", null, 0);
  check("subtotal = 2x1150 + 450", t.subtotal, 2750);
  check("itemCount = 3", t.itemCount, 3);
}

console.log("\n=== DELIVERY FEE RULES ===");
{
  const pickup = computeTotals([line(900)], "pickup", null, 0);
  check("pickup has no delivery fee", pickup.deliveryFee, 0);

  const small = computeTotals([line(900)], "delivery", null, 0);
  check("delivery under threshold charges fee", small.deliveryFee, brand.deliveryFee);
  check("below-minimum flag set", small.belowMinimum, false); // 900 > 500 min

  const tiny = computeTotals([line(300)], "delivery", null, 0);
  check("below minimum order flagged", tiny.belowMinimum, true);

  const big = computeTotals([line(brand.freeDeliveryOver)], "delivery", null, 0);
  check("free delivery at threshold", big.deliveryFee, 0);
  check("qualifiesForFreeDelivery true", big.qualifiesForFreeDelivery, true);

  const justUnder = computeTotals([line(brand.freeDeliveryOver - 1)], "delivery", null, 0);
  check("just under threshold still pays", justUnder.deliveryFee, brand.deliveryFee);
  check("freeDeliveryRemaining = 1", justUnder.freeDeliveryRemaining, 1);
}

console.log("\n=== TAX (SST) ===");
{
  const t = computeTotals([line(2000)], "pickup", null, 0);
  check("tax = subtotal * rate", t.tax, 2000 * brand.taxRate);
  check("total = subtotal + tax", t.total, 2000 + 2000 * brand.taxRate);
}

console.log("\n=== COUPONS ===");
{
  const pct = { code: "BLAZE20", kind: "percent", value: 0.2, minSubtotal: 800 };
  const t = computeTotals([line(2000)], "pickup", pct, 0);
  check("percent discount = 20% of subtotal", t.discount, 400);
  check("tax applies to DISCOUNTED amount", t.tax, 1600 * brand.taxRate);
  check("total = discounted + tax", t.total, 1600 + 1600 * brand.taxRate);

  const flat = { code: "BUN250", kind: "flat", value: 250, minSubtotal: 1500 };
  const f = computeTotals([line(2000)], "pickup", flat, 0);
  check("flat discount = 250", f.discount, 250);

  const del = { code: "FREERIDE", kind: "delivery", value: 0, minSubtotal: 1200 };
  const d = computeTotals([line(1300)], "delivery", del, 0);
  check("delivery coupon zeroes the fee", d.deliveryFee, 0);
  check("delivery coupon gives no discount", d.discount, 0);

  // Flat coupon larger than subtotal must not produce a negative total
  const huge = { code: "X", kind: "flat", value: 999999, minSubtotal: 0 };
  const h = computeTotals([line(500)], "pickup", huge, 0);
  check("over-large flat coupon clamps total to >= 0", h.total >= 0, true);
  check("over-large flat coupon clamps tax to >= 0", h.tax >= 0, true);
}

console.log("\n=== TIP ===");
{
  const t = computeTotals([line(1000)], "delivery", null, 150);
  check("tip added to total", t.total, 1000 + brand.deliveryFee + 1000 * brand.taxRate + 150);
  check("tip is not taxed", t.tax, 1000 * brand.taxRate);
}

console.log("\n=== EMPTY CART ===");
{
  const t = computeTotals([], "delivery", null, 0);
  check("empty subtotal = 0", t.subtotal, 0);
  check("empty cart does not charge delivery", t.total, 0);
  check("empty cart not below minimum", t.belowMinimum, false);
}

console.log("\n=== REAL MENU PRICES ARE SANE ===");
{
  const prices = menuItems.map((i) => i.price);
  const bad = prices.filter((p) => !Number.isFinite(p) || p <= 0);
  check(`all ${menuItems.length} menu items have positive finite prices`, bad.length, 0);
  check("cheapest item >= 100", Math.min(...prices) >= 100, true);
  check("priciest item <= 10000", Math.max(...prices) <= 10000, true);

  const dupes = menuItems.length - new Set(menuItems.map((i) => i.slug)).size;
  check("no duplicate menu slugs", dupes, 0);
}

console.log(`\n${"=".repeat(46)}`);
console.log(`  ${pass} passed, ${fail} failed`);
console.log(`${"=".repeat(46)}\n`);
process.exit(fail ? 1 : 0);

/**
 * Hydration-safety + server-pricing tests.
 *
 * PART 1 proves the SSR contract: the store is plain in-memory zustand with no
 * persist middleware, so nothing is read from localStorage and the client's
 * first render is byte-identical to the server's. Durable state arrives later,
 * asynchronously, from /api/state.
 *
 * PART 2 proves `applyRemoteState` cannot be fed garbage — a corrupt or
 * hand-edited database row must not be able to put the cart into an impossible
 * shape or resurrect a retired coupon.
 *
 * PART 3 proves the server is authoritative on price: coupons are validated
 * against minSpend, so a tampered request cannot apply BLAZE20 to a Rs 300 cart.
 */
const path = require("node:path");
const Module = require("node:module");

const OUT = path.join(__dirname, "..", ".tmp-test");

// Map the "@/..." alias requires that survive tsc output.
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) {
    return origResolve.call(this, path.join(OUT, `${request.slice(2)}.js`), ...rest);
  }
  return origResolve.call(this, request, ...rest);
};

// A localStorage that already contains a returning visitor's data. Under the
// old persist-based design this would leak into the first client render.
const PERSISTED = {
  state: {
    orderType: "pickup",
    branchId: "dha-6",
    city: "Lahore",
    lines: [
      { key: "a", slug: "blaze-signature-smash", name: "Blaze Signature Smash", unitPrice: 1150, qty: 2 },
      { key: "b", slug: "blaze-loaded-fries", name: "Blaze Loaded Fries", unitPrice: 650, qty: 1 },
    ],
    coupon: null,
    tip: 0,
    orders: [{ id: "BB-TEST1", number: "BB-TEST1", status: "delivered", total: 2950 }],
    loyaltyPoints: 340,
    isMember: true,
  },
  version: 0,
};

let backing = { "blaze-and-bun-store": JSON.stringify(PERSISTED) };
globalThis.localStorage = {
  getItem: (k) => (k in backing ? backing[k] : null),
  setItem: (k, v) => { backing[k] = String(v); },
  removeItem: (k) => { delete backing[k]; },
};

const storeModule = require(path.join(OUT, "store/useStore.js"));
const { useStore, serializeRemoteState } = storeModule;
const { priceOrder, findCoupon, coupons } = require(path.join(OUT, "lib/pricing.js"));
const { brand } = require(path.join(OUT, "config/brand.js"));

let pass = 0;
let fail = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : `\n          expected ${expected}, got ${actual}`}`);
}

console.log("\n=== PART 1: no localStorage, no persist — first render ===");
{
  check("store exposes no persist API", typeof useStore.persist, "undefined");

  const s = useStore.getState();
  check("cart is EMPTY despite localStorage holding 2 lines", s.lines.length, 0);
  check("orders is EMPTY despite localStorage holding 1", s.orders.length, 0);
  check("loyaltyPoints is 0, not the persisted 340", s.loyaltyPoints, 0);
  check("isMember is false, not the persisted true", s.isMember, false);
  check("orderType is the default 'delivery', not persisted 'pickup'", s.orderType, "delivery");
  check("city is the default, not persisted 'Lahore'", s.city, "Karachi");
  check("no location is confirmed on a fresh store", s.locationConfirmed, false);
  check("hydrated is false until the cloud load resolves", s.hydrated, false);
  check("cloudMode starts 'unknown'", s.cloudMode, "unknown");
  check("nothing was written to localStorage", Object.keys(backing).length, 1);

  const total = useStore.getState().lines.reduce((n, l) => n + l.unitPrice * l.qty, 0);
  check("first-paint cart total is Rs 0", total, 0);
}

console.log("\n=== PART 2: applyRemoteState validates what it is given ===");
{
  const apply = useStore.getState().applyRemoteState;

  // A well-formed remote state lands correctly.
  apply({
    orderType: "pickup",
    branchId: "bb-clifton-karachi",
    city: "Karachi",
    lines: [{ key: "a", slug: "blaze-signature-smash", name: "Blaze Signature Smash", unitPrice: 1150, qty: 2, hue: 18, glyph: "burger", basePrice: 1150, options: [], addOns: [], categoryId: "signature" }],
    coupon: null,
    tip: 100,
    orders: [],
    loyaltyPoints: 340,
    isMember: true,
  });
  let s = useStore.getState();
  check("valid orderType applied", s.orderType, "pickup");
  check("valid branchId applied", s.branchId, "bb-clifton-karachi");
  check("valid line applied", s.lines.length, 1);
  check("valid tip applied", s.tip, 100);
  check("valid loyalty applied", s.loyaltyPoints, 340);
  check("valid isMember applied", s.isMember, true);

  // Saved locations are revalidated against the live catalogue.
  apply({ zoneId: "z-khi-dha-phase-vi" });
  check("valid zoneId applied", useStore.getState().zoneId, "z-khi-dha-phase-vi");

  apply({ zoneId: "z-retired-forever" });
  check("unknown zoneId dropped", useStore.getState().zoneId, null);

  apply({ branchId: "bb-not-a-branch" });
  check("unknown branchId dropped", useStore.getState().branchId, null);

  apply({ branchId: null, zoneId: "z-khi-north-nazimabad" });
  check("a valid zone repairs a missing branch", useStore.getState().branchId, "bb-gulshan-karachi");

  // The "location confirmed" flag is only trusted when a real location survives.
  apply({ locationConfirmed: true, branchId: "bb-clifton-karachi" });
  check("confirmed flag restored with a valid location", useStore.getState().locationConfirmed, true);

  apply({ locationConfirmed: true, branchId: "bb-closed-forever" });
  check("confirmation dropped when the saved branch is gone", useStore.getState().locationConfirmed, false);
  check("retired branch cleared so the picker reopens", useStore.getState().branchId, null);

  apply({ locationConfirmed: true });
  check("confirmation with no location is refused", useStore.getState().locationConfirmed, false);

  // Hostile / corrupt input must be refused, not applied.
  apply({ orderType: "teleport" });
  check("bogus orderType rejected", useStore.getState().orderType, "pickup");

  apply({ tip: 999999 });
  check("absurd tip clamped to 5000", useStore.getState().tip, 5000);

  apply({ tip: -500 });
  check("negative tip clamped to 0", useStore.getState().tip, 0);

  apply({ loyaltyPoints: -9999 });
  check("negative loyalty clamped to 0", useStore.getState().loyaltyPoints, 0);

  apply({ loyaltyPoints: Number.NaN });
  check("NaN loyalty ignored", useStore.getState().loyaltyPoints, 0);

  apply({ lines: [{ slug: 12345 }, null, { slug: "x", name: "y", unitPrice: "free", qty: 2 }] });
  check("malformed lines dropped entirely", useStore.getState().lines.length, 0);

  apply({
    lines: [{ key: "a", slug: "s", name: "n", unitPrice: 100, qty: 9999, hue: 0, glyph: "g", basePrice: 100, options: [], addOns: [], categoryId: "c" }],
  });
  check("qty clamped to 50", useStore.getState().lines[0].qty, 50);

  // A retired coupon code must not be resurrected from an old row.
  apply({ coupon: { code: "DOESNOTEXIST", kind: "percent", value: 0.9, minSpend: 0 } });
  check("unknown coupon code dropped", useStore.getState().coupon, null);

  apply({ coupon: { code: coupons[0].code } });
  check("live coupon code accepted", useStore.getState().coupon?.code, coupons[0].code);

  apply(null);
  check("null remote state is a no-op", typeof useStore.getState().orderType, "string");

  // Confirming a location through the modal must persist the flag.
  useStore.getState().commitLocation({
    orderType: "delivery",
    city: "Karachi",
    branchId: "bb-dha-karachi",
    zoneId: "z-khi-dha-phase-vi",
  });
  check("commitLocation confirms the location", useStore.getState().locationConfirmed, true);
  check("commitLocation stores the delivery zone", useStore.getState().zoneId, "z-khi-dha-phase-vi");

  // Round-trip: serialise then re-apply.
  const snapshot = serializeRemoteState(useStore.getState());
  check("serialise includes exactly the durable keys", Object.keys(snapshot).length, 11);
  check("serialise carries the selected delivery zone", "zoneId" in snapshot, true);
  check("serialise carries the confirmation flag", "locationConfirmed" in snapshot, true);
  check("serialise excludes UI-only flags", "cartOpen" in snapshot, false);
  check("serialise excludes cloudMode", "cloudMode" in snapshot, false);
}

console.log("\n=== PART 3: server-side pricing is authoritative ===");
{
  // BLAZE20 needs Rs 800 minimum.
  const legit = priceOrder({ subtotal: 2000, itemCount: 2, orderType: "pickup", couponCode: "BLAZE20", tip: 0 });
  check("qualifying coupon applies 20%", legit.discount, 400);
  check("qualifying coupon is recorded", legit.couponCode, "BLAZE20");
  check("no rejection message", legit.couponRejected, null);

  const smuggled = priceOrder({ subtotal: 300, itemCount: 1, orderType: "pickup", couponCode: "BLAZE20", tip: 0 });
  check("coupon below minSpend is REJECTED", smuggled.couponCode, null);
  check("rejected coupon gives no discount", smuggled.discount, 0);
  check("rejection reason is explained", typeof smuggled.couponRejected, "string");
  check("customer still pays full subtotal", smuggled.subtotal, 300);

  const lower = priceOrder({ subtotal: 300, itemCount: 1, orderType: "pickup", couponCode: "blaze20", tip: 0 });
  check("coupon lookup is case-insensitive", lower.couponRejected !== null, true);

  const invented = priceOrder({ subtotal: 5000, itemCount: 5, orderType: "pickup", couponCode: "FREE100", tip: 0 });
  check("invented coupon code is ignored", invented.couponCode, null);
  check("invented coupon gives no discount", invented.discount, 0);

  // Loyalty must match the client formula exactly: 2% of the paid total.
  const loyal = priceOrder({ subtotal: 2000, itemCount: 2, orderType: "pickup", couponCode: null, tip: 0 });
  check("loyalty = round(total * pointsPerRupee)", loyal.loyaltyEarned, Math.round(loyal.total * brand.loyalty.pointsPerRupee));

  // Negative input cannot produce a negative charge.
  const hostile = priceOrder({ subtotal: -5000, itemCount: 1, orderType: "delivery", couponCode: "BUN250", tip: -900 });
  check("negative subtotal clamped to 0", hostile.subtotal, 0);
  check("negative tip clamped to 0", hostile.tip, 0);
  check("total never negative", hostile.total >= 0, true);

  // Free-delivery threshold still honoured server-side.
  const big = priceOrder({ subtotal: brand.freeDeliveryOver, itemCount: 3, orderType: "delivery", couponCode: null, tip: 0 });
  check("free delivery at threshold (server)", big.deliveryFee, 0);

  check("findCoupon returns null for junk", findCoupon("   "), null);
  check("findCoupon finds a real code", findCoupon("STUDENT")?.minSpend, 0);
}

console.log(`\n${"=".repeat(52)}`);
console.log(`  ${pass} passed, ${fail} failed`);
console.log(`${"=".repeat(52)}\n`);
process.exit(fail ? 1 : 0);

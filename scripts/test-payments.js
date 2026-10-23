// Payment system test suite
const path = require("node:path");
const Module = require("node:module");

const OUT = path.join(__dirname, "..", ".tmp-test");
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) {
    return origResolve.call(this, path.join(OUT, `${request.slice(2)}.js`), ...rest);
  }
  return origResolve.call(this, request, ...rest);
};

globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const {
  validatePaymentMethod,
  isDeliveryPayment,
  isOnlinePayment,
  processPayment,
  processSimulatedPayment,
  processDeliveryPayment,
  PAYMENT_METHOD_IDS,
} = require(path.join(OUT, "lib/payments/index.js"));

const { useStore } = require(path.join(OUT, "store/useStore.js"));
const { paymentMethods } = require(path.join(OUT, "config/brand.js"));

let pass = 0;
let fail = 0;

function check(name, actual, expected) {
  const ok = actual === expected;
  if (ok) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}\n          expected: ${expected}\n          actual:   ${actual}`);
  }
}

console.log("\n=== 1. PAYMENT METHOD CATALOGUE & BRAND CONFIG ===");
{
  check("brand config defines 6 payment methods", paymentMethods.length, 6);
  check("paymentMethods has 'cod'", paymentMethods.some((p) => p.id === "cod"), true);
  check("paymentMethods has 'cash_on_card'", paymentMethods.some((p) => p.id === "cash_on_card"), true);
  check("paymentMethods has 'card'", paymentMethods.some((p) => p.id === "card"), true);
  check("paymentMethods has 'jazzcash'", paymentMethods.some((p) => p.id === "jazzcash"), true);
  check("paymentMethods has 'easypaisa'", paymentMethods.some((p) => p.id === "easypaisa"), true);
  check("paymentMethods has 'bank'", paymentMethods.some((p) => p.id === "bank"), true);

  check("cash_on_card kind is 'card_delivery'", paymentMethods.find((p) => p.id === "cash_on_card")?.kind, "card_delivery");
  check("cod fee is 0", paymentMethods.find((p) => p.id === "cod")?.fee, 0);
  check("cash_on_card fee is 0", paymentMethods.find((p) => p.id === "cash_on_card")?.fee, 0);
}

console.log("\n=== 2. PAYMENT VALIDATION & CLASSIFICATION ===");
{
  check("validate 'cod'", validatePaymentMethod("cod"), "cod");
  check("validate 'cash_on_card'", validatePaymentMethod("cash_on_card"), "cash_on_card");
  check("validate 'card'", validatePaymentMethod("card"), "card");
  check("validate 'jazzcash'", validatePaymentMethod("jazzcash"), "jazzcash");
  check("validate 'easypaisa'", validatePaymentMethod("easypaisa"), "easypaisa");
  check("validate 'bank'", validatePaymentMethod("bank"), "bank");
  check("rejects arbitrary method 'crypto'", validatePaymentMethod("crypto"), null);
  check("rejects null method", validatePaymentMethod(null), null);
  check("rejects empty string", validatePaymentMethod(""), null);

  check("cod isDeliveryPayment = true", isDeliveryPayment("cod"), true);
  check("cash_on_card isDeliveryPayment = true", isDeliveryPayment("cash_on_card"), true);
  check("card isDeliveryPayment = false", isDeliveryPayment("card"), false);

  check("card isOnlinePayment = true", isOnlinePayment("card"), true);
  check("jazzcash isOnlinePayment = true", isOnlinePayment("jazzcash"), true);
  check("easypaisa isOnlinePayment = true", isOnlinePayment("easypaisa"), true);
  check("bank isOnlinePayment = true", isOnlinePayment("bank"), true);
  check("cod isOnlinePayment = false", isOnlinePayment("cod"), false);
  check("cash_on_card isOnlinePayment = false", isOnlinePayment("cash_on_card"), false);
}

console.log("\n=== 3. CASH ON DELIVERY (COD) & CASH ON CARD ===");
{
  const codRes = processPayment("cod", 2450);
  check("cod success is true (order placed)", codRes.success, true);
  check("cod paymentStatus is 'unpaid'", codRes.paymentStatus, "unpaid");
  check("cod attemptStatus is 'pending'", codRes.attemptStatus, "pending");
  check("cod isSimulated is false", codRes.isSimulated, false);
  check("cod mode is 'delivery'", codRes.mode, "delivery");
  check("cod reference starts with DEL-", codRes.reference.startsWith("DEL-"), true);

  const cocRes = processPayment("cash_on_card", 3100);
  check("cash_on_card success is true", cocRes.success, true);
  check("cash_on_card paymentStatus is 'unpaid'", cocRes.paymentStatus, "unpaid");
  check("cash_on_card isSimulated is false", cocRes.isSimulated, false);
  check("cash_on_card mode is 'delivery'", cocRes.mode, "delivery");
}

console.log("\n=== 4. SIMULATED ONLINE PAYMENTS (CARD, JAZZCASH, EASYPAISA, BANK) ===");
{
  // Success flow
  const cardSuccess = processPayment("card", 1850, "success");
  check("card success -> success is true", cardSuccess.success, true);
  check("card success -> paymentStatus is 'paid'", cardSuccess.paymentStatus, "paid");
  check("card success -> attemptStatus is 'paid'", cardSuccess.attemptStatus, "paid");
  check("card success -> isSimulated is true", cardSuccess.isSimulated, true);
  check("card success -> reference starts with SIM-CARD-", cardSuccess.reference.startsWith("SIM-CARD-"), true);

  // Failure flow
  const cardFail = processPayment("card", 1850, "failure");
  check("card failure -> success is false", cardFail.success, false);
  check("card failure -> paymentStatus is 'failed'", cardFail.paymentStatus, "failed");
  check("card failure -> attemptStatus is 'failed'", cardFail.attemptStatus, "failed");
  check("card failure -> isSimulated is true", cardFail.isSimulated, true);

  // Cancelled flow
  const jcCancel = processPayment("jazzcash", 1200, "cancelled");
  check("jazzcash cancel -> success is false", jcCancel.success, false);
  check("jazzcash cancel -> paymentStatus is 'unpaid'", jcCancel.paymentStatus, "unpaid");
  check("jazzcash cancel -> attemptStatus is 'cancelled'", jcCancel.attemptStatus, "cancelled");

  // EasyPaisa & Bank reference prefixes
  const epSuccess = processPayment("easypaisa", 950, "success");
  check("easypaisa ref starts with SIM-EP-", epSuccess.reference.startsWith("SIM-EP-"), true);

  const bnkSuccess = processPayment("bank", 5000, "success");
  check("bank ref starts with SIM-BNK-", bnkSuccess.reference.startsWith("SIM-BNK-"), true);

  const bnkFail = processPayment("bank", 5000, "failure");
  check("bank failure -> success is false", bnkFail.success, false);
  check("bank failure -> paymentStatus is 'failed'", bnkFail.paymentStatus, "failed");

  // Unique reference randomness
  const ref1 = processSimulatedPayment("card", 100, "success").reference;
  const ref2 = processSimulatedPayment("card", 100, "success").reference;
  check("success references are unique", ref1 !== ref2, true);
}

console.log("\n=== 5. ZUSTAND STORE ORDER TIMELINE & CANCEL FIX ===");
{
  const store = useStore.getState();

  // Test placeOrder with COD
  const codOrder = store.placeOrder({
    type: "delivery",
    lines: [],
    itemCount: 1,
    subtotal: 1000,
    deliveryFee: 149,
    tax: 50,
    discount: 0,
    tip: 0,
    total: 1199,
    payment: "cod",
    paymentLabel: "Cash on Delivery",
    branchId: "bb-dha-karachi",
    branchName: "DHA Phase 6, Karachi",
    etaMinutes: 30,
    customer: { name: "Ali", phone: "03001234567" },
  });

  check("COD order paymentStatus is unpaid", codOrder.paymentStatus, "unpaid");
  check("COD order isSimulated is false", codOrder.isSimulated, false);
  check("COD order timeline has doorstep payment event", codOrder.timeline[1].label, "Pay cash at delivery");
  check("COD order doorstep payment is not done yet", codOrder.timeline[1].done, false);

  // Test cancelOrder bug fix
  store.cancelOrder(codOrder.id);
  const cancelledOrder = useStore.getState().orders.find((o) => o.id === codOrder.id);
  check("cancelOrder marks status as 'cancelled' (NOT 'delivered')", cancelledOrder?.status, "cancelled");

  // Test placeOrder with simulated card payment
  const cardOrder = store.placeOrder(
    {
      type: "delivery",
      lines: [],
      itemCount: 1,
      subtotal: 1000,
      deliveryFee: 149,
      tax: 50,
      discount: 0,
      tip: 0,
      total: 1199,
      payment: "card",
      paymentLabel: "Credit / Debit Card",
      branchId: "bb-dha-karachi",
      branchName: "DHA Phase 6, Karachi",
      etaMinutes: 30,
      customer: { name: "Sara", phone: "03001234567" },
    },
    {
      id: "srv-ord-123",
      number: "BB-CARD1",
      payment: {
        status: "paid",
        reference: "SIM-CARD-TEST",
        isSimulated: true,
        message: "Card Gateway approved",
        method: "card",
      },
    },
  );

  check("Card order paymentStatus is 'paid'", cardOrder.paymentStatus, "paid");
  check("Card order isSimulated is true", cardOrder.isSimulated, true);
  check("Card order reference is preserved", cardOrder.paymentReference, "SIM-CARD-TEST");
  check("Card order timeline marks simulated payment as confirmed", cardOrder.timeline[1].label, "Payment simulated (demo)");
  check("Card order payment event is done = true", cardOrder.timeline[1].done, true);
}

console.log("\n=== 6. PAYMENT SECURITY, TAMPERING & SETTLEMENT RULES ===");
{
  const store = useStore.getState();

  // 1. COD / Cash on Card cannot be forced into paid state by client demoOutcome
  const codTamper = processPayment("cod", 2000, "success");
  check("tampering cod with demoOutcome='success' still forces unpaid", codTamper.paymentStatus, "unpaid");
  check("tampering cod still forces isSimulated=false", codTamper.isSimulated, false);

  const cocTamper = processPayment("cash_on_card", 2500, "success");
  check("tampering cash_on_card with demoOutcome='success' still forces unpaid", cocTamper.paymentStatus, "unpaid");
  check("tampering cash_on_card still forces isSimulated=false", cocTamper.isSimulated, false);

  // 2. Client cannot forge an online payment as non-simulated
  const cardAttempt = processPayment("card", 1500, "success");
  check("online card payment is strictly flagged isSimulated=true", cardAttempt.isSimulated, true);

  // 3. Settlement transition (unpaid -> paid) in store
  const unpaidOrder = store.placeOrder({
    type: "delivery",
    lines: [],
    itemCount: 1,
    subtotal: 1500,
    deliveryFee: 149,
    tax: 75,
    discount: 0,
    tip: 0,
    total: 1724,
    payment: "cod",
    paymentLabel: "Cash on Delivery",
    branchId: "bb-dha-karachi",
    branchName: "DHA Phase 6, Karachi",
    etaMinutes: 25,
    customer: { name: "Tariq", phone: "03211234567" },
  });

  check("pre-settlement paymentStatus is 'unpaid'", unpaidOrder.paymentStatus, "unpaid");

  // Settle it
  store.settleOrderPayment(unpaidOrder.id, "Rider Kashif");
  const settled = useStore.getState().orders.find((o) => o.id === unpaidOrder.id);
  check("settleOrderPayment marks paymentStatus as 'paid'", settled?.paymentStatus, "paid");
  const payEvent = settled?.timeline.find((t) => t.label.includes("Cash on Delivery"));
  check("settleOrderPayment marks timeline event done=true", payEvent?.done, true);

  // Duplicate settlement test: re-settling an already paid order is a safe no-op
  store.settleOrderPayment(unpaidOrder.id, "Staff 2");
  const reSettled = useStore.getState().orders.find((o) => o.id === unpaidOrder.id);
  check("duplicate settlement leaves paymentStatus as 'paid'", reSettled?.paymentStatus, "paid");

  // Cannot settle a cancelled order
  const cancelledTestOrder = store.placeOrder({
    type: "pickup",
    lines: [],
    itemCount: 1,
    subtotal: 800,
    deliveryFee: 0,
    tax: 40,
    discount: 0,
    tip: 0,
    total: 840,
    payment: "cod",
    paymentLabel: "Cash on Delivery",
    branchId: "bb-dha-karachi",
    branchName: "DHA Phase 6, Karachi",
    etaMinutes: 15,
    customer: { name: "Zain", phone: "03331234567" },
  });
  store.cancelOrder(cancelledTestOrder.id);
  store.settleOrderPayment(cancelledTestOrder.id, "Staff 3");
  const attemptedCancelled = useStore.getState().orders.find((o) => o.id === cancelledTestOrder.id);
  check("settling a cancelled order is refused (stays unpaid)", attemptedCancelled?.paymentStatus, "unpaid");
}

console.log("\n==============================================");
console.log(`  ${pass} passed, ${fail} failed`);
console.log("==============================================\n");

if (fail > 0) process.exit(1);

import { brand } from "@/config/brand";

/**
 * PRICING — single source of truth, shared by client and server.
 *
 * This module is deliberately free of React, zustand and "use client" so both
 * the browser store and the /api route handlers can import the exact same
 * numbers. Prices must never be duplicated: if the client and server disagree,
 * the server wins and the customer sees a different total than they were
 * promised.
 *
 * The server uses `priceOrder()`, which additionally validates the coupon's
 * `minSpend`. The client's `computeTotals()` applies whatever coupon is already
 * in the store, because `applyCoupon()` gates minSpend before it gets there.
 */

export interface Coupon {
  code: string;
  label: string;
  kind: "percent" | "flat" | "delivery";
  value: number;
  minSpend: number;
}

export const coupons: Coupon[] = [
  {
    code: "BLAZE20",
    label: "20% off your first order",
    kind: "percent",
    value: 0.2,
    minSpend: 800,
  },
  {
    code: "FREERIDE",
    label: "Free delivery",
    kind: "delivery",
    value: 1,
    minSpend: 1200,
  },
  {
    code: "BUN250",
    label: "Rs 250 off",
    kind: "flat",
    value: 250,
    minSpend: 1500,
  },
  {
    code: "STUDENT",
    label: "Student 20% off",
    kind: "percent",
    value: 0.2,
    minSpend: 0,
  },
];

export function findCoupon(code: string | null | undefined): Coupon | null {
  if (!code) return null;
  const needle = code.trim().toUpperCase();
  return coupons.find((c) => c.code === needle) ?? null;
}

export interface Totals {
  subtotal: number;
  itemCount: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  tip: number;
  total: number;
  freeDeliveryRemaining: number;
  qualifiesForFreeDelivery: boolean;
  belowMinimum: boolean;
}

export interface CartLineLike {
  unitPrice: number;
  qty: number;
}

/**
 * Client-facing totals from cart lines + an already-validated coupon.
 * Mirrors the original store implementation exactly.
 */
export function computeTotals(
  lines: CartLineLike[],
  orderType: string,
  coupon: Coupon | null,
  tip: number,
): Totals {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const itemCount = lines.reduce((s, l) => s + l.qty, 0);
  return totalsFromSubtotal({ subtotal, itemCount, orderType, coupon, tip });
}

/** Core arithmetic, shared by both entry points. */
function totalsFromSubtotal(args: {
  subtotal: number;
  itemCount: number;
  orderType: string;
  coupon: Coupon | null;
  tip: number;
}): Totals {
  const { subtotal, itemCount, orderType, coupon, tip } = args;

  // No items, no delivery fee — an empty bucket must total Rs 0, not Rs 149.
  let deliveryFee =
    orderType === "delivery" && itemCount > 0 ? brand.deliveryFee : 0;
  if (orderType === "delivery" && subtotal >= brand.freeDeliveryOver) {
    deliveryFee = 0;
  }

  let discount = 0;
  if (coupon) {
    if (coupon.kind === "percent") discount = subtotal * coupon.value;
    else if (coupon.kind === "flat") discount = coupon.value;
    else if (coupon.kind === "delivery") deliveryFee = 0;
  }

  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * brand.taxRate;
  const total = Math.max(0, taxable + deliveryFee + tax + tip);

  return {
    subtotal,
    itemCount,
    deliveryFee,
    discount,
    tax,
    tip,
    total,
    freeDeliveryRemaining: Math.max(0, brand.freeDeliveryOver - subtotal),
    qualifiesForFreeDelivery: subtotal >= brand.freeDeliveryOver,
    belowMinimum:
      orderType === "delivery" && subtotal > 0 && subtotal < brand.minOrder,
  };
}

export interface PriceOrderInput {
  subtotal: number;
  itemCount: number;
  orderType: string;
  couponCode?: string | null;
  tip?: number;
}

export interface PriceOrderResult extends Totals {
  couponCode: string | null;
  couponRejected: string | null;
  loyaltyEarned: number;
}

/**
 * Server-authoritative pricing.
 *
 * Differences from the client path, both intentional:
 *  - the coupon is looked up by code and its `minSpend` is ENFORCED here, so a
 *    tampered request cannot apply BLAZE20 to a Rs 300 cart;
 *  - a rejected coupon does not fail the order — it is dropped and reported via
 *    `couponRejected`, so the customer is charged correctly and told why.
 */
export function priceOrder(input: PriceOrderInput): PriceOrderResult {
  const requested = findCoupon(input.couponCode);
  const subtotal = Math.max(0, input.subtotal);

  let coupon = requested;
  let couponRejected: string | null = null;

  if (requested && subtotal < requested.minSpend) {
    coupon = null;
    couponRejected = `${requested.code} needs a minimum spend of Rs ${requested.minSpend.toLocaleString("en-PK")}.`;
  }

  const tip = Math.max(0, Math.round(input.tip ?? 0));
  const totals = totalsFromSubtotal({
    subtotal,
    itemCount: Math.max(0, input.itemCount),
    orderType: input.orderType,
    coupon,
    tip,
  });

  return {
    ...totals,
    couponCode: coupon?.code ?? null,
    couponRejected,
    // Must match the client store exactly: 2% back on the paid total.
    loyaltyEarned: Math.round(totals.total * brand.loyalty.pointsPerRupee),
  };
}

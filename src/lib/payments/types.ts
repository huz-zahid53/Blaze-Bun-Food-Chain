/**
 * Payment system types — shared by client and server.
 *
 * This module is deliberately free of React, zustand, and "use client" so both
 * the browser store and the /api route handlers can import the exact same
 * definitions.
 */

/* ------------------------------------------------------------------ methods */

/** The five supported payment method IDs. */
export const PAYMENT_METHOD_IDS = [
  "cod",
  "cash_on_card",
  "card",
  "jazzcash",
  "easypaisa",
  "bank",
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHOD_IDS)[number];

/** How a payment is processed. */
export type PaymentMode = "demo" | "sandbox" | "live" | "delivery";

/* ----------------------------------------------------------------- statuses */

/**
 * Financial lifecycle of a payment, separate from order fulfillment status.
 *
 * - unpaid:   no payment attempted or payment is collected offline (COD).
 * - pending:  a payment attempt is in progress.
 * - paid:     a payment attempt succeeded (or was simulated as success).
 * - failed:   the most recent payment attempt was declined.
 * - refunded: a paid order was refunded.
 */
export const PAYMENT_STATUSES = [
  "unpaid",
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/**
 * Status of an individual payment attempt in the ledger.
 * An order may have multiple attempts (e.g. first declined, second paid).
 */
export const ATTEMPT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "cancelled",
  "refunded",
] as const;

export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number];

/* ---------------------------------------------------------- demo outcomes */

/** Outcomes a portfolio visitor may select from the demo UI. */
export const DEMO_OUTCOMES = ["success", "failure", "cancelled"] as const;
export type DemoOutcome = (typeof DEMO_OUTCOMES)[number];

/* ---------------------------------------------------------- payment result */

/** What a payment provider returns after processing. */
export interface PaymentResult {
  /** Whether the payment was collected successfully. */
  success: boolean;
  /** The financial status to persist on the order. */
  paymentStatus: PaymentStatus;
  /** The attempt-level status for the ledger row. */
  attemptStatus: AttemptStatus;
  /** A unique reference for this transaction attempt. */
  reference: string;
  /** Whether this was a simulated (demo) transaction. */
  isSimulated: boolean;
  /** Processing mode (demo, sandbox, live, delivery). */
  mode: PaymentMode;
  /** Human-readable message for the customer. */
  message: string;
  /** Optional provider-specific metadata. */
  providerData?: Record<string, unknown>;
}

/* ----------------------------------------------------------- classification */

/** Whether a payment method collects payment online or at delivery. */
export function isOnlinePayment(method: PaymentMethodId): boolean {
  return method === "card" || method === "jazzcash" || method === "easypaisa" || method === "bank";
}

/** Whether a method collects payment at the door. */
export function isDeliveryPayment(method: PaymentMethodId): boolean {
  return method === "cod" || method === "cash_on_card";
}

/** Returns the processing mode for a payment method. */
export function paymentMode(method: PaymentMethodId): PaymentMode {
  if (isDeliveryPayment(method)) return "delivery";
  // All online methods currently run in demo mode.
  return "demo";
}

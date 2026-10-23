/**
 * Demo payment simulator.
 *
 * Produces deterministic payment results for Card, JazzCash, EasyPaisa, and
 * Bank Transfer based on a user-selected outcome (success / failure / cancelled).
 *
 * Server-only: imported by the order route handler. The browser never runs this
 * directly — it sends an outcome hint, and the server decides the authoritative
 * result.
 */

import type {
  PaymentMethodId,
  PaymentResult,
  DemoOutcome,
} from "./types";

/** Generate a unique simulated transaction reference. */
export function simulatedReference(method: PaymentMethodId): string {
  const prefix: Record<string, string> = {
    card: "SIM-CARD",
    jazzcash: "SIM-JC",
    easypaisa: "SIM-EP",
    bank: "SIM-BNK",
  };
  const tag = prefix[method] ?? "SIM";
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${tag}-${ts}-${rand}`;
}

/** Human-readable provider labels for messages. */
const providerLabel: Record<string, string> = {
  card: "Card Gateway (Demo)",
  jazzcash: "JazzCash (Demo)",
  easypaisa: "EasyPaisa (Demo)",
  bank: "Bank Transfer (Demo)",
};

/**
 * Process a simulated online payment.
 *
 * The `outcome` parameter comes from the client's demo UI. The server validates
 * it against the allowed set and produces the authoritative payment result.
 */
export function processSimulatedPayment(
  method: PaymentMethodId,
  amount: number,
  outcome: DemoOutcome,
): PaymentResult {
  const reference = simulatedReference(method);
  const label = providerLabel[method] ?? "Payment Simulator";

  switch (outcome) {
    case "success":
      return {
        success: true,
        paymentStatus: "paid",
        attemptStatus: "paid",
        reference,
        isSimulated: true,
        mode: "demo",
        message: `${label} — payment of Rs ${Math.round(amount).toLocaleString("en-PK")} approved.`,
        providerData: {
          provider: method,
          outcome: "success",
          simulatedAt: new Date().toISOString(),
        },
      };

    case "failure":
      return {
        success: false,
        paymentStatus: "failed",
        attemptStatus: "failed",
        reference,
        isSimulated: true,
        mode: "demo",
        message: `${label} — payment declined. Insufficient funds (simulated).`,
        providerData: {
          provider: method,
          outcome: "failure",
          declineReason: "insufficient_funds",
          simulatedAt: new Date().toISOString(),
        },
      };

    case "cancelled":
      return {
        success: false,
        paymentStatus: "unpaid",
        attemptStatus: "cancelled",
        reference,
        isSimulated: true,
        mode: "demo",
        message: `${label} — payment was cancelled by the customer.`,
        providerData: {
          provider: method,
          outcome: "cancelled",
          simulatedAt: new Date().toISOString(),
        },
      };
  }
}

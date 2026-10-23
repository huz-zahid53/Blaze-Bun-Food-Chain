/**
 * Payment module entry point.
 *
 * Re-exports types and provides `processPayment()` — the single function the
 * order route handler calls to get an authoritative payment result.
 */

export * from "./types";
export { processSimulatedPayment, simulatedReference } from "./simulator";
export { processDeliveryPayment } from "./cod";

import type { PaymentMethodId, PaymentResult, DemoOutcome } from "./types";
import { isDeliveryPayment, isOnlinePayment, PAYMENT_METHOD_IDS } from "./types";
import { processSimulatedPayment } from "./simulator";
import { processDeliveryPayment } from "./cod";

/**
 * Validate that a payment method ID is in the allowlist.
 * Returns the typed ID or null if invalid.
 */
export function validatePaymentMethod(
  method: unknown,
): PaymentMethodId | null {
  if (typeof method !== "string") return null;
  return (PAYMENT_METHOD_IDS as readonly string[]).includes(method)
    ? (method as PaymentMethodId)
    : null;
}

/**
 * Process a payment for the given method and amount.
 *
 * For delivery methods (COD, Cash on Card), `demoOutcome` is ignored.
 * For online methods (Card, JazzCash, EasyPaisa, Bank), `demoOutcome`
 * controls the simulated result.
 */
export function processPayment(
  method: PaymentMethodId,
  amount: number,
  demoOutcome?: DemoOutcome,
): PaymentResult {
  if (isDeliveryPayment(method)) {
    return processDeliveryPayment(method, amount);
  }

  if (isOnlinePayment(method)) {
    // Default to success if no outcome specified (backward compatibility).
    const outcome = demoOutcome ?? "success";
    return processSimulatedPayment(method, amount, outcome);
  }

  // Fallback for any future method — treat as delivery.
  return processDeliveryPayment(method, amount);
}

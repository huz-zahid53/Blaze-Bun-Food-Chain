/**
 * Delivery-payment handler for COD and Cash on Card.
 *
 * These methods do not process an online payment. They create the order with
 * payment_status = 'unpaid' and wait for the rider to collect payment.
 */

import type { PaymentMethodId, PaymentResult } from "./types";

/**
 * "Process" a delivery payment — which means recording that payment is due at
 * the doorstep and returning a reference for the order record.
 */
export function processDeliveryPayment(
  method: PaymentMethodId,
  amount: number,
): PaymentResult {
  const label = method === "cash_on_card"
    ? "Cash on Card"
    : "Cash on Delivery";

  return {
    success: true, // Order creation succeeds; payment is collected later.
    paymentStatus: "unpaid",
    attemptStatus: "pending",
    reference: `DEL-${Date.now().toString(36).toUpperCase()}`,
    isSimulated: false,
    mode: "delivery",
    message: `${label} — Rs ${Math.round(amount).toLocaleString("en-PK")} due when your order arrives.`,
    providerData: {
      provider: method,
      collectedAt: null,
    },
  };
}

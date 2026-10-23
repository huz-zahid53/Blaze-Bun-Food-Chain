import { ok, fail, notConfigured, str, isAdminAuthorized } from "@/lib/api";
import { db, isDbConfigured } from "@/lib/db";
import { peekGuestToken } from "@/lib/guest-token";

export const dynamic = "force-dynamic";

const ADVANCE: Record<string, string> = {
  placed: "confirmed",
  confirmed: "preparing",
  preparing: "on-the-flame",
  "on-the-flame": "out-for-delivery",
  "out-for-delivery": "delivered",
};

/**
 * GET /api/orders/[number]
 * A guest may read their own order (token must match); an admin may read any.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ number: string }> },
) {
  if (!isDbConfigured) return notConfigured();
  const { number } = await params;
  const client = db();

  const { data: order, error } = await client
    .from("orders")
    .select("*")
    .eq("order_number", number)
    .maybeSingle();

  if (error) return fail(500, "Could not read the order.", error.message);
  if (!order) return fail(404, "No order with that number.");

  const token = await peekGuestToken();
  const authorized = isAdminAuthorized(req) || order.client_token === token;
  if (!authorized) {
    // Deliberately 404, not 403 — do not confirm the number exists.
    return fail(404, "No order with that number.");
  }

  const { data: items, error: itemsErr } = await client
    .from("order_items")
    .select("*")
    .eq("order_id", order.id)
    .order("position", { ascending: true });

  if (itemsErr) return fail(500, "Could not read order items.", itemsErr.message);

  return ok({ order, items: items ?? [] });
}

/**
 * PATCH /api/orders/[number]  — admin only.
 * Body: { status } or { advance: true }
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ number: string }> },
) {
  // Authorise before revealing anything about server configuration.
  if (!isAdminAuthorized(req)) {
    return fail(401, "Admin token required to change order status or settle payment.");
  }
  if (!isDbConfigured) return notConfigured();

  const { number } = await params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const client = db();
  const { data: current, error: readErr } = await client
    .from("orders")
    .select(
      "id, order_number, status, order_type, payment_method, payment_status, total, is_simulated, settled_at, settled_by",
    )
    .eq("order_number", number)
    .maybeSingle();

  if (readErr) return fail(500, "Could not read the order.", readErr.message);
  if (!current) return fail(404, "No order with that number.");

  const updatePayload: Record<string, unknown> = {};

  // --- Payment settlement handling (COD & Cash on Card) ---
  const wantsPaymentConfirm =
    body?.confirm_payment === true || body?.payment_status === "paid";
  const explicitPaymentStatus = str(body?.payment_status, 20);

  if (wantsPaymentConfirm) {
    if (current.status === "cancelled") {
      return fail(400, "Cannot settle payment for a cancelled order.");
    }
    if (current.payment_status === "paid") {
      return fail(409, "Payment for this order has already been settled.");
    }
    const settledAt = new Date().toISOString();
    const settledBy = str(body?.settled_by, 60) || "admin-pos";

    updatePayload.payment_status = "paid";
    updatePayload.settled_at = settledAt;
    updatePayload.settled_by = settledBy;

    // Log the settlement attempt in the audit ledger
    await client.from("payment_attempts").insert({
      order_id: current.id,
      method: current.payment_method ?? "delivery",
      mode: "delivery",
      status: "paid",
      reference: `SETTLE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      amount: current.total,
      is_simulated: false,
      provider_data: {
        settled_by: settledBy,
        settled_at: settledAt,
        method: current.payment_method,
        note: str(body?.note, 200) || "Doorstep collection confirmed by staff",
      },
    });
  } else if (
    explicitPaymentStatus &&
    explicitPaymentStatus !== current.payment_status
  ) {
    return fail(
      400,
      `Invalid payment transition from '${current.payment_status}' to '${explicitPaymentStatus}'. Only settlement to 'paid' is permitted.`,
    );
  }

  // --- Fulfillment status advancement ---
  let next = str(body?.status, 30) || null;
  if (body?.advance) {
    // Pick-up terminates at ready-for-pickup, never out-for-delivery.
    next =
      current.order_type === "pickup" && current.status === "on-the-flame"
        ? "ready-for-pickup"
        : (ADVANCE[current.status] ?? current.status);
  }

  if (next) {
    updatePayload.status = next;
  }

  if (Object.keys(updatePayload).length === 0) {
    return fail(
      400,
      "Provide `status`, `advance: true`, or `confirm_payment: true`.",
    );
  }

  const { data: updated, error } = await client
    .from("orders")
    .update(updatePayload)
    .eq("id", current.id)
    .select(
      "order_number, status, payment_status, settled_at, settled_by, updated_at",
    )
    .single();

  if (error) return fail(500, "Could not update the order.", error.message);
  return ok(updated);
}

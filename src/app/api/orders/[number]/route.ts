import { ok, fail, notConfigured, str, isAdminAuthorized } from "@/lib/api";
import { db, isDbConfigured } from "@/lib/db";
import { peekGuestToken } from "@/lib/guest-token";

export const dynamic = "force-dynamic";

const STATUSES = [
  "placed",
  "confirmed",
  "preparing",
  "on-the-flame",
  "out-for-delivery",
  "ready-for-pickup",
  "delivered",
  "cancelled",
] as const;

type OrderStatus = (typeof STATUSES)[number];

const ADVANCE: Record<string, OrderStatus> = {
  placed: "confirmed",
  confirmed: "preparing",
  preparing: "on-the-flame",
  "on-the-flame": "out-for-delivery",
  "out-for-delivery": "delivered",
};

/** Permitted lifecycle transitions per current state */
const VALID_TRANSITIONS: Record<string, readonly OrderStatus[]> = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["on-the-flame", "cancelled"],
  "on-the-flame": ["out-for-delivery", "ready-for-pickup", "cancelled"],
  "out-for-delivery": ["delivered", "cancelled"],
  "ready-for-pickup": ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
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

  if (error) {
    console.error("[Orders Error] Could not read order:", error.message);
    return fail(500, "Could not read the order.");
  }
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

  if (itemsErr) {
    console.error("[Orders Error] Could not read order items:", itemsErr.message);
    return fail(500, "Could not read order items.");
  }

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
    return fail(401, "Admin token required to change order status.");
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
    .select("id, status, order_type")
    .eq("order_number", number)
    .maybeSingle();

  if (readErr) {
    console.error("[Orders Error] Read current order failed:", readErr.message);
    return fail(500, "Could not read the order.");
  }
  if (!current) return fail(404, "No order with that number.");

  // Terminal states cannot be altered or advanced
  if (current.status === "delivered" || current.status === "cancelled") {
    return fail(400, `Cannot modify an order that is already ${current.status}.`);
  }

  let next: OrderStatus | null = null;

  if (body?.advance) {
    // Pick-up terminates at ready-for-pickup, never out-for-delivery.
    next =
      current.order_type === "pickup" && current.status === "on-the-flame"
        ? "ready-for-pickup"
        : (ADVANCE[current.status] ?? null);

    if (!next) {
      return fail(400, `Order in status '${current.status}' cannot be advanced further.`);
    }
  } else if (body?.status !== undefined) {
    const rawStatus = str(body?.status, 30);
    if (!(STATUSES as readonly string[]).includes(rawStatus)) {
      return fail(400, `Invalid order status: ${rawStatus}`);
    }

    next = rawStatus as OrderStatus;
    if (next === current.status) {
      return fail(400, `Order is already in status '${next}'.`);
    }

    // Verify pick-up compatibility
    if (current.order_type === "pickup" && next === "out-for-delivery") {
      return fail(400, "Pick-up orders cannot be transitioned to out-for-delivery.");
    }

    // Enforce legitimate state-machine transition
    const allowed = VALID_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(next)) {
      return fail(
        400,
        `Invalid status transition from '${current.status}' to '${next}'. Allowed: ${allowed.join(", ") || "none"}.`,
      );
    }
  }

  if (!next) return fail(400, "Provide valid `status` or `advance: true`.");

  const { data: updated, error } = await client
    .from("orders")
    .update({ status: next })
    .eq("id", current.id)
    .select("order_number, status, updated_at")
    .single();

  if (error) {
    console.error("[Orders Error] Failed to update order status:", error.message);
    return fail(500, "Could not update the order.");
  }
  return ok(updated);
}

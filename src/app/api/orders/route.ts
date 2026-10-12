import { ok, fail, notConfigured, str, num, isAdminAuthorized } from "@/lib/api";
import { db, isDbConfigured } from "@/lib/db";
import { getGuestToken, peekGuestToken } from "@/lib/guest-token";
import { orderNumber } from "@/lib/utils";

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

const ORDER_TYPES = ["delivery", "pickup", "catering"] as const;

/**
 * POST /api/orders — place an order.
 *
 * The server re-validates every price against the menu rather than trusting
 * the client's arithmetic: a tampered request body cannot buy a Rs 1,150
 * burger for Rs 1.
 */
export async function POST(req: Request) {
  const token = await getGuestToken();
  if (!isDbConfigured) return notConfigured();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Expected a JSON body.");
  }

  const orderType = ORDER_TYPES.includes(body?.type) ? body.type : null;
  if (!orderType) return fail(400, "orderType must be delivery, pickup or catering.");

  const name = str(body?.customer?.name, 120);
  const phone = str(body?.customer?.phone, 32);
  if (name.length < 2) return fail(400, "Customer name is required.");
  if (!/^[+0-9 ()-]{7,20}$/.test(phone)) return fail(400, "A valid phone number is required.");

  const rawLines = Array.isArray(body?.lines) ? body.lines : [];
  if (rawLines.length === 0) return fail(400, "Cannot place an empty order.");
  if (rawLines.length > 60) return fail(400, "Too many lines in one order.");

  // --- Server-side repricing -------------------------------------------
  const { menuItems } = await import("@/data/menu");
  const byId = new Map(menuItems.map((i) => [i.slug, i]));

  const items = [];
  let subtotal = 0;
  let itemCount = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const l = rawLines[i];
    const item = byId.get(str(l?.slug, 80));
    if (!item) return fail(400, `Unknown menu item: ${str(l?.slug, 80)}`);

    const qty = Math.round(num(l?.qty, 1, 50, 1));
    itemCount += qty;

    // Base price comes from the menu, never from the request.
    let unit = item.price;

    // Size: accept only a size that actually exists on this item.
    const sizeLabel = str(l?.size?.label, 40) || null;
    if (sizeLabel) {
      const size = (item.sizes ?? []).find((s) => s.label === sizeLabel);
      if (!size) return fail(400, `Unknown size "${sizeLabel}" for ${item.name}.`);
      unit += size.delta;
    }

    // Options / add-ons: only known ids contribute a price delta.
    const options = Array.isArray(l?.options) ? l.options.slice(0, 20) : [];
    const addons = Array.isArray(l?.addOns) ? l.addOns.slice(0, 20) : [];

    for (const o of options) {
      const group = (item.options ?? []).find((g) => g.id === str(o?.groupId, 40));
      const choice = group?.choices.find((c) => c.id === str(o?.choiceId, 40));
      if (choice) unit += choice.delta;
    }
    for (const a of addons) {
      const add = (item.addOns ?? []).find((x) => x.id === str(a?.id, 40));
      if (add) unit += add.price;
    }

    const lineTotal = unit * qty;
    subtotal += lineTotal;

    items.push({
      position: i,
      slug: item.slug,
      name: item.name,
      category_id: item.categoryId,
      qty,
      base_price: item.price,
      unit_price: unit,
      line_total: lineTotal,
      size_label: sizeLabel,
      options,
      addons,
      note: str(l?.note, 240) || null,
    });
  }

  // --- Totals recomputed from brand config, not from the client ---------
  const { priceOrder } = await import("@/lib/pricing");

  const couponCode = str(body?.couponCode, 32) || null;
  const tip = Math.round(num(body?.tip, 0, 5000, 0));

  const totals = priceOrder({
    subtotal,
    itemCount,
    orderType,
    couponCode,
    tip,
  });

  const number = str(body?.number, 24) || orderNumber();

  // --- Insert ----------------------------------------------------------
  const client = db();
  const { data: order, error: orderErr } = await client
    .from("orders")
    .insert({
      order_number: number,
      client_token: token,
      status: "placed",
      order_type: orderType,
      branch_id: str(body?.branchId, 60) || null,
      branch_name: str(body?.branchName, 120) || null,
      customer_name: name,
      customer_phone: phone,
      customer_email: str(body?.customer?.email, 160) || null,
      address: str(body?.customer?.address, 300) || null,
      area: str(body?.customer?.area, 120) || null,
      city: str(body?.customer?.city, 80) || null,
      instructions: str(body?.customer?.instructions, 500) || null,
      slot: str(body?.customer?.slot, 60) || null,
      subtotal: totals.subtotal,
      delivery_fee: totals.deliveryFee,
      discount: totals.discount,
      tax: totals.tax,
      tip: totals.tip,
      total: totals.total,
      payment_method: str(body?.payment, 40) || null,
      payment_label: str(body?.paymentLabel, 80) || null,
      coupon_code: totals.couponCode,
      item_count: itemCount,
      eta_minutes: Math.round(num(body?.etaMinutes, 5, 240, 30)),
      loyalty_earned: totals.loyaltyEarned,
    })
    .select("id, order_number, status, total, placed_at")
    .single();

  if (orderErr) {
    // A duplicate order_number means the client's proposed number collided.
    if (String(orderErr.message).includes("orders_order_number_key")) {
      return fail(409, "That order number already exists. Retry — a new one will be issued.");
    }
    return fail(500, "Could not create the order.", orderErr.message);
  }

  const { error: itemsErr } = await client
    .from("order_items")
    .insert(items.map((i) => ({ ...i, order_id: order.id })));

  if (itemsErr) {
    // Roll the order back rather than leaving a header with no lines.
    await client.from("orders").delete().eq("id", order.id);
    return fail(500, "Could not save order items.", itemsErr.message);
  }

  return ok(
    {
      id: order.id,
      number: order.order_number,
      status: order.status,
      total: Number(order.total),
      placedAt: order.placed_at,
      totals,
    },
    { status: 201 },
  );
}

/**
 * GET /api/orders — this guest's order history.
 * With a valid ADMIN_TOKEN it returns every order (used by the POS console).
 */
export async function GET(req: Request) {
  if (!isDbConfigured) return notConfigured();

  const client = db();
  const admin = isAdminAuthorized(req);

  if (admin) {
    const limit = num(new URL(req.url).searchParams.get("limit"), 1, 500, 100);
    const status = new URL(req.url).searchParams.get("status");
    let q = client.from("orders").select("*").order("placed_at", { ascending: false }).limit(limit);
    if (status && (STATUSES as readonly string[]).includes(status)) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return fail(500, "Could not list orders.", error.message);
    return ok({ scope: "admin", orders: data ?? [] });
  }

  const token = await peekGuestToken();
  if (!token) return ok({ scope: "guest", orders: [] });

  const { data, error } = await client
    .from("orders")
    .select("*")
    .eq("client_token", token)
    .order("placed_at", { ascending: false })
    .limit(50);

  if (error) return fail(500, "Could not list your orders.", error.message);
  return ok({ scope: "guest", orders: data ?? [] });
}

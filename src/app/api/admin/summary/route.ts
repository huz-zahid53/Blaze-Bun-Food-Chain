import { ok, fail, notConfigured, isAdminAuthorized, num } from "@/lib/api";
import { db, isDbConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/summary — KPI payload for the POS dashboard.
 * Requires the ADMIN_TOKEN secret.
 *
 * Aggregation runs in JS over the most recent `days` of orders rather than in
 * SQL. That is fine at launch volume and keeps the schema migration-free, but
 * at scale this should move to the `daily_revenue` view (already defined in
 * supabase/schema.sql) or a Postgres RPC.
 */
export async function GET(req: Request) {
  // Authorisation is checked BEFORE configuration, so an unauthenticated
  // caller cannot probe whether this server has a database configured.
  if (!isAdminAuthorized(req)) {
    return fail(401, "Admin token required.");
  }
  if (!isDbConfigured) return notConfigured();

  const url = new URL(req.url);
  const days = Math.round(num(url.searchParams.get("days"), 1, 90, 7));
  const since = new Date(Date.now() - days * 86_400_000).toISOString();

  const client = db();

  const [{ data: orders, error: oErr }, { data: items, error: iErr }, { data: stock, error: sErr }] =
    await Promise.all([
      client
        .from("orders")
        .select(
          "id,order_number,status,order_type,branch_id,branch_name,total,subtotal,discount,delivery_fee,tax,tip,payment_method,placed_at",
        )
        .gte("placed_at", since)
        .order("placed_at", { ascending: false })
        .limit(2000),
      client
        .from("order_items")
        .select("slug,name,qty,line_total,orders!inner(placed_at)")
        .gte("orders.placed_at", since)
        .limit(5000),
      client.from("inventory").select("*").limit(500),
    ]);

  if (oErr) {
    console.error("[Summary Error] Could not load orders:", oErr.message);
    return fail(500, "Could not load orders.");
  }
  if (iErr) {
    console.error("[Summary Error] Could not load order items:", iErr.message);
    return fail(500, "Could not load order items.");
  }
  if (sErr) {
    console.error("[Summary Error] Could not load inventory:", sErr.message);
    return fail(500, "Could not load inventory.");
  }

  const rows = (orders ?? []).filter((o) => o.status !== "cancelled");
  const n = (v: unknown) => Number(v ?? 0);

  // --- KPIs ---
  const revenue = rows.reduce((s, o) => s + n(o.total), 0);
  const count = rows.length;
  const aov = count ? revenue / count : 0;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayRows = rows.filter((o) => new Date(o.placed_at) >= startOfToday);
  const today = {
    revenue: todayRows.reduce((s, o) => s + n(o.total), 0),
    orders: todayRows.length,
    aov: todayRows.length
      ? todayRows.reduce((s, o) => s + n(o.total), 0) / todayRows.length
      : 0,
  };

  // --- Daily revenue series (oldest → newest) ---
  const byDay = new Map<string, { day: string; revenue: number; orders: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    byDay.set(d.toISOString().slice(0, 10), {
      day: d.toISOString().slice(0, 10),
      revenue: 0,
      orders: 0,
    });
  }
  for (const o of rows) {
    const key = new Date(o.placed_at).toISOString().slice(0, 10);
    const bucket = byDay.get(key);
    if (bucket) {
      bucket.revenue += n(o.total);
      bucket.orders += 1;
    }
  }
  const daily = [...byDay.values()];

  // --- Mixes ---
  const tally = (key: (r: any) => string | null) => {
    const m = new Map<string, number>();
    for (const r of rows) {
      const k = key(r) ?? "unknown";
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  };

  const paymentMix = tally((o) => o.payment_method);
  const fulfilmentMix = tally((o) => o.order_type);
  const statusCounts = tally((o) => o.status);

  // --- Branch performance ---
  const branchMap = new Map<string, { name: string; orders: number; revenue: number }>();
  for (const o of rows) {
    const id = o.branch_id ?? "unassigned";
    const b = branchMap.get(id) ?? { name: o.branch_name ?? "Unassigned", orders: 0, revenue: 0 };
    b.orders += 1;
    b.revenue += n(o.total);
    branchMap.set(id, b);
  }
  const branches = [...branchMap.entries()]
    .map(([id, v]) => ({
      id,
      name: v.name,
      orders: v.orders,
      revenue: v.revenue,
      aov: v.orders ? v.revenue / v.orders : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // --- Top sellers ---
  const sellerMap = new Map<string, { slug: string; name: string; units: number; revenue: number }>();
  for (const it of items ?? []) {
    const s = sellerMap.get(it.slug) ?? { slug: it.slug, name: it.name, units: 0, revenue: 0 };
    s.units += n(it.qty);
    s.revenue += n(it.line_total);
    sellerMap.set(it.slug, s);
  }
  const topSellers = [...sellerMap.values()].sort((a, b) => b.units - a.units).slice(0, 10);

  // --- Totals breakdown ---
  const breakdown = {
    subtotal: rows.reduce((s, o) => s + n(o.subtotal), 0),
    discount: rows.reduce((s, o) => s + n(o.discount), 0),
    deliveryFee: rows.reduce((s, o) => s + n(o.delivery_fee), 0),
    tax: rows.reduce((s, o) => s + n(o.tax), 0),
    tip: rows.reduce((s, o) => s + n(o.tip), 0),
  };

  return ok({
    days,
    generatedAt: new Date().toISOString(),
    kpi: { revenue, orders: count, aov, today },
    daily,
    paymentMix,
    fulfilmentMix,
    statusCounts,
    branches,
    topSellers,
    breakdown,
    inventory: stock ?? [],
  });
}

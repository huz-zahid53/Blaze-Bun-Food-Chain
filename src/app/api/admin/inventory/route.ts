import { ok, fail, notConfigured, str, num, isAdminAuthorized } from "@/lib/api";
import { db, isDbConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/admin/inventory — stock state for every menu item. Admin only. */
export async function GET(req: Request) {
  if (!isAdminAuthorized(req)) return fail(401, "Admin token required.");
  if (!isDbConfigured) return notConfigured();

  const { data, error } = await db().from("inventory").select("*").order("item_slug");
  if (error) {
    console.error("[Inventory Error] Load failed:", error.message);
    return fail(500, "Could not load inventory.");
  }
  return ok({ inventory: data ?? [] });
}

/**
 * PATCH /api/admin/inventory — toggle stock or set a count for one item.
 * Body: { slug, inStock?, stockCount? }
 */
export async function PATCH(req: Request) {
  if (!isAdminAuthorized(req)) return fail(401, "Admin token required.");
  if (!isDbConfigured) return notConfigured();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Expected a JSON body.");
  }

  const slug = str(body?.slug, 80);
  if (!slug) return fail(400, "slug is required.");

  // Reject slugs that are not real menu items.
  const { menuItems } = await import("@/data/menu");
  if (!menuItems.some((i) => i.slug === slug)) {
    return fail(400, `Unknown menu item: ${slug}`);
  }

  const patch: Record<string, unknown> = { item_slug: slug };
  if (typeof body?.inStock === "boolean") patch.in_stock = body.inStock;
  if (body?.stockCount !== undefined) {
    patch.stock_count = Math.round(num(body.stockCount, 0, 100000, 0));
  }
  if (Object.keys(patch).length === 1) {
    return fail(400, "Provide inStock and/or stockCount.");
  }

  const { data, error } = await db()
    .from("inventory")
    .upsert(patch, { onConflict: "item_slug" })
    .select("*")
    .single();

  if (error) {
    console.error("[Inventory Error] Update failed:", error.message);
    return fail(500, "Could not update inventory.");
  }
  return ok(data);
}

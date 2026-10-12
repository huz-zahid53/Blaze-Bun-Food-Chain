import { ok, fail, notConfigured } from "@/lib/api";
import { db, isDbConfigured } from "@/lib/db";
import { getGuestToken } from "@/lib/guest-token";

export const dynamic = "force-dynamic";

/** Hard cap on the stored cart blob — protects against abuse. */
const MAX_BLOB_BYTES = 64 * 1024;

/**
 * GET /api/state
 * Returns this guest's persisted cart/loyalty blob, or `null` if none yet.
 * Sets the guest cookie on first contact.
 */
export async function GET() {
  const token = await getGuestToken();
  if (!isDbConfigured) return notConfigured();

  const { data, error } = await db()
    .from("guest_state")
    .select("state, updated_at")
    .eq("client_token", token)
    .maybeSingle();

  if (error) return fail(500, "Could not read guest state.", error.message);
  return ok({ token, state: data?.state ?? null, updatedAt: data?.updated_at ?? null });
}

/**
 * PUT /api/state
 * Upserts the guest's cart blob. Debounced by the client.
 */
export async function PUT(req: Request) {
  const token = await getGuestToken();
  if (!isDbConfigured) return notConfigured();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Expected a JSON body.");
  }

  const raw = JSON.stringify(body ?? {});
  if (raw.length > MAX_BLOB_BYTES) {
    return fail(413, `Cart state is too large (${raw.length} bytes; max ${MAX_BLOB_BYTES}).`);
  }

  const { error } = await db().from("guest_state").upsert(
    { client_token: token, state: body ?? {} },
    { onConflict: "client_token" },
  );

  if (error) return fail(500, "Could not save guest state.", error.message);
  return ok({ saved: true });
}

/** Kept for symmetry so a guest can wipe their own cart server-side. */
export async function DELETE() {
  const token = await getGuestToken();
  if (!isDbConfigured) return notConfigured();
  const { error } = await db().from("guest_state").delete().eq("client_token", token);
  if (error) return fail(500, "Could not clear guest state.", error.message);
  return ok({ cleared: true });
}

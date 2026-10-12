import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SERVICE ROLE key.
 *
 * The `server-only` import at the top makes this module a hard build error if
 * anything in the browser bundle ever imports it — that is the guardrail that
 * keeps the service-role key out of the client.
 *
 * RLS is enabled on every table with NO anon/authenticated policies, so this
 * key is the only way in. Authorisation is enforced in the route handlers:
 *   - guest order/state reads require a matching `client_token` cookie
 *   - admin reads require the `ADMIN_TOKEN` secret
 */

const url = process.env.SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

/** True when both env vars are present, so the app can talk to the cloud. */
export const isDbConfigured = Boolean(url && serviceKey);

/**
 * Human-readable reason the cloud is unavailable — surfaced by /api/health so
 * misconfiguration is obvious instead of silently falling back.
 */
export function dbConfigReport() {
  const missing: string[] = [];
  if (!url) missing.push("SUPABASE_URL");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  return {
    configured: isDbConfigured,
    missing,
    // Safe to expose: the URL is public by design, the key never is.
    url: url ?? null,
  };
}

let cached: SupabaseClient | null = null;

/** Returns the shared service-role client, or throws if not configured. */
export function db(): SupabaseClient {
  if (!isDbConfigured) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in .env.local (see .env.example).",
    );
  }
  if (!cached) {
    cached = createClient(url as string, serviceKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: "public" },
    });
  }
  return cached;
}

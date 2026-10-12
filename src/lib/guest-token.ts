import "server-only";

import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

/**
 * Guest identity — a random UUID kept in an httpOnly cookie.
 *
 * This replaces localStorage entirely. It scopes a guest's cart and order
 * history without an account, and because it is httpOnly it is invisible to
 * page scripts (so it cannot be read or forged by injected extension code).
 *
 * It is NOT a security boundary on its own: anyone holding the cookie can read
 * that guest's orders. That is the same trust level as "remember my cart", and
 * it is why admin endpoints require a separate ADMIN_TOKEN secret.
 */

export const GUEST_COOKIE = "bb_guest";

const YEAR = 60 * 60 * 24 * 365;

/** Reads the guest token, creating and persisting one if absent. */
export async function getGuestToken(): Promise<string> {
  const store = await cookies();
  const existing = store.get(GUEST_COOKIE)?.value;
  if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;

  const token = randomUUID();
  store.set(GUEST_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: YEAR,
  });
  return token;
}

/** Reads the token without creating one (for endpoints that must not set cookies). */
export async function peekGuestToken(): Promise<string | null> {
  const store = await cookies();
  const v = store.get(GUEST_COOKIE)?.value;
  return v && /^[0-9a-f-]{36}$/i.test(v) ? v : null;
}

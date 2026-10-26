import "server-only";

import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { isDbConfigured } from "@/lib/db";

/** Shared response + auth helpers for the /api route handlers. */

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(status: number, message: string, extra?: unknown) {
  return NextResponse.json({ ok: false, error: message, ...(extra ? { extra } : {}) }, { status });
}

/**
 * 503 with an actionable message when Supabase env vars are missing.
 * Lets the client fall back to in-memory mode instead of hard-failing, so the
 * site keeps working before the database is wired up.
 */
export function notConfigured() {
  return fail(
    503,
    "Cloud storage is not configured on this server. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, then run supabase/schema.sql.",
    { configured: isDbConfigured },
  );
}


/**
 * Admin gate. Compares against the ADMIN_TOKEN env secret using constant-time
 * comparison over fixed-length SHA-256 digests.
 *
 * Accepts credentials ONLY via the x-admin-token request header (never via URL query params).
 */
export function isAdminAuthorized(req: Request): boolean {
  const secret = process.env.ADMIN_TOKEN?.trim();
  if (!secret) return false; // no secret configured => admin API is closed

  const provided = req.headers.get("x-admin-token")?.trim() ?? "";
  if (!provided) return false;

  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

/** Trims and caps a string field from an untrusted request body. */
export function str(v: unknown, max = 500): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Coerces to a finite number within a range, else returns the fallback. */
export function num(v: unknown, min: number, max: number, fallback = 0): number {
  const n = typeof v === "string" ? Number(v) : (v as number);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

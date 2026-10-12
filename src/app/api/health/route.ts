import { ok } from "@/lib/api";
import { dbConfigReport, isDbConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Reports whether cloud storage is wired up. The client uses this to decide
 * between cloud mode and in-memory fallback, and it makes misconfiguration
 * visible instead of silent.
 */
export async function GET() {
  return ok({
    status: isDbConfigured ? "cloud" : "local-fallback",
    ...dbConfigReport(),
    time: new Date().toISOString(),
  });
}

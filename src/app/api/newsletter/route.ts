import { ok, fail, notConfigured, str } from "@/lib/api";
import { db, isDbConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/newsletter — email capture. Idempotent: re-subscribing is a no-op. */
export async function POST(req: Request) {
  if (!isDbConfigured) return notConfigured();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Expected a JSON body.");
  }

  const email = str(body?.email, 160).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return fail(400, "Please enter a valid email address.");
  }

  const { data, error } = await db()
    .from("newsletter")
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true })
    .select("id, email")
    .maybeSingle();

  if (error) return fail(500, "Could not subscribe that email.", error.message);
  return ok({ subscribed: true, alreadyExisted: !data, id: data?.id ?? null }, { status: 201 });
}

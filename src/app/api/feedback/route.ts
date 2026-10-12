import { ok, fail, notConfigured, str, num } from "@/lib/api";
import { db, isDbConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/feedback — star ratings plus free text from the feedback form. */
export async function POST(req: Request) {
  if (!isDbConfigured) return notConfigured();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Expected a JSON body.");
  }

  const food = Math.round(num(body?.food, 0, 5, 0));
  const service = Math.round(num(body?.service, 0, 5, 0));
  const value = Math.round(num(body?.value, 0, 5, 0));

  if (!food || !service || !value) {
    return fail(400, "Please rate food, service and value (1–5 stars each).");
  }

  const aspects = Array.isArray(body?.aspects)
    ? body?.aspects.map((a: unknown) => str(a, 40)).filter(Boolean).slice(0, 12)
    : [];

  const comment = str(body?.comment, 2000) || null;
  const recommend =
    typeof body?.recommend === "boolean" ? body.recommend : null;

  const overall = Number(((food + service + value) / 3).toFixed(2));

  const { data, error } = await db()
    .from("feedback")
    .insert({
      branch_id: str(body?.branchId, 60) || null,
      order_number: str(body?.orderNumber, 24) || null,
      food,
      service,
      value,
      overall,
      aspects,
      comment,
      recommend,
    })
    .select("id, overall, created_at")
    .single();

  if (error) return fail(500, "Could not save your feedback.", error.message);
  return ok({ received: true, id: data.id, overall }, { status: 201 });
}

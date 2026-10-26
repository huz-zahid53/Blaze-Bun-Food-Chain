import { ok, fail, notConfigured, str } from "@/lib/api";
import { db, isDbConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

const KINDS = ["contact", "franchise", "careers", "catering"] as const;

/**
 * POST /api/enquiries
 * One endpoint for every multi-field form (contact, franchise, careers,
 * catering). Form-specific fields go into `payload`, so adding a field to a
 * form never requires a migration.
 */
export async function POST(req: Request) {
  if (!isDbConfigured) return notConfigured();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail(400, "Expected a JSON body.");
  }

  const kind = KINDS.includes(body?.kind) ? body.kind : null;
  if (!kind) return fail(400, `kind must be one of: ${KINDS.join(", ")}.`);

  const name = str(body?.name, 120);
  const email = str(body?.email, 160);
  const phone = str(body?.phone, 32);

  if (name.length < 2) return fail(400, "Please provide a name.");
  if (!email && !phone) {
    return fail(400, "Please provide an email or a phone number so we can reply.");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return fail(400, "That email address looks invalid.");
  }

  // Keep the payload small and free of anything that looks like an injection.
  const payloadRaw = body?.payload ?? {};
  const payload =
    typeof payloadRaw === "object" && payloadRaw !== null ? payloadRaw : {};
  const encoded = JSON.stringify(payload);
  if (encoded.length > 16 * 1024) {
    return fail(413, "Submission is too large.");
  }

  const { data, error } = await db()
    .from("enquiries")
    .insert({
      kind,
      name,
      email: email || null,
      phone: phone || null,
      subject: str(body?.subject, 200) || null,
      payload,
    })
    .select("id, kind, status, created_at")
    .single();

  if (error) {
    console.error("[Enquiries Error] Could not save enquiry:", error.message);
    return fail(500, "Could not save the enquiry.");
  }
  return ok({ received: true, id: data.id }, { status: 201 });
}

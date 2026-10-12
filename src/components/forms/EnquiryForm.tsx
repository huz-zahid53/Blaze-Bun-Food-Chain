"use client";

import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { cn, isValidEmail, isValidPhone } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useCloudSubmit } from "@/lib/useCloudSubmit";
import { submitEnquiry } from "@/lib/cloud";
import { brand } from "@/config/brand";

export interface FieldSpec {
  id: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "date" | "select" | "textarea";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  half?: boolean;
}

interface Props {
  title: string;
  subtitle?: string;
  fields: FieldSpec[];
  submitLabel?: string;
  successTitle?: string;
  successBody?: string;
  tone?: "light" | "dark";
  /** Which enquiries bucket this form writes to in Supabase. */
  kind: "franchise" | "careers" | "catering";
}

/** Reusable enquiry form for catering / franchise / careers applications. */
export function EnquiryForm({
  title,
  subtitle,
  fields,
  submitLabel = "Send enquiry",
  successTitle = "Enquiry sent",
  successBody = "Thanks — we'll be in touch within one working day.",
  tone = "light",
  kind,
}: Props) {
  const push = useToast((s) => s.push);
  const { state, note, run, reset } = useCloudSubmit();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.id, ""])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dark = tone === "dark";

  function validate() {
    const e: Record<string, string> = {};
    for (const f of fields) {
      const v = values[f.id]?.trim() ?? "";
      if (f.required && !v) {
        e[f.id] = `${f.label} is required.`;
        continue;
      }
      if (f.type === "email" && v && !isValidEmail(v)) e[f.id] = "Enter a valid email.";
      if (f.type === "tel" && v && !isValidPhone(v))
        e[f.id] = "Enter a valid phone number.";
    }
    return e;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    // Pull the canonical contact fields out by type/id; everything else is
    // stored verbatim in `payload`, so adding a field to a form never needs a
    // schema change.
    const emailField = fields.find((f) => f.type === "email");
    const phoneField = fields.find((f) => f.type === "tel");
    const nameField =
      fields.find((f) => f.id === "name") ?? fields.find((f) => /name/i.test(f.id));
    const nameValue = nameField ? (values[nameField.id] ?? "").trim() : "";

    const result = await run(() =>
      submitEnquiry({
        kind,
        name: nameValue || "—",
        email: emailField ? values[emailField.id] : "",
        phone: phoneField ? values[phoneField.id] : "",
        subject: `${kind}: ${title}`,
        payload: { ...values },
      }),
    );

    if (result.stored) {
      push({ message: successTitle, tone: "success" });
    } else if (result.unconfigured) {
      push({
        message:
          "Demo mode: this enquiry was not stored because cloud storage is not configured.",
        tone: "info",
      });
    } else {
      push({ message: result.error ?? "Could not send your enquiry.", tone: "error" });
      return;
    }

    setTimeout(() => {
      setValues(Object.fromEntries(fields.map((f) => [f.id, ""])));
      reset();
    }, 3200);
  }

  const inputBase = cn(
    "w-full rounded-2xl border px-4 py-3.5 text-[13.5px] font-semibold outline-none transition-colors",
    dark
      ? "border-cream/15 bg-cream/5 text-cream placeholder:text-cream/35 focus:border-ember"
      : "border-charcoal/12 bg-white text-charcoal placeholder:text-slate-brand/50 focus:border-ember",
  );

  if (state === "sent") {
    return (
      <div
        className={cn(
          "flex min-h-[380px] flex-col items-center justify-center rounded-3xl p-10 text-center",
          dark ? "border border-cream/12 bg-cream/5" : "border border-charcoal/8 bg-white",
        )}
      >
        <span className="grid h-20 w-20 place-items-center rounded-full bg-fresh/15">
          <Check className="h-9 w-9 text-green-500" strokeWidth={3} />
        </span>
        <h3
          className={cn(
            "mt-6 font-display text-3xl uppercase tracking-wide",
            dark ? "text-cream" : "text-charcoal",
          )}
        >
          {successTitle}
        </h3>
        <p className={cn("mt-2 max-w-sm text-[14px]", dark ? "text-cream/60" : "text-slate-brand")}>
          {successBody}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "rounded-3xl p-6 sm:p-8",
        dark ? "border border-cream/12 bg-cream/5" : "border border-charcoal/8 bg-white",
      )}
    >
      <h2
        className={cn(
          "font-display text-2xl uppercase tracking-wide",
          dark ? "text-cream" : "text-charcoal",
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-1.5 text-[13.5px]", dark ? "text-cream/55" : "text-slate-brand")}>
          {subtitle}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.id} className={cn(!f.half && "sm:col-span-2")}>
            <label
              className={cn(
                "mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em]",
                dark ? "text-cream/55" : "text-slate-brand",
              )}
            >
              {f.label}
              {f.required && <span className="ml-1 text-ember">*</span>}
            </label>

            {f.type === "textarea" ? (
              <textarea
                value={values[f.id]}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
                rows={4}
                placeholder={f.placeholder}
                className={cn(inputBase, "resize-none", errors[f.id] && "border-ember")}
              />
            ) : f.type === "select" ? (
              <select
                value={values[f.id]}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
                className={cn(inputBase, "cursor-pointer", errors[f.id] && "border-ember")}
              >
                <option value="">Select…</option>
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type ?? "text"}
                value={values[f.id]}
                onChange={(e) => setValues({ ...values, [f.id]: e.target.value })}
                placeholder={f.placeholder}
                className={cn(inputBase, errors[f.id] && "border-ember")}
              />
            )}

            {errors[f.id] && (
              <p className="mt-1.5 text-[11.5px] font-semibold text-ember">
                {errors[f.id]}
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ember px-8 py-4 text-[13px] font-black uppercase tracking-wider text-white transition-all hover:bg-ember-dark active:scale-[0.98] disabled:opacity-70 sm:w-auto"
      >
        {state === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" strokeWidth={2.6} />
            {submitLabel}
          </>
        )}
      </button>

      {state === "error" && note && (
        <p
          role="alert"
          className={cn(
            "mt-4 rounded-2xl border px-4 py-3 text-[13px] leading-[1.6]",
            dark
              ? "border-ember/45 bg-ember/12 text-cream"
              : "border-ember/35 bg-ember/8 text-charcoal",
          )}
        >
          <strong className="font-black">Couldn&rsquo;t send that.</strong> {note}
          <span
            className={cn(
              "mt-1 block text-[12px]",
              dark ? "text-cream/60" : "text-slate-brand",
            )}
          >
            Your answers are still in the form, so you can retry — or email{" "}
            <a className="font-bold text-ember underline" href={`mailto:${brand.email}`}>
              {brand.email}
            </a>{" "}
            directly.
          </span>
        </p>
      )}
    </form>
  );
}

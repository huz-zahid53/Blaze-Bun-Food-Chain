"use client";

import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { cn, isValidEmail } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { useCloudSubmit } from "@/lib/useCloudSubmit";
import { submitEnquiry } from "@/lib/cloud";
import { brand } from "@/config/brand";

const subjects = [
  "Order issue",
  "Branch feedback",
  "Catering enquiry",
  "Franchise enquiry",
  "Careers",
  "Press / media",
  "Something else",
];

export function ContactForm() {
  const push = useToast((s) => s.push);
  const { state, note, run, reset } = useCloudSubmit();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: subjects[0],
    branch: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name.";
    if (!isValidEmail(form.email)) e.email = "Please enter a valid email.";
    if (form.message.trim().length < 12)
      e.message = "Give us a little more detail (12+ characters).";
    return e;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const result = await run(() =>
      submitEnquiry({
        kind: "contact",
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        payload: { branch: form.branch, message: form.message },
      }),
    );

    if (result.stored) {
      push({
        message: "Message sent — we'll reply within 24 hours.",
        tone: "success",
      });
    } else if (result.unconfigured) {
      push({
        message:
          "Demo mode: your message was not stored because cloud storage is not configured on this server.",
        tone: "info",
      });
    } else {
      // Keep the form filled so the visitor can retry — never pretend a
      // message was delivered when it was not.
      push({ message: result.error ?? "Could not send your message.", tone: "error" });
      return;
    }

    setTimeout(() => {
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: subjects[0],
        branch: "",
        message: "",
      });
      reset();
    }, 3000);
  }

  if (state === "sent") {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-charcoal/8 bg-white p-10 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-fresh/12">
          <Check className="h-9 w-9 text-green-600" strokeWidth={3} />
        </span>
        <h3 className="t-section-sm mt-6 uppercase tracking-wide text-charcoal">
          Message sent
        </h3>
        <p className="mt-2 max-w-sm text-[14px] text-slate-brand">
          Thanks {form.name.split(" ")[0]} — we've got it. Someone from the team
          will get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-charcoal/8 bg-white p-6 sm:p-8"
    >
      <h2 className="t-section-sm uppercase tracking-wide text-charcoal">
        Send us a message
      </h2>
      <p className="mt-1.5 text-[13.5px] text-slate-brand">
        We read every message. Most get a reply within a few hours.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field
          label="Your name"
          required
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          error={errors.name}
          placeholder="Ayesha Khan"
        />
        <Field
          label="Email"
          required
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          error={errors.email}
          placeholder="ayesha@email.com"
        />
        <Field
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          placeholder="0300 1234567"
        />
        <div>
          <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-brand">
            What's it about?
          </label>
          <select
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full cursor-pointer rounded-2xl border border-charcoal/12 bg-white px-4 py-3.5 text-[13.5px] font-semibold text-charcoal outline-none focus:border-ember"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <Field
            label="Which branch?"
            value={form.branch}
            onChange={(v) => setForm({ ...form, branch: v })}
            placeholder="DHA Phase VI, Karachi (optional)"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-brand">
            Your message
            <span className="ml-1 text-ember">*</span>
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={5}
            placeholder="Tell us what happened…"
            className={cn(
              "w-full resize-none rounded-2xl border bg-white px-4 py-3.5 text-[13.5px] outline-none transition-colors placeholder:text-slate-brand/50",
              errors.message ? "border-ember" : "border-charcoal/12 focus:border-ember",
            )}
          />
          {errors.message && (
            <p className="mt-1.5 text-[11.5px] font-semibold text-ember">
              {errors.message}
            </p>
          )}
        </div>
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
            Send message
          </>
        )}
      </button>

      {state === "error" && note && (
        <p
          role="alert"
          className="mt-4 rounded-2xl border border-ember/35 bg-ember/8 px-4 py-3 text-[13px] leading-[1.6] text-charcoal"
        >
          <strong className="font-black">Couldn&rsquo;t send that.</strong> {note}
          <span className="mt-1 block text-[12px] text-slate-brand">
            Your details are still in the form — you can retry, or call{" "}
            <a className="font-bold text-ember underline" href={brand.phoneHref}>
              {brand.phone}
            </a>{" "}
            directly.
          </span>
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-brand">
        {label}
        {required && <span className="ml-1 text-ember">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-2xl border bg-white px-4 py-3.5 text-[13.5px] font-semibold text-charcoal outline-none transition-colors placeholder:font-medium placeholder:text-slate-brand/50",
          error ? "border-ember" : "border-charcoal/12 focus:border-ember",
        )}
      />
      {error && <p className="mt-1.5 text-[11.5px] font-semibold text-ember">{error}</p>}
    </div>
  );
}

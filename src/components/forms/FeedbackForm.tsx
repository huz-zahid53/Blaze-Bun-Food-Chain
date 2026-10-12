"use client";

import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { StarPicker } from "@/components/ui/Meters";
import { useToast } from "@/components/ui/Toast";
import { branches } from "@/data/branches";
import { cn, isValidEmail } from "@/lib/utils";
import { useCloudSubmit } from "@/lib/useCloudSubmit";
import { submitFeedback } from "@/lib/cloud";

const aspects = [
  "Food quality",
  "Taste & flavour",
  "Portion size",
  "Delivery time",
  "Packaging",
  "Value for money",
  "Staff & service",
  "Cleanliness",
  "App / website",
];

const ratings = [
  { key: "food", label: "Food", hint: "How was it?" },
  { key: "service", label: "Service", hint: "Speed, accuracy, attitude" },
  { key: "value", label: "Value", hint: "Worth what you paid?" },
];

export function FeedbackForm() {
  const push = useToast((s) => s.push);
  const { state, note, run, reset } = useCloudSubmit();
  const [scores, setScores] = useState<Record<string, number>>({
    food: 0,
    service: 0,
    value: 0,
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    branch: "",
    orderNumber: "",
    message: "",
    recommend: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleAspect(a: string) {
    setSelected((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    // The API requires all three scores, so validate all three — otherwise the
    // request would 400 and the visitor would see a confusing failure.
    if (!scores.food) errs.food = "Please rate the food.";
    if (!scores.service) errs.service = "Please rate the service.";
    if (!scores.value) errs.value = "Please rate the value.";
    if (form.email && !isValidEmail(form.email)) errs.email = "Enter a valid email.";
    if (form.message.trim().length < 10)
      errs.message = "Tell us a little more (10+ characters).";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const result = await run(() =>
      submitFeedback({
        branchId: form.branch || null,
        orderNumber: form.orderNumber || null,
        food: scores.food,
        service: scores.service,
        value: scores.value,
        aspects: selected,
        comment: form.message,
        recommend:
          form.recommend === "" ? null : form.recommend === "yes" ? true : false,
      }),
    );

    if (result.stored) {
      push({
        message: "Thanks — your feedback goes straight to the branch manager.",
        tone: "success",
      });
    } else if (result.unconfigured) {
      push({
        message:
          "Demo mode: your feedback was not stored because cloud storage is not configured.",
        tone: "info",
      });
    } else {
      push({ message: result.error ?? "Could not send your feedback.", tone: "error" });
    }
  }

  if (state === "sent") {
    return (
      <div className="flex min-h-[440px] flex-col items-center justify-center rounded-3xl border border-charcoal/8 bg-white p-10 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-fresh/12">
          <Check className="h-9 w-9 text-green-600" strokeWidth={3} />
        </span>
        <h2 className="t-section-sm mt-6 uppercase tracking-wide text-charcoal">
          Thank you
        </h2>
        <p className="mt-2 max-w-sm text-[14px] leading-[1.6] text-slate-brand">
          Your feedback has been sent to the branch manager and the head office
          team. If you left an email, you'll hear back within 48 hours.
        </p>
        <button
          onClick={() => {
            reset();
            setScores({ food: 0, service: 0, value: 0 });
            setSelected([]);
            setForm({
              name: "",
              email: "",
              branch: "",
              orderNumber: "",
              message: "",
              recommend: "",
            });
          }}
          className="mt-7 rounded-full border-2 border-charcoal/12 px-7 py-3 text-[11.5px] font-black uppercase tracking-wider text-charcoal hover:border-charcoal"
        >
          Send more feedback
        </button>
      </div>
    );
  }

  const overall = Math.round(
    (scores.food + scores.service + scores.value) / 3 || 0,
  );

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-charcoal/8 bg-white p-6 sm:p-8"
    >
      <h2 className="t-section-sm uppercase tracking-wide text-charcoal">
        Rate your visit
      </h2>
      <p className="t-body mt-1.5 max-w-md text-slate-brand">
        Three quick scores, then tell us what happened. It goes straight to the
        branch manager.
      </p>

      {/* Ratings */}
      <div className="mt-6 space-y-5">
        {ratings.map((r) => (
          <div key={r.key} className="rounded-2xl bg-bone p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[13px] font-black uppercase tracking-wider text-charcoal">
                  {r.label}
                </p>
                <p className="text-[11.5px] text-slate-brand">{r.hint}</p>
              </div>
              <StarPicker
                value={scores[r.key]}
                onChange={(v) => setScores({ ...scores, [r.key]: v })}
              />
            </div>
            {errors[r.key] && (
              <p className="mt-2 text-[11.5px] font-semibold text-ember">{errors[r.key]}</p>
            )}
          </div>
        ))}
      </div>

      {overall > 0 && (
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-charcoal px-6 py-4 text-cream">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-cream/60">
            Overall score
          </span>
          <span className="font-display text-3xl text-flame">{overall}.0</span>
        </div>
      )}

      {/* Aspects */}
      <div className="mt-7">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-brand">
          What stood out? (pick any)
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {aspects.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => toggleAspect(a)}
              className={cn(
                "rounded-full border-2 px-4 py-2 text-[12px] font-bold transition-colors",
                selected.includes(a)
                  ? "border-ember bg-ember text-white"
                  : "border-charcoal/12 text-slate-brand hover:border-charcoal/30",
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <Field
          label="Your name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          placeholder="Optional"
        />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          error={errors.email}
          placeholder="If you'd like a reply"
        />
        <div>
          <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-brand">
            Branch
          </label>
          <select
            value={form.branch}
            onChange={(e) => setForm({ ...form, branch: e.target.value })}
            className="w-full cursor-pointer rounded-2xl border border-charcoal/12 bg-white px-4 py-3.5 text-[13.5px] font-semibold text-charcoal outline-none focus:border-ember"
          >
            <option value="">Select a branch…</option>
            {branches.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}, {b.city}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Order number"
          value={form.orderNumber}
          onChange={(v) => setForm({ ...form, orderNumber: v })}
          placeholder="e.g. BB-8F3K2"
        />
        <div className="sm:col-span-2">
          <Field
            label="Tell us more"
            value={form.message}
            onChange={(v) => setForm({ ...form, message: v })}
            error={errors.message}
            placeholder="What worked, what didn't, and what you'd change…"
            textarea
          />
        </div>
      </div>

      {/* Recommend */}
      <div className="mt-6">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-brand">
          Would you recommend us?
        </p>
        <div className="mt-2.5 flex gap-2">
          {["Definitely", "Probably", "Not sure", "Probably not"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setForm({ ...form, recommend: opt })}
              className={cn(
                "flex-1 rounded-full border-2 py-2.5 text-[12px] font-bold transition-colors",
                form.recommend === opt
                  ? "border-ember bg-ember text-white"
                  : "border-charcoal/12 text-slate-brand hover:border-charcoal/30",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ember px-8 py-4 text-[13px] font-black uppercase tracking-wider text-white transition-all hover:bg-ember-dark active:scale-[0.98] disabled:opacity-70 sm:w-auto"
      >
        {state === "sending" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" strokeWidth={2.6} />
            Send feedback
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
            Your ratings are still here, so you can try again.
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
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  textarea?: boolean;
}) {
  const cls = cn(
    "w-full rounded-2xl border bg-white px-4 py-3.5 text-[13.5px] font-semibold text-charcoal outline-none transition-colors placeholder:font-medium placeholder:text-slate-brand/50",
    error ? "border-ember" : "border-charcoal/12 focus:border-ember",
  );

  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-brand">
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className={cn(cls, "resize-none")}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
      {error && <p className="mt-1.5 text-[11.5px] font-semibold text-ember">{error}</p>}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Bike,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  Lock,
  MapPin,
  PartyPopper,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { useStore, computeTotals, type PlacedOrder, type ServerOrderConfirmation } from "@/store/useStore";
import { createOrder, ApiError } from "@/lib/cloud";
import { useToast } from "@/components/ui/Toast";
import { brand, paymentMethods } from "@/config/brand";
import { branches } from "@/data/branches";
import { findZone } from "@/data/zones";
import { cities } from "@/config/brand";
import { PageHero } from "@/components/ui/PageHero";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { CheckoutSkeleton } from "@/components/ui/Skeleton";
import { formatPKR, cn, isValidEmail, isValidPhone } from "@/lib/utils";

const steps = ["Your details", "Delivery", "Payment"] as const;

const paymentIcon: Record<string, typeof Banknote> = {
  cash: Banknote,
  card_delivery: CreditCard,
  card: CreditCard,
  wallet: Smartphone,
  bank: Wallet,
};

export default function CheckoutPage() {
  const router = useRouter();

  const lines = useStore((s) => s.lines);
  const orderType = useStore((s) => s.orderType);
  const branchId = useStore((s) => s.branchId);
  const zoneId = useStore((s) => s.zoneId);
  const storeCity = useStore((s) => s.city);
  const coupon = useStore((s) => s.coupon);
  const tip = useStore((s) => s.tip);
  const setTip = useStore((s) => s.setTip);
  const placeOrder = useStore((s) => s.placeOrder);
  const setLocationOpen = useStore((s) => s.setLocationOpen);
  const hydrated = useStore((s) => s.hydrated);

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  /** Set when payment or cloud creation failed or was declined. */
  const [placeError, setPlaceError] = useState<string | null>(null);
  /** Interactive demo payment outcome for online methods (card, jazzcash, easypaisa, bank). */
  const [demoOutcome, setDemoOutcome] = useState<"success" | "failure" | "cancelled">("success");
  const push = useToast((s) => s.push);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    area: findZone(zoneId)?.area ?? "",
    city: storeCity || "Karachi",
    instructions: "",
    slot: "asap",
    scheduledTime: "",
    eventDate: "",
    guests: "",
    cateringNotes: "",
    payment: "cod",
    saveAddress: true,
    agree: false,
  });

  const totals = computeTotals(lines, orderType, coupon, tip);
  const branch = branches.find((b) => b.id === branchId);
  const zone = findZone(zoneId);
  const visible = hydrated ? lines : [];
  const eta = (branch?.eta ?? 28) + 12;

  // If the location modal is used from here, carry the chosen city and
  // delivery area into the fulfilment form so the customer doesn't retype it.
  // Adjusting during render (guarded on the last sync) is React's documented
  // alternative to a synchronising effect.
  const zoneArea = zone?.area ?? "";
  const [syncedLocation, setSyncedLocation] = useState({
    city: storeCity,
    area: zoneArea,
  });
  if (syncedLocation.city !== storeCity || syncedLocation.area !== zoneArea) {
    setSyncedLocation({ city: storeCity, area: zoneArea });
    setForm((f) => ({
      ...f,
      city: storeCity || f.city,
      area: zoneArea || f.area,
    }));
  }

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (form.name.trim().length < 2) e.name = "Please tell us your name.";
      if (!isValidPhone(form.phone)) e.phone = "Enter a valid phone number.";
      if (form.email && !isValidEmail(form.email)) e.email = "That email looks off.";
    }
    if (step === 1) {
      if (orderType === "delivery") {
        if (form.address.trim().length < 8) e.address = "We need a full street address.";
        if (form.area.trim().length < 2) e.area = "Add an area or landmark.";
      }
      if (orderType === "catering") {
        if (!form.eventDate) e.eventDate = "Pick the event date.";
        if (!form.guests || Number(form.guests) < 10)
          e.guests = "Catering starts at 10 guests.";
      }
      if (form.slot === "later" && !form.scheduledTime)
        e.scheduledTime = "Choose a time.";
    }
    if (step === 2) {
      if (!form.agree) e.agree = "Please accept the terms to continue.";
    }
    return e;
  }, [form, step, orderType]);

  const hasErrors = Object.keys(errors).length > 0;

  function next() {
    if (hasErrors) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    if (hasErrors || !branch) return;
    setPlacing(true);
    setPlaceError(null);

    const paymentLabel =
      paymentMethods.find((p) => p.id === form.payment)?.label ?? "Cash on Delivery";

    const customer = {
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      address:
        orderType === "delivery"
          ? `${form.address}, ${form.area}, ${form.city}`
          : undefined,
      area: form.area || undefined,
      city: form.city,
      instructions:
        form.slot === "later"
          ? `Scheduled for ${form.scheduledTime}. ${form.instructions}`.trim()
          : form.instructions || undefined,
      slot: form.slot === "asap" ? "As soon as possible" : form.scheduledTime,
    };

    const isSimulatedOnline = form.payment !== "cod" && form.payment !== "cash_on_card";

    let confirmation: ServerOrderConfirmation | undefined;

    if (useStore.getState().cloudMode === "cloud") {
      try {
        const res = await createOrder({
          type: orderType,
          lines: visible,
          couponCode: coupon?.code ?? null,
          tip,
          payment: form.payment,
          paymentLabel,
          demoOutcome: isSimulatedOnline ? demoOutcome : undefined,
          branchId: branch.id,
          branchName: `${branch.name}, ${branch.city}`,
          zoneId: orderType === "delivery" ? zoneId : null,
          etaMinutes: eta,
          customer,
        });

        confirmation = {
          id: res.id,
          number: res.number,
          loyaltyEarned: res.totals.loyaltyEarned,
          payment: res.payment,
          totals: {
            subtotal: res.totals.subtotal,
            deliveryFee: res.totals.deliveryFee,
            discount: res.totals.discount,
            tax: res.totals.tax,
            tip: res.totals.tip,
            total: res.totals.total,
            itemCount: res.totals.itemCount,
          },
        };

        if (res.totals.couponRejected) {
          push({ message: res.totals.couponRejected, tone: "info" });
        }
      } catch (err) {
        setPlacing(false);
        const message =
          err instanceof ApiError ? err.message : "Could not complete order.";
        setPlaceError(message);
        push({
          message,
          tone: "error",
        });
        // Important: Stop here! Do not create local order or navigate when payment failed or was declined.
        return;
      }
    } else {
      // Offline / Local-only mode (when cloud DB is not configured)
      await new Promise((r) => setTimeout(r, 650));
      if (isSimulatedOnline && demoOutcome === "failure") {
        setPlacing(false);
        const msg = `${paymentLabel} — payment declined. Insufficient funds (simulated demo).`;
        setPlaceError(msg);
        push({ message: msg, tone: "error" });
        return;
      }
      if (isSimulatedOnline && demoOutcome === "cancelled") {
        setPlacing(false);
        const msg = `${paymentLabel} — payment was cancelled by customer (simulated demo).`;
        setPlaceError(msg);
        push({ message: msg, tone: "info" });
        return;
      }
    }

    const payload: Omit<
      PlacedOrder,
      "id" | "number" | "createdAt" | "timeline" | "status" | "loyaltyEarned"
    > = {
      type: orderType,
      lines: visible,
      itemCount: totals.itemCount,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      tax: totals.tax,
      discount: totals.discount,
      tip: totals.tip,
      total: totals.total,
      payment: form.payment,
      paymentLabel,
      branchId: branch.id,
      branchName: `${branch.name}, ${branch.city}`,
      etaMinutes: eta,
      customer,
    };

    const order = placeOrder(payload, confirmation);
    setPlacing(false);
    router.push(`/track?new=${order.number}`);
  }

  // Wait for cloud hydration before showing the form so the review list,
  // totals and branch all reflect the restored bucket.
  if (!hydrated) return <CheckoutSkeleton />;

  if (visible.length === 0) {
    return (
      <PageHero
          image="/media/hero/bg-kitchen.jpg"
        kicker="Checkout"
        title="Your bucket is empty"
        subtitle="Add something to your bucket before checking out."
      >
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 rounded-full bg-ember px-8 py-4 text-[13px] font-black uppercase tracking-wider text-white hover:bg-ember-dark"
        >
          Browse the menu
        </Link>
      </PageHero>
    );
  }

  return (
    <>
      <PageHero
          image="/media/hero/bg-kitchen.jpg"
        kicker="Checkout"
        title={[<span key="a">Almost</span>, <br key="b" />,
          <span key="c" className="bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">
            there
          </span>]}
        subtitle="Three quick steps and the grill fires up."
      />

      {/* Stepper */}
      <div className="sticky top-[112px] z-[60] border-b border-charcoal/8 bg-cream/92 backdrop-blur-xl md:top-[76px]">
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2 sm:gap-4">
            {steps.map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-2 sm:gap-3">
                <button
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={cn(
                    "flex items-center gap-2.5 transition-opacity",
                    i > step && "opacity-50",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-[14px] transition-colors",
                      i < step
                        ? "bg-fresh text-white"
                        : i === step
                          ? "bg-ember text-white"
                          : "bg-charcoal/10 text-slate-brand",
                    )}
                  >
                    {i < step ? <Check className="h-4 w-4" strokeWidth={3.5} /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "hidden text-[12.5px] font-bold uppercase tracking-wider sm:block",
                      i === step ? "text-charcoal" : "text-slate-brand",
                    )}
                  >
                    {s}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <span
                    className={cn(
                      "h-0.5 flex-1 rounded-full transition-colors",
                      i < step ? "bg-fresh" : "bg-charcoal/12",
                    )}
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
          {/* ---------- Form ---------- */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* ============ STEP 0 — DETAILS ============ */}
                {step === 0 && (
                  <div className="rounded-3xl border border-charcoal/8 bg-white p-6 sm:p-8">
                    <h2 className="t-section-sm uppercase tracking-wide text-charcoal">
                      Who's eating?
                    </h2>
                    <p className="mt-1.5 text-[13.5px] text-slate-brand">
                      We only use this to reach you about this order.
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Full name"
                        required
                        value={form.name}
                        onChange={(v) => setForm({ ...form, name: v })}
                        error={errors.name}
                        placeholder="Ahmed Khan"
                      />
                      <Field
                        label="Phone number"
                        required
                        type="tel"
                        value={form.phone}
                        onChange={(v) => setForm({ ...form, phone: v })}
                        error={errors.phone}
                        placeholder="0300 1234567"
                      />
                      <Field
                        label="Email"
                        className="sm:col-span-2"
                        type="email"
                        value={form.email}
                        onChange={(v) => setForm({ ...form, email: v })}
                        error={errors.email}
                        placeholder="ahmed@email.com (optional)"
                      />
                    </div>

                    {/* Order type switch reminder */}
                    <div className="mt-7 rounded-2xl bg-charcoal/4 p-5">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-brand">
                        Order type
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[
                          { id: "delivery", label: "Delivery", icon: Bike },
                          { id: "pickup", label: "Pick-Up", icon: Store },
                          { id: "catering", label: "Catering", icon: PartyPopper },
                        ].map((t) => {
                          const Icon = t.icon;
                          const active = orderType === t.id;
                          return (
                            <span
                              key={t.id}
                              className={cn(
                                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold",
                                active
                                  ? "bg-charcoal text-cream"
                                  : "bg-white text-slate-brand/50",
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {t.label}
                            </span>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setLocationOpen(true)}
                        className="mt-3 text-[12px] font-bold uppercase tracking-wider text-ember hover:underline"
                      >
                        Change order type or branch
                      </button>
                    </div>
                  </div>
                )}

                {/* ============ STEP 1 — DELIVERY ============ */}
                {step === 1 && (
                  <div className="rounded-3xl border border-charcoal/8 bg-white p-6 sm:p-8">
                    <h2 className="t-section-sm uppercase tracking-wide text-charcoal">
                      {orderType === "delivery"
                        ? "Where are we going?"
                        : orderType === "pickup"
                          ? "Pick-up details"
                          : "Catering details"}
                    </h2>

                    {orderType === "delivery" && (
                      <>
                        <div className="mt-6 grid gap-4">
                          <Field
                            label="Street address"
                            required
                            value={form.address}
                            onChange={(v) => setForm({ ...form, address: v })}
                            error={errors.address}
                            placeholder="House 12, Street 4, Block B"
                          />
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field
                              label="Area / landmark"
                              required
                              value={form.area}
                              onChange={(v) => setForm({ ...form, area: v })}
                              error={errors.area}
                              placeholder="Opposite National Bank"
                            />
                            <div>
                              <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-brand">
                                City
                              </label>
                              <select
                                value={form.city}
                                onChange={(e) =>
                                  setForm({ ...form, city: e.target.value })
                                }
                                className="w-full cursor-pointer rounded-2xl border border-charcoal/12 bg-white px-4 py-3.5 text-[13.5px] font-semibold text-charcoal outline-none focus:border-ember"
                              >
                                {cities.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-brand">
                              Delivery instructions
                            </label>
                            <textarea
                              value={form.instructions}
                              onChange={(e) =>
                                setForm({ ...form, instructions: e.target.value })
                              }
                              rows={3}
                              maxLength={250}
                              placeholder="Gate code, landmark, 'call when outside'…"
                              className="w-full resize-none rounded-2xl border border-charcoal/12 bg-white px-4 py-3.5 text-[13.5px] outline-none placeholder:text-slate-brand/50 focus:border-ember"
                            />
                          </div>
                        </div>

                        {/* Slot */}
                        <div className="mt-7">
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-brand">
                            When?
                          </p>
                          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                            {[
                              { id: "asap", label: "As soon as possible", sub: `~${eta} min` },
                              { id: "later", label: "Schedule for later", sub: "Pick a time" },
                            ].map((s) => (
                              <button
                                key={s.id}
                                onClick={() => setForm({ ...form, slot: s.id })}
                                className={cn(
                                  "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors",
                                  form.slot === s.id
                                    ? "border-ember bg-ember/6"
                                    : "border-charcoal/10 hover:border-charcoal/25",
                                )}
                              >
                                <span
                                  className={cn(
                                    "grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full border-2",
                                    form.slot === s.id
                                      ? "border-ember bg-ember"
                                      : "border-charcoal/25",
                                  )}
                                >
                                  {form.slot === s.id && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                  )}
                                </span>
                                <span>
                                  <span className="block text-[13.5px] font-bold text-charcoal">
                                    {s.label}
                                  </span>
                                  <span className="block text-[11.5px] text-slate-brand">
                                    {s.sub}
                                  </span>
                                </span>
                              </button>
                            ))}
                          </div>
                          {form.slot === "later" && (
                            <div className="mt-3 max-w-xs">
                              <Field
                                label="Preferred time"
                                required
                                type="time"
                                value={form.scheduledTime}
                                onChange={(v) =>
                                  setForm({ ...form, scheduledTime: v })
                                }
                                error={errors.scheduledTime}
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {orderType === "pickup" && (
                      <div className="mt-6 space-y-5">
                        <div className="flex items-start justify-between gap-4 rounded-2xl border-2 border-ember bg-ember/6 p-5">
                          <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-ember" />
                            <div>
                              <p className="font-display text-xl uppercase tracking-wide text-charcoal">
                                {branch?.name}
                              </p>
                              <p className="mt-1 text-[13px] text-slate-brand">
                                {branch?.address}
                              </p>
                              <p className="mt-1.5 text-[12px] font-semibold text-ember">
                                {branch?.hours}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setLocationOpen(true)}
                            className="shrink-0 text-[11.5px] font-black uppercase tracking-wider text-ember hover:underline"
                          >
                            Change
                          </button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field
                            label="Preferred time"
                            type="time"
                            value={form.scheduledTime}
                            onChange={(v) => setForm({ ...form, scheduledTime: v })}
                            placeholder="ASAP"
                          />
                          <Field
                            label="Car / bike details"
                            value={form.instructions}
                            onChange={(v) => setForm({ ...form, instructions: v })}
                            placeholder="Blue Corolla, plate ABC-123"
                          />
                        </div>

                        <p className="rounded-2xl bg-flame/10 px-4 py-3.5 text-[13px] text-slate-brand">
                          We'll text you the moment your order is bagged. Average
                          prep time at this branch is{" "}
                          <strong className="font-black text-charcoal">
                            {branch?.eta ? branch.eta - 14 : 14} minutes
                          </strong>
                          .
                        </p>
                      </div>
                    )}

                    {orderType === "catering" && (
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Event date"
                          required
                          type="date"
                          value={form.eventDate}
                          onChange={(v) => setForm({ ...form, eventDate: v })}
                          error={errors.eventDate}
                        />
                        <Field
                          label="Number of guests"
                          required
                          type="number"
                          value={form.guests}
                          onChange={(v) => setForm({ ...form, guests: v })}
                          error={errors.guests}
                          placeholder="Minimum 10"
                        />
                        <div className="sm:col-span-2">
                          <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-brand">
                            Event notes
                          </label>
                          <textarea
                            value={form.cateringNotes}
                            onChange={(e) =>
                              setForm({ ...form, cateringNotes: e.target.value })
                            }
                            rows={3}
                            placeholder="Venue, setup time, dietary requirements…"
                            className="w-full resize-none rounded-2xl border border-charcoal/12 bg-white px-4 py-3.5 text-[13.5px] outline-none placeholder:text-slate-brand/50 focus:border-ember"
                          />
                        </div>
                        <p className="sm:col-span-2 rounded-2xl bg-flame/10 px-4 py-3.5 text-[13px] text-slate-brand">
                          <Users className="mr-2 inline h-4 w-4 text-ember" />
                          Our catering team confirms every booking by phone within
                          4 hours. For events over 100 guests, please give us 48
                          hours' notice.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ============ STEP 2 — PAYMENT ============ */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="rounded-3xl border border-charcoal/8 bg-white p-6 sm:p-8">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="t-section-sm uppercase tracking-wide text-charcoal">
                            How are you paying?
                          </h2>
                          <p className="mt-1 text-[13px] text-slate-brand">
                            Choose between doorstep delivery payments or interactive demo simulators.
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal/5 px-3 py-1 text-[11px] font-bold text-charcoal">
                          <ShieldCheck className="h-3.5 w-3.5 text-fresh" />
                          Zero-Budget Hybrid
                        </span>
                      </div>

                      {/* Payment method cards */}
                      <div className="mt-5 space-y-2.5">
                        {paymentMethods.map((p) => {
                          const Icon = paymentIcon[p.kind] ?? Banknote;
                          const active = form.payment === p.id;
                          const isOnline = p.id !== "cod" && p.id !== "cash_on_card";
                          return (
                            <button
                              key={p.id}
                              onClick={() => {
                                setForm({ ...form, payment: p.id });
                                setPlaceError(null);
                              }}
                              className={cn(
                                "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                                active
                                  ? "border-ember bg-ember/6 ring-1 ring-ember/25"
                                  : "border-charcoal/10 hover:border-charcoal/25 bg-white",
                              )}
                            >
                              <span
                                className={cn(
                                  "grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors",
                                  active
                                    ? "bg-ember text-white"
                                    : "bg-charcoal/6 text-charcoal",
                                )}
                              >
                                <Icon className="h-5 w-5" strokeWidth={2.3} />
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className="flex items-center gap-2">
                                  <span className="block text-[13.5px] font-black text-charcoal truncate">
                                    {p.label}
                                  </span>
                                  {isOnline ? (
                                    <span className="shrink-0 rounded-full bg-ember/12 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-ember">
                                      Simulator
                                    </span>
                                  ) : (
                                    <span className="shrink-0 rounded-full bg-fresh/12 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-fresh">
                                      At Delivery
                                    </span>
                                  )}
                                </span>
                                <span className="block text-[12px] text-slate-brand truncate">
                                  {p.blurb}
                                </span>
                              </span>
                              <span
                                className={cn(
                                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                                  active ? "border-ember bg-ember" : "border-charcoal/25",
                                )}
                              >
                                {active && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Dynamic payment detail panels */}
                      <AnimatePresence mode="wait">
                        {/* 1. Cash on Delivery (COD) */}
                        {form.payment === "cod" && (
                          <motion.div
                            key="cod"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="mt-5 rounded-2xl border border-charcoal/10 bg-amber-50/60 p-5"
                          >
                            <div className="flex items-start gap-3">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-700">
                                <Banknote className="h-5 w-5" />
                              </span>
                              <div>
                                <h4 className="text-[13.5px] font-black uppercase tracking-wider text-amber-950">
                                  Cash on Delivery — Genuine Unpaid Order
                                </h4>
                                <p className="mt-1 text-[12.5px] leading-relaxed text-amber-900/80">
                                  No advance online payment is required. You will pay{" "}
                                  <strong className="font-black text-charcoal">
                                    {formatPKR(totals.total)}
                                  </strong>{" "}
                                  in cash directly to the rider upon delivery.
                                </p>
                                <p className="mt-2 text-[11.5px] font-semibold text-amber-800">
                                  ✓ Rider hands over official paper receipt · Exact change appreciated.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* 2. Cash on Card (POS machine at door) */}
                        {form.payment === "cash_on_card" && (
                          <motion.div
                            key="cash_on_card"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="mt-5 rounded-2xl border border-charcoal/10 bg-blue-50/60 p-5"
                          >
                            <div className="flex items-start gap-3">
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-blue-700">
                                <CreditCard className="h-5 w-5" />
                              </span>
                              <div>
                                <h4 className="text-[13.5px] font-black uppercase tracking-wider text-blue-950">
                                  Cash on Card — Rider POS Terminal
                                </h4>
                                <p className="mt-1 text-[12.5px] leading-relaxed text-blue-900/80">
                                  Your rider will bring a wireless bank POS machine to your doorstep.
                                  You can tap, insert, or swipe any Pakistani debit or credit card for{" "}
                                  <strong className="font-black text-charcoal">
                                    {formatPKR(totals.total)}
                                  </strong>
                                  .
                                </p>
                                <p className="mt-2 text-[11.5px] font-semibold text-blue-800">
                                  ✓ Accepts Visa, Mastercard & PayPak · Order remains unpaid until tapped at door.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* 3. Online Simulated Payments (Card, JazzCash, EasyPaisa, Bank) */}
                        {form.payment !== "cod" && form.payment !== "cash_on_card" && (
                          <motion.div
                            key="simulator"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="mt-5 rounded-2xl border-2 border-ember/20 bg-gradient-to-b from-charcoal/[0.03] to-ember/[0.02] p-5 sm:p-6"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-charcoal/10 pb-4">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-ember" />
                                <h4 className="text-[13px] font-black uppercase tracking-wider text-charcoal">
                                  Interactive Payment Simulator
                                </h4>
                              </div>
                              <span className="rounded-full bg-charcoal/8 px-2.5 py-0.5 text-[11px] font-bold text-charcoal">
                                Portfolio Mode · Zero Gateway Fees
                              </span>
                            </div>

                            <p className="mt-3 text-[12.5px] leading-relaxed text-slate-brand">
                              No live payment gateway credentials required. Test the full payment lifecycle,
                              ledger audit entries, and live tracking reactions by choosing a test outcome below:
                            </p>

                            {/* Demo outcome selector */}
                            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                              {/* Option A: Success */}
                              <button
                                type="button"
                                onClick={() => {
                                  setDemoOutcome("success");
                                  setPlaceError(null);
                                }}
                                className={cn(
                                  "rounded-xl border-2 p-3 text-left transition-all",
                                  demoOutcome === "success"
                                    ? "border-fresh bg-fresh/10 text-charcoal ring-1 ring-fresh/30"
                                    : "border-charcoal/10 bg-white hover:border-charcoal/25",
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle2
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      demoOutcome === "success" ? "text-fresh" : "text-slate-brand",
                                    )}
                                  />
                                  <span className="text-[12px] font-black uppercase tracking-wider">
                                    Approved
                                  </span>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-brand leading-snug">
                                  Simulates successful payment. Marks order Paid with reference.
                                </p>
                              </button>

                              {/* Option B: Failure / Decline */}
                              <button
                                type="button"
                                onClick={() => {
                                  setDemoOutcome("failure");
                                  setPlaceError(null);
                                }}
                                className={cn(
                                  "rounded-xl border-2 p-3 text-left transition-all",
                                  demoOutcome === "failure"
                                    ? "border-ember bg-ember/10 text-charcoal ring-1 ring-ember/30"
                                    : "border-charcoal/10 bg-white hover:border-charcoal/25",
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <XCircle
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      demoOutcome === "failure" ? "text-ember" : "text-slate-brand",
                                    )}
                                  />
                                  <span className="text-[12px] font-black uppercase tracking-wider">
                                    Decline (Test)
                                  </span>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-brand leading-snug">
                                  Simulates insufficient funds. Keeps cart safe for retry.
                                </p>
                              </button>

                              {/* Option C: Cancelled */}
                              <button
                                type="button"
                                onClick={() => {
                                  setDemoOutcome("cancelled");
                                  setPlaceError(null);
                                }}
                                className={cn(
                                  "rounded-xl border-2 p-3 text-left transition-all",
                                  demoOutcome === "cancelled"
                                    ? "border-amber-500 bg-amber-500/10 text-charcoal ring-1 ring-amber-500/30"
                                    : "border-charcoal/10 bg-white hover:border-charcoal/25",
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <AlertCircle
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      demoOutcome === "cancelled" ? "text-amber-600" : "text-slate-brand",
                                    )}
                                  />
                                  <span className="text-[12px] font-black uppercase tracking-wider">
                                    User Cancel
                                  </span>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-brand leading-snug">
                                  Simulates customer exiting gateway back to checkout.
                                </p>
                              </button>
                            </div>

                            {/* Method-specific simulated credentials display */}
                            <div className="mt-4 rounded-xl bg-charcoal/5 p-3.5 text-[12px]">
                              {form.payment === "card" && (
                                <div className="flex items-center justify-between text-charcoal">
                                  <span className="font-mono font-bold">•••• •••• •••• 4242</span>
                                  <span className="font-semibold text-slate-brand">EXP 12/28 · VISA DEMO</span>
                                  <span className="rounded bg-charcoal/10 px-2 py-0.5 text-[10px] font-bold">Auto-Filled</span>
                                </div>
                              )}
                              {form.payment === "jazzcash" && (
                                <div className="flex items-center justify-between text-charcoal">
                                  <span className="font-mono font-bold">JazzCash: 0300-1234567</span>
                                  <span className="font-semibold text-slate-brand">Wallet Verified</span>
                                  <span className="rounded bg-charcoal/10 px-2 py-0.5 text-[10px] font-bold">1-Touch Demo</span>
                                </div>
                              )}
                              {form.payment === "easypaisa" && (
                                <div className="flex items-center justify-between text-charcoal">
                                  <span className="font-mono font-bold">EasyPaisa: 0345-7654321</span>
                                  <span className="font-semibold text-slate-brand">Wallet Verified</span>
                                  <span className="rounded bg-charcoal/10 px-2 py-0.5 text-[10px] font-bold">1-Touch Demo</span>
                                </div>
                              )}
                              {form.payment === "bank" && (
                                <div className="flex items-center justify-between text-charcoal">
                                  <span className="font-mono font-bold">IBAN: PK78BAHL000123456789</span>
                                  <span className="font-semibold text-slate-brand">Raast / 1Link Demo</span>
                                  <span className="rounded bg-charcoal/10 px-2 py-0.5 text-[10px] font-bold">Instant</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-charcoal/4 p-4 text-[12px] leading-relaxed text-slate-brand">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-fresh" />
                        <span>
                          Production orders run on Supabase database integrity. No real funds are moved;
                          simulated payment tests exercise end-to-end ledger logging, status tracking, and cart preservation.
                        </span>
                      </div>
                    </div>

                    {/* Review */}
                    <div className="rounded-3xl border border-charcoal/8 bg-white p-6 sm:p-8">
                      <h2 className="t-section-sm uppercase tracking-wide text-charcoal">
                        Review & place
                      </h2>

                      <div className="mt-5 space-y-3">
                        {visible.map((l) => (
                          <div key={l.key} className="flex items-center gap-3">
                            <MediaFrame
                              src={l.image}
                              hue={l.hue}
                              glyph={l.glyph}
                              alt={l.name}
                              ratio="aspect-square"
                              className="h-14 w-14 shrink-0 rounded-xl"
                              sizes="56px"
                              zoom={false}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-bold text-charcoal">
                                {l.name}
                                {l.qty > 1 && (
                                  <span className="text-slate-brand"> × {l.qty}</span>
                                )}
                              </p>
                              <p className="truncate text-[11.5px] text-slate-brand">
                                {[
                                  l.size?.label,
                                  ...l.options.map((o) => o.choiceLabel),
                                  ...l.addOns.map((a) => a.label),
                                ]
                                  .filter(Boolean)
                                  .join(" · ") || "Standard"}
                              </p>
                            </div>
                            <span className="shrink-0 text-[13px] font-bold text-charcoal">
                              {formatPKR(l.unitPrice * l.qty)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 border-t border-charcoal/8 pt-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-brand">
                          Tip your rider
                        </p>
                        <div className="mt-2 flex gap-2">
                          {[0, 50, 100, 200].map((v) => (
                            <button
                              key={v}
                              onClick={() => setTip(v)}
                              className={cn(
                                "flex-1 rounded-full border-2 py-2 text-[12px] font-bold transition-colors",
                                tip === v
                                  ? "border-ember bg-ember text-white"
                                  : "border-charcoal/12 text-slate-brand hover:border-charcoal/30",
                              )}
                            >
                              {v === 0 ? "None" : formatPKR(v)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <label className="mt-6 flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={form.agree}
                          onChange={(e) =>
                            setForm({ ...form, agree: e.target.checked })
                          }
                          className="mt-0.5 h-4.5 w-4.5 shrink-0 accent-ember"
                        />
                        <span className="text-[12.5px] leading-[1.6] text-slate-brand">
                          I agree to the{" "}
                          <Link href="/legal" className="font-bold text-ember underline underline-offset-2">
                            terms of service
                          </Link>{" "}
                          and confirm my order details are correct.
                          {errors.agree && (
                            <span className="mt-1 block font-bold text-ember">
                              {errors.agree}
                            </span>
                          )}
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="mt-6 flex items-center justify-between gap-4">
              {step > 0 ? (
                <button
                  onClick={back}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-charcoal/12 px-6 py-3.5 text-[12px] font-black uppercase tracking-wider text-charcoal transition-colors hover:border-charcoal"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={3} />
                  Back
                </button>
              ) : (
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-charcoal/12 px-6 py-3.5 text-[12px] font-black uppercase tracking-wider text-charcoal transition-colors hover:border-charcoal"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={3} />
                  Bucket
                </Link>
              )}

              {step < steps.length - 1 ? (
                <button
                  onClick={next}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full bg-ember px-8 py-3.5 text-[12.5px] font-black uppercase tracking-wider text-white transition-all hover:bg-ember-dark",
                    hasErrors && "opacity-45",
                  )}
                >
                  Continue
                  <ArrowRight className="h-4 w-4" strokeWidth={3} />
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={placing || hasErrors}
                  className="inline-flex items-center gap-2 rounded-full bg-ember px-8 py-3.5 text-[12.5px] font-black uppercase tracking-wider text-white transition-all hover:bg-ember-dark disabled:opacity-45"
                >
                  {placing ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Placing…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" strokeWidth={2.8} />
                      Place order · {formatPKR(totals.total)}
                    </>
                  )}
                </button>
              )}

              {/* Payment or Cloud Error banner */}
              {placeError && (
                <div
                  role="alert"
                  className="mt-5 rounded-2xl border-2 border-ember/35 bg-ember/8 p-4 text-[13px] leading-[1.6] text-charcoal"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-ember" />
                    <div>
                      <strong className="font-black text-charcoal">Payment could not be completed</strong>
                      <p className="mt-1 text-[13px] text-slate-brand">{placeError}</p>
                      <p className="mt-2 text-[12px] font-bold text-ember">
                        Your bucket is completely safe. You can change your payment method, choose another test outcome, or try again.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {hasErrors && step < steps.length - 1 && (
              <p className="mt-3 text-right text-[12px] font-semibold text-ember">
                Fill in the highlighted fields to continue.
              </p>
            )}
          </div>

          {/* ---------- Summary rail ---------- */}
          <aside className="lg:sticky lg:top-40">
            <div className="rounded-3xl bg-charcoal p-6 text-cream">
              <h2 className="t-section-sm uppercase tracking-wide">
                Order summary
              </h2>

              <div className="mt-4 max-h-[280px] space-y-2.5 overflow-y-auto pr-1">
                {visible.map((l) => (
                  <div key={l.key} className="flex items-center justify-between gap-3 text-[12.5px]">
                    <span className="min-w-0 flex-1 truncate text-cream/70">
                      {l.qty}× {l.name}
                    </span>
                    <span className="shrink-0 font-bold">
                      {formatPKR(l.unitPrice * l.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <dl className="mt-5 space-y-2 border-t border-cream/10 pt-4 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-cream/55">Subtotal</dt>
                  <dd className="font-bold">{formatPKR(totals.subtotal)}</dd>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <dt>Discount</dt>
                    <dd className="font-bold">− {formatPKR(totals.discount)}</dd>
                  </div>
                )}
                {orderType === "delivery" && (
                  <div className="flex justify-between">
                    <dt className="text-cream/55">Delivery</dt>
                    <dd className="font-bold">
                      {totals.deliveryFee === 0 ? "Free" : formatPKR(totals.deliveryFee)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-cream/55">Tax ({(brand.taxRate * 100).toFixed(0)}%)</dt>
                  <dd className="font-bold">{formatPKR(totals.tax)}</dd>
                </div>
                {totals.tip > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-cream/55">Tip</dt>
                    <dd className="font-bold">{formatPKR(totals.tip)}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 flex items-end justify-between border-t border-cream/10 pt-4">
                <span className="text-[13px] font-black uppercase tracking-wider">
                  Total
                </span>
                <span className="font-display text-[32px] leading-none text-flame">
                  {formatPKR(totals.total)}
                </span>
              </div>

              {branch && (
                <div className="mt-5 rounded-2xl bg-cream/6 p-4">
                  <p className="flex items-center gap-2 text-[11.5px] font-bold text-cream/60">
                    <MapPin className="h-3.5 w-3.5 text-ember" />
                    {branch.name}, {branch.city}
                  </p>
                  {orderType === "delivery" && zone && (
                    <p className="mt-1.5 flex items-center gap-2 text-[11.5px] font-bold text-cream/60">
                      <MapPin className="h-3.5 w-3.5 text-ember" />
                      Delivering to {zone.area}
                    </p>
                  )}
                  <p className="mt-1.5 flex items-center gap-2 text-[11.5px] font-bold text-cream/60">
                    <CalendarDays className="h-3.5 w-3.5 text-ember" />
                    {form.slot === "asap" ? `Arriving in ~${eta} min` : `Scheduled: ${form.scheduledTime || "—"}`}
                  </p>
                </div>
              )}

              <div className="mt-5 flex items-center gap-2 text-[11.5px] text-cream/45">
                <Lock className="h-3.5 w-3.5" />
                Secure checkout · Simulated payments
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

/* ---------------- Field ---------------- */

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  required,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
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

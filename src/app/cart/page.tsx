"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bike,
  Clock,
  MapPin,
  Percent,
  Plus,
  ShoppingBag,
  Sparkles,
  Store,
  Ticket,
  Trash2,
  Truck,
} from "lucide-react";
import { useStore, computeTotals } from "@/store/useStore";
import { brand } from "@/config/brand";
import { branches } from "@/data/branches";
import { menuItems } from "@/data/menu";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { CartSkeleton } from "@/components/ui/Skeleton";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ItemModal } from "@/components/menu/ItemModal";
import { useToast } from "@/components/ui/Toast";
import { PageHero } from "@/components/ui/PageHero";
import { ScrollRail } from "@/components/ui/ScrollRail";
import { formatPKR, cn } from "@/lib/utils";
import type { MenuItem } from "@/data/menu";

export default function CartPage() {
  const lines = useStore((s) => s.lines);
  const orderType = useStore((s) => s.orderType);
  const branchId = useStore((s) => s.branchId);
  const coupon = useStore((s) => s.coupon);
  const tip = useStore((s) => s.tip);
  const setTip = useStore((s) => s.setTip);
  const setQty = useStore((s) => s.setQty);
  const removeLine = useStore((s) => s.removeLine);
  const clearCart = useStore((s) => s.clearCart);
  const applyCoupon = useStore((s) => s.applyCoupon);
  const removeCoupon = useStore((s) => s.removeCoupon);
  const setLocationOpen = useStore((s) => s.setLocationOpen);
  const hydrated = useStore((s) => s.hydrated);
  const push = useToast((s) => s.push);

  const [code, setCode] = useState("");
  const [upsell, setUpsell] = useState<MenuItem | null>(null);

  const totals = computeTotals(lines, orderType, coupon, tip);
  const branch = branches.find((b) => b.id === branchId);
  const visible = hydrated ? lines : [];

  // Suggest items not already in the bucket
  const suggestions = useMemo(() => {
    const inBucket = new Set(visible.map((l) => l.slug));
    const cats = new Set(visible.map((l) => l.categoryId));
    return menuItems
      .filter((i) => !inBucket.has(i.slug))
      .filter((i) => i.categoryId === "sides-fries" || i.categoryId === "beverages" || i.categoryId === "desserts")
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 8);
  }, [visible]);

  const prepMax = visible.reduce(
    (m, l) => Math.max(m, menuItems.find((i) => i.slug === l.slug)?.prepMinutes ?? 12),
    0,
  );

  // The bucket contents arrive from cloud hydration — show the cart skeleton
  // until that resolves so we never flash an empty bucket by mistake.
  if (!hydrated) return <CartSkeleton />;

  if (visible.length === 0) {
    return (
      <>
        <PageHero
          image="/media/hero/bg-grill.jpg"
          kicker="Your bucket"
          title="Nothing in here yet"
          subtitle="Your bucket is empty, which is a tragedy we can fix in about thirty seconds."
        >
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-full bg-ember px-8 py-4 text-[13px] font-black uppercase tracking-wider text-white hover:bg-ember-dark"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={2.6} />
            Explore the menu
          </Link>
        </PageHero>

        <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="t-section-sm uppercase tracking-wide text-charcoal">
            Start with a bestseller
          </h2>
          <ScrollRail className="mt-6" itemClassName="w-[240px]">
            {menuItems
              .filter((i) => i.tags.includes("bestseller"))
              .map((i) => (
                <button
                  key={i.slug}
                  onClick={() => setUpsell(i)}
                  data-cursor="cart"
                  className="group h-full w-full overflow-hidden rounded-2xl border border-charcoal/8 bg-white text-left transition-transform hover:-translate-y-1"
                >
                  <MediaFrame
                    src={i.image}
                    hue={i.hue}
                    glyph={i.glyph}
                    alt={i.name}
                    ratio="aspect-[4/3]"
                    sizes="240px"
                  />
                  <div className="p-4">
                    <p className="font-display text-lg uppercase tracking-wide text-charcoal">
                      {i.name}
                    </p>
                    <p className="mt-1 text-[12px] text-slate-brand">{formatPKR(i.price)}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-charcoal px-3.5 py-2 text-[10.5px] font-black uppercase tracking-wider text-cream transition-colors group-hover:bg-ember">
                      <Plus className="h-3 w-3" strokeWidth={3} /> Add
                    </span>
                  </div>
                </button>
              ))}
          </ScrollRail>
        </section>

        <ItemModal item={upsell} open={Boolean(upsell)} onClose={() => setUpsell(null)} />
      </>
    );
  }

  return (
    <>
      <PageHero
          image="/media/hero/bg-grill.jpg"
        kicker="Your bucket"
        title={[<span key="a">Check your</span>, <br key="b" />,
          <span key="c" className="bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">
            order
          </span>]}
        subtitle="Review everything, throw in a side you'll definitely want later, and head to checkout when you're ready."
      />

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        {/* Fulfilment strip */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-charcoal/8 bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-ember text-white">
              {orderType === "delivery" ? (
                <Bike className="h-5 w-5" strokeWidth={2.4} />
              ) : (
                <Store className="h-5 w-5" strokeWidth={2.4} />
              )}
            </span>
            <div className="leading-tight">
              <p className="text-[10.5px] font-black uppercase tracking-[0.18em] text-slate-brand">
                {orderType === "delivery" ? "Delivering to" : "Collecting from"}
              </p>
              <p className="text-[14px] font-bold text-charcoal">
                {branch ? `${branch.name}, ${branch.city}` : "No branch selected"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[12.5px] font-semibold text-slate-brand">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-ember" />
              {prepMax + (branch?.eta ?? 25)}–{prepMax + (branch?.eta ?? 25) + 10} min
            </span>
            <button
              onClick={() => setLocationOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-charcoal/15 px-4 py-2 text-[11.5px] font-black uppercase tracking-wider text-charcoal transition-colors hover:border-ember hover:text-ember"
            >
              <MapPin className="h-3.5 w-3.5" />
              Change
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
          {/* ---------- Lines ---------- */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="t-section-sm uppercase tracking-wide text-charcoal">
                {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
              </h2>
              <button
                onClick={() => {
                  clearCart();
                  push({ message: "Bucket emptied.", tone: "info" });
                }}
                className="text-[12px] font-bold uppercase tracking-wider text-slate-brand transition-colors hover:text-ember"
              >
                Clear bucket
              </button>
            </div>

            <ul className="mt-5 space-y-3.5">
              <AnimatePresence initial={false}>
                {visible.map((l) => {
                  const meta = menuItems.find((i) => i.slug === l.slug);
                  return (
                    <motion.li
                      key={l.key}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-4 rounded-3xl border border-charcoal/8 bg-white p-4"
                    >
                      <MediaFrame
                        src={l.image}
                        hue={l.hue}
                        glyph={l.glyph}
                        alt={l.name}
                        ratio="aspect-square"
                        className="h-[104px] w-[104px] shrink-0 rounded-2xl"
                        sizes="104px"
                        zoom={false}
                      />

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="t-sub uppercase tracking-wide text-charcoal">
                              {l.name}
                            </h3>
                            {l.size && (
                              <p className="text-[12px] font-semibold text-slate-brand">
                                {l.size.label}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeLine(l.key)}
                            aria-label={`Remove ${l.name}`}
                            className="shrink-0 rounded-full p-2 text-charcoal/25 transition-colors hover:bg-ember/10 hover:text-ember"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {(l.options.length > 0 || l.addOns.length > 0) && (
                          <ul className="mt-2 space-y-0.5">
                            {l.options.map((o) => (
                              <li key={o.groupId} className="text-[12px] text-slate-brand">
                                <span className="font-semibold">{o.groupLabel}:</span>{" "}
                                {o.choiceLabel}
                                {o.delta > 0 && (
                                  <span className="text-ember"> (+{formatPKR(o.delta)})</span>
                                )}
                              </li>
                            ))}
                            {l.addOns.map((a) => (
                              <li key={a.id} className="text-[12px] text-slate-brand">
                                <span className="font-semibold">+ {a.label}</span>{" "}
                                <span className="text-ember">({formatPKR(a.price)})</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {l.note && (
                          <p className="mt-2 rounded-lg bg-flame/10 px-3 py-1.5 text-[11.5px] italic text-slate-brand">
                            “{l.note}”
                          </p>
                        )}

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                          <QuantityStepper
                            value={l.qty}
                            onChange={(v) => setQty(l.key, v)}
                          />
                          <div className="text-right">
                            <p className="font-display text-2xl text-charcoal">
                              {formatPKR(l.unitPrice * l.qty)}
                            </p>
                            {l.qty > 1 && (
                              <p className="text-[11px] text-slate-brand">
                                {formatPKR(l.unitPrice)} each
                              </p>
                            )}
                          </div>
                        </div>

                        {meta && (
                          <button
                            onClick={() => setUpsell(meta)}
                            className="mt-2 self-start text-[11.5px] font-bold uppercase tracking-wider text-ember hover:underline"
                          >
                            Edit options
                          </button>
                        )}
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            {/* Upsells */}
            {suggestions.length > 0 && (
              <div className="mt-8">
                <h3 className="t-sub uppercase tracking-wide text-charcoal">
                  Goes well with that
                </h3>
                <ScrollRail className="mt-4" itemClassName="w-[190px]">
                  {suggestions.map((i) => (
                    <button
                      key={i.slug}
                      onClick={() => setUpsell(i)}
                      className="group h-full w-full overflow-hidden rounded-2xl border border-charcoal/8 bg-white text-left transition-transform hover:-translate-y-1"
                    >
                      <MediaFrame
                        src={i.image}
                        hue={i.hue}
                        glyph={i.glyph}
                        alt={i.name}
                        ratio="aspect-square"
                        sizes="190px"
                      />
                      <div className="p-3.5">
                        <p className="truncate font-display text-[15px] uppercase tracking-wide text-charcoal">
                          {i.name}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-[12.5px] font-bold text-charcoal">
                            {formatPKR(i.price)}
                          </span>
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-charcoal text-cream transition-colors group-hover:bg-ember">
                            <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </ScrollRail>
              </div>
            )}
          </div>

          {/* ---------- Summary ---------- */}
          <aside className="lg:sticky lg:top-28">
            <div className="rounded-3xl border border-charcoal/8 bg-white p-6">
              <h2 className="t-section-sm uppercase tracking-wide text-charcoal">
                Order summary
              </h2>

              {/* Free delivery meter */}
              {orderType === "delivery" && (
                <div className="mt-4 rounded-2xl bg-flame/8 p-4">
                  {totals.qualifiesForFreeDelivery ? (
                    <p className="flex items-center gap-2 text-[12.5px] font-bold text-ember-dark">
                      <Sparkles className="h-4 w-4" />
                      Free delivery unlocked
                    </p>
                  ) : (
                    <>
                      <p className="text-[12.5px] font-semibold text-charcoal">
                        Add {formatPKR(totals.freeDeliveryRemaining)} for{" "}
                        <span className="font-black text-ember">free delivery</span>
                      </p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-charcoal/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-flame to-ember"
                          animate={{
                            width: `${Math.min(100, (totals.subtotal / brand.freeDeliveryOver) * 100)}%`,
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Coupon */}
              <div className="mt-5">
                {coupon ? (
                  <div className="flex items-center justify-between rounded-2xl bg-fresh/10 px-4 py-3">
                    <span className="flex items-center gap-2 text-[12.5px] font-bold text-green-800">
                      <Ticket className="h-4 w-4" />
                      {coupon.code}
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-[11px] font-black uppercase tracking-wider text-charcoal/50 hover:text-ember"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Promo code"
                      aria-label="Promo code"
                      className="flex-1 rounded-full border border-charcoal/12 bg-white px-4 py-2.5 text-[13px] font-bold uppercase outline-none placeholder:font-semibold placeholder:normal-case focus:border-ember"
                    />
                    <button
                      onClick={() => {
                        const res = applyCoupon(code);
                        push({ message: res.message, tone: res.ok ? "success" : "error" });
                        if (res.ok) setCode("");
                      }}
                      className="shrink-0 rounded-full bg-charcoal px-5 text-[11px] font-black uppercase tracking-wider text-cream hover:bg-ember"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Tip */}
              <div className="mt-5">
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
                      {v === 0 ? "None" : formatPKR(v).replace("Rs ", "Rs")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <dl className="mt-6 space-y-2 border-t border-charcoal/8 pt-5 text-[13.5px]">
                <Row label="Subtotal" value={formatPKR(totals.subtotal)} />
                {totals.discount > 0 && (
                  <Row
                    label={`Discount (${coupon?.code})`}
                    value={`− ${formatPKR(totals.discount)}`}
                    tone="fresh"
                  />
                )}
                {orderType === "delivery" && (
                  <Row
                    label="Delivery"
                    value={
                      totals.qualifiesForFreeDelivery || totals.deliveryFee === 0
                        ? "Free"
                        : formatPKR(totals.deliveryFee)
                    }
                    tone={
                      totals.qualifiesForFreeDelivery || totals.deliveryFee === 0
                        ? "fresh"
                        : undefined
                    }
                  />
                )}
                <Row label={`Sales tax (${(brand.taxRate * 100).toFixed(0)}%)`} value={formatPKR(totals.tax)} />
                {totals.tip > 0 && <Row label="Rider tip" value={formatPKR(totals.tip)} />}
              </dl>

              <div className="mt-4 flex items-end justify-between border-t border-charcoal/8 pt-4">
                <span className="text-[14px] font-black uppercase tracking-wider text-charcoal">
                  Total
                </span>
                <span className="font-display text-[34px] leading-none text-charcoal">
                  {formatPKR(totals.total)}
                </span>
              </div>

              {totals.belowMinimum && (
                <p className="mt-4 rounded-xl bg-ember/10 px-4 py-3 text-[12.5px] font-semibold text-ember-dark">
                  Minimum order for delivery is {formatPKR(brand.minOrder)}. Add{" "}
                  {formatPKR(brand.minOrder - totals.subtotal)} more to continue.
                </p>
              )}

              <Link
                href={totals.belowMinimum ? "#" : "/checkout"}
                aria-disabled={totals.belowMinimum}
                className={cn(
                  "mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ember px-6 py-4 text-[13px] font-black uppercase tracking-wider text-white transition-all hover:bg-ember-dark active:scale-[0.98]",
                  totals.belowMinimum && "pointer-events-none opacity-40",
                )}
              >
                Checkout
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </Link>

              <Link
                href="/menu"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-charcoal/12 py-3.5 text-[12px] font-black uppercase tracking-wider text-charcoal transition-colors hover:border-charcoal"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                Add more food
              </Link>

              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-charcoal/4 px-4 py-3">
                <Truck className="h-4 w-4 shrink-0 text-ember" />
                <p className="text-[11.5px] leading-snug text-slate-brand">
                  {orderType === "delivery"
                    ? "Riders are dispatched the moment your food leaves the grill."
                    : "Skip the queue — we'll text you when it's bagged and ready."}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <ItemModal item={upsell} open={Boolean(upsell)} onClose={() => setUpsell(null)} />
    </>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "fresh";
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={tone === "fresh" ? "text-green-700" : "text-slate-brand"}>{label}</dt>
      <dd className={cn("font-bold", tone === "fresh" ? "text-green-700" : "text-charcoal")}>
        {value}
      </dd>
    </div>
  );
}

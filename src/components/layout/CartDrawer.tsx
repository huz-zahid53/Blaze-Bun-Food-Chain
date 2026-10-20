"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Percent,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useStore, computeTotals } from "@/store/useStore";
import { regularMenuItems } from "@/data/menu";
import { brand } from "@/config/brand";
import { formatPKR, cn } from "@/lib/utils";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { useToast } from "@/components/ui/Toast";

export function CartDrawer() {
  const open = useStore((s) => s.cartOpen);
  const setOpen = useStore((s) => s.setCartOpen);
  const lines = useStore((s) => s.lines);
  const orderType = useStore((s) => s.orderType);
  const coupon = useStore((s) => s.coupon);
  const tip = useStore((s) => s.tip);
  const setQty = useStore((s) => s.setQty);
  const removeLine = useStore((s) => s.removeLine);
  const addLine = useStore((s) => s.addLine);
  const applyCoupon = useStore((s) => s.applyCoupon);
  const removeCoupon = useStore((s) => s.removeCoupon);
  const hydrated = useStore((s) => s.hydrated);
  const push = useToast((s) => s.push);

  const [code, setCode] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);

  const { subtotal, total, itemCount, deliveryFee, freeDeliveryRemaining, qualifiesForFreeDelivery } =
    computeTotals(lines, orderType, coupon, tip);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const visibleLines = hydrated ? lines : [];
  const progress = Math.min(100, (subtotal / brand.freeDeliveryOver) * 100);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[115] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 330, damping: 34 }}
            className="relative flex h-full w-full max-w-[440px] flex-col bg-cream shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-charcoal/8 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-charcoal">
                  <ShoppingBag className="h-5 w-5 text-cream" strokeWidth={2.3} />
                  {itemCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 font-display text-[11px] text-white">
                      {itemCount}
                    </span>
                  )}
                </span>
                <div className="leading-tight">
                  <h3 className="t-section-sm uppercase tracking-wide text-charcoal">
                    Your bucket
                  </h3>
                  <p className="text-[11.5px] text-slate-brand">
                    {orderType === "delivery"
                      ? "Delivery"
                      : orderType === "pickup"
                        ? "Pick-up"
                        : "Catering"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close bucket"
                className="grid h-9 w-9 place-items-center rounded-full bg-charcoal/6 text-charcoal transition-colors hover:bg-charcoal hover:text-cream"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Free delivery meter */}
            {orderType === "delivery" && visibleLines.length > 0 && (
              <div className="border-b border-charcoal/8 bg-flame/8 px-5 py-3">
                {qualifiesForFreeDelivery ? (
                  <p className="flex items-center gap-2 text-[12.5px] font-bold text-ember-dark">
                    <Sparkles className="h-4 w-4" />
                    You've unlocked free delivery
                  </p>
                ) : (
                  <>
                    <p className="text-[12.5px] font-semibold text-charcoal">
                      <Truck className="mr-1.5 inline h-4 w-4 text-ember" />
                      Add {formatPKR(freeDeliveryRemaining)} more for{" "}
                      <span className="text-ember">free delivery</span>
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-charcoal/10">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-flame to-ember"
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 200, damping: 28 }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Lines */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {visibleLines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="grid h-20 w-20 place-items-center rounded-3xl bg-charcoal/5">
                    <ShoppingBag className="h-9 w-9 text-charcoal/25" strokeWidth={1.6} />
                  </span>
                  <p className="mt-5 font-display text-2xl uppercase tracking-wide text-charcoal">
                    Empty bucket
                  </p>
                  <p className="mt-1.5 max-w-[260px] text-[13.5px] text-slate-brand">
                    You haven't added anything yet. The flame is waiting.
                  </p>
                  <Link
                    href="/menu"
                    onClick={() => setOpen(false)}
                    className="mt-6 rounded-full bg-ember px-7 py-3.5 text-[12px] font-black uppercase tracking-wider text-white"
                  >
                    Explore the menu
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3.5">
                  <AnimatePresence initial={false}>
                    {visibleLines.map((l) => (
                      <motion.li
                        key={l.key}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.28 }}
                        className="flex gap-3 rounded-2xl border border-charcoal/8 bg-white p-3"
                      >
                        <MediaFrame
                          src={l.image}
                          hue={l.hue}
                          glyph={l.glyph}
                          alt={l.name}
                          ratio="aspect-square"
                          className="h-[76px] w-[76px] shrink-0 rounded-xl"
                          sizes="76px"
                          zoom={false}
                        />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-[13.5px] font-bold leading-snug text-charcoal">
                                {l.name}
                              </p>
                              {l.size && (
                                <p className="text-[11px] font-semibold text-slate-brand">
                                  {l.size.label}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => removeLine(l.key)}
                              aria-label={`Remove ${l.name}`}
                              className="shrink-0 rounded-full p-1.5 text-charcoal/30 transition-colors hover:bg-ember/10 hover:text-ember"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {(l.options.length > 0 || l.addOns.length > 0) && (
                            <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-slate-brand/85">
                              {[...l.options.map((o) => o.choiceLabel), ...l.addOns.map((a) => a.label)].join(
                                " · ",
                              )}
                            </p>
                          )}

                          <div className="mt-auto flex items-center justify-between pt-2">
                            <QuantityStepper
                              value={l.qty}
                              onChange={(v) => setQty(l.key, v)}
                              size="sm"
                            />
                            <span className="font-display text-lg text-charcoal">
                              {formatPKR(l.unitPrice * l.qty)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}

              {/* Quick Add-ons & Extras Upsell */}
              {visibleLines.length > 0 && (
                <div className="mt-5 border-t border-charcoal/8 pt-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-charcoal">
                      Add Extras & Dips
                    </span>
                    <span className="text-[10px] font-semibold text-slate-brand">
                      1-Tap Add
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {regularMenuItems
                      .filter((i) => i.categoryId === "addons" || i.categoryId === "sauces")
                      .slice(0, 6)
                      .map((extra) => (
                        <button
                          key={extra.slug}
                          type="button"
                          data-cursor="cart"
                          onClick={() => {
                            addLine({
                              slug: extra.slug,
                              name: extra.name,
                              image: extra.image,
                              hue: extra.hue,
                              glyph: extra.glyph,
                              basePrice: extra.price,
                              unitPrice: extra.price,
                              qty: 1,
                              options: [],
                              addOns: [],
                              categoryId: extra.categoryId,
                            });
                            push({
                              message: `${extra.name} added to bucket`,
                              tone: "success",
                            });
                          }}
                          className="shrink-0 flex items-center gap-2 rounded-xl border border-charcoal/10 bg-white px-3 py-2 text-left transition-all hover:border-ember hover:bg-ember/5"
                        >
                          <div className="min-w-0">
                            <p className="truncate max-w-[110px] text-[11.5px] font-bold text-charcoal">
                              {extra.name}
                            </p>
                            <p className="text-[10.5px] font-semibold text-ember-dark">
                              +{formatPKR(extra.price)}
                            </p>
                          </div>
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-charcoal/8 text-charcoal group-hover:bg-ember group-hover:text-white">
                            <Plus className="h-3 w-3 stroke-[3]" />
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Coupon */}
              {visibleLines.length > 0 && (
                <div className="mt-5 border-t border-charcoal/8 pt-4">
                  {coupon ? (
                    <div className="flex items-center justify-between rounded-2xl bg-fresh/10 px-4 py-3">
                      <span className="flex items-center gap-2 text-[12.5px] font-bold text-green-800">
                        <Percent className="h-4 w-4" />
                        {coupon.code} — {coupon.label}
                      </span>
                      <button
                        onClick={removeCoupon}
                        className="text-[11px] font-black uppercase tracking-wider text-charcoal/50 hover:text-ember"
                      >
                        Remove
                      </button>
                    </div>
                  ) : showCoupon ? (
                    <div className="flex gap-2">
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 rounded-full border border-charcoal/12 bg-white px-4 py-2.5 text-[13px] font-bold uppercase outline-none placeholder:font-semibold placeholder:normal-case focus:border-ember"
                      />
                      <button
                        onClick={() => {
                          const res = applyCoupon(code);
                          push({ message: res.message, tone: res.ok ? "success" : "error" });
                          if (res.ok) setCode("");
                        }}
                        className="rounded-full bg-charcoal px-5 text-[11px] font-black uppercase tracking-wider text-cream hover:bg-ember"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCoupon(true)}
                      className="flex w-full items-center justify-between rounded-2xl border border-dashed border-charcoal/20 px-4 py-3 text-[12.5px] font-bold text-slate-brand transition-colors hover:border-ember hover:text-ember"
                    >
                      <span className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Have a promo code?
                      </span>
                      <span className="text-ember">Add</span>
                    </button>
                  )}
                  <p className="mt-2.5 text-center text-[10.5px] text-slate-brand/70">
                    Try <span className="font-black text-charcoal">BLAZE20</span>,{" "}
                    <span className="font-black text-charcoal">FREERIDE</span> or{" "}
                    <span className="font-black text-charcoal">BUN250</span>
                  </p>
                </div>
              )}
            </div>

            {/* Footer / checkout */}
            {visibleLines.length > 0 && (
              <div className="border-t border-charcoal/8 bg-white px-5 py-4">
                <dl className="space-y-1.5 text-[13px]">
                  <div className="flex justify-between">
                    <dt className="text-slate-brand">Subtotal</dt>
                    <dd className="font-bold text-charcoal">{formatPKR(subtotal)}</dd>
                  </div>
                  {orderType === "delivery" && (
                    <div className="flex justify-between">
                      <dt className="text-slate-brand">Delivery</dt>
                      <dd className="font-bold text-charcoal">
                        {qualifiesForFreeDelivery ? (
                          <span className="text-fresh">Free</span>
                        ) : (
                          formatPKR(deliveryFee)
                        )}
                      </dd>
                    </div>
                  )}
                  {computeTotals(lines, orderType, coupon, tip).discount > 0 && (
                    <div className="flex justify-between text-fresh">
                      <dt>Discount{coupon ? ` (${coupon.code})` : ""}</dt>
                      <dd className="font-bold">
                        − {formatPKR(computeTotals(lines, orderType, coupon, tip).discount)}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="mt-3 flex items-end justify-between border-t border-charcoal/8 pt-3">
                  <span className="text-[13px] font-bold text-slate-brand">Total</span>
                  <span className="font-display text-3xl text-charcoal">
                    {formatPKR(total)}
                  </span>
                </div>

                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="mt-1 block text-center text-[11.5px] font-bold text-slate-brand underline-offset-4 hover:text-ember hover:underline"
                >
                  Edit full bucket
                </Link>

                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-ember px-6 py-4 text-sm font-black uppercase tracking-wider text-white shadow-[0_12px_30px_-10px_rgba(255,77,20,0.7)] transition-all hover:bg-ember-dark active:scale-[0.98]"
                >
                  Checkout
                  <ArrowRight className="h-4 w-4" strokeWidth={3} />
                </Link>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

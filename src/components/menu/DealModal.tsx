"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Flame, Plus, Sparkles, Tag, X } from "lucide-react";
import type { Deal, DealSlot } from "@/data/deals";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { PriceTag } from "@/components/ui/Badge";
import { formatPKR, discountPct, cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { useToast } from "@/components/ui/Toast";

interface Props {
  deal: Deal | null;
  open: boolean;
  onClose: () => void;
}

export function DealModal({ deal, open, onClose }: Props) {
  const addLine = useStore((s) => s.addLine);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const push = useToast((s) => s.push);

  const [qty, setQty] = useState(1);
  const [choices, setChoices] = useState<Record<string, string>>({});

  // Reset defaults when a deal opens
  useEffect(() => {
    if (!deal) return;
    setQty(1);
    const defaults: Record<string, string> = {};
    for (const slot of deal.slots) {
      if (slot.choices.length > 0) {
        defaults[slot.id] = slot.choices[0].id;
      }
    }
    setChoices(defaults);
  }, [deal]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Total unit price calculation with surcharges
  const { unitPrice, surchargesTotal } = useMemo(() => {
    if (!deal) return { unitPrice: 0, surchargesTotal: 0 };
    let extra = 0;
    for (const slot of deal.slots) {
      const selectedId = choices[slot.id];
      const match = slot.choices.find((c) => c.id === selectedId);
      if (match?.surcharge) extra += match.surcharge;
    }
    return {
      unitPrice: deal.price + extra,
      surchargesTotal: extra,
    };
  }, [deal, choices]);

  if (!deal) return null;

  const off = discountPct(deal.price, deal.originalPrice);

  function handleAdd(openCart: boolean) {
    if (!deal) return;

    // Convert deal slot choices to standard options for unified cart representation
    const selectedOptions = deal.slots.map((slot) => {
      const selectedChoice = slot.choices.find((c) => c.id === choices[slot.id]);
      return {
        groupId: slot.id,
        groupLabel: slot.title,
        choiceId: selectedChoice?.id || "",
        choiceLabel: selectedChoice?.name || "",
        delta: selectedChoice?.surcharge || 0,
      };
    });

    addLine(
      {
        slug: deal.slug,
        name: deal.title,
        image: deal.image,
        hue: deal.hue,
        glyph: deal.glyph,
        basePrice: deal.price,
        unitPrice,
        qty,
        options: selectedOptions,
        addOns: [],
        categoryId: "deals",
      },
      qty,
    );

    push({
      message: `${qty}× ${deal.title} added to your bucket`,
      tone: "success",
    });

    if (openCart) setCartOpen(true);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 70, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-[880px] flex-col overflow-hidden rounded-t-[28px] bg-cream shadow-2xl sm:rounded-[28px]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close deal modal"
              className="absolute right-4 top-4 z-30 grid h-9 w-9 place-items-center rounded-full bg-charcoal/70 text-cream backdrop-blur transition-colors hover:bg-ember"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Deal Hero Header */}
            <div className="relative shrink-0 border-b border-charcoal/10 bg-charcoal text-cream">
              <div className="relative aspect-[21/9] sm:aspect-[24/8] min-h-[160px] w-full overflow-hidden">
                <MediaFrame
                  src={deal.image}
                  hue={deal.hue}
                  glyph={deal.glyph}
                  alt={deal.title}
                  ratio="h-full w-full"
                  sizes="(max-width: 768px) 100vw, 880px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-charcoal/20" />

                {/* Floating Badges */}
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ember px-3 py-1 text-[10.5px] font-black uppercase tracking-wider text-white shadow-md">
                    <Flame className="h-3 w-3" />
                    {deal.badge ?? "Special Deal"}
                  </span>
                  {off > 0 && (
                    <span className="rounded-full bg-gold px-3 py-1 text-[10.5px] font-black uppercase tracking-wider text-charcoal shadow-md">
                      Save {off}%
                    </span>
                  )}
                  {deal.window && (
                    <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10.5px] font-black uppercase tracking-wider text-cream">
                      {deal.window}
                    </span>
                  )}
                </div>

                {/* Deal Header Info */}
                <div className="absolute inset-x-4 bottom-3 sm:inset-x-6 sm:bottom-4">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-ember-light">
                    {deal.kicker}
                  </span>
                  <h2 className="t-section-sm sm:t-section uppercase tracking-wide text-white">
                    {deal.title}
                  </h2>
                </div>
              </div>

              {/* Deal Contents Ribbon */}
              <div className="flex items-center gap-2 overflow-x-auto bg-charcoal-light/70 px-4 py-2.5 sm:px-6 text-[12px] text-cream/80 no-scrollbar">
                <span className="shrink-0 font-bold text-gold uppercase tracking-wider text-[10.5px]">
                  Includes:
                </span>
                {deal.contents.map((item, idx) => (
                  <span
                    key={idx}
                    className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-cream"
                  >
                    <Check className="h-3 w-3 text-emerald-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Scrollable Slots Configuration Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <div className="rounded-2xl bg-charcoal/4 p-3.5 text-[13px] text-slate-brand">
                <p>{deal.description}</p>
              </div>

              {/* Slots List */}
              <div className="space-y-6">
                {deal.slots.map((slot, sIdx) => {
                  const currentChoice = choices[slot.id];

                  return (
                    <section key={slot.id} className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-[13px] font-black uppercase tracking-wider text-charcoal flex items-center gap-2">
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-ember text-white text-[10.5px]">
                            {sIdx + 1}
                          </span>
                          {slot.title}
                        </h3>
                        {slot.required && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-brand">
                            Required
                          </span>
                        )}
                      </div>

                      {/* Choice items */}
                      <div className="grid gap-2 sm:grid-cols-2">
                        {slot.choices.map((choice) => {
                          const isSelected = currentChoice === choice.id;

                          return (
                            <button
                              key={choice.id}
                              type="button"
                              onClick={() =>
                                setChoices((prev) => ({
                                  ...prev,
                                  [slot.id]: choice.id,
                                }))
                              }
                              className={cn(
                                "flex items-center justify-between rounded-xl border p-3 text-left transition-all",
                                isSelected
                                  ? "border-ember bg-ember/6 shadow-sm ring-1 ring-ember"
                                  : "border-charcoal/10 bg-white hover:border-charcoal/25",
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <span
                                  className={cn(
                                    "grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full border transition-colors",
                                    isSelected
                                      ? "border-ember bg-ember text-white"
                                      : "border-charcoal/30 bg-transparent",
                                  )}
                                >
                                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                </span>
                                <span className="truncate text-[12.5px] font-semibold text-charcoal">
                                  {choice.name}
                                </span>
                              </div>

                              {choice.surcharge && choice.surcharge > 0 ? (
                                <span className="shrink-0 rounded-full bg-charcoal/8 px-2 py-0.5 text-[11px] font-bold text-ember-dark">
                                  +{formatPKR(choice.surcharge)}
                                </span>
                              ) : (
                                <span className="shrink-0 text-[10.5px] font-semibold text-slate-brand/70">
                                  Included
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>

            {/* Footer with Price and Add to Bucket Button */}
            <div className="border-t border-charcoal/10 bg-white p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                {/* Price Display */}
                <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4">
                  <QuantityStepper value={qty} onChange={setQty} />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-2xl text-charcoal">
                        {formatPKR(unitPrice * qty)}
                      </span>
                      {deal.originalPrice > unitPrice && (
                        <span className="text-[13px] text-slate-brand line-through">
                          {formatPKR(deal.originalPrice * qty)}
                        </span>
                      )}
                    </div>
                    {surchargesTotal > 0 && (
                      <p className="text-[10px] text-slate-brand">
                        Includes {formatPKR(surchargesTotal)} upgrade surcharges
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleAdd(false)}
                    className="flex-1 sm:flex-none rounded-full border-2 border-charcoal/15 px-5 py-3 text-[12px] font-black uppercase tracking-wider text-charcoal transition-colors hover:border-charcoal hover:bg-charcoal hover:text-cream"
                  >
                    Add & Continue
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdd(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full bg-ember px-6 py-3 text-[12px] font-black uppercase tracking-wider text-white shadow-lg shadow-ember/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    Add Bundle
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

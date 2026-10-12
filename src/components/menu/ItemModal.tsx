"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, ShoppingBag, X } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { SpiceMeter, Rating } from "@/components/ui/Meters";
import { PriceTag, MetaChip, Badge } from "@/components/ui/Badge";
import { formatPKR, cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { useToast } from "@/components/ui/Toast";
import type { MenuItem } from "@/data/menu";
import { Clock, Flame } from "lucide-react";

interface Props {
  item: MenuItem | null;
  open: boolean;
  onClose: () => void;
}

/** Full item configurator — sizes, required options, add-ons, kitchen note. */
export function ItemModal({ item, open, onClose }: Props) {
  const addLine = useStore((s) => s.addLine);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const push = useToast((s) => s.push);

  const [qty, setQty] = useState(1);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [addOns, setAddOns] = useState<string[]>([]);
  const [note, setNote] = useState("");

  // Reset configuration whenever a different item opens
  useEffect(() => {
    if (!item) return;
    setQty(1);
    setSizeIdx(0);
    setNote("");
    setAddOns([]);
    setChoices(
      Object.fromEntries(
        (item.options ?? [])
          .filter((o) => o.required)
          .map((o) => [o.id, o.choices[0].id]),
      ),
    );
  }, [item]);

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

  const unitPrice = useMemo(() => {
    if (!item) return 0;
    let p = item.price + (item.sizes?.[sizeIdx]?.delta ?? 0);
    for (const o of item.options ?? []) {
      const chosen = choices[o.id];
      const c = o.choices.find((x) => x.id === chosen);
      if (c) p += c.delta;
    }
    for (const a of addOns) {
      const found = item.addOns?.find((x) => x.id === a);
      if (found) p += found.price;
    }
    return p;
  }, [item, sizeIdx, choices, addOns]);

  if (!item) return null;

  const missingRequired = (item.options ?? []).some(
    (o) => o.required && !choices[o.id],
  );

  function handleAdd(openCart: boolean) {
    if (!item) return;
    addLine(
      {
        slug: item.slug,
        name: item.name,
        image: item.image,
        hue: item.hue,
        glyph: item.glyph,
        basePrice: item.price,
        unitPrice,
        qty,
        size: item.sizes?.[sizeIdx]
          ? { label: item.sizes[sizeIdx].label, delta: item.sizes[sizeIdx].delta }
          : undefined,
        options: (item.options ?? [])
          .map((o) => {
            const c = o.choices.find((x) => x.id === choices[o.id]);
            return c
              ? {
                  groupId: o.id,
                  groupLabel: o.label,
                  choiceId: c.id,
                  choiceLabel: c.label,
                  delta: c.delta,
                }
              : null;
          })
          .filter(Boolean) as {
          groupId: string;
          groupLabel: string;
          choiceId: string;
          choiceLabel: string;
          delta: number;
        }[],
        addOns: addOns
          .map((id) => item.addOns?.find((a) => a.id === id))
          .filter(Boolean) as { id: string; label: string; price: number }[],
        note: note.trim() || undefined,
        categoryId: item.categoryId,
      },
      qty,
    );
    push({
      message: `${qty}× ${item.name} added to your bucket`,
      tone: "success",
    });
    if (openCart) setCartOpen(true);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[118] flex items-end justify-center sm:items-center">
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
            className="relative z-10 flex max-h-[93vh] w-full max-w-[980px] flex-col overflow-hidden rounded-t-[28px] bg-cream shadow-2xl sm:rounded-[28px] md:flex-row"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-charcoal/70 text-cream backdrop-blur transition-colors hover:bg-ember"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Media */}
            <div className="relative shrink-0 md:w-[46%]">
              <MediaFrame
                src={item.image}
                hue={item.hue}
                glyph={item.glyph}
                alt={item.name}
                ratio="aspect-[4/3] md:aspect-auto md:h-full"
                sizes="(max-width: 768px) 100vw, 46vw"
                priority
                zoom={false}
              />
              <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
                {item.tags.includes("bestseller") && (
                  <Badge tone="ember">Bestseller</Badge>
                )}
                {item.tags.includes("new") && <Badge tone="fresh">New</Badge>}
                {item.tags.includes("veg") && <Badge tone="fresh">Veg</Badge>}
                {item.tags.includes("midnight") && (
                  <Badge tone="dark">Midnight</Badge>
                )}
              </div>
            </div>

            {/* Configurator */}
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
                <div className="pr-10">
                  <h2 className="t-section-sm uppercase tracking-wide text-charcoal">
                    {item.name}
                  </h2>
                  <div className="mt-2.5 flex flex-wrap items-center gap-3">
                    <Rating value={item.rating} reviews={item.reviews} />
                    <SpiceMeter level={item.spice} showLabel />
                  </div>
                  <p className="mt-3.5 text-[14px] leading-[1.6] text-slate-brand">
                    {item.story ?? item.blurb}
                  </p>
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    <MetaChip>
                      <Clock className="h-3 w-3" /> {item.prepMinutes} min
                    </MetaChip>
                    <MetaChip>
                      <Flame className="h-3 w-3" /> {item.calories} kcal
                    </MetaChip>
                    {item.allergens.length > 0 && (
                      <MetaChip>Contains: {item.allergens.join(", ")}</MetaChip>
                    )}
                  </div>
                </div>

                {/* Sizes */}
                {item.sizes && item.sizes.length > 0 && (
                  <Section label="Choose a size">
                    <div className="grid gap-2 sm:grid-cols-3">
                      {item.sizes.map((s, i) => (
                        <button
                          key={s.label}
                          onClick={() => setSizeIdx(i)}
                          className={cn(
                            "rounded-2xl border-2 p-3 text-left transition-all",
                            sizeIdx === i
                              ? "border-ember bg-ember/6"
                              : "border-charcoal/10 hover:border-charcoal/25",
                          )}
                        >
                          <span className="block text-[13px] font-black text-charcoal">
                            {s.label}
                          </span>
                          <span className="block text-[11px] text-slate-brand">
                            {s.serves}
                          </span>
                          {s.delta > 0 && (
                            <span className="mt-1 block text-[12px] font-bold text-ember">
                              + {formatPKR(s.delta)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Options */}
                {(item.options ?? []).map((o) => (
                  <Section
                    key={o.id}
                    label={o.label}
                    hint={o.required ? "Required" : "Optional"}
                  >
                    <div className="space-y-1.5">
                      {o.choices.map((c) => {
                        const active = choices[o.id] === c.id;
                        return (
                          <label
                            key={c.id}
                            className={cn(
                              "flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 px-4 py-2.5 transition-all",
                              active
                                ? "border-ember bg-ember/6"
                                : "border-charcoal/10 hover:border-charcoal/25",
                            )}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={cn(
                                  "grid h-4.5 w-4.5 place-items-center border-2 transition-colors",
                                  o.type === "single"
                                    ? "rounded-full border-charcoal/25"
                                    : "rounded-[5px] border-charcoal/25",
                                  active && "border-ember bg-ember",
                                )}
                              >
                                {active && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                              </span>
                              <input
                                type={o.type === "single" ? "radio" : "checkbox"}
                                name={o.id}
                                checked={active}
                                onChange={() =>
                                  setChoices((prev) => ({ ...prev, [o.id]: c.id }))
                                }
                                className="sr-only"
                              />
                              <span className="text-[13.5px] font-semibold text-charcoal">
                                {c.label}
                              </span>
                            </span>
                            {c.delta > 0 && (
                              <span className="text-[12.5px] font-bold text-ember">
                                + {formatPKR(c.delta)}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </Section>
                ))}

                {/* Add-ons */}
                {item.addOns && item.addOns.length > 0 && (
                  <Section label="Pimp it up" hint="Optional">
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {item.addOns.map((a) => {
                        const active = addOns.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            onClick={() =>
                              setAddOns((prev) =>
                                active
                                  ? prev.filter((x) => x !== a.id)
                                  : [...prev, a.id],
                              )
                            }
                            className={cn(
                              "flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-2.5 text-left transition-all",
                              active
                                ? "border-ember bg-ember/6"
                                : "border-charcoal/10 hover:border-charcoal/25",
                            )}
                          >
                            <span className="flex items-center gap-2.5">
                              <span
                                className={cn(
                                  "grid h-4.5 w-4.5 shrink-0 place-items-center rounded-[5px] border-2 transition-colors",
                                  active ? "border-ember bg-ember" : "border-charcoal/25",
                                )}
                              >
                                {active && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                )}
                              </span>
                              <span className="text-[13px] font-semibold text-charcoal">
                                {a.label}
                              </span>
                            </span>
                            <span className="text-[12.5px] font-bold text-ember">
                              + {formatPKR(a.price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </Section>
                )}

                {/* Kitchen note */}
                <Section label="Note for the kitchen" hint="Optional">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    maxLength={200}
                    placeholder="No pickles, extra napkins, sauce on the side…"
                    className="w-full resize-none rounded-xl border border-charcoal/12 bg-white px-4 py-3 text-[13.5px] outline-none transition-colors placeholder:text-slate-brand/60 focus:border-ember"
                  />
                </Section>
              </div>

              {/* Sticky add bar */}
              <div className="border-t border-charcoal/8 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <QuantityStepper value={qty} onChange={setQty} size="lg" />
                  <PriceTag value={unitPrice * qty} size="lg" />
                </div>
                <div className="mt-3 flex gap-2.5">
                  <button
                    onClick={() => handleAdd(true)}
                    disabled={missingRequired}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ember px-5 py-4 text-[13px] font-black uppercase tracking-wider text-white transition-all hover:bg-ember-dark active:scale-[0.98] disabled:opacity-40"
                  >
                    <ShoppingBag className="h-4 w-4" strokeWidth={2.6} />
                    Add & view bucket
                  </button>
                  <button
                    onClick={() => handleAdd(false)}
                    disabled={missingRequired}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-charcoal px-6 py-4 text-[13px] font-black uppercase tracking-wider text-cream transition-all hover:bg-ink active:scale-[0.98] disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" strokeWidth={3} />
                    Add
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

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <div className="mb-2.5 flex items-baseline justify-between">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-charcoal">
          {label}
        </h3>
        {hint && (
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-brand/70">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

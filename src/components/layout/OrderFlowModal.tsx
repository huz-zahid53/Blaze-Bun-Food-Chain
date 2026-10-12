"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bike,
  Check,
  ChevronRight,
  Crosshair,
  MapPin,
  PartyPopper,
  Search,
  Store,
  Star,
  X,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { branches } from "@/data/branches";
import { cities, orderTypes } from "@/config/brand";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

const iconFor = (id: string) =>
  id === "delivery" ? Bike : id === "pickup" ? Store : PartyPopper;

/**
 * Order-type + location gate.
 * Mirrors the Indolj flow used by burgerlab / bigbash / jajisbistro:
 * pick how you want it, then pick where.
 */
export function OrderFlowModal() {
  const open = useStore((s) => s.locationOpen);
  const setOpen = useStore((s) => s.setLocationOpen);
  const orderType = useStore((s) => s.orderType);
  const setOrderType = useStore((s) => s.setOrderType);
  const branchId = useStore((s) => s.branchId);
  const setBranch = useStore((s) => s.setBranch);
  const city = useStore((s) => s.city);

  const [step, setStep] = useState<"type" | "location">("type");
  const [selectedCity, setSelectedCity] = useState(city);
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (open) {
      setStep("type");
      setSelectedCity(city);
      setQuery("");
    }
  }, [open, city]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return branches
      .filter((b) => b.city === selectedCity)
      .filter(
        (b) =>
          !q ||
          b.name.toLowerCase().includes(q) ||
          b.area.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q),
      );
  }, [selectedCity, query]);

  function useCurrentLocation() {
    setLocating(true);
    if (!("geolocation" in navigator)) {
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let best = branches[0];
        let bestD = Infinity;
        for (const b of branches) {
          const d = Math.hypot(b.lat - latitude, b.lng - longitude);
          if (d < bestD) {
            bestD = d;
            best = b;
          }
        }
        setBranch(best.id, best.city);
        setLocating(false);
        setOpen(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-charcoal/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative z-10 max-h-[92vh] w-full max-w-[560px] overflow-hidden rounded-t-[28px] bg-cream shadow-2xl sm:rounded-[28px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-charcoal/8 px-6 py-4">
              <Logo compact={false} />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full bg-charcoal/6 text-charcoal transition-colors hover:bg-charcoal hover:text-cream"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="max-h-[calc(92vh-140px)] overflow-y-auto">
              {/* ============ STEP 1 — ORDER TYPE ============ */}
              <AnimatePresence mode="wait">
                {step === "type" && (
                  <motion.div
                    key="type"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6"
                  >
                    <h3 className="t-section-sm uppercase tracking-wide text-charcoal">
                      Select your order type
                    </h3>
                    <p className="mt-1.5 text-[13.5px] text-slate-brand">
                      How would you like your food?
                    </p>

                    <div className="mt-6 space-y-3">
                      {orderTypes.map((t) => {
                        const Icon = iconFor(t.id);
                        const active = orderType === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setOrderType(t.id as "delivery" | "pickup" | "catering")}
                            className={cn(
                              "group flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all",
                              active
                                ? "border-ember bg-ember/6"
                                : "border-charcoal/10 hover:border-charcoal/25",
                            )}
                          >
                            <span
                              className={cn(
                                "grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-colors",
                                active
                                  ? "bg-ember text-white"
                                  : "bg-charcoal/6 text-charcoal group-hover:bg-charcoal/10",
                              )}
                            >
                              <Icon className="h-5.5 w-5.5" strokeWidth={2.4} />
                            </span>
                            <span className="flex-1">
                              <span className="block font-display text-xl uppercase tracking-wide text-charcoal">
                                {t.label}
                              </span>
                              <span className="block text-[12.5px] text-slate-brand">
                                {t.blurb}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                                active
                                  ? "border-ember bg-ember text-white"
                                  : "border-charcoal/20",
                              )}
                            >
                              {active && <Check className="h-3.5 w-3.5" strokeWidth={3.5} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setStep("location")}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-charcoal px-6 py-4 text-sm font-black uppercase tracking-wider text-cream transition-all hover:bg-ember active:scale-[0.98]"
                    >
                      Continue
                      <ChevronRight className="h-4 w-4" strokeWidth={3} />
                    </button>
                  </motion.div>
                )}

                {/* ============ STEP 2 — LOCATION ============ */}
                {step === "location" && (
                  <motion.div
                    key="location"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-6"
                  >
                    <button
                      onClick={() => setStep("type")}
                      className="text-[11px] font-black uppercase tracking-wider text-ember hover:underline"
                    >
                      ← Back
                    </button>
                    <h3 className="t-section-sm mt-2 uppercase tracking-wide text-charcoal">
                      Select your location
                    </h3>
                    <p className="mt-1.5 text-[13.5px] text-slate-brand">
                      {orderType === "delivery"
                        ? "We'll send your order to the nearest open branch."
                        : "Choose the branch you'd like to collect from."}
                    </p>

                    <button
                      onClick={useCurrentLocation}
                      disabled={locating}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-ember/40 bg-ember/5 px-5 py-3.5 text-[12.5px] font-black uppercase tracking-wider text-ember transition-colors hover:bg-ember/10 disabled:opacity-60"
                    >
                      <Crosshair
                        className={cn("h-4 w-4", locating && "animate-spin")}
                        strokeWidth={2.8}
                      />
                      {locating ? "Locating…" : "Use current location"}
                    </button>

                    {/* City chips */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {cities.map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setSelectedCity(c);
                            setQuery("");
                          }}
                          className={cn(
                            "rounded-full px-4 py-2 text-[12px] font-bold transition-colors",
                            selectedCity === c
                              ? "bg-charcoal text-cream"
                              : "bg-charcoal/6 text-slate-brand hover:bg-charcoal/10",
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>

                    {/* Search */}
                    <div className="relative mt-4">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-brand" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search area or branch"
                        className="w-full rounded-full border border-charcoal/12 bg-white py-3 pl-11 pr-4 text-[13.5px] outline-none transition-colors placeholder:text-slate-brand/60 focus:border-ember"
                      />
                    </div>

                    {/* Branch list */}
                    <div className="mt-4 space-y-2">
                      {filtered.length === 0 && (
                        <p className="py-8 text-center text-[13.5px] text-slate-brand">
                          No branches in {selectedCity} yet — try another city.
                        </p>
                      )}
                      {filtered.map((b) => {
                        const active = branchId === b.id;
                        return (
                          <button
                            key={b.id}
                            onClick={() => {
                              setBranch(b.id, b.city);
                              setOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                              active
                                ? "border-ember bg-ember/6"
                                : "border-charcoal/10 hover:border-charcoal/25",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                                active ? "bg-ember text-white" : "bg-charcoal/6 text-charcoal",
                              )}
                            >
                              <MapPin className="h-4 w-4" strokeWidth={2.5} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="font-display text-lg uppercase tracking-wide text-charcoal">
                                  {b.name}
                                </span>
                                <span className="flex items-center gap-0.5 text-[11px] font-bold text-slate-brand">
                                  <Star className="h-3 w-3 fill-gold text-gold" />
                                  {b.rating}
                                </span>
                              </span>
                              <span className="mt-0.5 block truncate text-[12px] text-slate-brand">
                                {b.address}
                              </span>
                              <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-brand/80">
                                <span>{b.hours}</span>
                                <span className="text-ember">{b.eta} min</span>
                              </span>
                            </span>
                            {active && <Check className="mt-1 h-4 w-4 text-ember" strokeWidth={3.5} />}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

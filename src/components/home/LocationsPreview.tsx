"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Clock, MapPin, Phone, Star } from "lucide-react";
import { branches, statusMeta } from "@/data/branches";
import { cities } from "@/config/brand";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

const toneStyles = {
  fresh: "bg-fresh/15 text-green-700",
  gold: "bg-gold/25 text-amber-800",
  ember: "bg-ember/15 text-ember-dark",
  mist: "bg-charcoal/8 text-slate-brand",
} as const;

export function LocationsPreview() {
  const [city, setCity] = useState("Karachi");
  const setBranch = useStore((s) => s.setBranch);
  const setOrderType = useStore((s) => s.setOrderType);

  const shown = useMemo(
    () => branches.filter((b) => b.city === city).slice(0, 3),
    [city],
  );

  return (
    <section className="bg-charcoal py-12 text-cream sm:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
                <span className="h-[3px] w-6 rounded-full bg-ember" />
                Find us
              </span>
              <h2 className="t-section mt-3 uppercase tracking-wide">
                {branches.length} branches.
                <br />
                {cities.length} cities.
              </h2>
            </div>
            <Link
              href="/locations"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-cream/25 px-7 py-3.5 text-[11.5px] font-black uppercase tracking-wider text-cream transition-all hover:border-ember hover:bg-ember hover:text-white"
            >
              All locations
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                strokeWidth={3}
              />
            </Link>
          </div>
        </Reveal>

        {/* City switcher */}
        <Reveal delay={0.08}>
          <div className="mt-8 flex flex-wrap gap-2">
            {cities.map((c) => {
              const count = branches.filter((b) => b.city === c).length;
              if (!count) return null;
              return (
                <button
                  key={c}
                  onClick={() => setCity(c)}
                  className={cn(
                    "rounded-full px-4 py-2 text-[12px] font-bold transition-colors",
                    city === c
                      ? "bg-ember text-white"
                      : "bg-cream/8 text-cream/65 hover:bg-cream/15 hover:text-cream",
                  )}
                >
                  {c}
                  <span className="ml-1.5 opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Stagger key={city} className="mt-7 grid gap-4 md:grid-cols-3">
          {shown.map((b) => (
            <StaggerItem key={b.id} className="h-full">
              <div className="group flex h-full flex-col rounded-[26px] border border-cream/10 bg-cream/[0.035] p-6 transition-colors hover:border-ember/50 hover:bg-ember/5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="t-section-sm uppercase tracking-wide">
                      {b.name}
                    </h3>
                    <p className="mt-0.5 text-[12px] text-cream/50">{b.city}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                      "bg-fresh/20 text-green-300",
                    )}
                  >
                    {statusMeta[b.status].label}
                  </span>
                </div>

                <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-[1.6] text-cream/60">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ember" />
                  {b.address}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11.5px] text-cream/55">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-ember" />
                    {b.hours}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                    {b.rating} ({b.reviews.toLocaleString("en-PK")})
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-flame">
                    ~{b.eta} min
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {b.features.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-cream/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cream/55"
                    >
                      {f}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-5">
                  <Link
                    href="/menu"
                    onClick={() => {
                      setBranch(b.id, b.city);
                      setOrderType("delivery");
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-cream py-3 text-[11.5px] font-black uppercase tracking-wider text-charcoal transition-colors hover:bg-ember hover:text-white"
                  >
                    Order from here
                  </Link>
                  <a
                    href={`tel:${b.phone.replace(/-/g, "")}`}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-cream/15 py-2.5 text-[11.5px] font-bold text-cream/70 transition-colors hover:border-cream/40 hover:text-cream"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {b.phone}
                  </a>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

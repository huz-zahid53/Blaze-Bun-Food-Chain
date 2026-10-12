"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  MapPin,
  Phone,
  Search,
  Star,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { branches, allFeatures, statusMeta } from "@/data/branches";
import { cities } from "@/config/brand";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { useStore } from "@/store/useStore";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

const toneStyles = {
  fresh: "bg-fresh/15 text-green-700",
  gold: "bg-gold/25 text-amber-800",
  ember: "bg-ember/15 text-ember-dark",
  mist: "bg-charcoal/8 text-slate-brand",
} as const;

export default function LocationsPage() {
  const [city, setCity] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const setBranch = useStore((s) => s.setBranch);
  const setOrderType = useStore((s) => s.setOrderType);
  const push = useToast((s) => s.push);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return branches
      .filter((b) => city === "All" || b.city === city)
      .filter(
        (b) =>
          !q ||
          b.name.toLowerCase().includes(q) ||
          b.area.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q),
      )
      .filter((b) => features.every((f) => b.features.includes(f)));
  }, [city, query, features]);

  function toggleFeature(f: string) {
    setFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  }

  return (
    <>
      <PageHero
          image="/media/hero/bg-dining.jpg"
        kicker="Locations"
        title={[<span key="a">{branches.length} branches.</span>, <br key="b" />,
          <span key="c" className="bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">
            {cities.length} cities.
          </span>]}
        subtitle="Every branch runs its own grill, grinds its own chuck each morning and marinates its own chicken for 24 hours. Find the one nearest you."
      />

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="rounded-3xl border border-charcoal/8 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-brand" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by area or branch name…"
                aria-label="Search branches"
                className="w-full rounded-full border border-charcoal/12 bg-white py-3.5 pl-11 pr-11 text-[13.5px] outline-none transition-colors placeholder:text-slate-brand/60 focus:border-ember"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-charcoal/6 text-slate-brand hover:bg-ember hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCity("All")}
                className={cn(
                  "rounded-full px-4 py-2.5 text-[12.5px] font-bold transition-colors",
                  city === "All"
                    ? "bg-charcoal text-cream"
                    : "bg-charcoal/6 text-slate-brand hover:bg-charcoal/12",
                )}
              >
                All cities
              </button>
              {cities.map((c) => {
                const count = branches.filter((b) => b.city === c).length;
                if (!count) return null;
                return (
                  <button
                    key={c}
                    onClick={() => setCity(c)}
                    className={cn(
                      "rounded-full px-4 py-2.5 text-[12.5px] font-bold transition-colors",
                      city === c
                        ? "bg-charcoal text-cream"
                        : "bg-charcoal/6 text-slate-brand hover:bg-charcoal/12",
                    )}
                  >
                    {c} <span className="opacity-55">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feature chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-charcoal/8 pt-4">
            <span className="text-[10.5px] font-black uppercase tracking-[0.18em] text-slate-brand">
              Filter by
            </span>
            {allFeatures.map((f) => (
              <button
                key={f}
                onClick={() => toggleFeature(f)}
                className={cn(
                  "rounded-full border-2 px-3.5 py-1.5 text-[11.5px] font-bold transition-colors",
                  features.includes(f)
                    ? "border-ember bg-ember text-white"
                    : "border-charcoal/12 text-slate-brand hover:border-charcoal/30",
                )}
              >
                {f}
              </button>
            ))}
            {features.length > 0 && (
              <button
                onClick={() => setFeatures([])}
                className="text-[11.5px] font-bold uppercase tracking-wider text-ember hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Count */}
        <p className="mt-6 text-[13.5px] text-slate-brand">
          Showing <strong className="font-black text-charcoal">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "branch" : "branches"}
        </p>

        {/* Grid */}
        <h2 className="sr-only">Our branches</h2>
        {filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-charcoal/15 py-16 text-center">
            <p className="t-section-sm uppercase tracking-wide text-charcoal">
              Nothing here yet
            </p>
            <p className="mt-2 text-[14px] text-slate-brand">
              We're opening new branches constantly — try another city or clear
              your filters.
            </p>
            <button
              onClick={() => {
                setCity("All");
                setQuery("");
                setFeatures([]);
              }}
              className="mt-6 rounded-full bg-charcoal px-7 py-3.5 text-[12px] font-black uppercase tracking-wider text-cream hover:bg-ember"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <Stagger
            className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
            stagger={0.05}
          >
            {filtered.map((b) => (
              <StaggerItem key={b.id} className="h-full">
                <motion.article
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className="flex h-full flex-col overflow-hidden rounded-[26px] border border-charcoal/8 bg-white shadow-[0_4px_20px_-14px_rgba(16,14,12,0.35)]"
                >
                  {/* Stylised mini-map */}
                  <MiniMap lat={b.lat} lng={b.lng} hue={(b.lat * 7) % 360} />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="t-section-sm uppercase tracking-wide text-charcoal">
                          {b.name}
                        </h3>
                        <p className="mt-1 text-[12px] font-semibold text-slate-brand">
                          {b.city} · Opened {b.openedYear}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                          toneStyles[statusMeta[b.status].tone],
                        )}
                      >
                        {statusMeta[b.status].label}
                      </span>
                    </div>

                    <p className="mt-4 flex items-start gap-2 text-[13px] leading-[1.6] text-slate-brand">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                      {b.address}
                    </p>

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
                      <div className="flex items-center gap-2 text-slate-brand">
                        <Clock className="h-3.5 w-3.5 text-ember" />
                        <dd>{b.hours}</dd>
                      </div>
                      <div className="flex items-center gap-2 text-slate-brand">
                        <Users className="h-3.5 w-3.5 text-ember" />
                        <dd>{b.seats} seats</dd>
                      </div>
                      <div className="flex items-center gap-2 text-slate-brand">
                        <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                        <dd>
                          {b.rating} ({b.reviews.toLocaleString("en-PK")})
                        </dd>
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-ember">
                        <UtensilsCrossed className="h-3.5 w-3.5" />
                        <dd>~{b.eta} min</dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {b.features.map((f) => (
                        <span
                          key={f}
                          className="rounded-full bg-charcoal/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-brand"
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
                          push({
                            message: `Now ordering from ${b.name}, ${b.city}`,
                            tone: "success",
                          });
                        }}
                        className="flex w-full items-center justify-center rounded-full bg-charcoal py-3.5 text-[11.5px] font-black uppercase tracking-wider text-cream transition-colors hover:bg-ember"
                      >
                        Order from this branch
                      </Link>
                      <a
                        href={`tel:${b.phone.replace(/-/g, "")}`}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-charcoal/12 py-3 text-[11.5px] font-bold text-slate-brand transition-colors hover:border-charcoal hover:text-charcoal"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {b.phone}
                      </a>
                    </div>
                  </div>
                </motion.article>
              </StaggerItem>
            ))}
          </Stagger>
        )}

        {/* Franchise CTA */}
        <Reveal>
          <div className="mt-8 overflow-hidden rounded-[32px] bg-charcoal p-8 text-cream sm:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h2 className="t-section uppercase tracking-wide">
                  No branch near you?
                </h2>
                <p className="mt-4 text-[14.5px] leading-[1.6] text-cream/60">
                  We're actively expanding into Faisalabad, Multan, Peshawar and
                  Quetta. If you think your city deserves a proper flame-grilled
                  burger, tell us — or better yet, open one with us.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link
                  href="/franchise"
                  className="inline-flex items-center gap-2 rounded-full bg-ember px-7 py-4 text-[12.5px] font-black uppercase tracking-wider text-white hover:bg-ember-dark"
                >
                  Explore a franchise
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-cream/25 px-7 py-4 text-[12.5px] font-black uppercase tracking-wider text-cream hover:border-cream hover:bg-cream/10"
                >
                  Request your city
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

/** Lightweight stylised map plate — no external tile provider required. */
function MiniMap({ lat, lng, hue }: { lat: number; lng: number; hue: number }) {
  const seed = Math.abs(Math.round(lat * 100 + lng * 100));

  return (
    <div
      className="relative h-[132px] overflow-hidden"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 28% 16%), hsl(${hue} 34% 10%))`,
      }}
    >
      {/* Road grid */}
      <svg
        className="absolute inset-0 h-full w-full opacity-35"
        viewBox="0 0 400 140"
        preserveAspectRatio="none"
      >
        {[
          "M0 40 H400",
          "M0 92 H400",
          "M60 0 V140",
          "M170 0 V140",
          "M285 0 V140",
          "M0 122 H400",
        ].map((d, i) => (
          <path key={i} d={d} stroke="#FFF6EC" strokeWidth={i % 2 ? 1 : 1.8} fill="none" />
        ))}
        <path d="M0 0 L400 140" stroke="#FFF6EC" strokeWidth={1} fill="none" opacity="0.5" />
      </svg>

      {/* City blocks */}
      <div className="absolute inset-0 opacity-25">
        {[...Array(9)].map((_, i) => (
          <span
            key={i}
            className="absolute rounded-[3px] bg-cream"
            style={{
              left: `${(seed * (i + 3)) % 82}%`,
              top: `${(seed * (i + 5)) % 64}%`,
              width: `${18 + ((seed + i * 7) % 30)}px`,
              height: `${10 + ((seed + i * 3) % 20)}px`,
            }}
          />
        ))}
      </div>

      {/* Pin */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="relative flex h-11 w-11 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-45" />
          <span className="relative grid h-9 w-9 place-items-center rounded-full bg-ember shadow-lg ring-4 ring-cream/20">
            <MapPin className="h-4.5 w-4.5 text-white" strokeWidth={2.6} />
          </span>
        </span>
      </div>

      {/* Coordinates */}
      <span className="absolute bottom-2.5 right-3 font-mono text-[9.5px] tracking-wider text-cream/40">
        {lat.toFixed(4)}, {lng.toFixed(4)}
      </span>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ImageWithSkeleton } from "@/components/ui/Skeleton";
import { SectionDivider, DotGridOverlay } from "@/components/ui/SectionDivider";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Flame,
  Leaf,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import {
  categories,
  menuItems,
  regularMenuItems,
  bestSellers,
  type MenuItem,
} from "@/data/menu";
import { deals, type Deal } from "@/data/deals";
import { ItemCard } from "@/components/menu/ItemCard";
import { ItemModal } from "@/components/menu/ItemModal";
import { DealCard } from "@/components/menu/DealCard";
import { DealModal } from "@/components/menu/DealModal";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";

type SortKey = "popular" | "price-asc" | "price-desc" | "rating";
type BurgerSubFilter = "all" | "beef" | "chicken" | "veg";

const sorts: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Most popular" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "rating", label: "Top rated" },
];

export function MenuBrowser() {
  const params = useSearchParams();
  const deepLink = params.get("item");

  const [active, setActive] = useState<string>("all");
  const [burgerFilter, setBurgerFilter] = useState<BurgerSubFilter>("all");
  const [query, setQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("popular");
  const [openItem, setOpenItem] = useState<MenuItem | null>(null);
  const [openDeal, setOpenDeal] = useState<Deal | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const orderType = useStore((s) => s.orderType);

  // Deep-link: /menu?item=slug opens the configurator straight away
  useEffect(() => {
    if (!deepLink) return;
    const foundDeal = deals.find((d) => d.slug === deepLink);
    if (foundDeal) {
      setOpenDeal(foundDeal);
      setActive("deals");
      return;
    }
    const found = menuItems.find((i) => i.slug === deepLink);
    if (found) {
      setOpenItem(found);
      setActive("all");
    }
  }, [deepLink]);

  // Anchor scrolling for /menu#category-id
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 220);
    }
  }, []);

  // Filtered regular items
  const filteredRegularItems = useMemo(() => {
    let list = [...regularMenuItems];

    if (active === "best-sellers") {
      list = list.filter((i) => i.tags.includes("bestseller"));
    } else if (active !== "all" && active !== "deals") {
      list = list.filter((i) => i.categoryId === active);
    }

    if (active === "burgers" && burgerFilter !== "all") {
      list = list.filter((i) => i.subCategory === burgerFilter);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.blurb.toLowerCase().includes(q) ||
          i.allergens.join(" ").toLowerCase().includes(q),
      );
    }
    if (vegOnly) list = list.filter((i) => i.tags.includes("veg"));

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (sort === "popular")
      sorted.sort(
        (a, b) =>
          Number(b.tags.includes("bestseller")) -
            Number(a.tags.includes("bestseller")) ||
          b.reviews - a.reviews,
      );
    return sorted;
  }, [active, burgerFilter, query, vegOnly, sort]);

  // Filtered deals
  const filteredDeals = useMemo(() => {
    if (vegOnly) return [];
    let list = [...deals];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.contents.join(" ").toLowerCase().includes(q),
      );
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [query, vegOnly, sort]);

  // Count items per category pill
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {
      all: deals.length + regularMenuItems.length,
      deals: deals.length,
      "best-sellers": bestSellers.length,
    };
    for (const c of categories) {
      if (c.id !== "deals" && c.id !== "best-sellers") {
        map[c.id] = regularMenuItems.filter((i) => i.categoryId === c.id).length;
      }
    }
    return map;
  }, []);

  const totalResultsCount =
    active === "deals"
      ? filteredDeals.length
      : active === "all"
        ? filteredDeals.length + filteredRegularItems.length
        : filteredRegularItems.length;

  return (
    <>
      {/* ---------- Header ---------- */}
      <section className="relative isolate overflow-hidden bg-charcoal text-cream">
        <Image
          src="/media/hero/bg-spread.jpg"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          style={{ objectPosition: "72% center" }}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/80 to-charcoal/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/30" />
        <div className="absolute inset-0 bg-gradient-to-tr from-ember/15 via-transparent to-flame/10 mix-blend-overlay" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] grain" />

        {/* 21st.dev style subtle dot-matrix grid overlay */}
        <DotGridOverlay tone="dark" />

        {/* 21st.dev inspired luminous hairline divider */}
        <SectionDivider className="absolute inset-x-0 bottom-0 z-10" tone="dark" />

        <div className="relative mx-auto max-w-[1400px] px-4 pb-12 pt-14 sm:px-6 sm:pb-14 sm:pt-16 lg:px-8 lg:pb-16 lg:pt-20">
          <span className="t-eyebrow inline-flex items-center gap-2 text-ember">
            <span className="h-[3px] w-6 rounded-full bg-ember" />
            The full menu
          </span>
          <h1 className="t-page mt-3 uppercase tracking-wide">
            {orderType === "catering" ? "Catering menu" : "Everything on"}
            <br />
            <span className="bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">
              the flame
            </span>
          </h1>
          <p className="t-lead mt-4 max-w-xl text-cream/70">
            {deals.length} combo deals & {regularMenuItems.length} freshly ground
            specialities. Ordered by popularity and grilled fresh daily.
          </p>

          {/* Search */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-cream/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search deals, burgers, wings, loaded fries…"
                aria-label="Search the menu"
                className="w-full rounded-full border border-cream/15 bg-cream/5 py-4 pl-13 pr-12 text-[14.5px] text-cream outline-none transition-colors placeholder:text-cream/40 focus:border-ember"
                style={{ paddingLeft: "3.25rem" }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-cream/10 text-cream/60 transition-colors hover:bg-ember hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Sticky Filter bar (Exact 10 Categories Order) ---------- */}
      <div className="sticky top-[112px] z-[60] border-b border-charcoal/8 bg-cream/92 backdrop-blur-xl md:top-[76px]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-3">
            {/* Category pills */}
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto no-scrollbar">
              <Pill
                active={active === "all"}
                onClick={() => {
                  setActive("all");
                  setBurgerFilter("all");
                }}
                label="All"
                count={categoryCounts["all"]}
              />
              {categories.map((c) => (
                <Pill
                  key={c.id}
                  active={active === c.id}
                  onClick={() => {
                    setActive(c.id);
                    if (c.id !== "burgers") setBurgerFilter("all");
                    if (active === "all") {
                      const el = document.getElementById("grid-top");
                      el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  label={c.name}
                  badge={c.badge}
                  count={categoryCounts[c.id] ?? 0}
                />
              ))}
            </div>

            {/* Sort (desktop) */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort menu"
              className="hidden shrink-0 cursor-pointer rounded-full border border-charcoal/12 bg-white px-4 py-2.5 text-[12.5px] font-bold text-charcoal outline-none focus:border-ember lg:block"
            >
              {sorts.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Filters (mobile) */}
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-charcoal/12 bg-white px-4 py-2.5 text-[12px] font-bold text-charcoal lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Sort
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Results ---------- */}
      <div id="grid-top" className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13.5px] text-slate-brand">
            Showing{" "}
            <strong className="font-black text-charcoal">{totalResultsCount}</strong>{" "}
            {totalResultsCount === 1 ? "item" : "items"}
            {query && (
              <>
                {" "}
                for <strong className="font-black text-charcoal">“{query}”</strong>
              </>
            )}
          </p>

          <button
            onClick={() => setVegOnly((v) => !v)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-[12px] font-bold transition-colors",
              vegOnly
                ? "border-fresh bg-fresh/10 text-green-800"
                : "border-charcoal/12 text-slate-brand hover:border-charcoal/30",
            )}
          >
            <Leaf className="h-3.5 w-3.5" />
            Vegetarian only
          </button>
        </div>

        {totalResultsCount === 0 ? (
          <div className="rounded-3xl border border-dashed border-charcoal/15 py-16 text-center">
            <p className="font-display text-3xl uppercase tracking-wide text-charcoal">
              Nothing matched that
            </p>
            <p className="mt-2 text-[14px] text-slate-brand">
              Try a different search, or clear your filters.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setVegOnly(false);
                setActive("all");
                setBurgerFilter("all");
              }}
              className="mt-6 rounded-full bg-charcoal px-7 py-3.5 text-[12px] font-black uppercase tracking-wider text-cream hover:bg-ember"
            >
              Reset filters
            </button>
          </div>
        ) : active === "all" ? (
          /* ============================================================
             "ALL" VIEW — ORDERED BY CATEGORY (1 to 10 in sequence)
             ============================================================ */
          <div className="space-y-14">
            {/* 1. Deals / Offers (Always First — Main Revenue Driver) */}
            {filteredDeals.length > 0 && (
              <section id="deals" className="scroll-mt-40">
                <Reveal>
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-charcoal/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-ember px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                          #1 Deals
                        </span>
                        <h2 className="t-section-sm uppercase tracking-wide text-charcoal">
                          Deals / Offers
                        </h2>
                      </div>
                      <p className="mt-1.5 text-[13px] text-slate-brand">
                        Slot bundles, midnight munch boxes & party feasts with customizable sides & drinks
                      </p>
                    </div>
                    <span className="rounded-full bg-ember/10 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-ember-dark">
                      {filteredDeals.length} bundles
                    </span>
                  </div>
                </Reveal>

                {/* Grid: 4 columns on desktop, 2 on tablet, 1 on mobile (horizontal card) */}
                <Stagger
                  className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  stagger={0.05}
                >
                  {filteredDeals.map((deal, i) => (
                    <StaggerItem key={deal.id} className="h-full">
                      <DealCard
                        deal={deal}
                        onSelect={(d) => setOpenDeal(d)}
                        priority={i < 4}
                        className="h-full"
                      />
                    </StaggerItem>
                  ))}
                </Stagger>
              </section>
            )}

            {/* 2. Best Sellers / Trending (Optional / Pulls from other categories) */}
            {bestSellers.length > 0 && !query && (
              <section id="best-sellers" className="scroll-mt-40">
                <Reveal>
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-charcoal/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gradient-to-r from-flame to-gold px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-charcoal">
                          Trending
                        </span>
                        <h2 className="t-section-sm uppercase tracking-wide text-charcoal">
                          Best Sellers / Trending
                        </h2>
                      </div>
                      <p className="mt-1.5 text-[13px] text-slate-brand">
                        The city's most requested smash burgers, crispy chicken & sides
                      </p>
                    </div>
                    <span className="rounded-full bg-gold/20 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-amber-900">
                      {bestSellers.length} top items
                    </span>
                  </div>
                </Reveal>

                <Stagger
                  className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  stagger={0.05}
                >
                  {bestSellers.map((item, i) => (
                    <StaggerItem key={`bestseller-${item.slug}`} className="h-full">
                      <ItemCard item={item} priority={i < 4} className="h-full" />
                    </StaggerItem>
                  ))}
                </Stagger>
              </section>
            )}

            {/* Categories 3 to 10 in exact requested order */}
            {categories
              .filter((c) => c.id !== "deals" && c.id !== "best-sellers")
              .map((category) => {
                const items = filteredRegularItems.filter(
                  (i) => i.categoryId === category.id,
                );
                if (items.length === 0) return null;

                return (
                  <section
                    key={category.id}
                    id={category.id}
                    className="scroll-mt-40"
                  >
                    <Reveal>
                      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-charcoal/10 pb-4">
                        <div>
                          <h2 className="t-section-sm uppercase tracking-wide text-charcoal">
                            {category.name}
                          </h2>
                          <p className="mt-1.5 text-[13px] text-slate-brand">
                            {category.blurb}
                          </p>
                        </div>
                        <span className="rounded-full bg-charcoal/6 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-charcoal">
                          {items.length} items
                        </span>
                      </div>
                    </Reveal>

                    <Stagger
                      className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      stagger={0.05}
                    >
                      {items.map((item) => (
                        <StaggerItem key={item.slug} className="h-full">
                          <ItemCard item={item} className="h-full" />
                        </StaggerItem>
                      ))}
                    </Stagger>
                  </section>
                );
              })}
          </div>
        ) : active === "deals" ? (
          /* ============================================================
             "DEALS / OFFERS" SINGLE CATEGORY VIEW
             ============================================================ */
          <div className="space-y-6">
            <Reveal>
              <div className="rounded-2xl bg-charcoal text-cream p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ember-light">
                    Category #1 · Main Revenue Driver
                  </span>
                  <h2 className="t-section-sm sm:t-section mt-1 text-white uppercase tracking-wide">
                    Deals & Bundles
                  </h2>
                  <p className="mt-1 text-[13.5px] text-cream/70 max-w-xl">
                    Every deal is a customizable bundle of slots. Pick your burger, sides, dips, and drinks with optional upgrades.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[12px] font-bold text-gold">
                  <Tag className="h-4 w-4" />
                  Save up to 40% on Combos
                </div>
              </div>
            </Reveal>

            {/* Grid: 4 cols desktop, 2 cols tablet, 1-2 mobile horizontal card */}
            <Stagger
              className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              stagger={0.05}
            >
              {filteredDeals.map((deal, i) => (
                <StaggerItem key={deal.id} className="h-full">
                  <DealCard
                    deal={deal}
                    onSelect={(d) => setOpenDeal(d)}
                    priority={i < 4}
                    className="h-full"
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        ) : (
          /* ============================================================
             OTHER SINGLE CATEGORY VIEW (Burgers, Chicken, Sides, etc.)
             ============================================================ */
          <div className="space-y-6">
            {/* Burgers Sub-Split Filter (Chicken / Beef / Veg) */}
            {active === "burgers" && (
              <div className="flex flex-wrap items-center gap-2 border-b border-charcoal/10 pb-4">
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-brand mr-2">
                  Patty type:
                </span>
                {(
                  [
                    { id: "all", label: "All Burgers" },
                    { id: "beef", label: "Beef Smashes" },
                    { id: "chicken", label: "Crispy & Grilled Chicken" },
                    { id: "veg", label: "Vegetarian / Halloumi" },
                  ] as const
                ).map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setBurgerFilter(sub.id)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all",
                      burgerFilter === sub.id
                        ? "bg-ember text-white shadow-sm"
                        : "bg-white border border-charcoal/12 text-charcoal hover:border-charcoal/30",
                    )}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}

            {/* Grid: 4 cols desktop, 2 cols tablet, 1-2 mobile */}
            <Stagger
              className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              stagger={0.045}
            >
              {filteredRegularItems.map((item, i) => (
                <StaggerItem key={item.slug} className="h-full">
                  <ItemCard item={item} priority={i < 4} className="h-full" />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        )}

        {/* Allergen note */}
        <section
          id="allergens"
          className="mt-14 rounded-3xl border border-charcoal/10 bg-white p-7 sm:p-9"
        >
          <h2 className="t-section-sm uppercase tracking-wide text-charcoal">
            Allergens & nutrition
          </h2>
          <p className="mt-3 max-w-3xl text-[13.5px] leading-[1.6] text-slate-brand">
            Every dish is prepared in a kitchen that handles gluten, dairy, egg,
            sesame, soy and tree nuts. While we keep preparation areas separate
            where we can, we cannot guarantee any item is completely free of
            traces. Calorie counts are estimates based on standard recipes and
            default customisations — adding extras changes the numbers.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Gluten", "Dairy", "Egg", "Sesame", "Soy", "Nuts"].map((a) => (
              <span
                key={a}
                className="rounded-full bg-charcoal/6 px-3.5 py-1.5 text-[11.5px] font-bold text-slate-brand"
              >
                {a}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* ---------- Mobile sort sheet ---------- */}
      <AnimatePresence>
        {filtersOpen && (
          <div className="fixed inset-0 z-[120] flex items-end justify-center lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="relative w-full rounded-t-[26px] bg-cream p-6 pb-9"
            >
              <h3 className="t-section-sm uppercase tracking-wide text-charcoal">
                Sort by
              </h3>
              <div className="mt-4 space-y-2">
                {sorts.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => {
                      setSort(s.key);
                      setFiltersOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3.5 text-left text-[13.5px] font-bold",
                      sort === s.key
                        ? "border-ember bg-ember/6 text-charcoal"
                        : "border-charcoal/10 text-slate-brand",
                    )}
                  >
                    {s.label}
                    {sort === s.key && <span className="text-ember">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deep-link / item modal */}
      <ItemModal
        item={openItem}
        open={Boolean(openItem)}
        onClose={() => setOpenItem(null)}
      />

      {/* Deal bundle modal */}
      <DealModal
        deal={openDeal}
        open={Boolean(openDeal)}
        onClose={() => setOpenDeal(null)}
      />
    </>
  );
}

function Pill({
  active,
  onClick,
  label,
  count,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative shrink-0 rounded-full px-4 py-2.5 text-[12.5px] font-bold transition-all flex items-center gap-1.5",
        active
          ? "bg-charcoal text-cream shadow-sm"
          : "bg-charcoal/6 text-slate-brand hover:bg-charcoal/12 hover:text-charcoal",
      )}
    >
      <span>{label}</span>
      {badge && (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider",
            active ? "bg-ember text-white" : "bg-ember/15 text-ember-dark",
          )}
        >
          {badge}
        </span>
      )}
      <span
        className={cn(
          "ml-0.5 text-[11px]",
          active ? "text-cream/60" : "text-slate-brand/60",
        )}
      >
        {count}
      </span>
    </button>
  );
}

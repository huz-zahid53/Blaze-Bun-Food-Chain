"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Beef,
  Boxes,
  CakeSlice,
  CupSoda,
  Drumstick,
  Flame,
  Sandwich,
  Soup,
} from "lucide-react";
import { categories, type CategoryIcon } from "@/data/menu";
import { ScrollRail } from "@/components/ui/ScrollRail";
import { Reveal } from "@/components/ui/Reveal";
import { itemsByCategory } from "@/data/menu";

const iconMap: Record<CategoryIcon, typeof Beef> = {
  burger: Sandwich,
  flame: Flame,
  drumstick: Drumstick,
  bucket: Boxes,
  fries: Soup,
  cup: CupSoda,
  dessert: CakeSlice,
};

/** KFC-style "Explore menu" circular category rail. */
export function CategoryRail() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
              <span className="h-[3px] w-6 rounded-full bg-ember" />
              Explore menu
            </span>
            <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
              Pick your poison
            </h2>
          </div>
          <Link
            href="/menu"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-charcoal/15 px-6 py-3 text-[11.5px] font-black uppercase tracking-wider text-charcoal transition-all hover:border-ember hover:bg-ember hover:text-white"
          >
            View all
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <ScrollRail
          className="mt-9"
          itemClassName="w-[132px] sm:w-[150px]"
          label="Menu categories"
          arrows="mobile-only"
          arrowPosition="top-[56px] -translate-y-1/2"
        >
          {categories.map((c) => {
            const Icon = iconMap[c.icon];
            const count = itemsByCategory(c.id).length;
            return (
              <Link key={c.id} href={`/menu#${c.id}`} className="group block">
                <div className="flex flex-col items-center text-center">
                  <div
                    className="relative grid h-[112px] w-[112px] place-items-center overflow-hidden rounded-full transition-transform duration-500 group-hover:-translate-y-2 sm:h-[128px] sm:w-[128px]"
                    style={{
                      background: `radial-gradient(120% 120% at 30% 20%, hsl(${c.hue} 82% 92%), hsl(${c.hue} 55% 82%))`,
                    }}
                  >
                    {/* Spinning ring */}
                    <span
                      className="absolute inset-0 z-10 rounded-full border-2 border-dashed opacity-40 transition-transform duration-[1400ms] group-hover:rotate-90"
                      style={{ borderColor: `hsl(${c.hue} 70% 45%)` }}
                    />

                    {/* Photorealistic image (if provided) — falls back to icon */}
                    {c.image ? (
                      <Image
                        src={c.image}
                        alt={c.name}
                        fill
                        sizes="128px"
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <Icon
                        className="h-11 w-11 transition-transform duration-500 group-hover:scale-110 sm:h-12 sm:w-12"
                        style={{ color: `hsl(${c.hue} 72% 38%)` }}
                        strokeWidth={1.9}
                      />
                    )}
                  </div>
                  <h3 className="t-sub mt-3.5 text-[15px] uppercase tracking-wide text-charcoal transition-colors group-hover:text-ember sm:">
                    {c.name}
                  </h3>
                  <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-wider text-slate-brand">
                    {count} items
                  </p>
                </div>
              </Link>
            );
          })}
        </ScrollRail>
      </Reveal>
    </section>
  );
}

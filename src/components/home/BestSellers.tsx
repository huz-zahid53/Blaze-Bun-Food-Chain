"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { bestSellers } from "@/data/menu";
import { ItemCard } from "@/components/menu/ItemCard";
import { ScrollRail } from "@/components/ui/ScrollRail";
import { Reveal } from "@/components/ui/Reveal";

export function BestSellers() {
  return (
    <section className="relative overflow-hidden border-b border-charcoal/8 bg-bone pt-12 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
      {/* Background grill atmosphere */}
      <Image
        src="/media/hero/bg-grill.jpg"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="object-cover opacity-12"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bone/95 via-bone/85 to-bone/95" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] grain" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
                <span className="h-[3px] w-6 rounded-full bg-ember" />
                Best sellers
              </span>
              <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
                What Karachi orders
              </h2>
              <p className="mt-3 max-w-xl text-[14.5px] leading-[1.6] text-slate-brand">
                Ranked by what actually leaves our kitchens — not by what we'd
                like you to buy.
              </p>
            </div>
            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-[11.5px] font-black uppercase tracking-wider text-cream transition-all hover:bg-ember"
            >
              Full menu
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                strokeWidth={3}
              />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <ScrollRail
            className="mt-9"
            itemClassName="w-[268px] sm:w-[300px] lg:w-[318px]"
            label="Best selling items"
          >
            {bestSellers.map((item, i) => (
              <ItemCard key={item.slug} item={item} priority={i < 3} className="h-full" />
            ))}
          </ScrollRail>
        </Reveal>
      </div>
    </section>
  );
}

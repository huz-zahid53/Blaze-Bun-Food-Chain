"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { deals, dealKindMeta } from "@/data/deals";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { formatPKR, discountPct, cn } from "@/lib/utils";
import { MediaFrame } from "@/components/ui/MediaFrame";

export function DealsShowcase({ compact = false }: { compact?: boolean }) {
  const shown = compact ? deals.slice(0, 3) : deals;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
              <span className="h-[3px] w-6 rounded-full bg-ember" />
              Top deals
            </span>
            <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
              Deals worth staying in for
            </h2>
          </div>
          <Link
            href="/deals"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-charcoal/15 px-6 py-3 text-[11.5px] font-black uppercase tracking-wider text-charcoal transition-all hover:border-ember hover:bg-ember hover:text-white"
          >
            All deals
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
              strokeWidth={3}
            />
          </Link>
        </div>
      </Reveal>

      <Stagger className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((deal) => {
          const off = discountPct(deal.price, deal.originalPrice);
          return (
            <StaggerItem key={deal.id} className="h-full">
              <Link
                href={`/deals#${deal.slug}`}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-[26px] text-cream transition-transform duration-500 hover:-translate-y-2",
                  deal.kind === "midnight"
                    ? "bg-gradient-to-br from-indigo-900 via-charcoal to-charcoal"
                    : "bg-charcoal",
                )}
              >
                {/* Media */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  {deal.image ? (
                    <Image
                      src={deal.image}
                      alt={deal.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                    />
                  ) : (
                    <MediaFrame
                      hue={deal.hue}
                      glyph={deal.glyph}
                      alt={deal.title}
                      ratio="aspect-[16/10]"
                      zoom
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/25 to-transparent" />

                  <span className="absolute left-4 top-4 rounded-full bg-ember px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">
                    {dealKindMeta[deal.kind].label}
                  </span>

                  {off > 0 && (
                    <span className="absolute right-4 top-4 rounded-full bg-gold px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-charcoal">
                      Save {off}%
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="t-section-sm uppercase tracking-wide">
                    {deal.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[13.5px] leading-[1.6] text-cream/60">
                    {deal.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-bold">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/10 px-3 py-1.5 uppercase tracking-wider text-cream/80">
                      <Tag className="h-3 w-3" />
                      {deal.badge ?? deal.kicker}
                    </span>
                    {deal.window && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/10 px-3 py-1.5 uppercase tracking-wider text-cream/80">
                        <Clock className="h-3 w-3" />
                        {deal.window}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-end justify-between border-t border-cream/10 pt-4">
                    {deal.price > 0 ? (
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-3xl text-cream">
                          {formatPKR(deal.price)}
                        </span>
                        {deal.originalPrice > 0 && (
                          <span className="text-[13px] font-semibold text-cream/35 line-through">
                            {formatPKR(deal.originalPrice)}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="font-display text-2xl text-flame">
                        {deal.kicker}
                      </span>
                    )}
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-ember transition-transform group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4 text-white" strokeWidth={3} />
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

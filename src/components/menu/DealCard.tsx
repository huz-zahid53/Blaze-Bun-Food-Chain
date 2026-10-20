"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Clock, Flame, Plus, Sparkles, Tag } from "lucide-react";
import type { Deal } from "@/data/deals";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { formatPKR, discountPct, cn } from "@/lib/utils";

interface Props {
  deal: Deal;
  onSelect: (deal: Deal) => void;
  priority?: boolean;
  className?: string;
}

export function DealCard({ deal, onSelect, priority, className }: Props) {
  const off = discountPct(deal.price, deal.originalPrice);
  const isMidnight = deal.kind === "midnight";

  return (
    <motion.article
      data-cursor="food"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      onClick={() => onSelect(deal)}
      className={cn(
        "group relative flex h-full cursor-pointer flex-row sm:flex-col overflow-hidden rounded-[24px] sm:rounded-[26px] border border-charcoal/10 bg-white shadow-[0_4px_22px_-12px_rgba(16,14,12,0.18)] transition-all duration-300 hover:border-ember/40 hover:shadow-[0_20px_45px_-12px_rgba(255,77,20,0.22)]",
        isMidnight && "hover:border-indigo-500/40",
        className,
      )}
    >
      {/* ---------------- Media Frame ---------------- */}
      {/* On mobile: image sits on the right side. On tablet/desktop: sits on top! */}
      <div className="order-2 sm:order-1 relative w-[120px] xs:w-[135px] sm:w-full shrink-0 overflow-hidden sm:aspect-[4/3] self-stretch sm:self-auto">
        <MediaFrame
          src={deal.image}
          hue={deal.hue}
          glyph={deal.glyph}
          alt={deal.title}
          ratio="h-full w-full sm:aspect-[4/3]"
          sizes="(max-width: 640px) 140px, (max-width: 1024px) 50vw, 25vw"
          priority={priority}
        />

        {/* Ambient Warmth Glow on Hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/65 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

        {/* Top Floating Badges (Desktop & Mobile) */}
        <div className="absolute inset-x-2.5 top-2.5 sm:inset-x-3 sm:top-3 flex items-center justify-between gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-ember px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
            <Flame className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {deal.badge ?? "Deal"}
          </span>

          {off > 0 && (
            <span className="rounded-full bg-gold px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-charcoal shadow-sm">
              Save {off}%
            </span>
          )}
        </div>

        {deal.window && (
          <div className="absolute bottom-2 left-2.5 hidden sm:flex items-center gap-1 rounded-full bg-charcoal/80 backdrop-blur-md px-2 py-0.5 text-[9.5px] font-bold text-cream">
            <Clock className="h-3 w-3 text-gold" />
            {deal.window}
          </div>
        )}
      </div>

      {/* ---------------- Body ---------------- */}
      <div className="order-1 sm:order-2 flex flex-1 min-w-0 flex-col p-3.5 sm:p-4.5 justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-ember truncate block">
            {deal.kicker}
          </span>

          <h3 className="t-sub mt-1 text-[16px] sm:text-[18px] uppercase tracking-wide text-charcoal transition-colors group-hover:text-ember leading-tight line-clamp-1 sm:line-clamp-2">
            {deal.title}
          </h3>

          <p className="mt-1 hidden xs:block text-[12px] leading-snug text-slate-brand line-clamp-2">
            {deal.description}
          </p>

          {/* Contents list chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {deal.contents.slice(0, 3).map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-md bg-charcoal/5 px-2 py-0.5 text-[10.5px] font-medium text-charcoal/80"
              >
                <Check className="h-2.5 w-2.5 text-ember stroke-[3]" />
                <span className="truncate max-w-[170px] sm:max-w-none">{item}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Price & Customize Button Row */}
        <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-charcoal/8 pt-3">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-lg sm:text-xl text-charcoal">
                {formatPKR(deal.price)}
              </span>
              {deal.originalPrice > deal.price && (
                <span className="text-[11.5px] text-slate-brand line-through">
                  {formatPKR(deal.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-700">
              Bundle price
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(deal);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-charcoal px-3.5 py-2 sm:px-4 sm:py-2 text-[10.5px] sm:text-[11px] font-black uppercase tracking-wider text-cream transition-all group-hover:bg-ember group-hover:text-white"
          >
            <span>Customise</span>
            <Plus className="h-3 w-3 stroke-[3]" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

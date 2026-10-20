"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Flame, Heart, Plus, Sparkles } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { PriceTag } from "@/components/ui/Badge";
import { SpiceMeter, Rating } from "@/components/ui/Meters";
import { cn, discountPct } from "@/lib/utils";
import type { MenuItem } from "@/data/menu";
import { ItemModal } from "./ItemModal";

interface Props {
  item: MenuItem;
  priority?: boolean;
  className?: string;
}

/**
 * Modern responsive menu item card:
 * - On mobile (< sm): Horizontal card with the image on the right (KFC / delivery app pattern).
 * - On tablet & desktop (sm+): Rich vertical card (2 cols on tablet, 4 cols on desktop).
 */
export function ItemCard({ item, priority, className }: Props) {
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const off = discountPct(item.price, item.compareAt);

  return (
    <>
      <motion.article
        data-cursor="food"
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className={cn(
          "group relative flex h-full cursor-pointer flex-row sm:flex-col overflow-hidden rounded-[22px] sm:rounded-[26px] border border-charcoal/8 bg-white shadow-[0_4px_22px_-12px_rgba(16,14,12,0.18)] transition-all duration-300 hover:border-ember/35 hover:shadow-[0_24px_50px_-16px_rgba(255,77,20,0.24)]",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        {/* Media Frame — Right on mobile, Top on tablet/desktop */}
        <div className="order-2 sm:order-1 relative w-[120px] xs:w-[135px] sm:w-full shrink-0 overflow-hidden sm:aspect-[4/3] self-stretch sm:self-auto">
          <MediaFrame
            src={item.image}
            hue={item.hue}
            glyph={item.glyph}
            alt={item.name}
            ratio="h-full w-full sm:aspect-[4/3]"
            sizes="(max-width: 640px) 140px, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
          />

          {/* Ambient sizzle warmth glow behind the food on hover */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,77,20,0.22)_0%,transparent_72%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Cinematic dark vignette at bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-charcoal/75 via-charcoal/20 to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-80" />

          {/* Top Floating Glassmorphism Badges */}
          <div className="absolute inset-x-2.5 top-2.5 sm:inset-x-3 sm:top-3 flex items-center justify-between gap-1.5">
            <div className="flex flex-wrap items-center gap-1">
              {off > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-ember to-flame px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white shadow-[0_4px_12px_rgba(255,77,20,0.45)]">
                  −{off}%
                </span>
              )}
              {item.tags.includes("bestseller") && (
                <span className="hidden xs:inline-flex items-center gap-1 rounded-full border border-white/15 bg-charcoal/85 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-[0.16em] text-amber-300 shadow-sm backdrop-blur-md">
                  <Flame className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-ember text-ember" />
                  <span className="hidden sm:inline">Bestseller</span>
                </span>
              )}
            </div>

            {/* Quick Wishlist Favorite Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLiked((prev) => !prev);
              }}
              aria-label={liked ? "Remove from favourites" : "Add to favourites"}
              className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full border border-white/20 bg-charcoal/50 text-white shadow-sm backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-white hover:text-rose-500 active:scale-95"
            >
              <Heart
                className={cn(
                  "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors",
                  liked ? "fill-rose-500 text-rose-500" : "text-white",
                )}
              />
            </button>
          </div>

          {/* Center-Bottom Floating "Customise & Add" Pill on Hover (Desktop) */}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden sm:flex items-center justify-center">
            <span className="inline-flex translate-y-3 items-center gap-2 rounded-full border border-white/70 bg-white/95 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-charcoal opacity-0 shadow-[0_12px_30px_-6px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-hover:border-ember group-hover:bg-ember group-hover:text-white group-hover:shadow-[0_10px_25px_-5px_rgba(255,77,20,0.6)]">
              <Sparkles className="h-3.5 w-3.5 text-ember transition-colors group-hover:text-gold" />
              Customise & Add
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
            </span>
          </div>
        </div>

        {/* Card Body — Left on mobile, Bottom on tablet/desktop */}
        <div className="order-1 sm:order-2 flex flex-1 min-w-0 flex-col p-3.5 sm:p-4.5 justify-between">
          <div>
            <div className="flex items-start justify-between gap-1.5">
              <h3 className="t-sub text-[15px] sm:text-[18.5px] uppercase tracking-wide text-charcoal transition-colors duration-200 group-hover:text-ember line-clamp-1 sm:line-clamp-2">
                {item.name}
              </h3>
              <SpiceMeter level={item.spice} className="mt-0.5 shrink-0 hidden xs:flex sm:flex" />
            </div>

            <p className="mt-1 line-clamp-2 text-[11.5px] sm:text-[12.5px] leading-[1.5] sm:leading-[1.6] text-slate-brand">
              {item.blurb}
            </p>

            <div className="mt-2.5 flex items-center justify-between gap-2">
              <Rating value={item.rating} reviews={item.reviews} />
              <span className="inline-flex items-center gap-1 rounded-full bg-charcoal/5 px-2 py-0.5 text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-brand">
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-brand/80" />
                {item.prepMinutes} min
              </span>
            </div>
          </div>

          {/* Bottom Price & Action Row */}
          <div className="mt-3 sm:mt-auto flex items-center justify-between gap-2 border-t border-charcoal/6 pt-2.5 sm:pt-3.5">
            <PriceTag value={item.price} compareAt={item.compareAt} />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
              aria-label={`Customise ${item.name}`}
              className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-charcoal/6 text-charcoal transition-all duration-200 hover:scale-105 group-hover:bg-ember group-hover:text-white group-hover:shadow-[0_6px_16px_rgba(255,77,20,0.4)]"
            >
              <Plus className="h-4 w-4 sm:h-4.5 sm:w-4.5 stroke-[2.8]" />
            </button>
          </div>
        </div>
      </motion.article>

      <ItemModal item={item} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

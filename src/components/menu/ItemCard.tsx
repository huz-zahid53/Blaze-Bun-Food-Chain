"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { PriceTag, Badge } from "@/components/ui/Badge";
import { SpiceMeter, Rating } from "@/components/ui/Meters";
import { cn, discountPct } from "@/lib/utils";
import type { MenuItem } from "@/data/menu";
import { ItemModal } from "./ItemModal";

interface Props {
  item: MenuItem;
  priority?: boolean;
  className?: string;
}

/** Menu grid card — click anywhere to open the configurator. */
export function ItemCard({ item, priority, className }: Props) {
  const [open, setOpen] = useState(false);
  const off = discountPct(item.price, item.compareAt);

  return (
    <>
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className={cn(
          "group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[26px] border border-charcoal/8 bg-white shadow-[0_4px_20px_-14px_rgba(16,14,12,0.35)] transition-shadow hover:shadow-[0_24px_50px_-22px_rgba(16,14,12,0.45)]",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        {/* Media */}
        <div className="relative">
          <MediaFrame
            src={item.image}
            hue={item.hue}
            glyph={item.glyph}
            alt={item.name}
            ratio="aspect-[4/3]"
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            priority={priority}
          />

          {/* Tag cluster */}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {off > 0 && <Badge tone="ember">−{off}%</Badge>}
            {item.tags.includes("bestseller") && (
              <Badge tone="dark">Bestseller</Badge>
            )}
            {item.tags.includes("new") && <Badge tone="fresh">New</Badge>}
            {item.tags.includes("midnight") && <Badge tone="dark">Midnight</Badge>}
          </div>

          {item.tags.includes("veg") && (
            <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-lg border-2 border-fresh bg-white/90" title="Vegetarian">
              <span className="h-2.5 w-2.5 rounded-full bg-fresh" />
            </span>
          )}

          {/* Quick add */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            aria-label={`Customise ${item.name}`}
            className="absolute bottom-3 right-3 grid h-11 w-11 translate-y-3 place-items-center rounded-full bg-ember text-white opacity-0 shadow-[0_10px_24px_-8px_rgba(255,77,20,0.9)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
          >
            <Plus className="h-5 w-5" strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="t-sub text-[19px] uppercase tracking-wide text-charcoal">
              {item.name}
            </h3>
            <SpiceMeter level={item.spice} className="mt-1 shrink-0" />
          </div>

          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-[1.6] text-slate-brand">
            {item.blurb}
          </p>

          <div className="mt-2.5">
            <Rating value={item.rating} reviews={item.reviews} />
          </div>

          <div className="mt-auto flex items-end justify-between gap-2 pt-4">
            <PriceTag value={item.price} compareAt={item.compareAt} />
            <span className="rounded-full bg-charcoal/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-brand">
              {item.prepMinutes} min
            </span>
          </div>
        </div>
      </motion.article>

      <ItemModal item={item} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

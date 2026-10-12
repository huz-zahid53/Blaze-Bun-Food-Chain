"use client";

import { Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function SpiceMeter({
  level,
  className,
  showLabel = false,
}: {
  level: 0 | 1 | 2 | 3;
  className?: string;
  showLabel?: boolean;
}) {
  if (level === 0) return null;
  const labels = ["", "Mild", "Hot", "Inferno"];

  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      title={`Heat: ${labels[level]}`}
    >
      {[1, 2, 3].map((i) => (
        <Flame
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i <= level ? "text-ember" : "text-charcoal/15",
          )}
          strokeWidth={2.5}
          fill={i <= level ? "currentColor" : "none"}
        />
      ))}
      {showLabel && (
        <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-ember">
          {labels[level]}
        </span>
      )}
    </span>
  );
}

export function Rating({
  value,
  reviews,
  className,
  dark,
}: {
  value: number;
  reviews?: number;
  className?: string;
  dark?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold",
        dark ? "text-cream/70" : "text-slate-brand",
        className,
      )}
    >
      <Star className="h-3.5 w-3.5 fill-gold text-gold" strokeWidth={0} />
      <span className="text-charcoal">{value.toFixed(1)}</span>
      {reviews !== undefined && (
        <span className={dark ? "text-cream/45" : "text-slate-brand/70"}>
          ({reviews.toLocaleString("en-PK")})
        </span>
      )}
    </span>
  );
}

/** Five-star interactive picker used on the feedback page. */
export function StarPicker({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className="transition-transform duration-200 hover:scale-125 active:scale-95"
        >
          <Star
            className={cn(
              "h-8 w-8 transition-colors",
              n <= value ? "fill-gold text-gold" : "fill-transparent text-charcoal/20",
            )}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "ember" | "dark" | "gold" | "fresh" | "chill" | "mist" | "outline";

const tones: Record<Tone, string> = {
  ember: "bg-ember text-white",
  dark: "bg-charcoal text-cream",
  gold: "bg-gold text-charcoal",
  fresh: "bg-fresh text-white",
  chill: "bg-chill text-white",
  mist: "bg-charcoal/8 text-slate-brand",
  outline: "border border-charcoal/20 text-charcoal",
};

export function Badge({
  children,
  tone = "ember",
  className,
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** Rounded price chip used on menu cards. */
export function PriceTag({
  value,
  compareAt,
  className,
  size = "md",
}: {
  value: number;
  compareAt?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };
  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <span className="font-display text-[0.72em] text-ember">Rs</span>
      <span
        className={cn(
          "font-display leading-none tracking-wide text-charcoal",
          sizes[size],
        )}
      >
        {Math.round(value).toLocaleString("en-PK")}
      </span>
      {compareAt && compareAt > value && (
        <span className="text-[0.62em] font-semibold text-slate-brand/60 line-through">
          {Math.round(compareAt).toLocaleString("en-PK")}
        </span>
      )}
    </span>
  );
}

/** Small dark chip with an icon — used for prep time, calories, rating. */
export function MetaChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-charcoal/6 px-2.5 py-1 text-[10.5px] font-semibold text-slate-brand",
        className,
      )}
    >
      {children}
    </span>
  );
}

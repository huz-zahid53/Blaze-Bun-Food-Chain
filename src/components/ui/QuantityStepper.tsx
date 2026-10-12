"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  className,
}: Props) {
  const dims = {
    sm: { btn: "h-7 w-7", text: "text-sm w-7" },
    md: { btn: "h-9 w-9", text: "text-base w-9" },
    lg: { btn: "h-11 w-11", text: "text-lg w-11" },
  }[size];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-charcoal/12 bg-white p-1 shadow-sm",
        className,
      )}
    >
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn(
          "grid place-items-center rounded-full bg-charcoal/5 text-charcoal transition-all hover:bg-ember hover:text-white active:scale-90 disabled:opacity-30 disabled:hover:bg-charcoal/5 disabled:hover:text-charcoal",
          dims.btn,
        )}
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={3} />
      </button>
      <span
        className={cn(
          "grid place-items-center font-display text-charcoal tabular-nums",
          dims.text,
        )}
      >
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn(
          "grid place-items-center rounded-full bg-charcoal text-cream transition-all hover:bg-ember hover:text-white active:scale-90 disabled:opacity-30",
          dims.btn,
        )}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={3} />
      </button>
    </div>
  );
}

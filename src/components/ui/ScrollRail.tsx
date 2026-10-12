"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Horizontal snap rail with edge fades and arrow controls. */
export function ScrollRail({
  children,
  className,
  itemClassName,
  label,
}: {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 620), behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      {/* Fades */}
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-cream to-transparent transition-opacity",
          canLeft ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-cream to-transparent transition-opacity",
          canRight ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Arrows */}
      <button
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
        className={cn(
          "absolute -left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-charcoal/10 bg-white text-charcoal shadow-lg transition-all hover:border-ember hover:bg-ember hover:text-white lg:grid",
          !canLeft && "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2.6} />
      </button>
      <button
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
        className={cn(
          "absolute -right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-charcoal/10 bg-white text-charcoal shadow-lg transition-all hover:border-ember hover:bg-ember hover:text-white lg:grid",
          !canRight && "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight className="h-5 w-5" strokeWidth={2.6} />
      </button>

      <div
        ref={ref}
        aria-label={label}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar"
      >
        {Array.isArray(children)
          ? children.map((child, i) => (
              <div key={i} className={cn("snap-start shrink-0", itemClassName)}>
                {child}
              </div>
            ))
          : children}
      </div>
    </div>
  );
}

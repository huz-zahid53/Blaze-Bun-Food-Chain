"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollRailProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  label?: string;
  /**
   * "all": visible on both mobile and desktop
   * "mobile-only": visible ONLY on mobile (<640px), hidden on desktop (>=640px)
   * "desktop-only": visible ONLY on desktop, hidden on mobile
   * "none": hidden completely
   */
  arrows?: "all" | "mobile-only" | "desktop-only" | "none";
  /** Custom vertical alignment class for arrows (default: "top-1/2 -translate-y-1/2") */
  arrowPosition?: string;
}

/** Horizontal snap rail with crisp edge-to-edge view and responsive arrow controls. */
export function ScrollRail({
  children,
  className,
  itemClassName,
  label,
  arrows = "all",
  arrowPosition = "top-1/2 -translate-y-1/2",
}: ScrollRailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 6);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 6);
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

  const getVisibilityClass = () => {
    switch (arrows) {
      case "mobile-only":
        return "grid sm:hidden";
      case "desktop-only":
        return "hidden sm:grid";
      case "all":
        return "grid";
      case "none":
        return "hidden";
    }
  };

  const visibilityClass = getVisibilityClass();

  return (
    <div className={cn("relative", className)}>
      {/* Floating Left Arrow */}
      {arrows !== "none" && (
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          className={cn(
            "absolute left-0.5 sm:-left-3 lg:-left-5 z-20 place-items-center rounded-full border border-charcoal/15 bg-white/95 text-charcoal shadow-[0_4px_18px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-ember hover:bg-ember hover:text-white active:scale-90",
            "h-9 w-9 sm:h-11 sm:w-11",
            arrowPosition,
            visibilityClass,
            !canLeft && "pointer-events-none opacity-0",
          )}
        >
          <ChevronLeft className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2.6} />
        </button>
      )}

      {/* Floating Right Arrow */}
      {arrows !== "none" && (
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          className={cn(
            "absolute right-0.5 sm:-right-3 lg:-right-5 z-20 place-items-center rounded-full border border-charcoal/15 bg-white/95 text-charcoal shadow-[0_4px_18px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-ember hover:bg-ember hover:text-white active:scale-90",
            "h-9 w-9 sm:h-11 sm:w-11",
            arrowPosition,
            visibilityClass,
            !canRight && "pointer-events-none opacity-0",
          )}
        >
          <ChevronRight className="h-4.5 w-4.5 sm:h-5 sm:w-5" strokeWidth={2.6} />
        </button>
      )}

      <div
        ref={ref}
        aria-label={label}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar px-1 sm:px-0"
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

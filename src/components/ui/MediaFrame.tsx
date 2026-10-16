"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, seededRandom } from "@/lib/utils";
import { FoodGlyph, type Glyph } from "./FoodGlyph";

interface Props {
  src?: string;
  hue: number;
  glyph: string;
  alt: string;
  className?: string;
  /** Tailwind aspect utility for the wrapper. */
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  /** Slight zoom on hover — used by cards. */
  zoom?: boolean;
}

/**
 * Renders the real photograph with lazy loading and animated skeleton shimmer,
 * otherwise falls back to the generative glyph on a brand-tinted
 * duotone backdrop. Always visually complete — never a broken image.
 */
export function MediaFrame({
  src,
  hue,
  glyph,
  alt,
  className,
  ratio = "aspect-square",
  sizes = "(max-width: 768px) 50vw, 33vw",
  priority,
  zoom = true,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(src) && !failed;
  const r = seededRandom(alt);

  const backdrop = {
    background: `radial-gradient(115% 115% at ${28 + r * 34}% ${18 + r * 20}%, hsl(${hue} 72% 94%) 0%, hsl(${hue} 46% 86%) 46%, hsl(${hue} 34% 76%) 100%)`,
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-bone",
        ratio,
        "group/media",
        className,
      )}
      style={!showPhoto ? backdrop : undefined}
    >
      {showPhoto ? (
        <>
          {/* Shimmer skeleton loader until image has fully loaded */}
          {!loaded && (
            <div className="absolute inset-0 z-10 bg-charcoal/10 overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
          )}

          <Image
            src={src as string}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setFailed(true);
              setLoaded(true);
            }}
            className={cn(
              "object-cover transition-all duration-[750ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              !loaded ? "opacity-0 scale-[0.98] blur-[2px]" : "opacity-100 scale-100 blur-0",
              zoom && "group-hover:scale-[1.09]",
            )}
          />
        </>
      ) : (
        <>
          {/* Soft glow behind the glyph */}
          <div
            className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-2xl"
            style={{ background: `hsl(${hue} 80% 62% / 0.35)` }}
          />
          {/* Diagonal ember weave */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `repeating-linear-gradient(-45deg, hsl(${hue} 60% 30%) 0 2px, transparent 2px 12px)`,
            }}
          />
          <div
            className={cn(
              "absolute inset-[8%] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              zoom && "group-hover:scale-[1.07]",
            )}
          >
            <FoodGlyph glyph={glyph as Glyph} hue={hue} title={alt} />
          </div>
        </>
      )}

      {/* Bottom vignette for legibility of overlaid labels */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-charcoal/20 to-transparent" />
    </div>
  );
}

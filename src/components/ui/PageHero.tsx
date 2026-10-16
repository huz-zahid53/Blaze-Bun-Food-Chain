import Image from "next/image";
import { SectionDivider, DotGridOverlay } from "@/components/ui/SectionDivider";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  kicker?: string;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  align?: "left" | "center";
  /** Fast-food background photograph. Defaults to relevant flame background. */
  image?: string;
  /** Which side of the photograph the subject sits on. */
  focus?: "right" | "left" | "center";
  /** Heavier overlay = darker, more contrast behind the copy. */
  tone?: "deep" | "soft";
}

/**
 * Shared hero band for interior pages.
 *
 * Every page hero carries a full-bleed fast-food photograph graded
 * with a charcoal wash so the left-hand column stays legible.
 */
export function PageHero({
  kicker,
  title,
  subtitle,
  children,
  className,
  align = "left",
  image = "/media/hero/bg-dining.jpg",
  focus = "right",
  tone = "deep",
}: Props) {
  const objectPosition =
    focus === "right" ? "70% center" : focus === "left" ? "30% center" : "center";

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-charcoal text-cream",
        className,
      )}
    >
      {/* ---------- Background photograph ---------- */}
      <Image
        src={image}
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        style={{ objectPosition }}
        className="object-cover"
      />
      {/* Legibility wash — left column stays readable while right food image shines through */}
      <div
        className={cn(
          "absolute inset-0",
          tone === "deep"
            ? "bg-gradient-to-r from-charcoal via-charcoal/80 to-charcoal/20"
            : "bg-gradient-to-r from-charcoal/80 via-charcoal/60 to-charcoal/15",
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/30" />
      {/* Brand duotone warmth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-ember/15 via-transparent to-flame/10 mix-blend-overlay" />

      {/* Film grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] grain" />

      {/* Subtle dot-matrix grid overlay */}
      <DotGridOverlay tone="dark" />

      {/* Luminous hairline divider */}
      <SectionDivider className="absolute inset-x-0 bottom-0 z-10" tone="dark" />

      {/* ---------- Content ---------- */}
      <div
        className={cn(
          "relative mx-auto max-w-[1400px] px-4 pb-14 pt-14 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20",
          align === "center" && "text-center",
        )}
      >
        {kicker && (
          <span className="t-eyebrow inline-flex items-center gap-2 text-ember">
            <span className="h-[3px] w-6 rounded-full bg-ember" />
            {kicker}
          </span>
        )}

        <h1 className="t-page mt-3">{title}</h1>

        {subtitle && (
          <p
            className={cn(
              "t-lead mt-4 max-w-2xl text-cream/70",
              align === "center" && "mx-auto",
            )}
          >
            {subtitle}
          </p>
        )}

        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}

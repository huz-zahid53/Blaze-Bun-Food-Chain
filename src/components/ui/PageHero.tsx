import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  kicker?: string;
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  align?: "left" | "center";
  /**
   * Fast-food background photograph. When omitted the hero falls back to
   * the ember-gradient treatment used on the franchise page.
   */
  image?: string;
  /** Which side of the photograph the subject sits on. */
  focus?: "right" | "left" | "center";
  /** Heavier overlay = darker, more contrast behind the copy. */
  tone?: "deep" | "soft";
}

/**
 * Shared hero band for interior pages.
 *
 * Every page hero now carries a full-bleed fast-food photograph graded
 * with a charcoal wash so the left-hand column stays legible, and fades
 * into the page background at the bottom for a seamless transition.
 */
export function PageHero({
  kicker,
  title,
  subtitle,
  children,
  className,
  align = "left",
  image,
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
      {image ? (
        <>
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
          {/* Legibility wash — left column stays readable */}
          <div
            className={cn(
              "absolute inset-0",
              tone === "deep"
                ? "bg-gradient-to-r from-charcoal via-charcoal/88 to-charcoal/35"
                : "bg-gradient-to-r from-charcoal/85 via-charcoal/70 to-charcoal/40",
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/25 to-charcoal/55" />
          {/* Brand duotone */}
          <div className="absolute inset-0 bg-gradient-to-tr from-ember/20 via-transparent to-flame/10 mix-blend-overlay" />
        </>
      ) : (
        <>
          {/* Fallback: ember glow treatment */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-ember/25 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-flame/18 blur-[130px]" />
        </>
      )}

      {/* Film grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] grain" />

      {/* Bottom fade into the page so the hero doesn't end on a hard line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-cream" />

      {/* ---------- Content ---------- */}
      <div
        className={cn(
          "relative mx-auto max-w-[1400px] px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8 lg:pb-28 lg:pt-20",
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

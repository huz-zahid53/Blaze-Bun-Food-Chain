"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

/**
 * Low-level glowing skeleton box with animated shimmer wave.
 *
 * Purely decorative: it is `aria-hidden` and the surrounding region carries the
 * `role="status"` / `aria-busy` semantics (see the page-level skeletons below).
 * The shimmer is a CSS animation, so `prefers-reduced-motion` freezes it via the
 * global rule in `globals.css`; `motion-reduce:animate-none` mirrors that here.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-xl bg-charcoal/8",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent motion-reduce:animate-none" />
    </div>
  );
}

/**
 * Standard menu item card skeleton (responsive: horizontal on mobile, vertical on desktop).
 */
export function CardSkeleton() {
  return (
    <div className="flex h-full flex-row sm:flex-col overflow-hidden rounded-[22px] sm:rounded-[26px] border border-charcoal/8 bg-white p-0">
      {/* Media skeleton */}
      <div className="order-2 sm:order-1 relative w-[120px] xs:w-[135px] sm:w-full shrink-0 overflow-hidden sm:aspect-[4/3] self-stretch sm:self-auto bg-charcoal/8">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Body skeleton */}
      <div className="order-1 sm:order-2 flex flex-1 min-w-0 flex-col p-3.5 sm:p-4.5 justify-between space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-2/3 rounded-md" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-3.5 w-14 rounded-full" />
            <Skeleton className="h-3.5 w-16 rounded-full" />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-charcoal/6 pt-3">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Deal card bundle skeleton.
 */
export function DealCardSkeleton() {
  return (
    <div className="flex h-full flex-row sm:flex-col overflow-hidden rounded-[24px] sm:rounded-[26px] border border-charcoal/10 bg-white">
      <div className="order-2 sm:order-1 relative w-[120px] xs:w-[135px] sm:w-full shrink-0 overflow-hidden sm:aspect-[4/3] self-stretch sm:self-auto bg-charcoal/8">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      <div className="order-1 sm:order-2 flex flex-1 min-w-0 flex-col p-3.5 sm:p-4.5 justify-between space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-5 w-4/5 rounded-md" />
          <Skeleton className="h-3.5 w-full rounded-md" />
          <div className="flex gap-1.5 pt-1">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-charcoal/8 pt-3">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

interface ImageWithSkeletonProps extends Omit<ImageProps, "onLoad" | "onError"> {
  wrapperClassName?: string;
}

/**
 * Drop-in Next.js Image with lazy-loading, shimmer skeleton placeholder, and smooth blur-fade transition.
 */
export function ImageWithSkeleton({
  src,
  alt,
  className,
  wrapperClassName,
  priority = false,
  fill = false,
  ...rest
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={cn(
        fill ? "absolute inset-0 h-full w-full overflow-hidden" : "relative overflow-hidden",
        wrapperClassName,
      )}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 z-10 bg-charcoal/8 overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        fill={fill}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        className={cn(
          "transition-all duration-700 ease-out",
          !loaded && "opacity-0 scale-[0.98] blur-[2px]",
          loaded && "opacity-100 scale-100 blur-0",
          className,
        )}
        {...rest}
      />
    </div>
  );
}

/* ============================================================
   PAGE-LEVEL SKELETONS
   ------------------------------------------------------------
   Each mirrors the real page's grid, spacing and aspect ratios so
   the swap to live content causes no layout shift. The outer element
   owns the `role="status"` / `aria-busy` semantics and a visually
   hidden "Loading…" label for screen readers.
   ============================================================ */

/** Responsive grid of product cards — matches the menu grid exactly. */
export function ProductGridSkeleton({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Horizontal row of category pill placeholders. */
export function CategoryPillsSkeleton({ className }: { className?: string }) {
  const widths = [56, 104, 88, 116, 80, 96, 72];
  return (
    <div className={cn("flex items-center gap-2 overflow-hidden", className)}>
      {widths.map((w, i) => (
        <Skeleton
          key={i}
          className="h-10 shrink-0 rounded-full"
          style={{ width: w }}
        />
      ))}
    </div>
  );
}

/**
 * Charcoal hero band used by every interior page (`PageHero`). `search` adds a
 * pill placeholder for pages whose hero carries a search/order box.
 */
export function HeroSkeleton({
  search = false,
  className,
}: {
  search?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden bg-charcoal text-cream",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] grain" />
      <div className="relative mx-auto max-w-[1400px] px-4 pb-14 pt-14 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
        <Skeleton className="h-3 w-32 rounded-full bg-cream/15" />
        <Skeleton className="mt-4 h-12 w-[22rem] max-w-[72%] rounded-lg bg-cream/15 sm:h-14" />
        <Skeleton className="mt-4 h-4 w-[26rem] max-w-[80%] rounded-md bg-cream/10" />
        {search && (
          <Skeleton className="mt-7 h-14 w-full max-w-xl rounded-full bg-cream/10" />
        )}
      </div>
    </section>
  );
}

/** Full `/menu` loading layout: hero band, filter bar and product grid. */
export function MenuPageSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading the menu…</span>

      <HeroSkeleton search />

      {/* Sticky filter bar */}
      <div className="border-b border-charcoal/8 bg-cream">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-3">
            <CategoryPillsSkeleton className="min-w-0 flex-1" />
            <Skeleton className="hidden h-10 w-44 shrink-0 rounded-full lg:block" />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-9 w-44 rounded-full" />
        </div>
        <Skeleton className="mb-6 h-7 w-56 rounded-md" />
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}

function CartLineSkeleton() {
  return (
    <div className="flex gap-4 rounded-3xl border border-charcoal/8 bg-white p-4">
      <Skeleton className="h-[104px] w-[104px] shrink-0 rounded-2xl" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Skeleton className="h-5 w-3/5 rounded-md" />
        <Skeleton className="mt-2 h-3.5 w-2/5 rounded-md" />
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/** Full `/cart` loading layout. */
export function CartSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your bucket…</span>

      <HeroSkeleton />

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        {/* Fulfilment strip */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-charcoal/8 bg-white p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-2.5 w-24 rounded-full" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
          <div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <div className="mt-5 space-y-3.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <CartLineSkeleton key={i} />
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-3xl border border-charcoal/8 bg-white p-6">
              <Skeleton className="h-6 w-40 rounded-md" />
              <Skeleton className="mt-4 h-20 w-full rounded-2xl" />
              <div className="mt-5 space-y-2.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-4 w-16 rounded-md" />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-end justify-between border-t border-charcoal/8 pt-4">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
              </div>
              <Skeleton className="mt-5 h-12 w-full rounded-full" />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

/** Full `/checkout` loading layout: hero, stepper, form and dark summary. */
export function CheckoutSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading checkout…</span>

      <HeroSkeleton />

      {/* Stepper */}
      <div className="border-b border-charcoal/8 bg-cream">
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 shrink-0 rounded-full" />
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
          <div className="rounded-3xl border border-charcoal/8 bg-white p-6 sm:p-8">
            <Skeleton className="h-6 w-44 rounded-md" />
            <Skeleton className="mt-2 h-4 w-64 rounded-md" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[62px] rounded-2xl" />
              ))}
            </div>
            <Skeleton className="mt-7 h-28 w-full rounded-2xl" />
          </div>

          <aside className="lg:sticky lg:top-40">
            <div className="rounded-3xl bg-charcoal p-6">
              <Skeleton className="h-6 w-40 rounded-md bg-cream/15" />
              <div className="mt-4 space-y-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32 rounded-md bg-cream/10" />
                    <Skeleton className="h-4 w-14 rounded-md bg-cream/10" />
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-2 border-t border-cream/10 pt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20 rounded-md bg-cream/10" />
                    <Skeleton className="h-4 w-16 rounded-md bg-cream/10" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-cream/10 pt-4">
                <Skeleton className="h-4 w-16 rounded-md bg-cream/15" />
                <Skeleton className="h-8 w-28 rounded-md bg-cream/15" />
              </div>
              <Skeleton className="mt-5 h-16 w-full rounded-2xl bg-cream/10" />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

/** Full `/track` loading layout: hero with lookup, order list and status card. */
export function TrackSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your orders…</span>

      <HeroSkeleton search />

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:items-start">
          <aside className="lg:sticky lg:top-28">
            <Skeleton className="h-5 w-28 rounded-md" />
            <div className="mt-4 space-y-2.5">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-[92px] w-full rounded-2xl" />
              ))}
            </div>
          </aside>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-3xl bg-charcoal p-6 sm:p-8">
              <Skeleton className="h-2.5 w-40 rounded-full bg-cream/15" />
              <Skeleton className="mt-3 h-8 w-56 rounded-md bg-cream/15" />
              <Skeleton className="mt-2 h-4 w-72 max-w-full rounded-md bg-cream/10" />
              <Skeleton className="mt-9 h-11 w-full rounded-full bg-cream/10" />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-64 rounded-3xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

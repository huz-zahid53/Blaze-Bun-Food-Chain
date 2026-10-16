"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

/**
 * Low-level glowing skeleton box with animated shimmer wave.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-charcoal/8",
        className,
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
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

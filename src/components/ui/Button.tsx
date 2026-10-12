"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "ember" | "dark" | "outline" | "ghost" | "cream";
type Size = "sm" | "md" | "lg" | "xl";

const base =
  "relative inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wide rounded-full transition-all duration-300 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97] whitespace-nowrap";

const variants: Record<Variant, string> = {
  ember:
    "bg-ember text-white shadow-[0_10px_30px_-8px_rgba(255,77,20,0.65)] hover:bg-ember-dark hover:shadow-[0_16px_40px_-10px_rgba(255,77,20,0.8)] hover:-translate-y-0.5",
  dark: "bg-charcoal text-cream hover:bg-ink hover:-translate-y-0.5 shadow-[0_10px_28px_-12px_rgba(16,14,12,0.8)]",
  outline:
    "border-2 border-charcoal/20 text-charcoal hover:border-ember hover:text-ember hover:bg-ember/5",
  ghost: "text-charcoal hover:bg-charcoal/5",
  cream:
    "bg-cream text-charcoal hover:bg-bone hover:-translate-y-0.5 shadow-[0_10px_28px_-12px_rgba(0,0,0,0.4)]",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-[11px]",
  md: "px-6 py-3 text-xs",
  lg: "px-7 py-3.5 text-[13px]",
  xl: "px-9 py-4 text-sm",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  full?: boolean;
}

export function Button({
  variant = "ember",
  size = "md",
  className,
  children,
  full,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], full && "w-full", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "ember",
  size = "md",
  className,
  children,
  href,
  full,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], full && "w-full", className)}
    >
      {children}
    </Link>
  );
}

/** Icon-only circular action button (cart, wishlist, close). */
export function IconButton({
  className,
  children,
  label,
  tone = "dark",
  ...rest
}: {
  className?: string;
  children: ReactNode;
  label: string;
  tone?: "dark" | "ember" | "cream";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const tones = {
    dark: "bg-charcoal text-cream hover:bg-ink",
    ember: "bg-ember text-white hover:bg-ember-dark",
    cream: "bg-cream text-charcoal hover:bg-bone",
  };
  return (
    <button
      aria-label={label}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 active:scale-90",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

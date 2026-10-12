import { cn } from "@/lib/utils";

interface MarkProps {
  className?: string;
  /** Reverse = cream on transparent (for dark backgrounds). */
  reverse?: boolean;
}

/**
 * Blaze & Bun flame mark — pure SVG, recolorable, scales crisply.
 * A flame rising out of a sesame brioche bun.
 */
export function FlameMark({ className, reverse }: MarkProps) {
  const badge = reverse ? "#FFF6EC" : "#100E0C";
  const inner = reverse ? "#100E0C" : "#FFF6EC";

  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="Blaze & Bun flame mark"
    >
      <defs>
        <linearGradient id="blaze-flame" x1="0" y1="1" x2="0.6" y2="0">
          <stop offset="0%" stopColor="#FF4D14" />
          <stop offset="55%" stopColor="#FF8A00" />
          <stop offset="100%" stopColor="#FFC24B" />
        </linearGradient>
      </defs>

      <rect
        x="0"
        y="0"
        width="64"
        height="64"
        rx="17"
        fill={badge}
      />

      {/* Flame */}
      <path
        d="M32 7C28.2 15 20 21 20 31.5C20 39.6 25.2 45.5 32 45.5C38.8 45.5 44 39.6 44 31.5C44 25.4 41 21.4 38 17.4C37 23.2 35 27 32 27C34 20 33 13.5 32 7Z"
        fill="url(#blaze-flame)"
      />
      <path
        d="M32 25.5C29.2 30 27.4 32.8 27.4 35.6C27.4 39.4 29.5 42.3 32 42.3C34.5 42.3 36.6 39.4 36.6 35.6C36.6 32.8 34.8 30 32 25.5Z"
        fill="#FFF6EC"
        opacity="0.92"
      />

      {/* Bun */}
      <path
        d="M13 47.5C13 46.1 14.1 45 15.5 45H48.5C49.9 45 51 46.1 51 47.5V49C51 52.6 48.1 55.5 44.6 55.5H19.4C15.9 55.5 13 52.6 13 49V47.5Z"
        fill={inner}
      />
      <g fill={badge} opacity="0.5">
        <ellipse cx="22" cy="49.6" rx="1.9" ry="1.2" />
        <ellipse cx="32" cy="49.2" rx="1.9" ry="1.2" />
        <ellipse cx="42" cy="49.6" rx="1.9" ry="1.2" />
      </g>
    </svg>
  );
}

interface LogoProps {
  className?: string;
  reverse?: boolean;
  showTagline?: boolean;
  compact?: boolean;
}

export function Logo({
  className,
  reverse,
  showTagline = true,
  compact = false,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "relative shrink-0",
          compact ? "h-9 w-9" : "h-11 w-11",
        )}
      >
        <FlameMark reverse={reverse} />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[26px] tracking-wide",
              reverse ? "text-cream" : "text-charcoal",
            )}
          >
            BLAZE<span className="text-ember">&</span>BUN
          </span>
          {showTagline && (
            <span
              className={cn(
                "mt-1 text-[9.5px] font-bold uppercase tracking-[0.32em]",
                reverse ? "text-cream/55" : "text-slate-brand",
              )}
            >
              Gourmet Burgers
            </span>
          )}
        </span>
      )}
    </span>
  );
}

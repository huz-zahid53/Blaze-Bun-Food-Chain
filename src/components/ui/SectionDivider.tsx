import { cn } from "@/lib/utils";

interface SectionDividerProps {
  className?: string;
  tone?: "dark" | "light";
  pip?: boolean;
}

/**
 * 21st.dev inspired luminous hairline divider.
 * Clean, razor-sharp 1px line with a central flame beam and glowing diamond pip.
 * Replaces blurry muddy fog gradients with sleek, modern engineered aesthetic.
 */
export function SectionDivider({
  className,
  tone = "dark",
  pip = true,
}: SectionDividerProps) {
  return (
    <div
      className={cn(
        "pointer-events-none relative flex w-full items-center justify-center overflow-hidden py-0",
        className,
      )}
      aria-hidden="true"
    >
      {/* Base hairline */}
      <div
        className={cn(
          "h-px w-full",
          tone === "dark"
            ? "bg-gradient-to-r from-transparent via-white/12 to-transparent"
            : "bg-gradient-to-r from-transparent via-charcoal/12 to-transparent",
        )}
      />

      {/* Vibrant luminous flame beam */}
      <div className="absolute h-px w-3/4 max-w-3xl bg-gradient-to-r from-transparent via-flame to-transparent opacity-85" />

      {/* Subtle core micro-glow */}
      <div className="absolute h-[2px] w-48 bg-gradient-to-r from-transparent via-gold to-transparent blur-[1.5px]" />

      {/* Centered micro diamond flame pip */}
      {pip && (
        <span className="absolute h-1.5 w-1.5 rotate-45 border border-gold/90 bg-flame shadow-[0_0_8px_rgba(255,77,20,0.85)]" />
      )}
    </div>
  );
}

/**
 * 21st.dev style subtle dot-matrix grid overlay.
 * Adds tactile depth without muddy fog or blurry washes.
 */
export function DotGridOverlay({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)]",
        tone === "dark" ? "opacity-20" : "opacity-15",
        className,
      )}
      style={{
        backgroundImage:
          tone === "dark"
            ? "radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)"
            : "radial-gradient(rgba(16, 14, 12, 0.12) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
      aria-hidden="true"
    />
  );
}

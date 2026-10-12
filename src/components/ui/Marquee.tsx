import { cn } from "@/lib/utils";

interface Props {
  items: string[];
  className?: string;
  speed?: "normal" | "fast";
  separator?: string;
  reverse?: boolean;
}

/** Infinite horizontal ticker — duplicated track, CSS-driven. */
export function Marquee({
  items,
  className,
  speed = "normal",
  separator = "•",
  reverse,
}: Props) {
  const track = [...items, ...items];

  return (
    <div
      className={cn(
        "relative flex w-full overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-max shrink-0 items-center",
          speed === "fast" ? "animate-marquee-fast" : "animate-marquee",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {track.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center whitespace-nowrap font-display text-lg uppercase tracking-[0.14em] text-charcoal/70"
          >
            <span className="px-6">{item}</span>
            <span className="text-ember">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Ember-striped divider bar. */
export function StripeBar({ className }: { className?: string }) {
  return (
    <div className={cn("h-3 w-full stripe-ember opacity-90", className)} />
  );
}

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  kicker?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
  action?: ReactNode;
}

export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = "left",
  dark,
  className,
  action,
}: Props) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start",
        action && "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-3",
          align === "center" && "items-center",
        )}
      >
        {kicker && (
          <span
            className={cn(
              "inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em]",
              dark ? "text-ember" : "text-ember",
            )}
          >
            <span className="h-[3px] w-6 rounded-full bg-ember" />
            {kicker}
          </span>
        )}
        <h2
          className={cn(
            "t-section",
            dark ? "text-cream" : "text-charcoal",
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              "max-w-2xl text-[15px] leading-[1.6]",
              dark ? "text-cream/60" : "text-slate-brand",
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

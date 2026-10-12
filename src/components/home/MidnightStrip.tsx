"use client";

import Link from "next/link";
import { ArrowRight, Moon, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { formatPKR } from "@/lib/utils";

/**
 * Time-gated midnight offer — becomes orderable at exactly 00:00,
 * mirroring KFC Pakistan's midnight drop mechanic.
 */
export function MidnightStrip() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const hour = now ? now.getHours() : -1;
  const live = hour >= 0 && hour < 4;

  // Countdown to midnight
  const msToMidnight = (() => {
    if (!now) return null;
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    return next.getTime() - now.getTime();
  })();

  const hhmm = msToMidnight
    ? `${String(Math.floor(msToMidnight / 3_600_000)).padStart(2, "0")}:${String(
        Math.floor((msToMidnight % 3_600_000) / 60_000),
      ).padStart(2, "0")}`
    : "--:--";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-charcoal to-charcoal py-12 text-cream sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,138,0,0.18), transparent 45%), radial-gradient(circle at 85% 70%, rgba(129,140,248,0.22), transparent 45%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10.5px] font-black uppercase tracking-[0.2em] ${
                  live
                    ? "animate-pulse-ring bg-ember text-white"
                    : "bg-cream/10 text-cream/70"
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                {live ? "Live now — 12 AM to 4 AM" : "Drops at 12:00 AM"}
              </span>

              <h2 className="t-section mt-5 uppercase tracking-wide">
                Midnight
                <br />
                <span className="bg-gradient-to-r from-flame via-gold to-indigo-400 bg-clip-text text-transparent">
                  Munch Box
                </span>
              </h2>

              <p className="mt-4 max-w-md text-[14.5px] leading-[1.6] text-cream/60">
                A burger, four wings, fries, a dip and a drink for{" "}
                <strong className="font-black text-flame">
                  {formatPKR(1250)}
                </strong>
                . It exists between midnight and 4 AM — like all good decisions.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/deals#midnight-munch"
                  className={`group inline-flex items-center gap-2 rounded-full px-8 py-4 text-[12.5px] font-black uppercase tracking-wider transition-all ${
                    live
                      ? "bg-ember text-white hover:bg-ember-dark"
                      : "border-2 border-cream/25 text-cream hover:border-cream hover:bg-cream/10"
                  }`}
                >
                  {live ? "Order it now" : "Set a reminder"}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={3}
                  />
                </Link>

                {!live && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 px-5 py-3.5 text-[12.5px] font-black uppercase tracking-wider text-cream/70">
                    <Timer className="h-4 w-4 text-flame" />
                    Drops in {hhmm}
                  </span>
                )}
              </div>
            </div>

            {/* Clock face */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative grid h-[260px] w-[260px] place-items-center rounded-full border border-cream/12 bg-cream/[0.03] backdrop-blur sm:h-[300px] sm:w-[300px]">
                <div className="absolute inset-6 rounded-full border border-dashed border-cream/12 animate-spin-slow" />

                <div className="text-center" suppressHydrationWarning>
                  <p
                    className="font-display text-[clamp(3rem,9vw,4.6rem)] leading-none text-cream"
                    suppressHydrationWarning
                  >
                    {now
                      ? now.toLocaleTimeString("en-PK", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                      : "--:--"}
                  </p>
                  <p className="mt-2 text-[10.5px] font-black uppercase tracking-[0.22em] text-cream/45">
                    Your local time
                  </p>

                  <div
                    suppressHydrationWarning
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-ember/15 px-4 py-2 text-[11px] font-black uppercase tracking-wider text-flame"
                  >
                    {live ? "Box is live" : "Box is sleeping"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Crown, Gift, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { brand } from "@/config/brand";
import { useStore } from "@/store/useStore";
import { useToast } from "@/components/ui/Toast";
import { formatPKR } from "@/lib/utils";
import Image from "next/image";

/** KFC-style loyalty / rewards join panel. */
export function RewardsBanner() {
  const points = useStore((s) => s.loyaltyPoints);
  const isMember = useStore((s) => s.isMember);
  const joinRewards = useStore((s) => s.joinRewards);
  const push = useToast((s) => s.push);
  const [email, setEmail] = useState("");

  function join(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      push({ message: "Please enter a valid email address.", tone: "error" });
      return;
    }
    joinRewards();
    push({
      message: `Welcome to ${brand.loyalty.name} — ${brand.loyalty.joinBonus} points added.`,
      tone: "success",
    });
    setEmail("");
  }

  const tier =
    [...brand.loyalty.tiers].reverse().find((t) => points >= t.min) ??
    brand.loyalty.tiers[0];
  const nextTier = brand.loyalty.tiers.find((t) => t.min > points);

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-[32px] bg-charcoal p-8 sm:p-12 lg:p-16 text-cream">
          {/* Relevant Background Photograph */}
          <Image
            src="/media/hero/bg-spread.jpg"
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            className="object-cover"
          />
          {/* Rich ember/flame/gold wash */}
          <div className="absolute inset-0 bg-gradient-to-br from-ember/85 via-flame/80 to-gold/70" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] grain" />

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-45deg, #100E0C 0 2px, transparent 2px 16px)",
            }}
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div className="text-charcoal">
              <span className="inline-flex items-center gap-2 rounded-full bg-charcoal px-4 py-1.5 text-[10.5px] font-black uppercase tracking-[0.2em] text-flame">
                <Crown className="h-3.5 w-3.5" />
                {brand.loyalty.name}
              </span>
              <h2 className="t-section mt-5 uppercase tracking-wide">
                Earn while
                <br />
                you eat
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-[1.6] text-charcoal/75">
                Every rupee you spend earns points you can burn on actual food —
                not on a digital badge. Join free and start with{" "}
                <strong className="font-black">
                  {brand.loyalty.joinBonus} points
                </strong>{" "}
                on the house.
              </p>

              {isMember ? (
                <div className="mt-7 rounded-2xl bg-charcoal p-5 text-cream">
                  <div className="flex items-baseline justify-between">
                    <p className="font-display text-4xl text-flame">
                      {points.toLocaleString("en-PK")}
                    </p>
                    <span className="rounded-full bg-flame/20 px-3 py-1 text-[10.5px] font-black uppercase tracking-wider text-flame">
                      {tier.name} member
                    </span>
                  </div>
                  <p className="mt-1 text-[12.5px] text-cream/60">
                    Worth {formatPKR(points * brand.loyalty.rupeePerPoint)} in
                    rewards
                  </p>

                  {nextTier && (
                    <>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-cream/12">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-flame to-ember"
                          style={{
                            width: `${Math.min(100, (points / nextTier.min) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-2 text-[12px] text-cream/55">
                        {nextTier.min - points} more points to{" "}
                        <span className="font-bold text-flame">{nextTier.name}</span>{" "}
                        — {nextTier.perk}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={join} className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    aria-label="Email address"
                    className="flex-1 rounded-full border-2 border-charcoal/20 bg-white/85 px-5 py-4 text-[14px] font-semibold text-charcoal outline-none backdrop-blur placeholder:font-medium placeholder:text-charcoal/45 focus:border-charcoal"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-charcoal px-8 py-4 text-[12.5px] font-black uppercase tracking-wider text-cream transition-all hover:bg-ink active:scale-[0.97]"
                  >
                    Join free
                  </button>
                </form>
              )}
            </div>

            {/* Perks */}
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Zap,
                  title: "2% back on everything",
                  body: "Points on every single order, no cap, no expiry games.",
                },
                {
                  icon: Gift,
                  title: "Free fries Fridays",
                  body: "Hit Ember tier and loaded fries land free every Friday.",
                },
                {
                  icon: TrendingUp,
                  title: "Priority delivery",
                  body: "Inferno members skip the queue during peak hours.",
                },
                {
                  icon: Sparkles,
                  title: "Members-only drops",
                  body: "First access to new builds before they hit the menu.",
                },
              ].map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.title}
                    className="rounded-2xl border border-charcoal/12 bg-cream/85 p-5 backdrop-blur transition-transform hover:-translate-y-1"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-charcoal text-flame">
                      <Icon className="h-5 w-5" strokeWidth={2.4} />
                    </span>
                    <h3 className="mt-3.5 text-[13.5px] font-bold text-charcoal">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-[12.5px] leading-[1.6] text-slate-brand">
                      {p.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

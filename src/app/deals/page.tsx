import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Check, Clock, Info, Tag } from "lucide-react";
import { deals, dealKindMeta } from "@/data/deals";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { formatPKR, discountPct, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Deals & Offers",
  description:
    "Current Blaze & Bun deals — 2-for-1 smash burgers every weekday, the Midnight Munch Box after 12 AM, family buckets, student discounts and free delivery offers.",
};

export default function DealsPage() {
  return (
    <>
      <PageHero
          image="/media/hero/hero-3.jpg"
        kicker="Deals & offers"
        title={[<span key="a">Save money,</span>, <br key="b" />,
          <span key="c" className="bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">
            eat better
          </span>]}
        subtitle="Every offer currently running across all twelve branches. No codes to hunt for, no member-only nonsense — just apply and eat."
      />

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="space-y-7">
          {deals.map((deal, i) => {
            const off = discountPct(deal.price, deal.originalPrice);
            const midnight = deal.kind === "midnight";

            return (
              <Reveal key={deal.id} delay={i * 0.06}>
                <article
                  id={deal.slug}
                  className={cn(
                    "scroll-mt-32 overflow-hidden rounded-[32px] transition-shadow hover:shadow-[0_30px_70px_-40px_rgba(16,14,12,0.7)]",
                    midnight
                      ? "bg-gradient-to-br from-indigo-950 via-charcoal to-charcoal text-cream"
                      : "bg-charcoal text-cream",
                  )}
                >
                  <div className="grid lg:grid-cols-[1.05fr_1fr]">
                    {/* Media */}
                    <div className="relative aspect-[16/11] overflow-hidden lg:aspect-auto lg:min-h-[380px]">
                      {deal.image ? (
                        <Image
                          src={deal.image}
                          alt={deal.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 52vw"
                          className="object-cover"
                        />
                      ) : (
                        <MediaFrame
                          hue={deal.hue}
                          glyph={deal.glyph}
                          alt={deal.title}
                          ratio="aspect-[16/11] lg:h-full"
                          sizes="(max-width: 1024px) 100vw, 52vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-charcoal" />

                      <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                        <span
                          className={cn(
                            "rounded-full px-3.5 py-1.5 text-[10.5px] font-black uppercase tracking-wider",
                            dealKindMeta[deal.kind].tone,
                          )}
                        >
                          {dealKindMeta[deal.kind].label}
                        </span>
                        {off > 0 && (
                          <span className="rounded-full bg-gold px-3.5 py-1.5 text-[10.5px] font-black uppercase tracking-wider text-charcoal">
                            Save {off}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col p-7 sm:p-9">
                      <h2 className="t-section uppercase tracking-wide">
                        {deal.title}
                      </h2>
                      <p className="mt-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-flame">
                        {deal.kicker}
                      </p>
                      <p className="mt-4 text-[14.5px] leading-[1.6] text-cream/65">
                        {deal.description}
                      </p>

                      {/* Meta chips */}
                      <div className="mt-5 flex flex-wrap gap-2">
                        {deal.window && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/8 px-3.5 py-2 text-[11.5px] font-bold text-cream/75">
                            <Clock className="h-3.5 w-3.5 text-flame" />
                            {deal.window}
                          </span>
                        )}
                        {deal.badge && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/8 px-3.5 py-2 text-[11.5px] font-bold text-cream/75">
                            <Tag className="h-3.5 w-3.5 text-flame" />
                            {deal.badge}
                          </span>
                        )}
                        {deal.validUntil && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/8 px-3.5 py-2 text-[11.5px] font-bold text-cream/75">
                            <CalendarDays className="h-3.5 w-3.5 text-flame" />
                            Until{" "}
                            {new Date(deal.validUntil).toLocaleDateString("en-PK", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      {/* Terms */}
                      <ul className="mt-6 space-y-2">
                        {deal.terms.map((t) => (
                          <li key={t} className="flex items-start gap-2.5 text-[12.5px] text-cream/55">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fresh" strokeWidth={3} />
                            {t}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-7">
                        <div>
                          {deal.price > 0 ? (
                            <div className="flex items-baseline gap-2.5">
                              <span className="font-display text-[38px] leading-none">
                                {formatPKR(deal.price)}
                              </span>
                              {deal.originalPrice > deal.price && (
                                <span className="text-[14px] font-semibold text-cream/35 line-through">
                                  {formatPKR(deal.originalPrice)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="font-display text-2xl text-flame">
                              {deal.kicker}
                            </span>
                          )}
                        </div>

                        <Link
                          href={
                            deal.itemSlugs.length
                              ? `/menu?item=${deal.itemSlugs[0]}`
                              : "/menu"
                          }
                          className={cn(
                            "group inline-flex items-center gap-2 rounded-full px-7 py-4 text-[12px] font-black uppercase tracking-wider transition-all",
                            midnight
                              ? "bg-indigo-500 text-white hover:bg-indigo-400"
                              : "bg-ember text-white hover:bg-ember-dark",
                          )}
                        >
                          {deal.kind === "student" ? "Show your card" : "Order this deal"}
                          <ArrowRight
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                            strokeWidth={3}
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* Fine print */}
        <Reveal>
          <div className="mt-8 rounded-3xl border border-charcoal/10 bg-white p-7 sm:p-9">
            <h2 className="t-section-sm flex items-center gap-2.5 uppercase tracking-wide text-charcoal">
              <Info className="h-5 w-5 text-ember" />
              The small print
            </h2>
            <div className="mt-4 grid gap-5 text-[13.5px] leading-[1.6] text-slate-brand md:grid-cols-2">
              <p>
                Offers are valid at participating branches only and cannot be
                combined with one another unless explicitly stated. Discounts
                apply to menu-priced items before tax and delivery charges.
              </p>
              <p>
                Midnight offers become orderable at 00:00 local time and stop at
                04:00. Student discounts require a valid, physical student ID
                shown to the rider or counter staff at the point of handover.
              </p>
              <p>
                We reserve the right to withdraw or amend any offer without
                notice. Where an offer is withdrawn after you have placed an
                order, the price you saw at checkout is the price you pay.
              </p>
              <p>
                Prices include all applicable taxes unless otherwise stated. A
                5% sales tax applies to prepared food. Delivery is charged
                separately and is free on orders over Rs 2,500.
              </p>
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-4 text-[12.5px] font-black uppercase tracking-wider text-cream transition-colors hover:bg-ember"
            >
              Browse the full menu
              <ArrowRight className="h-4 w-4" strokeWidth={3} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border-2 border-charcoal/15 px-8 py-4 text-[12.5px] font-black uppercase tracking-wider text-charcoal transition-colors hover:border-charcoal"
            >
              Question about a deal?
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}

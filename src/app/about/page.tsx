import type { Metadata } from "next";
import Image from "next/image";
import { ImageWithSkeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { ArrowRight, Award, Flame, Handshake, Leaf } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { SectionDivider, DotGridOverlay } from "@/components/ui/SectionDivider";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { values, timeline, heroStats } from "@/data/content";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "How Blaze & Bun went from one charcoal grill outside a Clifton café in 2019 to twelve branches across four cities — without a single outside investor.",
};

const promises = [
  {
    icon: Flame,
    title: "Cooked over real fire",
    body: "Every patty hits steel at 400°C and every chicken order finishes over live coals. No flat-tops. No heat lamps. No reheating.",
  },
  {
    icon: Leaf,
    title: "Sourced, not commoditised",
    body: "80/20 chuck ground in-house every morning. Chicken from a certified halal supplier we've used since day one. Produce bought daily.",
  },
  {
    icon: Handshake,
    title: "Staff treated properly",
    body: "Above-market wages, paid overtime, proper breaks and real promotion paths. Half our branch managers started on the grill.",
  },
  {
    icon: Award,
    title: "Consistent or nothing",
    body: "Every patty weighed. Every marinade timed. Every recipe written down. The fortieth burger of a Friday tastes like the first.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
          image="/media/story/about.jpg"
        kicker="Our story"
        title={[<span key="a">One grill.</span>, <br key="b" />,
          <span key="c" className="bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">
            Zero shortcuts.
          </span>]}
        subtitle={brand.voice}
      />

      {/* Stats bar */}
      <section className="border-b border-charcoal/8 bg-white">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px bg-charcoal/8 sm:grid-cols-4">
          {heroStats.map((s) => (
            <div key={s.label} className="bg-white px-4 py-8 text-center sm:py-11">
              <p className="font-display text-[clamp(2.4rem,6vw,3.6rem)] leading-none text-charcoal">
                {s.value}
                <span className="text-ember">{s.suffix}</span>
              </p>
              <p className="mt-2 text-[10.5px] font-black uppercase tracking-[0.2em] text-slate-brand">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Origin story */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
          <Reveal direction="left">
            <div className="relative">
<div className="overflow-hidden rounded-[30px]">
                 <ImageWithSkeleton
                   src="/media/story/about.jpg"
                   alt="Our chef working the flame grill"
                   width={900}
                   height={700}
                   sizes="(max-width: 1024px) 100vw, 50vw"
                   className="h-full w-full object-cover"
                 />
              </div>
              <div className="absolute -bottom-7 -left-5 hidden rounded-2xl border border-charcoal/8 bg-white p-5 shadow-xl sm:block">
                <p className="font-display text-4xl leading-none text-ember">41</p>
                <p className="mt-1 text-[10.5px] font-black uppercase tracking-[0.16em] text-slate-brand">
                  Burgers sold on night one
                </p>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
                <span className="h-[3px] w-6 rounded-full bg-ember" />
                2019 — Clifton, Karachi
              </span>
              <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
                We started with
                <br />
                a folding table
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-6 space-y-4 text-[15px] leading-[1.6] text-slate-brand">
                <p>
                  One charcoal grill, a folding table, and a spot outside a
                  Clifton café that let us set up on Friday nights. The first
                  night we sold forty-one burgers and ran out of buns at 11 PM.
                  We went home with Rs 13,000 in cash and the absolute certainty
                  that this was going to work.
                </p>
                <p>
                  It took another eighteen months before it actually did.
                </p>
                <p>
                  The hard part was never the food. The hard part was
                  consistency — making the fortieth burger of a Friday night
                  taste identical to the first one. That meant building prep
                  systems, writing them down, weighing every patty, and accepting
                  that &ldquo;cooked until it looks right&rdquo; is not a system.
                </p>
                <p className="font-semibold text-charcoal">
                  Every branch since has been funded from the profits of the ones
                  before it. No investors, no debt — and no shortcuts on
                  ingredients to make a quarter look better.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <Link
                href="/blog/building-blaze-bun"
                className="group mt-8 inline-flex items-center gap-2.5 rounded-full bg-charcoal px-7 py-4 text-[12px] font-black uppercase tracking-wider text-cream transition-colors hover:bg-ember"
              >
                Read the founder's account
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  strokeWidth={3}
                />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-bone section-y">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
                <span className="h-[3px] w-6 rounded-full bg-ember" />
                What we won't compromise on
              </span>
              <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
                Four rules, no exceptions
              </h2>
            </div>
          </Reveal>

          <Stagger className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <StaggerItem key={v.id} className="h-full">
                <div className="group h-full rounded-[26px] border border-charcoal/8 bg-white p-6 transition-all hover:-translate-y-1.5 hover:border-ember">
                  <p className="font-display text-[44px] leading-none text-ember">
                    {v.stat}
                  </p>
                  <p className="mt-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-brand">
                    {v.statLabel}
                  </p>
                  <h3 className="t-sub mt-5 uppercase tracking-wide text-charcoal">
                    {v.title}
                  </h3>
                  <p className="mt-2.5 text-[13px] leading-[1.6] text-slate-brand">
                    {v.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Promises */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Reveal>
          <h2 className="t-section max-w-2xl uppercase tracking-wide text-charcoal">
            The promises we actually keep
          </h2>
        </Reveal>

        <Stagger className="mt-9 grid gap-6 md:grid-cols-2">
          {promises.map((p) => {
            const Icon = p.icon;
            return (
              <StaggerItem key={p.title} className="h-full">
                <div className="flex h-full gap-5 rounded-[26px] border border-charcoal/8 bg-white p-6 sm:p-7">
                  <span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-charcoal p-3.5">
                    <Icon className="h-6 w-6 text-flame" strokeWidth={2.2} />
                  </span>
                  <div>
                    <h3 className="t-sub uppercase tracking-wide text-charcoal">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-[1.6] text-slate-brand">
                      {p.body}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* Timeline */}
      <section className="relative overflow-hidden bg-charcoal py-14 text-cream sm:py-20">
        {/* Relevant Background Photograph (The 2019 grill origin) */}
        <Image
          src="/media/hero/bg-grill.jpg"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/90 via-charcoal/80 to-charcoal/90" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] grain" />

        <DotGridOverlay tone="dark" />
        <SectionDivider className="absolute inset-x-0 top-0 z-10" tone="dark" />
        <SectionDivider className="absolute inset-x-0 bottom-0 z-10" tone="dark" />

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
                <span className="h-[3px] w-6 rounded-full bg-ember" />
                How we got here
              </span>
              <h2 className="t-section mt-3 uppercase tracking-wide">
                Seven years, one grill at a time
              </h2>
            </div>
          </Reveal>

          <div className="relative mt-8">
            {/* Rail */}
            <div className="absolute bottom-0 left-[7px] top-0 w-0.5 bg-gradient-to-b from-ember via-flame to-cream/15 sm:left-1/2 sm:-translate-x-1/2" />

            <ol className="space-y-7">
              {timeline.map((t, i) => (
                <Reveal key={t.year} delay={i * 0.05}>
                  <li
                    className={`relative flex gap-6 sm:gap-0 ${
                      i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                    }`}
                  >
                    {/* Dot */}
                    <span className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-ember ring-4 ring-charcoal sm:left-1/2 sm:-translate-x-1/2" />

                    <div className="hidden sm:block sm:w-1/2" />

                    <div
                      className={`pl-10 sm:w-1/2 sm:pl-0 ${
                        i % 2 === 0 ? "sm:pl-12" : "sm:pr-12 sm:text-right"
                      }`}
                    >
                      <p className="font-display text-3xl text-flame">{t.year}</p>
                      <h3 className="t-sub mt-1.5 uppercase tracking-wide">
                        {t.title}
                      </h3>
                      <p className="mt-2 text-[13.5px] leading-[1.6] text-cream/60">
                        {t.body}
                      </p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-br from-ember via-flame to-gold p-10 text-center sm:p-16">
            <h2 className="t-section uppercase tracking-wide text-charcoal">
              Come taste the difference
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.6] text-charcoal/75">
              Twelve branches, four cities, and a grill that never really goes
              out. Find the one nearest you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/locations"
                className="rounded-full bg-charcoal px-8 py-4 text-[12.5px] font-black uppercase tracking-wider text-cream transition-colors hover:bg-ink"
              >
                Find a branch
              </Link>
              <Link
                href="/menu"
                className="rounded-full border-2 border-charcoal/25 px-8 py-4 text-[12.5px] font-black uppercase tracking-wider text-charcoal transition-colors hover:bg-charcoal/10"
              >
                See the menu
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

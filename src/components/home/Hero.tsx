"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { heroStats } from "@/data/content";
import { brand } from "@/config/brand";

const slides = [
  {
    id: "s1",
    image: "/media/hero/hero-1.jpg",
    kicker: "Smash season",
    title: ["SMASHED", "ON FLAME"],
    blurb:
      "Two 100g chuck patties smashed onto 400°C steel, finished over open coals, stacked with aged cheddar and Blaze secret sauce.",
    cta: { label: "Order the Signature", href: "/menu?item=blaze-signature-smash" },
    accent: "from-ember via-flame to-gold",
    badge: "New drop",
  },
  {
    id: "s2",
    image: "/media/hero/hero-2.jpg",
    kicker: "24-hour marinade",
    title: ["PERI PERI", "CHARRED"],
    blurb:
      "Marinated a full day in African bird's eye chilli, lemon and smoked paprika — then blackened over live coals until the edges blister.",
    cta: { label: "Explore the menu", href: "/menu" },
    accent: "from-flame via-ember to-charcoal",
    badge: "Chef's pick",
  },
  {
    id: "s3",
    image: "/media/hero/hero-3.jpg",
    kicker: "Built for the table",
    title: ["FEED", "THE CREW"],
    blurb:
      "Buckets, boxes and platters that serve four to five. Free delivery over Rs 2,500, and every branch runs late.",
    cta: { label: "See the deals", href: "/deals" },
    accent: "from-gold via-flame to-ember",
    badge: "Save Rs 870",
  },
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [paused, index]);

  const go = (n: number) => setIndex((n + slides.length) % slides.length);
  const slide = slides[index];

  return (
    <section
      className="relative isolate overflow-hidden bg-charcoal"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured offers"
    >
      {/* Slides */}
      <div className="relative h-[86vh] min-h-[560px] w-full sm:h-[78vh] lg:h-[calc(100vh-76px)] lg:max-h-[820px]">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.title.join(" ")}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            {/* Cinematic grade */}
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/75 to-charcoal/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/40" />
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-tr opacity-25 mix-blend-overlay",
                slide.accent,
              )}
            />
          </motion.div>
        </AnimatePresence>

        {/* Floating embers */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(9)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute block h-1.5 w-1.5 rounded-full bg-flame/70 blur-[1px]"
              style={{
                left: `${8 + i * 11}%`,
                bottom: "-4%",
              }}
              animate={{
                y: [0, -420 - i * 40],
                x: [0, (i % 2 ? 30 : -30) + i * 4],
                opacity: [0, 0.85, 0],
                scale: [0.6, 1.3, 0.4],
              }}
              transition={{
                duration: 7 + (i % 4),
                repeat: Infinity,
                delay: i * 0.85,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto flex h-full max-w-[1400px] items-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-[720px] pb-12 lg:pb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-3.5 py-1.5 text-[10.5px] font-black uppercase tracking-[0.22em] text-cream backdrop-blur">
                  <Sparkles className="h-3.5 w-3.5 text-flame" />
                  {slide.kicker}
                </span>

                <h1 className="t-page mt-5 uppercase tracking-wide text-cream">
                  {slide.title[0]}
                  <br />
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-flame via-ember to-gold bg-clip-text text-transparent">
                      {slide.title[1]}
                    </span>
                    <motion.span
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.42, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute -bottom-1 left-0 h-[5px] w-full origin-left rounded-full bg-gradient-to-r from-ember to-flame"
                    />
                  </span>
                </h1>

                <p className="mt-6 max-w-lg text-[15.5px] leading-[1.6] text-cream/70">
                  {slide.blurb}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={slide.cta.href}
                    className="group inline-flex items-center gap-2 rounded-full bg-ember px-8 py-4 text-[13px] font-black uppercase tracking-wider text-white shadow-[0_16px_40px_-12px_rgba(255,77,20,0.9)] transition-all hover:-translate-y-0.5 hover:bg-ember-dark"
                  >
                    {slide.cta.label}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      strokeWidth={3}
                    />
                  </Link>
                  <Link
                    href="/locations"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-cream/25 px-7 py-4 text-[13px] font-black uppercase tracking-wider text-cream transition-all hover:border-cream hover:bg-cream/10"
                  >
                    Find a branch
                  </Link>
                </div>

                <div className="mt-8 flex items-center gap-3 text-[12.5px] font-semibold text-cream/55">
                  <Flame className="h-4 w-4 text-flame" />
                  {brand.hoursNote}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Arrows */}
        <button
          onClick={() => go(index - 1)}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-cream/20 bg-charcoal/40 text-cream backdrop-blur transition-all hover:border-ember hover:bg-ember lg:grid"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.6} />
        </button>
        <button
          onClick={() => go(index + 1)}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-cream/20 bg-charcoal/40 text-cream backdrop-blur transition-all hover:border-ember hover:bg-ember lg:grid"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.6} />
        </button>

        {/* Dots + stats */}
        <div className="absolute inset-x-0 bottom-0 z-20 border-t border-cream/10 bg-charcoal/40 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center gap-2.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="group flex items-center gap-2"
                >
                  <span
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      i === index ? "w-10 bg-ember" : "w-5 bg-cream/25 group-hover:bg-cream/50",
                    )}
                  />
                </button>
              ))}
              <span className="ml-3 font-display text-sm tracking-[0.2em] text-cream/45">
                0{index + 1} / 0{slides.length}
              </span>
            </div>

            <dl className="flex items-center gap-6 sm:gap-9">
              {heroStats.map((s) => (
                <div key={s.label} className="leading-tight">
                  <dd className="font-display text-2xl text-cream sm:text-[28px]">
                    {s.value}
                    <span className="text-ember">{s.suffix}</span>
                  </dd>
                  <dt className="text-[9.5px] font-black uppercase tracking-[0.18em] text-cream/45">
                    {s.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

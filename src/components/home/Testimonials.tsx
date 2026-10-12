"use client";

import { Quote, Star } from "lucide-react";
import { testimonials } from "@/data/content";
import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";

export function Testimonials() {
  const rowA = testimonials.slice(0, 3);
  const rowB = testimonials.slice(3);

  return (
    <section className="overflow-hidden bg-white section-y">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
              <span className="h-[3px] w-6 rounded-full bg-ember" />
              Real orders, real opinions
            </span>
            <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
              4.8 from 24,000+ reviews
            </h2>
            <p className="mt-3 flex items-center gap-1.5 text-[13.5px] font-semibold text-slate-brand">
              <span className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" strokeWidth={0} />
                ))}
              </span>
              Across Google, Instagram and in-branch feedback
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.1}>
        <div className="mt-9 space-y-4">
          <MarqueeRow items={rowA} direction="normal" />
          <MarqueeRow items={rowB} direction="reverse" />
        </div>
      </Reveal>
    </section>
  );
}

function MarqueeRow({
  items,
  direction,
}: {
  items: typeof testimonials;
  direction: "normal" | "reverse";
}) {
  const doubled = [...items, ...items];

  return (
    <div className="group relative flex w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
      <div
        className={`flex w-max shrink-0 gap-4 pr-4 ${
          direction === "reverse"
            ? "animate-marquee-fast [animation-direction:reverse] group-hover:[animation-play-state:paused]"
            : "animate-marquee group-hover:[animation-play-state:paused]"
        }`}
      >
        {doubled.map((t, i) => (
          <figure
            key={`${t.id}-${i}`}
            className="w-[330px] shrink-0 rounded-3xl border border-charcoal/8 bg-cream p-6 sm:w-[400px]"
          >
            <div className="flex items-center gap-3">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-[15px] text-white"
                style={{ background: `hsl(${t.hue} 72% 45%)` }}
              >
                {t.initials}
              </span>
              <div className="min-w-0">
                <figcaption className="text-[13.5px] font-bold text-charcoal">
                  {t.name}
                </figcaption>
                <p className="truncate text-[11.5px] text-slate-brand">
                  {t.handle} · {t.city}
                </p>
              </div>
              <span className="ml-auto flex shrink-0">
                {[...Array(t.rating)].map((_, s) => (
                  <Star key={s} className="h-3 w-3 fill-gold text-gold" strokeWidth={0} />
                ))}
              </span>
            </div>

            <Quote className="mt-4 h-5 w-5 text-ember/40" />
            <blockquote className="mt-1.5 text-[13.5px] leading-[1.6] text-charcoal/85">
              {t.quote}
            </blockquote>
            <p className="mt-4 border-t border-charcoal/8 pt-3 text-[11px] font-bold uppercase tracking-wider text-ember">
              Ordered: {t.item}
            </p>
          </figure>
        ))}
      </div>
    </div>
  );
}

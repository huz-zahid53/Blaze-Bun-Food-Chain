"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { values } from "@/data/content";
import { brand } from "@/config/brand";
import { ImageWithSkeleton } from "@/components/ui/Skeleton";
import { SectionDivider, DotGridOverlay } from "@/components/ui/SectionDivider";

export function StoryStrip() {
  return (
    <section className="relative overflow-hidden bg-charcoal py-16 text-cream sm:py-20">
      {/* Relevant Background Photograph */}
      <Image
        src="/media/hero/bg-grill.jpg"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="object-cover"
      />
      {/* Deep legibility wash */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/85 to-charcoal/65" />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/50" />
      <div className="absolute inset-0 bg-gradient-to-tr from-ember/15 via-transparent to-flame/10 mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] grain" />

      {/* Subtle dot-matrix grid overlay */}
      <DotGridOverlay tone="dark" />

       {/* 21st.dev luminous dividers at boundaries */}
       <SectionDivider className="absolute inset-x-0 top-0 z-10" tone="dark" />
       <SectionDivider className="absolute inset-x-0 bottom-0 z-10" tone="dark" />

       <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
         <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-14">
           {/* Image */}
           <Reveal direction="left">
             <div className="relative">
               <div className="overflow-hidden rounded-[30px]">
                 <ImageWithSkeleton
                   src="/media/story/about.jpg"
                   alt="A chef flipping a patty over open flame"
                   width={900}
                   height={680}
                   sizes="(max-width: 1024px) 100vw, 50vw"
                   className="h-full w-full object-cover"
                 />
               </div>

               {/* Floating stat card */}
               <div className="absolute -bottom-8 -right-4 w-[210px] rounded-3xl border border-cream/12 bg-ink/95 p-5 shadow-2xl backdrop-blur sm:-right-8">
                 <p className="font-display text-5xl leading-none text-flame">
                   {new Date().getFullYear() - brand.founded}
                 </p>
                 <p className="mt-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-cream/60">
                   Years on the flame
                 </p>
                 <p className="mt-3 border-t border-cream/10 pt-3 text-[12px] leading-snug text-cream/55">
                   One grill in 2019 → twelve branches across four cities today.
                 </p>
               </div>

               {/* Quote chip */}
               <div className="absolute -left-4 -top-6 hidden max-w-[230px] rotate-[-3deg] rounded-2xl border border-cream/12 bg-ink/95 p-4 shadow-xl backdrop-blur sm:block">
                 <Quote className="h-4 w-4 text-ember" />
                 <p className="mt-2 text-[12.5px] font-semibold leading-snug text-cream/80">
                   “No shortcuts. No sad burgers.”
                 </p>
               </div>
             </div>
           </Reveal>

           {/* Copy */}
           <div>
             <Reveal>
               <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
                 <span className="h-[3px] w-6 rounded-full bg-ember" />
                 Our story
               </span>
               <h2 className="t-section mt-3 uppercase tracking-wide">
                 One grill,
                 <br />
                 <span className="bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">
                   zero shortcuts
                 </span>
               </h2>
               <p className="mt-5 max-w-lg text-[15px] leading-[1.6] text-cream/65">
                 {brand.voice} We grind our chuck every morning, marinate our
                 chicken for a full 24 hours, and hand-dredge every tender that
                 leaves the kitchen. It's slower and it costs more — and it's the
                 only reason any of this is worth doing.
               </p>
             </Reveal>

             <Stagger className="mt-8 grid gap-5 sm:grid-cols-2">
               {values.slice(0, 4).map((v) => (
                 <StaggerItem key={v.id}>
                   <div className="group rounded-2xl border border-cream/10 bg-cream/[0.03] p-5 transition-colors hover:border-ember/40 hover:bg-ember/5">
                     <p className="font-display text-4xl text-flame">{v.stat}</p>
                     <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-cream/45">
                       {v.statLabel}
                     </p>
                     <h3 className="mt-3 text-[13.5px] font-bold text-cream">
                       {v.title}
                     </h3>
                     <p className="mt-1.5 text-[12.5px] leading-[1.6] text-cream/55">
                       {v.body}
                     </p>
                   </div>
                 </StaggerItem>
               ))}
             </Stagger>

             <Reveal delay={0.2}>
               <Link
                 href="/about"
                 className="group mt-8 inline-flex items-center gap-2.5 rounded-full border-2 border-cream/20 px-7 py-3.5 text-[12px] font-black uppercase tracking-wider text-cream transition-all hover:border-ember hover:bg-ember hover:text-white"
               >
                 Read the full story
                 <ArrowRight
                   className="h-4 w-4 transition-transform group-hover:translate-x-1"
                   strokeWidth={3}
                 />
               </Link>
             </Reveal>
           </div>
         </div>
       </div>
     </section>
  );
}

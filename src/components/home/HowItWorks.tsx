"use client";

import Link from "next/link";
import { Bike, Flame, MousePointerClick, Store, UtensilsCrossed } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { useStore } from "@/store/useStore";
import Image from "next/image";
import { DotGridOverlay } from "@/components/ui/SectionDivider";

const steps = [
  {
    n: "01",
    icon: MousePointerClick,
    title: "Pick your order",
    body: "Choose delivery, pick-up or catering, then tell us where. We'll route you to the nearest open branch automatically.",
  },
  {
    n: "02",
    icon: Flame,
    title: "We cook it fresh",
    body: "Nothing sits under a heat lamp. Your patty hits the steel the moment your order lands in the kitchen.",
  },
  {
    n: "03",
    icon: Bike,
    title: "It arrives hot",
    body: "Track your rider on the live map. Average door-to-door time across all twelve branches is 28 minutes.",
  },
];

export function HowItWorks() {
  const orderType = useStore((s) => s.orderType);

  return (
    <section className="relative overflow-hidden border-y border-charcoal/8 bg-white section-y">
      {/* Relevant Background Photograph (Kitchen & fresh preparation) */}
      <Image
        src="/media/hero/bg-kitchen.jpg"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="object-cover opacity-25"
      />
      {/* Light legibility wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/94 via-white/85 to-white/94" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] grain" />

      {/* Subtle dot-matrix grid overlay */}
      <DotGridOverlay tone="light" />

       <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
         <Reveal>
           <div className="max-w-2xl">
             <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-ember">
               <span className="h-[3px] w-6 rounded-full bg-ember" />
               How it works
             </span>
             <h2 className="t-section mt-3 uppercase tracking-wide text-charcoal">
               Three steps. Zero faff.
             </h2>
           </div>
         </Reveal>

         <Stagger className="relative mt-8 grid gap-8 md:grid-cols-3 md:gap-6">
           {/* Connector */}
           <div className="absolute left-0 right-0 top-[42px] hidden h-0.5 md:block">
             <div className="mx-auto h-full w-[72%] border-t-2 border-dashed border-charcoal/12" />
           </div>

           {steps.map((s) => {
             const Icon = s.icon;
             return (
               <StaggerItem key={s.n}>
                 <div className="group relative flex flex-col items-center text-center">
                   <div className="relative z-10 grid h-[84px] w-[84px] place-items-center rounded-full bg-charcoal transition-transform duration-500 group-hover:scale-105">
                     <div className="absolute inset-0 rounded-full bg-gradient-to-br from-flame to-ember opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                     <Icon
                       className="relative h-8 w-8 text-cream"
                       strokeWidth={1.9}
                     />
                     <span className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-ember font-display text-[13px] text-white ring-4 ring-white">
                       {s.n}
                     </span>
                   </div>
                   <h3 className="t-sub mt-6 text-[22px] uppercase tracking-wide text-charcoal">
                     {s.title}
                   </h3>
                   <p className="mt-2.5 max-w-xs text-[13.5px] leading-[1.6] text-slate-brand">
                     {s.body}
                   </p>
                 </div>
               </StaggerItem>
             );
           })}
         </Stagger>

         <Reveal delay={0.15}>
           <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
             <Link
               href="/menu"
               className="inline-flex items-center gap-2 rounded-full bg-ember px-8 py-4 text-[12.5px] font-black uppercase tracking-wider text-white shadow-[0_14px_34px_-12px_rgba(255,77,20,0.8)] transition-all hover:-translate-y-0.5 hover:bg-ember-dark"
             >
               <UtensilsCrossed className="h-4 w-4" strokeWidth={2.5} />
               Start an order
             </Link>
             <Link
               href="/locations"
               className="inline-flex items-center gap-2 rounded-full border-2 border-charcoal/15 px-7 py-4 text-[12.5px] font-black uppercase tracking-wider text-charcoal transition-all hover:border-charcoal hover:bg-charcoal hover:text-cream"
             >
               <Store className="h-4 w-4" strokeWidth={2.5} />
               {orderType === "delivery" ? "Find a branch" : "Browse branches"}
             </Link>
           </div>
         </Reveal>
       </div>
     </section>
  );
}

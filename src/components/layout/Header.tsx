"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bike,
  MapPin,
  Menu,
  PartyPopper,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { brand, navLinks, orderTypes, type OrderType } from "@/config/brand";
import { useStore, computeTotals } from "@/store/useStore";
import { branches } from "@/data/branches";
import { ticker } from "@/data/content";

const iconFor = (id: string) =>
  id === "delivery" ? Bike : id === "pickup" ? Store : PartyPopper;

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  const orderType = useStore((s) => s.orderType);
  const setOrderType = useStore((s) => s.setOrderType);
  const branchId = useStore((s) => s.branchId);
  const setLocationOpen = useStore((s) => s.setLocationOpen);
  const setCartOpen = useStore((s) => s.setCartOpen);
  const navOpen = useStore((s) => s.navOpen);
  const setNavOpen = useStore((s) => s.setNavOpen);
  const lines = useStore((s) => s.lines);
  const coupon = useStore((s) => s.coupon);
  const tip = useStore((s) => s.tip);
  const hydrated = useStore((s) => s.hydrated);

  const count = hydrated ? lines.reduce((n, l) => n + l.qty, 0) : 0;
  const branch = branches.find((b) => b.id === branchId);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname, setNavOpen]);

  // Lock scroll when mobile nav is open
  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  return (
    <>
      {/* ---------- Promo ticker ---------- */}
      <div className="hidden overflow-hidden bg-charcoal py-1.5 md:block">
        <div className="flex w-max animate-marquee items-center">
          {[...ticker, ...ticker].map((t, i) => (
            <span
              key={i}
              className="flex items-center whitespace-nowrap font-display text-[13px] uppercase tracking-[0.18em] text-cream/70"
            >
              <span className="px-5">{t}</span>
              <span className="text-ember">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ---------- Main header ---------- */}
      <header
        className={cn(
          "sticky top-0 z-[80] w-full transition-all duration-300",
          scrolled
            ? "bg-cream/92 shadow-[0_8px_30px_-18px_rgba(16,14,12,0.6)] backdrop-blur-xl"
            : "bg-cream",
        )}
      >
        <div className="mx-auto flex h-[68px] max-w-[1400px] items-center gap-3 px-4 sm:h-[76px] sm:px-6 lg:px-8">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-charcoal transition-colors hover:bg-charcoal/6 xl:hidden"
          >
            <Menu className="h-5.5 w-5.5" strokeWidth={2.4} />
          </button>

          <Link href="/" className="shrink-0" aria-label={`${brand.name} home`}>
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="ml-4 hidden shrink-0 items-center gap-0.5 xl:ml-6 xl:flex">
            {navLinks.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "relative whitespace-nowrap rounded-full px-2.5 py-2 text-[12.5px] font-bold transition-colors 2xl:px-3.5 2xl:text-[13px]",
                    active ? "text-ember" : "text-charcoal/75 hover:text-charcoal",
                  )}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-dot"
                      className="absolute -bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-ember"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
            {/* Order-type segmented control */}
            <div className="hidden shrink-0 rounded-full bg-charcoal/6 p-1 md:flex">
              {orderTypes.map((t) => {
                const Icon = iconFor(t.id);
                const active = orderType === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setOrderType(t.id as OrderType)}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-full px-2.5 py-2 text-[10.5px] font-black uppercase tracking-wider transition-colors 2xl:px-3.5 2xl:text-[11.5px]",
                      active ? "text-cream" : "text-slate-brand hover:text-charcoal",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="order-type-pill"
                        className="absolute inset-0 rounded-full bg-charcoal"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      />
                    )}
                    <Icon className="relative h-3.5 w-3.5" strokeWidth={2.6} />
                    <span className="relative">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Location chip */}
            <button
              onClick={() => setLocationOpen(true)}
              className="hidden h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-charcoal/12 text-left transition-colors hover:border-ember hover:bg-ember/5 sm:flex lg:h-auto lg:min-w-0 lg:w-auto lg:max-w-[150px] lg:px-3.5 lg:py-2 2xl:max-w-[190px]"
            >
              <MapPin className="h-4 w-4 shrink-0 text-ember" strokeWidth={2.6} />
              <span className="hidden min-w-0 flex-col leading-tight lg:flex">
                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-brand">
                  {orderType === "delivery" ? "Deliver to" : "Collect from"}
                </span>
                <span className="truncate text-[12px] font-bold text-charcoal">
                  {branch ? `${branch.name}, ${branch.city}` : "Select location"}
                </span>
              </span>
            </button>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-charcoal text-cream transition-all hover:bg-ember active:scale-95"
              aria-label={`Open bucket, ${count} items`}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={2.3} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 font-display text-[11px] font-bold text-white ring-2 ring-cream"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile order-type row */}
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-2.5 no-scrollbar md:hidden">
          {orderTypes.map((t) => {
            const Icon = iconFor(t.id);
            const active = orderType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setOrderType(t.id as OrderType)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-black uppercase tracking-wider transition-colors",
                  active
                    ? "bg-charcoal text-cream"
                    : "bg-charcoal/6 text-slate-brand",
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.6} />
                {t.label}
              </button>
            );
          })}
          <button
            onClick={() => setLocationOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-charcoal/12 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-slate-brand"
          >
            <MapPin className="h-3.5 w-3.5" strokeWidth={2.6} />
            {branch ? branch.name : "Location"}
          </button>
        </div>
      </header>

      {/* ---------- Mobile nav overlay ---------- */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNavOpen(false)}
              className="fixed inset-0 z-[100] bg-charcoal/60 backdrop-blur-sm xl:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-[101] w-[86vw] max-w-[360px] bg-charcoal p-6 text-cream xl:hidden"
            >
              <div className="flex items-center justify-between">
                <Logo reverse />
                <button
                  onClick={() => setNavOpen(false)}
                  aria-label="Close menu"
                  className="grid h-10 w-10 place-items-center rounded-full bg-cream/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-9 flex flex-col">
                {navLinks.map((l, i) => (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.045 }}
                  >
                    <Link
                      href={l.href}
                      className="flex items-center justify-between border-b border-cream/8 py-4 font-display text-3xl uppercase tracking-wide transition-colors hover:text-ember"
                    >
                      {l.label}
                      <span className="text-cream/25">→</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-9 space-y-3">
                <Link
                  href="/menu"
                  className="flex w-full items-center justify-center rounded-full bg-ember px-6 py-4 text-sm font-black uppercase tracking-wider text-white"
                >
                  Order now
                </Link>
                <button
                  onClick={() => {
                    setNavOpen(false);
                    setLocationOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-cream/20 px-6 py-3.5 text-[12px] font-bold uppercase tracking-wider text-cream/80"
                >
                  <MapPin className="h-4 w-4" />
                  Change location
                </button>
              </div>

              <div className="mt-8 space-y-1 text-[12px] text-cream/45">
                <p>{brand.phone}</p>
                <p>{brand.email}</p>
                <p className="pt-2">{brand.hoursNote}</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

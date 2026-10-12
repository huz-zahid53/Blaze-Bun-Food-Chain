"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useStore, computeTotals } from "@/store/useStore";
import { formatPKR } from "@/lib/utils";

/** Mobile-only sticky bar showing live bucket total — KFC "View Bucket" pattern. */
export function FloatingCart() {
  const pathname = usePathname();
  const lines = useStore((s) => s.lines);
  const orderType = useStore((s) => s.orderType);
  const coupon = useStore((s) => s.coupon);
  const tip = useStore((s) => s.tip);
  const hydrated = useStore((s) => s.hydrated);

  const { total, itemCount } = computeTotals(lines, orderType, coupon, tip);

  const hidden =
    !hydrated ||
    itemCount === 0 ||
    pathname === "/cart" ||
    pathname === "/checkout" ||
    pathname?.startsWith("/admin");

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ y: 110, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 110, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="fixed inset-x-3 bottom-3 z-[90] md:hidden"
        >
          <Link
            href="/cart"
            className="flex items-center justify-between gap-3 rounded-2xl bg-charcoal p-3 pl-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.65)] ring-1 ring-cream/10"
          >
            <span className="flex items-center gap-3">
              <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-ember">
                <ShoppingBag className="h-5 w-5 text-white" strokeWidth={2.4} />
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 font-display text-[11px] text-charcoal">
                  {itemCount}
                </span>
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cream/50">
                  Your bucket
                </span>
                <span className="font-display text-xl text-cream">
                  {formatPKR(total)}
                </span>
              </span>
            </span>
            <span className="flex items-center gap-1.5 rounded-xl bg-cream px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-charcoal">
              View <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useStore } from "@/store/useStore";

const SESSION_KEY = "bb-promo-2-for-1-seen";

/** One-off promotional overlay, shown after a location is confirmed. */
export function PromoPopup() {
  const hydrated = useStore((s) => s.hydrated);
  const locationConfirmed = useStore((s) => s.locationConfirmed);
  const locationOpen = useStore((s) => s.locationOpen);
  const [seen] = useState(
    () =>
      typeof window !== "undefined" &&
      sessionStorage.getItem(SESSION_KEY) === "1",
  );
  const [dismissed, setDismissed] = useState(false);

  const open =
    hydrated && locationConfirmed && !locationOpen && !seen && !dismissed;

  useEffect(() => {
    if (open) sessionStorage.setItem(SESSION_KEY, "1");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDismissed(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDismissed(true)}
            className="absolute inset-0 bg-charcoal/70 backdrop-blur-md"
          />
          {/* ponytail: max-w-2xl/3xl centers hero banner; whole card links to /menu since graphic bakes in its own CTA */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="2 for 1 promotion"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative z-10 w-full max-w-2xl sm:max-w-3xl overflow-hidden rounded-[28px] bg-charcoal shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Close promotion"
              className="absolute right-3.5 top-3.5 z-20 grid h-10 w-10 place-items-center rounded-full bg-charcoal/80 text-cream backdrop-blur-sm transition-colors hover:bg-ember hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <Link
              href="/menu"
              onClick={() => setDismissed(true)}
              className="block cursor-pointer transition-transform duration-200 hover:scale-[1.008] active:scale-[0.992]"
            >
              <Image
                src="/images/promotions/blaze-bun-2-for-1.png"
                alt="Blaze & Bun 2 for 1 promotion"
                width={1359}
                height={818}
                sizes="(max-width: 768px) 100vw, 768px"
                className="h-auto w-full object-cover"
                priority
              />
            </Link>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

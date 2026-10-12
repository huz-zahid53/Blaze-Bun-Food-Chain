"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X } from "lucide-react";
import { create } from "zustand";
import { useEffect } from "react";

export interface Toast {
  id: number;
  message: string;
  tone: "success" | "info" | "error";
  action?: { label: string; href: string };
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

let counter = 0;

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = ++counter;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
    }, 3600);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export function ToastHost() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  // Dismiss on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && toasts.length) dismiss(toasts[0].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toasts, dismiss]);

  return (
    <div className="pointer-events-none fixed bottom-6 right-4 z-[120] flex w-[min(92vw,380px)] flex-col gap-2.5 sm:bottom-8 sm:right-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-charcoal/8 bg-charcoal p-4 pr-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]"
          >
            <span
              className={
                t.tone === "success"
                  ? "mt-0.5 text-fresh"
                  : t.tone === "error"
                    ? "mt-0.5 text-ember"
                    : "mt-0.5 text-flame"
              }
            >
              {t.tone === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Info className="h-5 w-5" />
              )}
            </span>
            <p className="flex-1 text-[13.5px] font-semibold leading-snug text-cream">
              {t.message}
            </p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="rounded-full p-1 text-cream/40 transition-colors hover:bg-cream/10 hover:text-cream"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

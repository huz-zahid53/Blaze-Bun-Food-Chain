import { Suspense } from "react";
import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/MenuBrowser";

export const metadata: Metadata = {
  title: "Full Menu",
  description:
    "Browse every Blaze & Bun item — signature smash burgers, 24-hour marinated peri peri chicken, wings tossed to order, sharing buckets, sides, drinks and desserts. Customise any item and order online.",
};

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-charcoal">
          <span className="font-display text-2xl uppercase tracking-[0.3em] text-cream/40">
            Firing up the grill…
          </span>
        </div>
      }
    >
      <MenuBrowser />
    </Suspense>
  );
}

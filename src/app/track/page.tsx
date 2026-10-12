import { Suspense } from "react";
import type { Metadata } from "next";
import { TrackBoard } from "@/components/orders/TrackBoard";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Follow your Blaze & Bun order from the grill to your door with live status updates, an ETA countdown and a full order timeline.",
};

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-charcoal">
          <span className="font-display text-2xl uppercase tracking-[0.3em] text-cream/40">
            Locating your order…
          </span>
        </div>
      }
    >
      <TrackBoard />
    </Suspense>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { TrackBoard } from "@/components/orders/TrackBoard";
import { TrackSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Follow your Blaze & Bun order from the grill to your door with live status updates, an ETA countdown and a full order timeline.",
};

export default function TrackPage() {
  return (
    <Suspense fallback={<TrackSkeleton />}>
      <TrackBoard />
    </Suspense>
  );
}

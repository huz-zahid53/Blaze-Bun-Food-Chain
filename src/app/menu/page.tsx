import { Suspense } from "react";
import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { MenuPageSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Full Menu",
  description:
    "Browse every Blaze & Bun item — signature smash burgers, 24-hour marinated peri peri chicken, wings tossed to order, sharing buckets, sides, drinks and desserts. Customise any item and order online.",
};

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuPageSkeleton />}>
      <MenuBrowser />
    </Suspense>
  );
}

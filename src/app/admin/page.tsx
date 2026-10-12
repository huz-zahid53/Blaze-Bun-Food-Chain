import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "POS Admin Console",
  description:
    "Blaze & Bun point-of-sale console — live orders, menu and inventory, branch performance, payments and reporting.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}

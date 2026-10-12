"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bike,
  Boxes,
  CheckCircle2,
  ChefHat,
  Clock,
  DollarSign,
  Eye,
  Filter,
  LayoutDashboard,
  MapPin,
  PackageCheck,
  Receipt,
  Search,
  Settings,
  ShoppingBag,
  Store,
  TrendingDown,
  TrendingUp,
  Truck,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { menuItems, categories } from "@/data/menu";
import { branches } from "@/data/branches";
import { useStore, type OrderStatus } from "@/store/useStore";
import { CloudConnect } from "@/components/admin/CloudConnect";
import { brand } from "@/config/brand";
import { cn, formatPKR, formatCompact, seededRandom } from "@/lib/utils";

type View = "dashboard" | "orders" | "menu" | "branches" | "reports";

const nav: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: Receipt },
  { id: "menu", label: "Menu & inventory", icon: UtensilsCrossed },
  { id: "branches", label: "Branches", icon: Store },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

const statusTone: Record<OrderStatus, string> = {
  placed: "bg-charcoal/8 text-slate-brand",
  confirmed: "bg-chill/15 text-sky-700",
  preparing: "bg-flame/18 text-amber-800",
  "on-the-flame": "bg-ember/15 text-ember-dark",
  "out-for-delivery": "bg-indigo-500/15 text-indigo-700",
  "ready-for-pickup": "bg-purple-500/15 text-purple-700",
  delivered: "bg-fresh/15 text-green-700",
};

/* ------------------------------------------------------------
   Deterministic mock trading history for the dashboard charts
   (in production this comes from the POS order store)
   ------------------------------------------------------------ */

const tradingDays = (() => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((d, i) => {
    const r = seededRandom(`day-${i}`);
    const weekend = i >= 5 ? 1.42 : 1;
    return {
      day: d,
      revenue: Math.round((420_000 + r * 260_000) * weekend),
      orders: Math.round((310 + r * 180) * weekend),
    };
  });
})();

const hourly = Array.from({ length: 14 }, (_, i) => {
  const hour = 12 + i; // 12:00 → 01:00
  const r = seededRandom(`hour-${i}`);
  const peak = hour >= 20 && hour <= 23 ? 1.7 : 1;
  return {
    hour: hour > 23 ? `${hour - 24}:00` : `${hour}:00`,
    value: Math.round((18 + r * 42) * peak),
  };
});

export function AdminDashboard() {
  const [view, setView] = useState<View>("dashboard");
  const [branchFilter, setBranchFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [stock, setStock] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      menuItems.map((i) => [i.slug, seededRandom(`stock-${i.slug}`) > 0.08]),
    ),
  );

  const orders = useStore((s) => s.orders);
  const advanceOrder = useStore((s) => s.advanceOrder);
  const cancelOrder = useStore((s) => s.cancelOrder);

  const totalRevenue = tradingDays.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = tradingDays.reduce((s, d) => s + d.orders, 0);
  const aov = totalRevenue / totalOrders;
  const liveOrders = orders.filter((o) => o.status !== "delivered");

  const itemStats = useMemo(() => {
    return menuItems
      .map((i) => {
        const r = seededRandom(`sold-${i.slug}`);
        const units = Math.round(60 + r * 940);
        return { item: i, units, revenue: units * i.price };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, []);

  const maxHour = Math.max(...hourly.map((h) => h.value));
  const maxDay = Math.max(...tradingDays.map((d) => d.revenue));

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (branchFilter !== "all" && o.branchId !== branchFilter) return false;
    if (
      search &&
      !o.number.toLowerCase().includes(search.toLowerCase()) &&
      !o.customer.name.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-bone">
      <div className="flex">
        {/* ---------- Sidebar ---------- */}
        <aside className="sticky top-0 hidden h-screen w-[268px] shrink-0 flex-col border-r border-charcoal/10 bg-charcoal text-cream lg:flex">
          <div className="flex items-center gap-3 border-b border-cream/10 px-6 py-5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-ember to-flame">
              <UtensilsCrossed className="h-5 w-5 text-white" strokeWidth={2.4} />
            </span>
            <div className="leading-tight">
              <p className="font-display text-lg tracking-wide">BLAZE POS</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cream/40">
                Admin console
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-5">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = view === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setView(n.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold transition-colors",
                    active
                      ? "bg-ember text-white"
                      : "text-cream/60 hover:bg-cream/8 hover:text-cream",
                  )}
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={2.2} />
                  {n.label}
                  {n.id === "orders" && liveOrders.length > 0 && (
                    <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-flame px-1.5 text-[10px] font-black text-charcoal">
                      {liveOrders.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-cream/10 p-4">
            <div className="rounded-2xl bg-cream/5 p-4">
              <p className="text-[10.5px] font-black uppercase tracking-[0.16em] text-cream/45">
                Signed in as
              </p>
              <p className="mt-1.5 text-[13px] font-bold">Hamza Iqbal</p>
              <p className="text-[11.5px] text-cream/45">Owner · All branches</p>
            </div>
          </div>
        </aside>

        {/* ---------- Main ---------- */}
        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-cream/92 backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-6">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-charcoal text-flame lg:hidden">
                  <UtensilsCrossed className="h-4.5 w-4.5" strokeWidth={2.4} />
                </span>
                <div>
                  <h1 className="t-page uppercase tracking-wide text-charcoal">
                    {nav.find((n) => n.id === view)?.label}
                  </h1>
                  <p className="text-[11px] text-slate-brand">
                    {brand.name} · Head office
                  </p>
                </div>
              </div>

              <div className="relative ml-auto min-w-[200px] flex-1 max-w-sm">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-brand" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search orders…"
                  className="w-full rounded-full border border-charcoal/12 bg-white py-2.5 pl-11 pr-4 text-[13px] outline-none focus:border-ember"
                />
              </div>

              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="cursor-pointer rounded-full border border-charcoal/12 bg-white px-4 py-2.5 text-[12.5px] font-bold outline-none focus:border-ember"
              >
                <option value="all">All branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}, {b.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile nav */}
            <div className="flex gap-1 overflow-x-auto px-4 pb-3 no-scrollbar lg:hidden">
              {nav.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setView(n.id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-[12px] font-bold",
                    view === n.id
                      ? "bg-charcoal text-cream"
                      : "bg-white text-slate-brand",
                  )}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </header>

          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                {/* Live Supabase link — shown above every view so it is always
                    clear whether the numbers below are real or demo data. */}
                <div className="mb-6">
                  <CloudConnect />
                </div>

                {/* =============== DASHBOARD =============== */}
                {view === "dashboard" && (
                  <div className="space-y-6">
                    {/* KPIs */}
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <Kpi
                        icon={DollarSign}
                        label="Revenue (7d)"
                        value={formatPKR(totalRevenue)}
                        delta="+12.4%"
                        up
                        accent="bg-ember"
                      />
                      <Kpi
                        icon={Receipt}
                        label="Orders (7d)"
                        value={totalOrders.toLocaleString("en-PK")}
                        delta="+8.1%"
                        up
                        accent="bg-charcoal"
                      />
                      <Kpi
                        icon={ShoppingBag}
                        label="Avg order value"
                        value={formatPKR(aov)}
                        delta="+3.9%"
                        up
                        accent="bg-flame"
                      />
                      <Kpi
                        icon={Clock}
                        label="Avg fulfilment"
                        value="28 min"
                        delta="-2.3%"
                        up
                        accent="bg-fresh"
                      />
                    </div>

                    {/* Charts */}
                    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                      {/* Weekly revenue */}
                      <Panel
                        title="Revenue this week"
                        action={
                          <span className="rounded-full bg-fresh/15 px-3 py-1 text-[10.5px] font-black uppercase tracking-wider text-green-700">
                            +12.4%
                          </span>
                        }
                      >
                        <div className="flex h-[220px] items-end gap-2 sm:gap-3">
                          {tradingDays.map((d, i) => (
                            <div
                              key={d.day}
                              className="group flex flex-1 flex-col items-center gap-2"
                            >
                              <span className="text-[10px] font-bold text-slate-brand opacity-0 transition-opacity group-hover:opacity-100">
                                {formatCompact(d.revenue)}
                              </span>
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{
                                  height: `${(d.revenue / maxDay) * 100}%`,
                                }}
                                transition={{
                                  delay: i * 0.06,
                                  duration: 0.7,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                className="w-full rounded-t-lg bg-gradient-to-t from-ember to-flame transition-opacity group-hover:opacity-85"
                              />
                              <span className="text-[11px] font-bold text-slate-brand">
                                {d.day}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-4 border-t border-charcoal/8 pt-3 text-[12px] text-slate-brand">
                          Weekend uplift of ~42% — Friday and Saturday now account
                          for 38% of weekly revenue.
                        </p>
                      </Panel>

                      {/* Hourly heat */}
                      <Panel title="Order volume by hour">
                        <div className="flex h-[220px] items-end gap-1">
                          {hourly.map((h, i) => (
                            <div
                              key={h.hour}
                              className="group flex flex-1 flex-col items-center justify-end gap-2"
                            >
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(h.value / maxHour) * 100}%` }}
                                transition={{
                                  delay: i * 0.04,
                                  duration: 0.6,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                className={cn(
                                  "w-full rounded-t",
                                  h.value / maxHour > 0.75
                                    ? "bg-ember"
                                    : h.value / maxHour > 0.45
                                      ? "bg-flame"
                                      : "bg-gold/70",
                                )}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 flex justify-between text-[9.5px] font-bold text-slate-brand">
                          <span>12 PM</span>
                          <span>8 PM</span>
                          <span>1 AM</span>
                        </div>
                        <p className="mt-3 border-t border-charcoal/8 pt-3 text-[12px] text-slate-brand">
                          Peak window is 8–11 PM. The 12–4 AM midnight menu now
                          contributes 18% of daily orders.
                        </p>
                      </Panel>
                    </div>

                    {/* Live orders + top sellers */}
                    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                      <Panel
                        title="Live orders"
                        action={
                          <button
                            onClick={() => setView("orders")}
                            className="text-[11.5px] font-black uppercase tracking-wider text-ember hover:underline"
                          >
                            View all
                          </button>
                        }
                      >
                        {orders.length === 0 ? (
                          <div className="py-12 text-center">
                            <PackageCheck className="mx-auto h-9 w-9 text-charcoal/20" strokeWidth={1.6} />
                            <p className="mt-4 text-[13.5px] text-slate-brand">
                              No orders yet. Place one from the storefront and
                              it'll appear here instantly.
                            </p>
                          </div>
                        ) : (
                          <ul className="divide-y divide-charcoal/8">
                            {orders.slice(0, 6).map((o) => (
                              <li
                                key={o.id}
                                className="flex flex-wrap items-center gap-3 py-3.5"
                              >
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-charcoal/6 text-charcoal">
                                  {o.type === "delivery" ? (
                                    <Truck className="h-4.5 w-4.5" />
                                  ) : (
                                    <Store className="h-4.5 w-4.5" />
                                  )}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[13px] font-bold text-charcoal">
                                    {o.number} · {o.customer.name}
                                  </p>
                                  <p className="truncate text-[11.5px] text-slate-brand">
                                    {o.itemCount} items · {o.branchName}
                                  </p>
                                </div>
                                <span
                                  className={cn(
                                    "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                                    statusTone[o.status],
                                  )}
                                >
                                  {o.status.replace(/-/g, " ")}
                                </span>
                                <span className="shrink-0 font-display text-lg text-charcoal">
                                  {formatPKR(o.total)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </Panel>

                      <Panel title="Top sellers (7d)">
                        <ul className="space-y-3.5">
                          {itemStats.slice(0, 6).map((s, i) => (
                            <li key={s.item.slug} className="flex items-center gap-3">
                              <span className="font-display text-lg w-5 text-ember">
                                {i + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-bold text-charcoal">
                                  {s.item.name}
                                </p>
                                <p className="text-[11.5px] text-slate-brand">
                                  {s.units.toLocaleString("en-PK")} sold
                                </p>
                              </div>
                              <span className="shrink-0 text-[12.5px] font-bold text-charcoal">
                                {formatCompact(s.revenue)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </Panel>
                    </div>
                  </div>
                )}

                {/* =============== ORDERS =============== */}
                {view === "orders" && (
                  <Panel
                    title="Order management"
                    action={
                      <div className="flex gap-1.5">
                        {(["all", "placed", "preparing", "out-for-delivery", "delivered"] as const).map(
                          (s) => (
                            <button
                              key={s}
                              onClick={() => setStatusFilter(s)}
                              className={cn(
                                "rounded-full px-3 py-1.5 text-[10.5px] font-black uppercase tracking-wider transition-colors",
                                statusFilter === s
                                  ? "bg-charcoal text-cream"
                                  : "bg-charcoal/6 text-slate-brand hover:bg-charcoal/12",
                              )}
                            >
                              {s.replace(/-/g, " ")}
                            </button>
                          ),
                        )}
                      </div>
                    }
                  >
                    {filteredOrders.length === 0 ? (
                      <div className="py-12 text-center">
                        <Receipt className="mx-auto h-9 w-9 text-charcoal/20" strokeWidth={1.6} />
                        <p className="mt-4 text-[13.5px] text-slate-brand">
                          {orders.length === 0
                            ? "No orders yet. Place one from the storefront and it'll appear here."
                            : "No orders match these filters."}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left">
                          <thead>
                            <tr className="border-b border-charcoal/10 text-[10.5px] font-black uppercase tracking-[0.14em] text-slate-brand">
                              <th className="pb-3 pr-4">Order</th>
                              <th className="pb-3 pr-4">Customer</th>
                              <th className="pb-3 pr-4">Branch</th>
                              <th className="pb-3 pr-4">Items</th>
                              <th className="pb-3 pr-4">Payment</th>
                              <th className="pb-3 pr-4">Status</th>
                              <th className="pb-3 pr-4 text-right">Total</th>
                              <th className="pb-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-charcoal/8">
                            {filteredOrders.map((o) => (
                              <tr key={o.id} className="text-[13px]">
                                <td className="py-3.5 pr-4">
                                  <span className="font-display text-charcoal">{o.number}</span>
                                  <span className="block text-[11px] text-slate-brand">
                                    {new Date(o.createdAt).toLocaleTimeString("en-PK", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </td>
                                <td className="py-3.5 pr-4">
                                  <span className="font-semibold text-charcoal">
                                    {o.customer.name}
                                  </span>
                                  <span className="block text-[11px] text-slate-brand">
                                    {o.customer.phone}
                                  </span>
                                </td>
                                <td className="py-3.5 pr-4 text-slate-brand">
                                  {o.branchName}
                                </td>
                                <td className="py-3.5 pr-4 text-slate-brand">
                                  {o.itemCount}
                                </td>
                                <td className="py-3.5 pr-4 text-slate-brand">
                                  {o.paymentLabel}
                                </td>
                                <td className="py-3.5 pr-4">
                                  <span
                                    className={cn(
                                      "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
                                      statusTone[o.status],
                                    )}
                                  >
                                    {o.status.replace(/-/g, " ")}
                                  </span>
                                </td>
                                <td className="py-3.5 pr-4 text-right font-bold text-charcoal">
                                  {formatPKR(o.total)}
                                </td>
                                <td className="py-3.5">
                                  <div className="flex justify-end gap-1.5">
                                    {o.status !== "delivered" && (
                                      <button
                                        onClick={() => advanceOrder(o.id)}
                                        title="Advance status"
                                        className="grid h-8 w-8 place-items-center rounded-lg bg-charcoal text-cream transition-colors hover:bg-ember"
                                      >
                                        <CheckCircle2 className="h-4 w-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => cancelOrder(o.id)}
                                      title="Close order"
                                      className="grid h-8 w-8 place-items-center rounded-lg border border-charcoal/12 text-slate-brand transition-colors hover:border-ember hover:text-ember"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Panel>
                )}

                {/* =============== MENU & INVENTORY =============== */}
                {view === "menu" && (
                  <Panel
                    title="Menu & inventory"
                    action={
                      <span className="text-[11.5px] text-slate-brand">
                        {menuItems.length} items ·{" "}
                        {Object.values(stock).filter(Boolean).length} in stock
                      </span>
                    }
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[680px] text-left">
                        <thead>
                          <tr className="border-b border-charcoal/10 text-[10.5px] font-black uppercase tracking-[0.14em] text-slate-brand">
                            <th className="pb-3 pr-4">Item</th>
                            <th className="pb-3 pr-4">Category</th>
                            <th className="pb-3 pr-4">Price</th>
                            <th className="pb-3 pr-4">Prep</th>
                            <th className="pb-3 pr-4 text-center">In stock</th>
                            <th className="pb-3 text-right">Sold (7d)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal/8">
                          {menuItems.map((i) => {
                            const stat = itemStats.find((s) => s.item.slug === i.slug)!;
                            const inStock = stock[i.slug];
                            return (
                              <tr key={i.slug} className="text-[13px]">
                                <td className="py-3 pr-4">
                                  <span className="font-semibold text-charcoal">
                                    {i.name}
                                  </span>
                                </td>
                                <td className="py-3 pr-4 text-slate-brand">
                                  {categories.find((c) => c.id === i.categoryId)?.name}
                                </td>
                                <td className="py-3 pr-4 font-bold text-charcoal">
                                  {formatPKR(i.price)}
                                </td>
                                <td className="py-3 pr-4 text-slate-brand">
                                  {i.prepMinutes} min
                                </td>
                                <td className="py-3 pr-4 text-center">
                                  <button
                                    onClick={() =>
                                      setStock((s) => ({ ...s, [i.slug]: !s[i.slug] }))
                                    }
                                    className={cn(
                                      "relative h-6 w-11 rounded-full transition-colors",
                                      inStock ? "bg-fresh" : "bg-charcoal/20",
                                    )}
                                    aria-label={`Toggle stock for ${i.name}`}
                                  >
                                    <span
                                      className={cn(
                                        "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                                        inStock ? "left-[22px]" : "left-0.5",
                                      )}
                                    />
                                  </button>
                                </td>
                                <td className="py-3 text-right font-bold text-charcoal">
                                  {stat.units.toLocaleString("en-PK")}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-4 border-t border-charcoal/8 pt-3 text-[12px] text-slate-brand">
                      Toggling an item off marks it sold out across every branch
                      and hides the &ldquo;add&rdquo; action on the storefront.
                    </p>
                  </Panel>
                )}

                {/* =============== BRANCHES =============== */}
                {view === "branches" && (
                  <Panel title="Branch performance (7d)">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-left">
                        <thead>
                          <tr className="border-b border-charcoal/10 text-[10.5px] font-black uppercase tracking-[0.14em] text-slate-brand">
                            <th className="pb-3 pr-4">Branch</th>
                            <th className="pb-3 pr-4">City</th>
                            <th className="pb-3 pr-4 text-right">Revenue</th>
                            <th className="pb-3 pr-4 text-right">Orders</th>
                            <th className="pb-3 pr-4 text-right">AOV</th>
                            <th className="pb-3 pr-4 text-right">Avg time</th>
                            <th className="pb-3 text-right">Rating</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-charcoal/8">
                          {branches
                            .map((b) => {
                              const r = seededRandom(`branch-${b.id}`);
                              const rev = Math.round(320_000 + r * 480_000);
                              const ord = Math.round(rev / (1150 + r * 500));
                              return { b, rev, ord, aov: rev / ord };
                            })
                            .sort((x, y) => y.rev - x.rev)
                            .map(({ b, rev, ord, aov: bAov }) => (
                              <tr key={b.id} className="text-[13px]">
                                <td className="py-3.5 pr-4 font-semibold text-charcoal">
                                  {b.name}
                                </td>
                                <td className="py-3.5 pr-4 text-slate-brand">
                                  {b.city}
                                </td>
                                <td className="py-3.5 pr-4 text-right font-bold text-charcoal">
                                  {formatPKR(rev)}
                                </td>
                                <td className="py-3.5 pr-4 text-right text-slate-brand">
                                  {ord.toLocaleString("en-PK")}
                                </td>
                                <td className="py-3.5 pr-4 text-right text-slate-brand">
                                  {formatPKR(bAov)}
                                </td>
                                <td className="py-3.5 pr-4 text-right text-slate-brand">
                                  {b.eta} min
                                </td>
                                <td className="py-3.5 text-right font-bold text-charcoal">
                                  {b.rating}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </Panel>
                )}

                {/* =============== REPORTS =============== */}
                {view === "reports" && (
                  <div className="grid gap-5 lg:grid-cols-2">
                    <Panel title="Revenue by category">
                      <ul className="space-y-4">
                        {categories
                          .map((c) => {
                            const r = seededRandom(`cat-${c.id}`);
                            const rev = Math.round(180_000 + r * 620_000);
                            return { c, rev };
                          })
                          .sort((a, b) => b.rev - a.rev)
                          .map(({ c, rev }) => {
                            const max = 800_000;
                            return (
                              <li key={c.id}>
                                <div className="mb-1.5 flex items-baseline justify-between">
                                  <span className="text-[13px] font-bold text-charcoal">
                                    {c.name}
                                  </span>
                                  <span className="text-[12.5px] font-bold text-slate-brand">
                                    {formatPKR(rev)}
                                  </span>
                                </div>
                                <div className="h-2.5 overflow-hidden rounded-full bg-charcoal/8">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(rev / max) * 100}%` }}
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    className="h-full rounded-full"
                                    style={{
                                      background: `linear-gradient(90deg, hsl(${c.hue} 78% 48%), hsl(${c.hue} 88% 62%))`,
                                    }}
                                  />
                                </div>
                              </li>
                            );
                          })}
                      </ul>
                    </Panel>

                    <Panel title="Payment mix">
                      <ul className="space-y-4">
                        {[
                          { label: "Cash on delivery", pct: 44, colour: "#FF4D14" },
                          { label: "Card", pct: 22, colour: "#FF8A00" },
                          { label: "JazzCash", pct: 17, colour: "#FFC24B" },
                          { label: "EasyPaisa", pct: 12, colour: "#2FBF71" },
                          { label: "Bank transfer", pct: 5, colour: "#38BDF8" },
                        ].map((p) => (
                          <li key={p.label}>
                            <div className="mb-1.5 flex items-baseline justify-between">
                              <span className="text-[13px] font-bold text-charcoal">
                                {p.label}
                              </span>
                              <span className="text-[12.5px] font-bold text-slate-brand">
                                {p.pct}%
                              </span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-charcoal/8">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${p.pct}%` }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="h-full rounded-full"
                                style={{ background: p.colour }}
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-5 border-t border-charcoal/8 pt-3 text-[12px] text-slate-brand">
                        COD is still dominant but down from 61% a year ago.
                        Digital now accounts for 56% of settled value.
                      </p>
                    </Panel>

                    <Panel title="Fulfilment mix">
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          {
                            icon: Bike,
                            label: "Delivery",
                            pct: 68,
                            colour: "bg-ember",
                          },
                          {
                            icon: Store,
                            label: "Pick-up",
                            pct: 24,
                            colour: "bg-charcoal",
                          },
                          {
                            icon: Boxes,
                            label: "Catering",
                            pct: 8,
                            colour: "bg-flame",
                          },
                        ].map((f) => {
                          const Icon = f.icon;
                          return (
                            <div
                              key={f.label}
                              className="rounded-2xl border border-charcoal/8 p-5 text-center"
                            >
                              <span
                                className={cn(
                                  "mx-auto grid h-11 w-11 place-items-center rounded-xl text-white",
                                  f.colour,
                                )}
                              >
                                <Icon className="h-5 w-5" strokeWidth={2.3} />
                              </span>
                              <p className="mt-3 font-display text-3xl text-charcoal">
                                {f.pct}%
                              </p>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-brand">
                                {f.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </Panel>

                    <Panel title="Inventory alerts">
                      <ul className="space-y-2.5">
                        {itemStats
                          .filter((_, i) => i % 7 === 3)
                          .slice(0, 5)
                          .map((s, i) => {
                            const level = 8 + i * 6;
                            return (
                              <li
                                key={s.item.slug}
                                className="flex items-center gap-3 rounded-2xl border border-charcoal/8 p-3.5"
                              >
                                <span
                                  className={cn(
                                    "grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white",
                                    level < 15 ? "bg-ember" : "bg-flame",
                                  )}
                                >
                                  <Boxes className="h-4 w-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[13px] font-bold text-charcoal">
                                    {s.item.name}
                                  </p>
                                  <p className="text-[11.5px] text-slate-brand">
                                    {level < 15 ? "Below par level" : "Approaching par"} ·{" "}
                                    {level} units
                                  </p>
                                </div>
                                <span className="shrink-0 text-[11px] font-black uppercase tracking-wider text-ember">
                                  Reorder
                                </span>
                              </li>
                            );
                          })}
                      </ul>
                    </Panel>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Building blocks ---------------- */

function Kpi({
  icon: Icon,
  label,
  value,
  delta,
  up,
  accent,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  delta: string;
  up: boolean;
  accent: string;
}) {
  const Trend = up ? TrendingUp : TrendingDown;
  return (
    <div className="rounded-2xl border border-charcoal/8 bg-white p-5">
      <div className="flex items-start justify-between">
        <span className={cn("grid h-11 w-11 place-items-center rounded-xl text-white", accent)}>
          <Icon className="h-5 w-5" strokeWidth={2.3} />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-black uppercase tracking-wider",
            up ? "bg-fresh/15 text-green-700" : "bg-ember/15 text-ember-dark",
          )}
        >
          <Trend className="h-3 w-3" strokeWidth={3} />
          {delta}
        </span>
      </div>
      <p className="mt-4 text-[10.5px] font-black uppercase tracking-[0.16em] text-slate-brand">
        {label}
      </p>
      <p className="mt-1 font-display text-[30px] leading-none text-charcoal">
        {value}
      </p>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[26px] border border-charcoal/8 bg-white p-5 sm:p-6",
        className,
      )}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="t-sub uppercase tracking-wide text-charcoal">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

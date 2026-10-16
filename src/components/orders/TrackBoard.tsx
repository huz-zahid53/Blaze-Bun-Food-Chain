"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bike,
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  MapPin,
  PackageCheck,
  Phone,
  Receipt,
  RotateCcw,
  Search,
  ShoppingBag,
  Store,
} from "lucide-react";
import { useStore, type PlacedOrder, type OrderStatus } from "@/store/useStore";
import { getOrder } from "@/lib/cloud";
import { PageHero } from "@/components/ui/PageHero";
import { DotGridOverlay } from "@/components/ui/SectionDivider";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { formatPKR, cn, timeAgo } from "@/lib/utils";
import { menuItems } from "@/data/menu";
import { brand } from "@/config/brand";

const stageMeta: Record<
  OrderStatus,
  { label: string; blurb: string; icon: typeof Bike }
> = {
  placed: { label: "Order placed", blurb: "We've got it", icon: Receipt },
  confirmed: { label: "Confirmed", blurb: "Payment verified", icon: CheckCircle2 },
  preparing: { label: "In the kitchen", blurb: "Prep has started", icon: ChefHat },
  "on-the-flame": { label: "On the flame", blurb: "Grill is working", icon: Flame },
  "out-for-delivery": { label: "Out for delivery", blurb: "Rider is on the way", icon: Bike },
  "ready-for-pickup": { label: "Ready for pick-up", blurb: "Come and get it", icon: PackageCheck },
  delivered: { label: "Delivered", blurb: "Enjoy it", icon: CheckCircle2 },
};

const chain: OrderStatus[] = [
  "placed",
  "confirmed",
  "preparing",
  "on-the-flame",
  "out-for-delivery",
  "delivered",
];

export function TrackBoard() {
  const params = useSearchParams();
  const newNumber = params.get("new");

  const orders = useStore((s) => s.orders);
  const advanceOrder = useStore((s) => s.advanceOrder);
  const hydrated = useStore((s) => s.hydrated);

  const [lookup, setLookup] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (newNumber && orders.length) {
      const found = orders.find((o) => o.number === newNumber);
      if (found) setSelectedId(found.id);
    } else if (!selectedId && orders.length) {
      setSelectedId(orders[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newNumber, orders.length]);

  // Live countdown ticker
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  /**
   * Live status pulled from Supabase, keyed by order number. The POS console
   * advances statuses server-side, so polling here is what makes the customer's
   * tracking page move without a refresh.
   */
  const cloudMode = useStore((s) => s.cloudMode);
  const [remoteStatus, setRemoteStatus] = useState<Record<string, OrderStatus>>({});

  const selected = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? orders[0],
    [orders, selectedId],
  );

  useEffect(() => {
    const number = selected?.number;
    if (cloudMode !== "cloud" || !number) return;
    let alive = true;

    async function poll() {
      try {
        const { order: remote } = await getOrder(number);
        const status = remote?.status as OrderStatus | undefined;
        if (!alive || !status) return;
        setRemoteStatus((prev) =>
          prev[number] === status ? prev : { ...prev, [number]: status },
        );
      } catch {
        // Offline, or the order belongs to another guest — keep showing the
        // last known local status rather than blanking the page.
      }
    }

    void poll();
    const t = setInterval(poll, 15_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [cloudMode, selected?.number]);

  /** The order as displayed: cloud status wins over the locally stored one. */
  const order = useMemo(() => {
    if (!selected) return selected;
    const live = remoteStatus[selected.number];
    return live && live !== selected.status ? { ...selected, status: live } : selected;
  }, [selected, remoteStatus]);

  // Pick-up orders terminate at "ready-for-pickup" rather than delivery
  const activeChain: OrderStatus[] =
    order?.type === "pickup"
      ? ["placed", "confirmed", "preparing", "on-the-flame", "ready-for-pickup"]
      : chain;

  const statusIdx = order ? activeChain.indexOf(order.status) : -1;

  const etaSeconds = useMemo(() => {
    if (!order) return 0;
    const placed = new Date(order.createdAt).getTime();
    const target = placed + order.etaMinutes * 60_000;
    return Math.max(0, Math.round((target - Date.now()) / 1000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, tick]);

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const found = orders.find(
      (o) => o.number.toLowerCase() === lookup.trim().toLowerCase(),
    );
    if (found) setSelectedId(found.id);
  }

  function handleSimulateNextStage() {
    if (!order) return;
    const currentIdx = activeChain.indexOf(order.status);
    const nextStatus = activeChain[Math.min(currentIdx + 1, activeChain.length - 1)];

    // 1. Advance in zustand store by id
    advanceOrder(order.id);
    if (order.number && order.number !== order.id) {
      advanceOrder(order.number);
    }

    // 2. Clear remote status override and set nextStatus so animation triggers immediately
    setRemoteStatus((prev) => ({
      ...prev,
      [order.number]: nextStatus,
    }));
  }

  return (
    <>
      <PageHero
          image="/media/hero/bg-wings.jpg"
        kicker="Order tracking"
        title={[<span key="a">Where's my</span>, <br key="b" />,
          <span key="c" className="bg-gradient-to-r from-flame to-gold bg-clip-text text-transparent">
            food?
          </span>]}
        subtitle="Live status from the moment your order hits the grill to the second it lands at your door."
      >
        <form onSubmit={handleLookup} className="flex max-w-md gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/40" />
            <input
              value={lookup}
              onChange={(e) => setLookup(e.target.value.toUpperCase())}
              placeholder="Order number, e.g. BB-8F3K2"
              aria-label="Order number"
              className="w-full rounded-full border border-cream/15 bg-cream/5 py-3.5 pl-11 pr-4 text-[13.5px] font-bold uppercase text-cream outline-none placeholder:font-medium placeholder:normal-case placeholder:text-cream/40 focus:border-ember"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-full bg-ember px-6 text-[12px] font-black uppercase tracking-wider text-white hover:bg-ember-dark"
          >
            Track
          </button>
        </form>
      </PageHero>

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-12 lg:px-8">
        {!hydrated ? (
          <div className="py-16 text-center text-[14px] text-slate-brand">
            Loading your orders…
          </div>
        ) : orders.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-charcoal/15 px-6 py-16 text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-charcoal/5">
              <PackageCheck className="h-9 w-9 text-charcoal/25" strokeWidth={1.6} />
            </span>
            <h2 className="t-section mt-6 uppercase tracking-wide text-charcoal">
              No orders yet
            </h2>
            <p className="mt-2 text-[14px] text-slate-brand">
              Once you place an order it'll show up here with live tracking.
            </p>
            <Link
              href="/menu"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-ember px-8 py-4 text-[12.5px] font-black uppercase tracking-wider text-white hover:bg-ember-dark"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={2.6} />
              Start an order
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:items-start">
            {/* Order list */}
            <aside className="lg:sticky lg:top-28">
              <h2 className="t-sub uppercase tracking-wide text-charcoal">
                Your orders
              </h2>
              <div className="mt-4 space-y-2.5">
                {orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedId(o.id)}
                    className={cn(
                      "w-full rounded-2xl border-2 p-4 text-left transition-colors",
                      order?.id === o.id
                        ? "border-ember bg-ember/6"
                        : "border-charcoal/8 bg-white hover:border-charcoal/20",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-lg tracking-wide text-charcoal">
                        {o.number}
                      </span>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-brand">
                        {timeAgo(o.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] text-slate-brand">
                      {o.itemCount} {o.itemCount === 1 ? "item" : "items"} ·{" "}
                      {formatPKR(o.total)}
                    </p>
                    <p
                      className={cn(
                        "mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
                        o.status === "delivered"
                          ? "bg-fresh/15 text-green-700"
                          : "bg-flame/15 text-ember-dark",
                      )}
                    >
                      {stageMeta[o.status].label}
                    </p>
                  </button>
                ))}
              </div>
            </aside>

            {/* Detail */}
            {order && (
              <div className="space-y-6">
                {/* Status card */}
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-3xl bg-charcoal text-cream"
                >
                  <div className="relative overflow-hidden border-b border-cream/10 p-6 sm:p-8">
                    <DotGridOverlay tone="dark" />

                    <div className="relative flex flex-wrap items-start justify-between gap-5">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={order.status}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <p className="text-[10.5px] font-black uppercase tracking-[0.22em] text-cream/45">
                              Order {order.number} · Live tracking
                            </p>
                          </div>
                          <h2 className="t-section mt-1.5 uppercase tracking-wide text-white">
                            {stageMeta[order.status].label}
                          </h2>
                          <p className="mt-2 text-[13.5px] text-cream/70">
                            {stageMeta[order.status].blurb}
                          </p>
                        </motion.div>
                      </AnimatePresence>

                      <AnimatePresence mode="wait">
                        {order.status !== "delivered" ? (
                          <motion.div
                            key="timer"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="text-right"
                          >
                            <p className="text-[10.5px] font-black uppercase tracking-[0.22em] text-cream/45">
                              Arriving in
                            </p>
                            <p className="font-display text-[clamp(2.4rem,7vw,3.6rem)] leading-none text-flame tabular-nums">
                              {String(Math.floor(etaSeconds / 60)).padStart(2, "0")}:
                              {String(etaSeconds % 60).padStart(2, "0")}
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-2xl bg-fresh/15 px-5 py-4 text-right shadow-[0_0_24px_rgba(34,197,94,0.3)]"
                          >
                            <p className="font-display text-2xl text-green-400">
                              Delivered & Complete
                            </p>
                            <p className="text-[11.5px] text-cream/60">
                              +{order.loyaltyEarned} points earned
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Progress rail */}
                    <div className="relative mt-9">
                      <div className="absolute left-0 right-0 top-5 h-1.5 rounded-full bg-cream/12" />
                      <motion.div
                        className="absolute left-0 top-5 h-1.5 rounded-full bg-gradient-to-r from-flame via-ember to-gold shadow-[0_0_12px_rgba(255,77,20,0.6)]"
                        initial={false}
                        animate={{
                          width: `${Math.max(2, (statusIdx / (activeChain.length - 1)) * 100)}%`,
                        }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      />

                      {/* Gliding leading indicator pip along the rail */}
                      {statusIdx > 0 && statusIdx < activeChain.length && (
                        <motion.div
                          className="pointer-events-none absolute top-3.5 -ml-2.5 z-20 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white shadow-[0_0_14px_rgba(255,77,20,0.9)]"
                          initial={false}
                          animate={{
                            left: `${(statusIdx / (activeChain.length - 1)) * 100}%`,
                          }}
                          transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        >
                          <span className="h-2.5 w-2.5 rounded-full bg-ember animate-ping" />
                        </motion.div>
                      )}

                      <ol className="relative flex justify-between">
                        {activeChain.map((s, i) => {
                          const Icon = stageMeta[s].icon;
                          const done = i <= statusIdx;
                          const current = i === statusIdx;
                          return (
                            <li
                              key={s}
                              className="flex w-[62px] flex-col items-center text-center"
                            >
                              <motion.span
                                key={`icon-${s}-${done}`}
                                animate={{
                                  scale: current ? [1, 1.15, 1] : 1,
                                }}
                                transition={{
                                  scale: {
                                    duration: 1.4,
                                    repeat: current ? Infinity : 0,
                                    repeatDelay: 0.6,
                                  },
                                }}
                                className={cn(
                                  "grid h-11 w-11 place-items-center rounded-full border-2 transition-all duration-500",
                                  done
                                    ? "border-ember bg-ember text-white shadow-[0_0_16px_rgba(255,77,20,0.5)]"
                                    : "border-cream/20 bg-charcoal text-cream/35",
                                  current && "animate-pulse-ring",
                                )}
                              >
                                <Icon className="h-5 w-5" strokeWidth={2.3} />
                              </motion.span>
                              <span
                                className={cn(
                                  "mt-2 text-[9.5px] font-bold uppercase leading-tight tracking-wider transition-colors",
                                  done ? "text-cream/90" : "text-cream/35",
                                  current && "text-gold font-black",
                                )}
                              >
                                {stageMeta[s].label}
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                    </div>

                    {/* Demo advance */}
                    {order.status !== "delivered" && (
                      <div className="relative mt-9 flex flex-wrap items-center gap-3 border-t border-cream/10 pt-5">
                        <button
                          type="button"
                          onClick={handleSimulateNextStage}
                          className="rounded-full bg-ember px-6 py-3 text-[11.5px] font-black uppercase tracking-wider text-white shadow-lg shadow-ember/30 transition-all hover:bg-ember-dark hover:scale-105 active:scale-95"
                        >
                          Simulate next stage
                        </button>
                        <p className="text-[11.5px] text-cream/45">
                          Demo control — advances order stages with live real-time progress animations.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="p-6 sm:p-8">
                    <h3 className="t-sub uppercase tracking-wide">
                      Timeline
                    </h3>
                    <ol className="mt-4 space-y-0">
                      {order.timeline.map((t, i) => (
                        <li key={i} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span
                              className={cn(
                                "mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ring-charcoal",
                                t.done ? "bg-fresh" : "bg-cream/20",
                              )}
                            />
                            {i < order.timeline.length - 1 && (
                              <span
                                className={cn(
                                  "w-0.5 flex-1",
                                  t.done ? "bg-fresh/40" : "bg-cream/12",
                                )}
                              />
                            )}
                          </div>
                          <div className="pb-5">
                            <p
                              className={cn(
                                "text-[13.5px] font-bold",
                                t.done ? "text-cream" : "text-cream/40",
                              )}
                            >
                              {t.label}
                            </p>
                            {t.at && (
                              <p className="text-[11.5px] text-cream/45">
                                {new Date(t.at).toLocaleTimeString("en-PK", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </motion.div>

                {/* Details grid */}
                <div className="grid gap-5 md:grid-cols-2">
                  {/* Items */}
                  <div className="rounded-3xl border border-charcoal/8 bg-white p-6">
                    <h3 className="t-sub uppercase tracking-wide text-charcoal">
                      What's in the bag
                    </h3>
                    <ul className="mt-4 space-y-3.5">
                      {order.lines.map((l) => (
                        <li key={l.key} className="flex gap-3">
                          <MediaFrame
                            src={l.image}
                            hue={l.hue}
                            glyph={l.glyph}
                            alt={l.name}
                            ratio="aspect-square"
                            className="h-14 w-14 shrink-0 rounded-xl"
                            sizes="56px"
                            zoom={false}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-bold text-charcoal">
                              {l.qty}× {l.name}
                            </p>
                            <p className="truncate text-[11.5px] text-slate-brand">
                              {[
                                l.size?.label,
                                ...l.options.map((o) => o.choiceLabel),
                                ...l.addOns.map((a) => a.label),
                              ]
                                .filter(Boolean)
                                .join(" · ") || "Standard"}
                            </p>
                          </div>
                          <span className="shrink-0 text-[13px] font-bold text-charcoal">
                            {formatPKR(l.unitPrice * l.qty)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <dl className="mt-5 space-y-2 border-t border-charcoal/8 pt-4 text-[13px]">
                      <div className="flex justify-between">
                        <dt className="text-slate-brand">Subtotal</dt>
                        <dd className="font-bold text-charcoal">{formatPKR(order.subtotal)}</dd>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-700">
                          <dt>Discount</dt>
                          <dd className="font-bold">− {formatPKR(order.discount)}</dd>
                        </div>
                      )}
                      {order.deliveryFee > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-slate-brand">Delivery</dt>
                          <dd className="font-bold text-charcoal">{formatPKR(order.deliveryFee)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-slate-brand">Tax</dt>
                        <dd className="font-bold text-charcoal">{formatPKR(order.tax)}</dd>
                      </div>
                      {order.tip > 0 && (
                        <div className="flex justify-between">
                          <dt className="text-slate-brand">Tip</dt>
                          <dd className="font-bold text-charcoal">{formatPKR(order.tip)}</dd>
                        </div>
                      )}
                      <div className="flex items-end justify-between border-t border-charcoal/8 pt-3">
                        <dt className="text-[13px] font-black uppercase tracking-wider text-charcoal">
                          Total
                        </dt>
                        <dd className="font-display text-2xl text-charcoal">
                          {formatPKR(order.total)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Delivery info */}
                  <div className="space-y-5">
                    <div className="rounded-3xl border border-charcoal/8 bg-white p-6">
                      <h3 className="t-sub uppercase tracking-wide text-charcoal">
                        {order.type === "delivery" ? "Delivery details" : "Collection details"}
                      </h3>
                      <dl className="mt-4 space-y-3.5 text-[13px]">
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                          <div>
                            <dt className="text-[10.5px] font-black uppercase tracking-[0.16em] text-slate-brand">
                              {order.type === "delivery" ? "Address" : "Branch"}
                            </dt>
                            <dd className="font-semibold text-charcoal">
                              {order.customer.address ?? order.branchName}
                            </dd>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                          <div>
                            <dt className="text-[10.5px] font-black uppercase tracking-[0.16em] text-slate-brand">
                              Slot
                            </dt>
                            <dd className="font-semibold text-charcoal">
                              {order.customer.slot ?? "As soon as possible"}
                            </dd>
                          </div>
                        </div>
                        {order.customer.instructions && (
                          <div className="flex items-start gap-3">
                            <Receipt className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                            <div>
                              <dt className="text-[10.5px] font-black uppercase tracking-[0.16em] text-slate-brand">
                                Instructions
                              </dt>
                              <dd className="font-semibold text-charcoal">
                                {order.customer.instructions}
                              </dd>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <Store className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                          <div>
                            <dt className="text-[10.5px] font-black uppercase tracking-[0.16em] text-slate-brand">
                              Preparing at
                            </dt>
                            <dd className="font-semibold text-charcoal">
                              {order.branchName}
                            </dd>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Receipt className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                          <div>
                            <dt className="text-[10.5px] font-black uppercase tracking-[0.16em] text-slate-brand">
                              Payment
                            </dt>
                            <dd className="font-semibold text-charcoal">
                              {order.paymentLabel}
                            </dd>
                          </div>
                        </div>
                      </dl>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 rounded-full border-2 border-charcoal/12 px-5 py-3 text-[11.5px] font-black uppercase tracking-wider text-charcoal transition-colors hover:border-ember hover:text-ember"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Get help
                      </Link>
                      <Link
                        href="/menu"
                        className="inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-3 text-[11.5px] font-black uppercase tracking-wider text-cream transition-colors hover:bg-ember"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Order again
                      </Link>
                    </div>

                    <p className="rounded-2xl bg-charcoal/4 px-4 py-3.5 text-[12px] leading-[1.6] text-slate-brand">
                      Something wrong with your order? Call{" "}
                      <a href={brand.phoneHref} className="font-bold text-ember">
                        {brand.phone}
                      </a>{" "}
                      and we'll refund or re-deliver. No interrogation.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}

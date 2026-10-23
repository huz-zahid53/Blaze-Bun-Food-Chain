"use client";

import { create } from "zustand";
import type { OrderType } from "@/config/brand";
import { brand } from "@/config/brand";
import { branches } from "@/data/branches";
import { findZone } from "@/data/zones";
import { orderNumber } from "@/lib/utils";
import { computeTotals, coupons, type Coupon } from "@/lib/pricing";

/* ============================================================
   TYPES
   ============================================================ */

export interface SelectedOption {
  groupId: string;
  groupLabel: string;
  choiceId: string;
  choiceLabel: string;
  delta: number;
}

export interface SelectedAddOn {
  id: string;
  label: string;
  price: number;
}

export interface CartLine {
  key: string;
  slug: string;
  name: string;
  image?: string;
  hue: number;
  glyph: string;
  basePrice: number;
  unitPrice: number;
  qty: number;
  size?: { label: string; delta: number };
  options: SelectedOption[];
  addOns: SelectedAddOn[];
  note?: string;
  categoryId: string;
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "on-the-flame"
  | "out-for-delivery"
  | "ready-for-pickup"
  | "delivered"
  | "cancelled";

export interface OrderEvent {
  label: string;
  at: string;
  done: boolean;
}

export interface PlacedOrder {
  id: string;
  number: string;
  createdAt: string;
  status: OrderStatus;
  type: OrderType;
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  tip: number;
  total: number;
  payment: string;
  paymentLabel: string;
  paymentStatus?: "unpaid" | "pending" | "paid" | "failed" | "refunded";
  paymentReference?: string;
  isSimulated?: boolean;
  branchId: string | null;
  branchName: string;
  etaMinutes: number;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    instructions?: string;
    slot?: string;
  };
  timeline: OrderEvent[];
  loyaltyEarned: number;
}

/**
 * The slice of store state that is durable — i.e. what gets saved to
 * `guest_state` in Supabase and restored on the next visit. UI-only flags
 * (cartOpen, navOpen, …) are deliberately excluded so a reload never reopens a
 * drawer the customer closed.
 */
export interface RemoteState {
  orderType: OrderType;
  branchId: string | null;
  /** Selected delivery zone id — `null` for pick-up / catering. */
  zoneId: string | null;
  city: string;
  /**
   * True once the customer has explicitly confirmed a location. Persisted so a
   * returning visitor is not re-prompted; the store's default branch/city alone
   * cannot tell "never chose" apart from "chose the DHA branch".
   */
  locationConfirmed: boolean;
  lines: CartLine[];
  coupon: Coupon | null;
  tip: number;
  orders: PlacedOrder[];
  loyaltyPoints: number;
  isMember: boolean;
}

/**
 * What the API returns after accepting an order. These values are authoritative
 * — the server re-prices every line against the menu, so a tampered client
 * cannot alter what is charged.
 */
export interface ServerOrderConfirmation {
  id?: string;
  number?: string;
  loyaltyEarned?: number;
  payment?: {
    status: "unpaid" | "pending" | "paid" | "failed" | "refunded";
    reference: string;
    isSimulated: boolean;
    message: string;
    method: string;
  };
  totals?: Partial<
    Pick<
      PlacedOrder,
      | "subtotal"
      | "deliveryFee"
      | "discount"
      | "tax"
      | "tip"
      | "total"
      | "itemCount"
    >
  >;
}

/** Serialises the durable slice for a PUT to /api/state. */
export function serializeRemoteState(s: RemoteState): RemoteState {
  return {
    orderType: s.orderType,
    branchId: s.branchId,
    zoneId: s.zoneId,
    city: s.city,
    locationConfirmed: s.locationConfirmed,
    lines: s.lines,
    coupon: s.coupon,
    tip: s.tip,
    orders: s.orders,
    loyaltyPoints: s.loyaltyPoints,
    isMember: s.isMember,
  };
}

/**
 * Pricing lives in `@/lib/pricing` — a React-free, "use client"-free module so
 * the API route handlers can price orders with the exact same numbers the
 * browser shows. Re-exported here so existing imports keep working.
 */
export type { Coupon } from "@/lib/pricing";
export { coupons, computeTotals, findCoupon, priceOrder } from "@/lib/pricing";
export type { Totals, PriceOrderResult } from "@/lib/pricing";

/* ============================================================
   STORE
   ============================================================ */

interface StoreState {
  /* --- Order context --- */
  orderType: OrderType;
  branchId: string | null;
  /** Delivery zone id when `orderType === "delivery"`; otherwise `null`. */
  zoneId: string | null;
  city: string;
  /** True once the customer has explicitly chosen their location. */
  locationConfirmed: boolean;
  setOrderType: (t: OrderType) => void;
  setBranch: (id: string | null, city?: string) => void;
  /**
   * Commits a fully-resolved location choice in one update. Used by the
   * location modal so order type, city, branch and delivery zone can never end
   * up describing different places.
   */
  commitLocation: (loc: {
    orderType: OrderType;
    city: string;
    branchId: string | null;
    zoneId: string | null;
  }) => void;

  /* --- Cart --- */
  lines: CartLine[];
  coupon: Coupon | null;
  tip: number;
  addLine: (line: Omit<CartLine, "key">, qty?: number) => void;
  removeLine: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  incQty: (key: string) => void;
  decQty: (key: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
  setTip: (v: number) => void;

  /* --- Orders --- */
  orders: PlacedOrder[];
  /**
   * Records an order locally. When `server` is supplied the order was accepted
   * by the API, so its id, number, loyalty and repriced totals take precedence
   * over the client's own arithmetic.
   */
  placeOrder: (
    payload: Omit<PlacedOrder, "id" | "number" | "createdAt" | "timeline" | "status" | "loyaltyEarned">,
    server?: ServerOrderConfirmation,
  ) => PlacedOrder;
  advanceOrder: (id: string) => void;
  cancelOrder: (id: string) => void;
  settleOrderPayment: (id: string, settledBy?: string) => void;

  /* --- Loyalty --- */
  loyaltyPoints: number;
  isMember: boolean;
  joinRewards: () => void;

  /* --- UI --- */
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  locationOpen: boolean;
  setLocationOpen: (v: boolean) => void;
  navOpen: boolean;
  setNavOpen: (v: boolean) => void;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;

  /* --- Cloud sync (Supabase) --- */
  /** "cloud" = durable state lives in Supabase; "local" = in-memory only. */
  cloudMode: "cloud" | "local" | "unknown";
  /** Last cloud error, surfaced in the UI instead of failing silently. */
  cloudError: string | null;
  /** True while a state push to the cloud is in flight. */
  syncing: boolean;
  setCloudMode: (m: "cloud" | "local" | "unknown") => void;
  setCloudError: (e: string | null) => void;
  setSyncing: (v: boolean) => void;
  /** Applies state fetched from /api/state after mount. */
  applyRemoteState: (remote: Partial<RemoteState> | null) => void;
}

/** Deterministic key so identical configurations merge into one line. */
function lineKey(line: Omit<CartLine, "key">) {
  const opts = line.options
    .map((o) => `${o.groupId}:${o.choiceId}`)
    .sort()
    .join("|");
  const adds = line.addOns
    .map((a) => a.id)
    .sort()
    .join("|");
  return `${line.slug}::${line.size?.label ?? "-"}::${opts}::${adds}::${line.note ?? ""}`;
}

/**
 * The store is plain in-memory zustand — there is NO `persist` middleware and
 * nothing is written to localStorage.
 *
 * Durable state lives in Supabase (`guest_state`, `orders`, …) and is loaded by
 * `AppProviders` after mount via /api/state. That ordering is what makes
 * hydration safe by construction: the server and the client's first render both
 * see the initial state, and cloud data arrives in a later render.
 */
export const useStore = create<StoreState>()(
    (set, get) => ({
      orderType: "delivery",
      branchId: "bb-dha-karachi",
      zoneId: null,
      city: "Karachi",
      // Nothing is "chosen" yet — this is what lets the app prompt on first
      // load without mistaking the default branch for a saved selection.
      locationConfirmed: false,
      setOrderType: (t) =>
        set({ orderType: t, ...(t !== "delivery" ? { zoneId: null } : {}) }),
      // Picking a branch directly (e.g. the locations page) has no delivery
      // area alongside it, so any previous zone is cleared rather than left
      // pointing at a branch the customer just moved away from.
      setBranch: (id, city) =>
        set({
          branchId: id,
          zoneId: null,
          locationConfirmed: id != null,
          ...(city ? { city } : {}),
        }),
      commitLocation: (loc) =>
        set({
          orderType: loc.orderType,
          city: loc.city,
          branchId: loc.branchId,
          zoneId: loc.orderType === "delivery" ? loc.zoneId : null,
          locationConfirmed: loc.branchId != null || loc.zoneId != null,
        }),

      lines: [],
      coupon: null,
      tip: 0,

      addLine: (line, qty = 1) => {
        const key = lineKey(line);
        const existing = get().lines.find((l) => l.key === key);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.key === key ? { ...l, qty: l.qty + qty } : l,
            ),
          });
        } else {
          set({ lines: [...get().lines, { ...line, key }] });
        }
      },

      removeLine: (key) =>
        set({ lines: get().lines.filter((l) => l.key !== key) }),

      setQty: (key, qty) =>
        set({
          lines:
            qty <= 0
              ? get().lines.filter((l) => l.key !== key)
              : get().lines.map((l) => (l.key === key ? { ...l, qty } : l)),
        }),

      incQty: (key) =>
        set({
          lines: get().lines.map((l) =>
            l.key === key ? { ...l, qty: l.qty + 1 } : l,
          ),
        }),

      decQty: (key) =>
        set({
          lines: get().lines.map((l) =>
            l.key === key ? { ...l, qty: Math.max(0, l.qty - 1) } : l,
          ),
        }),

      clearCart: () => set({ lines: [], coupon: null, tip: 0 }),

      applyCoupon: (code) => {
        const found = coupons.find(
          (c) => c.code.toLowerCase() === code.trim().toLowerCase(),
        );
        if (!found) return { ok: false, message: "That code isn't valid." };
        const subtotal = get().lines.reduce(
          (s, l) => s + l.unitPrice * l.qty,
          0,
        );
        if (subtotal < found.minSpend)
          return {
            ok: false,
            message: `Spend Rs ${found.minSpend} to use ${found.code}.`,
          };
        set({ coupon: found });
        return { ok: true, message: `${found.label} applied.` };
      },

      removeCoupon: () => set({ coupon: null }),
      setTip: (v) => set({ tip: v }),

      orders: [],

      placeOrder: (payload, server) => {
        const now = new Date().toISOString();
        const isDelivery = payload.type === "delivery";
        const isDeliveryPay = payload.payment === "cod" || payload.payment === "cash_on_card";
        const paymentLabelEvent = isDeliveryPay
          ? (payload.payment === "cash_on_card" ? "Pay card at delivery" : "Pay cash at delivery")
          : (server?.payment?.isSimulated ? "Payment simulated (demo)" : "Payment confirmed");
        const paymentDone = !isDeliveryPay && (server?.payment?.status === "paid" || !server?.payment);

        const base: OrderEvent[] = [
          { label: "Order placed", at: now, done: true },
          { label: paymentLabelEvent, at: paymentDone ? now : "", done: paymentDone },
          { label: "Sent to kitchen", at: now, done: false },
          { label: "On the flame", at: "", done: false },
          isDelivery
            ? { label: "Out for delivery", at: "", done: false }
            : { label: "Ready for pick-up", at: "", done: false },
        ];
        // When the order was accepted by the API, the server is authoritative:
        // it re-priced the basket and issued the order number. Fall back to
        // locally generated values when running without cloud storage.
        const merged = { ...payload, ...(server?.totals ?? {}) };
        const order: PlacedOrder = {
          ...merged,
          id: server?.id ?? `${Date.now()}`,
          number: server?.number ?? orderNumber(),
          createdAt: now,
          status: "placed",
          paymentStatus: server?.payment?.status ?? (isDeliveryPay ? "unpaid" : "paid"),
          paymentReference: server?.payment?.reference,
          isSimulated: server?.payment?.isSimulated ?? !isDeliveryPay,
          timeline: base,
          loyaltyEarned:
            server?.loyaltyEarned ??
            Math.round(merged.total * brand.loyalty.pointsPerRupee),
        };
        set({
          orders: [order, ...get().orders],
          loyaltyPoints: get().loyaltyPoints + order.loyaltyEarned,
          lines: [],
          coupon: null,
          tip: 0,
        });
        return order;
      },

      advanceOrder: (id) => {
        set({
          orders: get().orders.map((o) => {
            if (o.id !== id && o.number !== id) return o;
            // Pick-up orders terminate at "ready-for-pickup", not delivery
            const chain: OrderStatus[] =
              o.type === "pickup"
                ? ["placed", "confirmed", "preparing", "on-the-flame", "ready-for-pickup"]
                : [
                    "placed",
                    "confirmed",
                    "preparing",
                    "on-the-flame",
                    "out-for-delivery",
                    "delivered",
                  ];
            const idx = chain.indexOf(o.status);
            const next = chain[Math.min(Math.max(idx, -1) + 1, chain.length - 1)];
            const ti = o.timeline.findIndex((t) => !t.done);
            return {
              ...o,
              status: next,
              timeline: o.timeline.map((t, i) =>
                i === ti ? { ...t, done: true, at: new Date().toISOString() } : t,
              ),
            };
          }),
        });
      },

      cancelOrder: (id) =>
        set({
          orders: get().orders.map((o) =>
            o.id === id || o.number === id ? { ...o, status: "cancelled" } : o,
          ),
        }),

      settleOrderPayment: (id, settledBy) =>
        set({
          orders: get().orders.map((o) => {
            if (o.id !== id && o.number !== id) return o;
            if (o.paymentStatus === "paid" || o.status === "cancelled") return o;
            const now = new Date().toISOString();
            return {
              ...o,
              paymentStatus: "paid",
              timeline: o.timeline.map((t) =>
                t.label.toLowerCase().includes("pay ") || t.label.toLowerCase().includes("payment")
                  ? { ...t, label: `${o.paymentLabel} (Settled)`, done: true, at: now }
                  : t,
              ),
            };
          }),
        }),

      loyaltyPoints: 0,
      isMember: false,
      joinRewards: () =>
        set({
          isMember: true,
          loyaltyPoints: get().loyaltyPoints + brand.loyalty.joinBonus,
        }),

      cartOpen: false,
      setCartOpen: (v) => set({ cartOpen: v }),
      locationOpen: false,
      setLocationOpen: (v) => set({ locationOpen: v }),
      navOpen: false,
      setNavOpen: (v) => set({ navOpen: v }),
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),

      /* --- Cloud sync (Supabase) --- */
      cloudMode: "unknown",
      cloudError: null,
      syncing: false,
      setCloudMode: (m) => set({ cloudMode: m }),
      setCloudError: (e) => set({ cloudError: e }),
      setSyncing: (v) => set({ syncing: v }),

      /**
       * Applies state fetched from /api/state. Every field is validated before
       * it lands in the store — a corrupt or hand-edited row in the database
       * must not be able to put the cart into an impossible shape.
       */
      applyRemoteState: (remote) => {
        if (!remote || typeof remote !== "object") return;
        const patch: Partial<StoreState> = {};

        if (remote.orderType === "delivery" || remote.orderType === "pickup" || remote.orderType === "catering") {
          patch.orderType = remote.orderType;
        }
        // Revalidate the saved branch/zone against the live catalogue: a branch
        // that has since closed, or a zone that is no longer serviced, must not
        // survive a reload. Unknown ids are dropped rather than trusted.
        if (remote.branchId === null) patch.branchId = null;
        else if (typeof remote.branchId === "string") {
          patch.branchId = branches.some((b) => b.id === remote.branchId)
            ? remote.branchId
            : null;
        }
        if (remote.zoneId === null) patch.zoneId = null;
        else if (typeof remote.zoneId === "string") {
          patch.zoneId = findZone(remote.zoneId) ? remote.zoneId : null;
        }
        // A valid zone implies its servicing branch, so repair a branch that
        // was dropped or never stored.
        if (patch.zoneId && !patch.branchId) {
          const zone = findZone(patch.zoneId);
          if (zone) patch.branchId = zone.branchId;
        }
        // Only trust a persisted "confirmed" flag if a usable location actually
        // survived revalidation; otherwise the customer must be prompted again.
        if (typeof remote.locationConfirmed === "boolean") {
          const hasLocation = patch.branchId != null || patch.zoneId != null;
          patch.locationConfirmed = remote.locationConfirmed && hasLocation;
        }
        if (typeof remote.city === "string" && remote.city) patch.city = remote.city;

        if (Array.isArray(remote.lines)) {
          // Keep only lines that still look like cart lines and reference a
          // menu item that still exists — the menu can change between visits.
          patch.lines = remote.lines
            .filter(
              (l) =>
                l &&
                typeof l.slug === "string" &&
                typeof l.name === "string" &&
                Number.isFinite(l.unitPrice) &&
                Number.isFinite(l.qty) &&
                l.qty > 0,
            )
            .slice(0, 60)
            .map((l) => ({ ...l, qty: Math.min(Math.round(l.qty), 50) }));
        }

        if (remote.coupon === null) patch.coupon = null;
        else if (remote.coupon && typeof remote.coupon === "object") {
          // Re-validate against the live catalogue; a retired code is dropped.
          const code = (remote.coupon as Coupon).code;
          const live = coupons.find((c) => c.code === code);
          patch.coupon = live ?? null;
        }

        if (typeof remote.tip === "number" && Number.isFinite(remote.tip)) {
          patch.tip = Math.min(Math.max(Math.round(remote.tip), 0), 5000);
        }
        if (Array.isArray(remote.orders)) {
          patch.orders = remote.orders.filter((o) => o && typeof o.number === "string").slice(0, 50);
        }
        if (typeof remote.loyaltyPoints === "number" && Number.isFinite(remote.loyaltyPoints)) {
          patch.loyaltyPoints = Math.max(0, Math.round(remote.loyaltyPoints));
        }
        if (typeof remote.isMember === "boolean") patch.isMember = remote.isMember;

        set(patch);
      },
    }),
);

/** Stable selectors — avoids re-render loops in React 19. */
export const useCartCount = () =>
  useStore((s) => s.lines.reduce((n, l) => n + l.qty, 0));

export const useCartTotal = () =>
  useStore((s) => computeTotals(s.lines, s.orderType, s.coupon, s.tip).total);

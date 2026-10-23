/**
 * Browser-side client for the /api route handlers.
 *
 * No Supabase keys appear here — the browser only ever talks to same-origin
 * /api/* endpoints, and the guest identity travels automatically in the
 * httpOnly `bb_guest` cookie set by the server. Nothing is written to
 * localStorage.
 *
 * Every function degrades gracefully: if the server reports that cloud storage
 * is not configured, callers fall back to in-memory state so the storefront
 * keeps working before the database is wired up.
 */

export type CloudMode = "cloud" | "local" | "unknown";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    // Never let the browser cache API responses.
    cache: "no-store",
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError(res.status, `Malformed response from ${path}`);
  }

  if (!res.ok || json?.ok === false) {
    throw new ApiError(res.status, json?.error ?? `Request to ${path} failed`, json);
  }
  return json.data as T;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
  /** True when the server has no database configured (graceful fallback). */
  get isUnconfigured() {
    return this.status === 503;
  }
}

/* ------------------------------------------------------------------ health */

export interface HealthReport {
  status: "cloud" | "local-fallback";
  configured: boolean;
  missing: string[];
  url: string | null;
  time: string;
}

let cachedHealth: HealthReport | null = null;

export async function getHealth(
  force = false,
  init?: RequestInit,
): Promise<HealthReport> {
  if (cachedHealth && !force) return cachedHealth;
  cachedHealth = await call<HealthReport>("/api/health", init);
  return cachedHealth;
}

export async function isCloudEnabled(): Promise<boolean> {
  try {
    const h = await getHealth();
    return h.configured;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------- guest state */

export async function loadGuestState(
  init?: RequestInit,
): Promise<{ state: any; updatedAt: string | null }> {
  return call("/api/state", init);
}

export async function saveGuestState(state: unknown): Promise<void> {
  await call("/api/state", { method: "PUT", body: JSON.stringify(state) });
}

export async function clearGuestState(): Promise<void> {
  await call("/api/state", { method: "DELETE" });
}

/* ------------------------------------------------------------------ orders */

export interface CreateOrderInput {
  number?: string;
  type: "delivery" | "pickup" | "catering";
  lines: unknown[];
  couponCode?: string | null;
  tip?: number;
  payment?: string;
  paymentLabel?: string;
  demoOutcome?: "success" | "failure" | "cancelled";
  branchId?: string | null;
  branchName?: string;
  /** Delivery zone id (delivery orders only). Validated server-side. */
  zoneId?: string | null;
  etaMinutes?: number;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    area?: string;
    city?: string;
    instructions?: string;
    slot?: string;
  };
}

export interface CreateOrderResult {
  id: string;
  number: string;
  status: string;
  total: number;
  placedAt: string;
  payment?: {
    status: "unpaid" | "pending" | "paid" | "failed" | "refunded";
    reference: string;
    isSimulated: boolean;
    message: string;
    method: string;
  };
  totals: {
    subtotal: number;
    itemCount: number;
    deliveryFee: number;
    discount: number;
    tax: number;
    tip: number;
    total: number;
    couponCode: string | null;
    couponRejected: string | null;
    loyaltyEarned: number;
  };
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  return call("/api/orders", { method: "POST", body: JSON.stringify(input) });
}

export async function listMyOrders(): Promise<any[]> {
  const r = await call<{ orders: any[] }>("/api/orders");
  return r.orders;
}

export async function getOrder(number: string): Promise<{ order: any; items: any[] }> {
  return call(`/api/orders/${encodeURIComponent(number)}`);
}

/* ------------------------------------------------------- forms & marketing */

export async function submitEnquiry(input: {
  kind: "contact" | "franchise" | "careers" | "catering";
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  payload?: Record<string, unknown>;
}) {
  return call("/api/enquiries", { method: "POST", body: JSON.stringify(input) });
}

export async function submitFeedback(input: {
  branchId?: string | null;
  orderNumber?: string | null;
  food: number;
  service: number;
  value: number;
  aspects?: string[];
  comment?: string;
  recommend?: boolean | null;
}) {
  return call("/api/feedback", { method: "POST", body: JSON.stringify(input) });
}

export async function subscribeNewsletter(
  email: string,
): Promise<{ subscribed: boolean; alreadyExisted: boolean; id: string | null }> {
  return call("/api/newsletter", { method: "POST", body: JSON.stringify({ email }) });
}

/* ------------------------------------------------------------------- admin */

export function adminHeaders(token: string): HeadersInit {
  return { "x-admin-token": token };
}

export async function fetchAdminSummary(token: string, days = 7) {
  return call(`/api/admin/summary?days=${days}`, { headers: adminHeaders(token) });
}

export async function fetchAdminOrders(token: string, status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  const r = await call<{ orders: any[] }>(`/api/orders${q}`, { headers: adminHeaders(token) });
  return r.orders;
}

export async function advanceOrderStatus(token: string, number: string) {
  return call(`/api/orders/${encodeURIComponent(number)}`, {
    method: "PATCH",
    headers: adminHeaders(token),
    body: JSON.stringify({ advance: true }),
  });
}

export async function setOrderStatus(token: string, number: string, status: string) {
  return call(`/api/orders/${encodeURIComponent(number)}`, {
    method: "PATCH",
    headers: adminHeaders(token),
    body: JSON.stringify({ status }),
  });
}

export async function confirmOrderPayment(
  token: string,
  number: string,
  settledBy?: string,
  note?: string,
) {
  return call(`/api/orders/${encodeURIComponent(number)}`, {
    method: "PATCH",
    headers: adminHeaders(token),
    body: JSON.stringify({
      confirm_payment: true,
      settled_by: settledBy,
      note,
    }),
  });
}

export async function setInventory(token: string, slug: string, patch: { inStock?: boolean; stockCount?: number }) {
  return call("/api/admin/inventory", {
    method: "PATCH",
    headers: adminHeaders(token),
    body: JSON.stringify({ slug, ...patch }),
  });
}

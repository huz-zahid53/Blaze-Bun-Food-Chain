"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  CloudOff,
  KeyRound,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  advanceOrderStatus,
  confirmOrderPayment,
  ApiError,
  fetchAdminOrders,
  fetchAdminSummary,
  isCloudEnabled,
  setInventory,
} from "@/lib/cloud";
import { cn, formatCompact, formatPKR } from "@/lib/utils";

/**
 * POS ⇄ Supabase link.
 *
 * The rest of the console renders deterministic demo data so it is useful
 * before a database exists. This panel is the real thing: it authenticates with
 * the ADMIN_TOKEN secret, pulls live orders and KPIs from Supabase, and can
 * advance order status and toggle stock — writes that land in the same tables
 * the storefront reads.
 *
 * The token is held in component state only. It is never written to
 * localStorage or a cookie, so it does not outlive the tab.
 */
export function CloudConnect() {
  const [cloudOn, setCloudOn] = useState<boolean | null>(null);
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [days, setDays] = useState(7);

  useEffect(() => {
    let alive = true;
    isCloudEnabled().then((v) => alive && setCloudOn(v));
    return () => {
      alive = false;
    };
  }, []);

  const load = useCallback(
    async (t: string, d: number) => {
      setBusy(true);
      setError(null);
      try {
        const [s, o] = await Promise.all([
          fetchAdminSummary(t, d),
          fetchAdminOrders(t),
        ]);
        setSummary(s);
        setOrders(o);
        setConnected(true);
      } catch (err) {
        setConnected(false);
        setError(
          err instanceof ApiError
            ? err.status === 401
              ? "That admin token was rejected. Check ADMIN_TOKEN in .env.local."
              : err.message
            : "Could not reach the cloud.",
        );
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  async function connect(e: React.FormEvent) {
    e.preventDefault();
    if (!token.trim()) return;
    await load(token.trim(), days);
  }

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      await load(token.trim(), days);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  /* ---------------- Not configured ---------------- */
  if (cloudOn === false) {
    return (
      <Panel tone="warn" icon={<CloudOff className="h-5 w-5" />}>
        <h3 className="t-sub uppercase tracking-wide text-charcoal">
          Cloud storage is not connected
        </h3>
        <p className="t-body mt-2 max-w-3xl text-slate-brand">
          This console is showing deterministic demo data. To run it against a
          real database, create a free Supabase project, run{" "}
          <code className="rounded bg-charcoal/6 px-1.5 py-0.5 font-mono text-[12px]">
            supabase/schema.sql
          </code>{" "}
          in the SQL editor, then set these in{" "}
          <code className="rounded bg-charcoal/6 px-1.5 py-0.5 font-mono text-[12px]">
            .env.local
          </code>
          :
        </p>
        <pre className="mt-3 overflow-x-auto rounded-2xl bg-charcoal px-4 py-3 font-mono text-[12px] leading-[1.6] text-cream/85">
{`SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_TOKEN=pick-a-long-random-secret`}
        </pre>
        <p className="t-small mt-3 text-slate-brand">
          The service-role key bypasses Row Level Security, so it must stay on
          the server. It is read only by <code className="font-mono">src/lib/db.ts</code>,
          which imports <code className="font-mono">server-only</code> — a browser
          import would fail the build.
        </p>
      </Panel>
    );
  }

  if (cloudOn === null) {
    return (
      <Panel tone="muted" icon={<Loader2 className="h-5 w-5 animate-spin" />}>
        <p className="t-body text-slate-brand">Checking cloud connection…</p>
      </Panel>
    );
  }

  /* ---------------- Connected: live data ---------------- */
  if (connected && summary) {
    const k = summary.kpi;
    return (
      <div className="space-y-4">
        <Panel tone="ok" icon={<Cloud className="h-5 w-5" />}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="t-sub flex items-center gap-2 uppercase tracking-wide text-charcoal">
                <CheckCircle2 className="h-4.5 w-4.5 text-green-600" strokeWidth={2.6} />
                Live from Supabase
              </h3>
              <p className="t-small mt-1 text-slate-brand">
                Last {summary.days} days · refreshed{" "}
                {new Date(summary.generatedAt).toLocaleTimeString("en-PK")} ·{" "}
                {orders.length} orders
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={days}
                onChange={(e) => {
                  const d = Number(e.target.value);
                  setDays(d);
                  void load(token.trim(), d);
                }}
                className="rounded-full border border-charcoal/12 bg-white px-4 py-2.5 text-[12px] font-bold text-charcoal outline-none focus:border-ember"
                aria-label="Reporting window"
              >
                {[1, 7, 14, 30, 90].map((d) => (
                  <option key={d} value={d}>
                    Last {d} day{d === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
              <button
                onClick={() => void load(token.trim(), days)}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 text-[11.5px] font-black uppercase tracking-wider text-cream transition-colors hover:bg-ember disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.8} />
                )}
                Refresh
              </button>
              <button
                onClick={() => {
                  setConnected(false);
                  setSummary(null);
                  setOrders([]);
                  setToken("");
                }}
                className="rounded-full border border-charcoal/15 px-5 py-2.5 text-[11.5px] font-black uppercase tracking-wider text-charcoal transition-colors hover:border-charcoal"
              >
                Disconnect
              </button>
            </div>
          </div>
        </Panel>

        {error && <ErrorNote message={error} />}

        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Revenue (window)" value={formatPKR(Math.round(k.revenue))} />
          <Kpi label="Orders" value={String(k.orders)} />
          <Kpi label="Average order" value={formatPKR(Math.round(k.aov))} />
          <Kpi
            label="Today"
            value={`${formatPKR(Math.round(k.today.revenue))} · ${k.today.orders} orders`}
          />
        </div>

        {/* Live orders */}
        <div className="overflow-hidden rounded-3xl border border-charcoal/8 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-charcoal/8 px-5 py-4">
            <h3 className="t-card uppercase tracking-wide text-charcoal">
              Orders from the database
            </h3>
            <span className="t-meta text-slate-brand">
              {orders.length} row{orders.length === 1 ? "" : "s"}
            </span>
          </div>

          {orders.length === 0 ? (
            <p className="t-body px-5 py-10 text-center text-slate-brand">
              No orders in this window yet. Place one from the storefront and it
              will appear here immediately.
            </p>
          ) : (
            <div className="max-h-[520px] overflow-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 z-10 bg-bone">
                  <tr className="t-meta uppercase tracking-wider text-slate-brand">
                    <th className="px-5 py-3 font-black">Order</th>
                    <th className="px-3 py-3 font-black">Customer</th>
                    <th className="px-3 py-3 font-black">Type</th>
                    <th className="px-3 py-3 font-black">Branch</th>
                    <th className="px-3 py-3 text-right font-black">Total</th>
                    <th className="px-3 py-3 font-black">Payment</th>
                    <th className="px-3 py-3 font-black">Status</th>
                    <th className="px-5 py-3 text-right font-black">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-charcoal/6">
                      <td className="px-5 py-3">
                        <p className="t-small font-black text-charcoal">{o.order_number}</p>
                        <p className="t-meta text-slate-brand">
                          {new Date(o.placed_at).toLocaleString("en-PK")}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="t-small font-semibold text-charcoal">{o.customer_name}</p>
                        <p className="t-meta text-slate-brand">{o.customer_phone}</p>
                      </td>
                      <td className="t-small px-3 py-3 capitalize text-slate-brand">
                        {o.order_type}
                      </td>
                      <td className="t-small px-3 py-3 text-slate-brand">
                        {o.branch_name ?? "—"}
                      </td>
                      <td className="t-small px-3 py-3 text-right font-black tabular-nums text-charcoal">
                        {formatPKR(Number(o.total))}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[12px] font-semibold text-charcoal truncate max-w-[130px]">
                            {o.payment_label ?? o.payment_method}
                          </span>
                          {o.payment_status === "paid" ? (
                            <span className="inline-flex items-center gap-1 w-fit rounded-full bg-fresh/15 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-green-700">
                              ✓ Paid {o.is_simulated ? "(Demo)" : ""}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 w-fit rounded-full bg-amber-500/15 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-amber-800">
                              Unpaid (Doorstep)
                            </span>
                          )}
                          {o.settled_at && (
                            <span className="text-[10px] text-slate-brand">
                              Settled by {o.settled_by ?? "staff"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-full bg-charcoal/6 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-charcoal">
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {o.payment_status === "unpaid" && o.status !== "cancelled" && (
                            <button
                              disabled={busy}
                              onClick={() =>
                                void act(() =>
                                  confirmOrderPayment(
                                    token.trim(),
                                    o.order_number,
                                    "POS Staff",
                                    "Doorstep collection confirmed by staff",
                                  ),
                                )
                              }
                              title="Confirm cash or POS payment collection"
                              className="rounded-full bg-fresh px-3 py-1.5 text-[10.5px] font-black uppercase tracking-wider text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                            >
                              Settle {o.payment_method === "cash_on_card" ? "POS" : "Cash"}
                            </button>
                          )}
                          {o.status !== "delivered" && o.status !== "cancelled" && (
                            <button
                              disabled={busy}
                              onClick={() =>
                                void act(() => advanceOrderStatus(token.trim(), o.order_number))
                              }
                              className="rounded-full bg-ember px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-white transition-colors hover:bg-charcoal disabled:opacity-50"
                            >
                              Advance
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top sellers + revenue series from real rows */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-charcoal/8 bg-white p-5">
            <h3 className="t-card uppercase tracking-wide text-charcoal">Top sellers</h3>
            <ul className="mt-4 space-y-2.5">
              {(summary.topSellers ?? []).slice(0, 6).map((s: any, i: number) => (
                <li key={s.slug} className="flex items-center gap-3">
                  <span className="t-meta grid h-6 w-6 shrink-0 place-items-center rounded-full bg-charcoal font-black text-cream">
                    {i + 1}
                  </span>
                  <span className="t-small flex-1 truncate font-semibold text-charcoal">
                    {s.name}
                  </span>
                  <span className="t-meta tabular-nums text-slate-brand">
                    {s.units} sold · {formatCompact(Math.round(s.revenue))}
                  </span>
                </li>
              ))}
              {!(summary.topSellers ?? []).length && (
                <li className="t-small text-slate-brand">No item sales in this window.</li>
              )}
            </ul>
          </div>

          <div className="rounded-3xl border border-charcoal/8 bg-white p-5">
            <h3 className="t-card uppercase tracking-wide text-charcoal">
              Revenue by day
            </h3>
            <ul className="mt-4 space-y-2">
              {(summary.daily ?? []).map((d: any) => {
                const max = Math.max(1, ...summary.daily.map((x: any) => x.revenue));
                return (
                  <li key={d.day} className="flex items-center gap-3">
                    <span className="t-meta w-20 shrink-0 tabular-nums text-slate-brand">
                      {d.day.slice(5)}
                    </span>
                    <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-charcoal/6">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-ember to-flame"
                        style={{ width: `${(d.revenue / max) * 100}%` }}
                      />
                    </span>
                    <span className="t-meta w-24 shrink-0 text-right tabular-nums font-bold text-charcoal">
                      {formatCompact(Math.round(d.revenue))}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Stock toggles write straight to the inventory table */}
        <StockGrid
          inventory={summary.inventory ?? []}
          busy={busy}
          onToggle={(slug, inStock) =>
            void act(() => setInventory(token.trim(), slug, { inStock }))
          }
        />
      </div>
    );
  }

  /* ---------------- Configured but not authenticated ---------------- */
  return (
    <Panel tone="info" icon={<KeyRound className="h-5 w-5" />}>
      <h3 className="t-sub uppercase tracking-wide text-charcoal">
        Connect the POS to Supabase
      </h3>
      <p className="t-body mt-2 max-w-2xl text-slate-brand">
        Cloud storage is configured. Enter the <code className="font-mono">ADMIN_TOKEN</code>{" "}
        from the server&rsquo;s environment to pull live orders, revenue and stock.
        Everything below stays demo data until you connect.
      </p>
      <form onSubmit={connect} className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Admin token"
          aria-label="Admin token"
          autoComplete="off"
          className="min-w-[240px] flex-1 rounded-full border border-charcoal/12 bg-white px-5 py-3 text-[13px] font-semibold text-charcoal outline-none transition-colors placeholder:text-slate-brand/50 focus:border-ember"
        />
        <button
          type="submit"
          disabled={busy || !token.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-[12px] font-black uppercase tracking-wider text-white transition-colors hover:bg-charcoal disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
          Connect
        </button>
      </form>
      {error && <ErrorNote message={error} />}
    </Panel>
  );
}

/* ------------------------------------------------------------------ pieces */

function Panel({
  tone,
  icon,
  children,
}: {
  tone: "ok" | "warn" | "info" | "muted";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border p-5 sm:p-6",
        tone === "ok" && "border-green-600/25 bg-green-600/6",
        tone === "warn" && "border-gold/40 bg-gold/10",
        tone === "info" && "border-charcoal/10 bg-white",
        tone === "muted" && "border-charcoal/8 bg-bone",
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-ember">{icon}</div>
      {children}
    </section>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2.5 rounded-2xl border border-ember/35 bg-ember/8 px-4 py-3 text-[13px] leading-[1.6] text-charcoal"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-ember" strokeWidth={2.6} />
      {message}
    </p>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-charcoal/8 bg-white p-5">
      <p className="t-meta font-black uppercase tracking-wider text-slate-brand">{label}</p>
      <p className="t-section-sm mt-2 tabular-nums text-charcoal">{value}</p>
    </div>
  );
}

function StockGrid({
  inventory,
  busy,
  onToggle,
}: {
  inventory: any[];
  busy: boolean;
  onToggle: (slug: string, inStock: boolean) => void;
}) {
  if (!inventory.length) return null;
  return (
    <div className="rounded-3xl border border-charcoal/8 bg-white p-5">
      <h3 className="t-card uppercase tracking-wide text-charcoal">
        Stock (writes to <code className="font-mono">inventory</code>)
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {inventory.map((row) => (
          <button
            key={row.item_slug}
            disabled={busy}
            onClick={() => onToggle(row.item_slug, !row.in_stock)}
            className={cn(
              "rounded-full px-4 py-2 text-[11.5px] font-black uppercase tracking-wider transition-colors disabled:opacity-50",
              row.in_stock
                ? "bg-green-600/12 text-green-700 hover:bg-green-600/20"
                : "bg-charcoal/8 text-slate-brand line-through hover:bg-charcoal/14",
            )}
          >
            {row.item_slug}
          </button>
        ))}
      </div>
    </div>
  );
}

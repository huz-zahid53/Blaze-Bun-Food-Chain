"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bike,
  Check,
  ChevronDown,
  Crosshair,
  MapPin,
  PartyPopper,
  Store,
  X,
} from "lucide-react";
import { useStore, serializeRemoteState } from "@/store/useStore";
import { branches } from "@/data/branches";
import { zonesByCity, zonesByBranch, findZone } from "@/data/zones";
import { cities as allCities, orderTypes, type OrderType } from "@/config/brand";
import { cn } from "@/lib/utils";
import { ApiError, saveGuestState } from "@/lib/cloud";
import { Logo } from "@/components/brand/Logo";
import { CityGlyph } from "@/components/ui/CityGlyph";

const typeIcon = {
  delivery: Bike,
  pickup: Store,
  catering: PartyPopper,
} as const;

/** Cities we actually have a branch in — the city picker never offers a city
 *  we can't serve. Derived from the branch data, not hardcoded. */
const serviceableCities: string[] = allCities.filter((c) =>
  branches.some((b) => b.city === c),
);

const toRadians = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in km — picks the nearest branch for geolocation. */
function distanceKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const dLat = toRadians(bLat - aLat);
  const dLng = toRadians(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(aLat)) * Math.cos(toRadians(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/**
 * Order type + location gate.
 *
 * The dialog body is a separate component so each time it opens it mounts
 * fresh, seeding its draft from the committed location — no reset effect, and
 * a half-finished selection is never left behind. Nothing is written to the
 * store until "Select", so changing city can clear an incompatible area
 * without ever having committed a mismatched location.
 */
export function OrderFlowModal() {
  const open = useStore((s) => s.locationOpen);
  const setOpen = useStore((s) => s.setLocationOpen);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Lock background scroll. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* Escape to close + keep focus inside the dialog. */
  useEffect(() => {
    if (!open) return;
    const restored = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => panelRef.current?.focus(), 0);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      restored?.focus?.();
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-charcoal/70 backdrop-blur-md"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative z-10 flex max-h-[92vh] w-full max-w-[500px] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl outline-none sm:rounded-[28px]"
          >
            <OrderFlowDialog onClose={() => setOpen(false)} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   Dialog body — remounts on every open, so its state starts
   from the currently committed location.
   ============================================================ */

function OrderFlowDialog({ onClose }: { onClose: () => void }) {
  const orderType = useStore((s) => s.orderType);
  const branchId = useStore((s) => s.branchId);
  const zoneId = useStore((s) => s.zoneId);
  const city = useStore((s) => s.city);
  const commitLocation = useStore((s) => s.commitLocation);
  const cloudMode = useStore((s) => s.cloudMode);

  const [type, setType] = useState<OrderType>(orderType);
  const [draftCity, setDraftCity] = useState(
    serviceableCities.includes(city) ? city : "",
  );
  const [draftBranch, setDraftBranch] = useState<string | null>(branchId);
  const [draftZone, setDraftZone] = useState<string | null>(zoneId);

  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const cityZones = useMemo(() => zonesByCity(draftCity), [draftCity]);
  const cityBranches = useMemo(
    () => branches.filter((b) => b.city === draftCity),
    [draftCity],
  );
  const selectedZone = findZone(draftZone);
  const isDelivery = type === "delivery";
  const selectedBranch = isDelivery
    ? branches.find((b) => b.id === selectedZone?.branchId)
    : cityBranches.find((b) => b.id === draftBranch);

  const locationReady = isDelivery ? !!selectedZone : !!selectedBranch;
  const canConfirm = !!draftCity && locationReady && !saving;

  const chooseType = useCallback((next: OrderType) => {
    setType(next);
    setSaveError(null);
    if (next !== "delivery") setDraftZone(null);
  }, []);

  const chooseCity = useCallback((next: string) => {
    setSaveError(null);
    setDraftCity(next);
    // Selections from another city are no longer valid.
    setDraftBranch(null);
    setDraftZone(null);
  }, []);

  const chooseLocation = useCallback(
    (id: string) => {
      setSaveError(null);
      if (isDelivery) {
        setDraftZone(id || null);
        setDraftBranch(findZone(id)?.branchId ?? null);
      } else {
        setDraftBranch(id || null);
        setDraftZone(null);
      }
    },
    [isDelivery],
  );

  const useCurrentLocation = useCallback(() => {
    setLocError(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocError(
        "This browser can't share your location. Please pick your city below.",
      );
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let best = branches[0];
        let bestD = Infinity;
        for (const b of branches) {
          const d = distanceKm(latitude, longitude, b.lat, b.lng);
          if (d < bestD) {
            bestD = d;
            best = b;
          }
        }
        setDraftCity(best.city);
        if (isDelivery) {
          const zone =
            zonesByBranch(best.id)[0] ?? zonesByCity(best.city)[0] ?? null;
          setDraftZone(zone?.id ?? null);
          setDraftBranch(zone?.branchId ?? best.id);
        } else {
          setDraftBranch(best.id);
          setDraftZone(null);
        }
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setLocError(
            "Location permission was denied. Please pick your city below.",
          );
        } else if (err.code === 3) {
          setLocError("Locating timed out. Please pick your city below.");
        } else {
          setLocError(
            "We couldn't determine your location. Please pick your city below.",
          );
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }, [isDelivery]);

  const confirm = useCallback(async () => {
    if (saving) return;
    if (!draftCity) {
      setSaveError("Please select a city.");
      return;
    }
    const resolvedBranch = isDelivery
      ? selectedZone?.branchId ?? null
      : draftBranch;
    if (!resolvedBranch) {
      setSaveError(
        isDelivery ? "Please select a delivery area." : "Please select a branch.",
      );
      return;
    }

    setSaving(true);
    setSaveError(null);
    commitLocation({
      orderType: type,
      city: draftCity,
      branchId: resolvedBranch,
      zoneId: isDelivery ? draftZone : null,
    });

    // With a database wired up, persist immediately so "Select" only closes
    // once the choice is genuinely stored. Without one the store is in-memory
    // and there is nothing to wait for.
    if (cloudMode === "cloud") {
      try {
        await saveGuestState(serializeRemoteState(useStore.getState()));
      } catch (err) {
        setSaving(false);
        setSaveError(
          err instanceof ApiError
            ? err.message
            : "Couldn't save your selection. Please try again.",
        );
        return;
      }
    }

    setSaving(false);
    onClose();
  }, [
    saving,
    draftCity,
    isDelivery,
    selectedZone,
    draftBranch,
    type,
    draftZone,
    commitLocation,
    cloudMode,
    onClose,
  ]);

  const segments = orderTypes.filter((t) => t.id !== "catering");

  return (
    <>
      {/* ---------------- Brand header ---------------- */}
      <div className="relative flex items-center justify-center bg-charcoal px-6 py-5">
        <Logo reverse showTagline={false} />
        <button
          onClick={onClose}
          aria-label="Close location picker"
          className="absolute right-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-ember hover:text-white"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* ---------------- Body ---------------- */}
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        <h2
          id="order-modal-title"
          className="t-section-sm text-center uppercase tracking-wide text-charcoal"
        >
          Select Your Order Type
        </h2>

        {/* Segmented control — Delivery / Pick-Up */}
        <div className="mt-4 flex justify-center">
          <div
            role="radiogroup"
            aria-label="Order type"
            className="flex rounded-full bg-charcoal/6 p-1"
          >
            {segments.map((t) => {
              const Icon = typeIcon[t.id as OrderType];
              const active = type === t.id;
              return (
                <button
                  key={t.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => chooseType(t.id as OrderType)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "ArrowRight" ||
                      e.key === "ArrowLeft" ||
                      e.key === "ArrowDown" ||
                      e.key === "ArrowUp"
                    ) {
                      e.preventDefault();
                      chooseType(type === "delivery" ? "pickup" : "delivery");
                    }
                  }}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full px-5 py-2.5 text-[12.5px] font-black uppercase tracking-wider transition-colors",
                    active ? "text-white" : "text-slate-brand hover:text-charcoal",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="modal-order-type-pill"
                      className="absolute inset-0 rounded-full bg-ember"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  <Icon className="relative h-4 w-4" strokeWidth={2.6} />
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Catering — a distinct flow, kept reachable without a third segment */}
        <div className="mt-3 text-center">
          <button
            type="button"
            aria-pressed={type === "catering"}
            onClick={() => chooseType("catering")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider transition-colors",
              type === "catering"
                ? "bg-ember/10 text-ember"
                : "text-slate-brand hover:text-charcoal",
            )}
          >
            <PartyPopper className="h-3.5 w-3.5" strokeWidth={2.6} />
            Catering order
          </button>
        </div>

        {/* ------------- Use current location ------------- */}
        <p className="mt-6 text-center text-[12.5px] font-bold text-slate-brand">
          {isDelivery
            ? "Please select your delivery location"
            : "Please select your branch"}
        </p>
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="inline-flex items-center gap-2 rounded-full border-2 border-ember/40 bg-ember/5 px-5 py-3 text-[12px] font-black uppercase tracking-wider text-ember transition-colors hover:bg-ember/10 disabled:opacity-60"
          >
            <Crosshair
              className={cn("h-4 w-4", locating && "animate-spin")}
              strokeWidth={2.8}
            />
            {locating ? "Locating…" : "Use Current Location"}
          </button>
        </div>
        <p
          aria-live="polite"
          className={cn(
            "mt-2 min-h-[1rem] text-center text-[11.5px] font-semibold",
            locError ? "text-ember" : "text-transparent",
          )}
        >
          {locError ?? "·"}
        </p>

        {/* ------------------- City ------------------- */}
        <p className="mt-3 text-center text-[12.5px] font-bold text-slate-brand">
          Please select city
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {serviceableCities.map((c) => {
            const active = draftCity === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                onClick={() => chooseCity(c)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-3.5 transition-all",
                  active
                    ? "border-ember bg-ember/6"
                    : "border-charcoal/10 hover:border-charcoal/25",
                )}
              >
                {active && (
                  <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-ember text-white">
                    <Check className="h-3 w-3" strokeWidth={3.5} />
                  </span>
                )}
                <span
                  className={cn(
                    "h-9 w-9",
                    active ? "text-ember" : "text-slate-brand",
                  )}
                >
                  <CityGlyph city={c} />
                </span>
                <span
                  className={cn(
                    "text-[12.5px] font-bold",
                    active ? "text-ember" : "text-charcoal",
                  )}
                >
                  {c}
                </span>
              </button>
            );
          })}
        </div>

        {/* ------------- Location selector ------------- */}
        <label
          htmlFor="order-location"
          className="mt-6 block text-[11px] font-black uppercase tracking-[0.18em] text-slate-brand"
        >
          {isDelivery
            ? "Please select your delivery area"
            : "Please select your branch"}
        </label>

        <div className="relative mt-2">
          <select
            id="order-location"
            value={(isDelivery ? draftZone : draftBranch) ?? ""}
            disabled={
              !draftCity ||
              (isDelivery ? cityZones.length === 0 : cityBranches.length === 0)
            }
            onChange={(e) => chooseLocation(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-2xl border border-charcoal/12 bg-white px-4 py-3.5 pr-11 text-[13.5px] font-semibold text-charcoal outline-none transition-colors focus:border-ember disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="" disabled>
              {!draftCity
                ? "Select a city first"
                : isDelivery
                  ? cityZones.length
                    ? "Choose your area"
                    : "No delivery area here yet"
                  : cityBranches.length
                    ? "Choose a branch"
                    : "No branch here yet"}
            </option>
            {isDelivery
              ? cityZones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.area}
                  </option>
                ))
              : cityBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.area}
                  </option>
                ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-brand"
            strokeWidth={2.6}
          />
        </div>

        {/* Empty states / selected detail */}
        {draftCity && isDelivery && cityZones.length === 0 && (
          <p className="mt-2 text-[12px] font-semibold text-slate-brand">
            We don&rsquo;t deliver in {draftCity} yet. Try pick-up or another
            city.
          </p>
        )}
        {draftCity && !isDelivery && cityBranches.length === 0 && (
          <p className="mt-2 text-[12px] font-semibold text-slate-brand">
            No branch in {draftCity} yet. Try another city.
          </p>
        )}

        {selectedZone && isDelivery && (
          <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-slate-brand">
            <MapPin className="h-3.5 w-3.5 text-ember" strokeWidth={2.6} />
            ~{selectedZone.eta} min · fulfilled by{" "}
            {branches.find((b) => b.id === selectedZone.branchId)?.name}
          </p>
        )}
        {selectedBranch && !isDelivery && (
          <p className="mt-2 flex items-start gap-1.5 text-[12px] font-semibold text-slate-brand">
            <MapPin
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ember"
              strokeWidth={2.6}
            />
            <span>
              {selectedBranch.address}
              <span className="mt-0.5 block text-[11px] text-slate-brand/80">
                {selectedBranch.hours} · ~{selectedBranch.eta} min
              </span>
            </span>
          </p>
        )}
      </div>

      {/* ---------------- Footer ---------------- */}
      <div className="border-t border-charcoal/8 bg-white px-5 py-4 sm:px-7">
        {saveError && (
          <p
            role="alert"
            className="mb-3 rounded-2xl border border-ember/35 bg-ember/8 px-4 py-2.5 text-[12.5px] font-semibold text-charcoal"
          >
            {saveError}
          </p>
        )}
        <button
          type="button"
          onClick={confirm}
          disabled={!canConfirm}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ember px-6 py-4 text-sm font-black uppercase tracking-wider text-white shadow-[0_12px_30px_-10px_rgba(255,77,20,0.7)] transition-all hover:bg-ember-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-charcoal/20 disabled:text-slate-brand disabled:shadow-none"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving…
            </>
          ) : (
            "Select"
          )}
        </button>
      </div>
    </>
  );
}

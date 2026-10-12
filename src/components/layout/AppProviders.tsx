"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { serializeRemoteState, useStore } from "@/store/useStore";
import {
  ApiError,
  getHealth,
  loadGuestState,
  saveGuestState,
} from "@/lib/cloud";
import { CartDrawer } from "./CartDrawer";
import { OrderFlowModal } from "./OrderFlowModal";
import { ToastHost } from "@/components/ui/Toast";
import { FloatingCart } from "@/components/ui/FloatingCart";

/** Debounce window for pushing cart changes to the cloud. */
const SAVE_DEBOUNCE_MS = 700;

/**
 * Client-side shell.
 *
 * Two jobs beyond mounting the global overlays:
 *
 * 1. LOAD — fetch durable state from Supabase *after* mount. The server and the
 *    client's first render both see the initial (empty) state, so hydration
 *    always matches; cloud data lands in a later render. Nothing is read from
 *    localStorage, and nothing is read synchronously during store creation.
 *
 * 2. SAVE — subscribe to the durable slice and push it, debounced, so a cart
 *    survives a reload or a device switch without a write per keystroke.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const setHydrated = useStore((s) => s.setHydrated);
  const setCloudMode = useStore((s) => s.setCloudMode);
  const setCloudError = useStore((s) => s.setCloudError);
  const setSyncing = useStore((s) => s.setSyncing);
  const applyRemoteState = useStore((s) => s.applyRemoteState);

  const lastSaved = useRef<string>("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelled = useRef(false);

  /* ---------------- LOAD ---------------- */
  useEffect(() => {
    cancelled.current = false;

    (async () => {
      try {
        const health = await getHealth();
        if (cancelled.current) return;

        if (!health.configured) {
          // No database: run in-memory. The storefront still works, it just
          // won't remember a cart across reloads.
          setCloudMode("local");
          setHydrated(true);
          return;
        }

        setCloudMode("cloud");
        const { state } = await loadGuestState();
        if (cancelled.current) return;
        applyRemoteState(state);
        lastSaved.current = state ? JSON.stringify(state) : "";
      } catch (err) {
        if (cancelled.current) return;
        setCloudMode("local");
        setCloudError(
          err instanceof ApiError ? err.message : "Could not reach cloud storage.",
        );
      } finally {
        if (!cancelled.current) setHydrated(true);
      }
    })();

    return () => {
      cancelled.current = true;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [applyRemoteState, setCloudError, setCloudMode, setHydrated]);

  /* ---------------- SAVE ---------------- */
  useEffect(() => {
    const unsub = useStore.subscribe((state) => {
      // Only sync once we know the cloud is available, and only after the
      // initial load has landed — otherwise the empty initial state would
      // overwrite the customer's real cart.
      if (state.cloudMode !== "cloud" || !state.hydrated) return;

      const payload = serializeRemoteState(state);
      const signature = JSON.stringify(payload);
      if (signature === lastSaved.current) return;

      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        lastSaved.current = signature;
        setSyncing(true);
        try {
          await saveGuestState(payload);
          setCloudError(null);
        } catch (err) {
          // Roll the signature back so the next change retries this state.
          lastSaved.current = "";
          setCloudError(
            err instanceof ApiError && err.isUnconfigured
              ? "Cloud storage is not configured on this server."
              : "Could not save your bucket to the cloud. It is still on this device.",
          );
        } finally {
          setSyncing(false);
        }
      }, SAVE_DEBOUNCE_MS);
    });

    return () => {
      unsub();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [setCloudError, setSyncing]);

  return (
    <>
      {children}
      <CartDrawer />
      <OrderFlowModal />
      <FloatingCart />
      <ToastHost />
    </>
  );
}

"use client";

import { useCallback, useState } from "react";
import { ApiError, isCloudEnabled } from "@/lib/cloud";

export type SubmitState = "idle" | "sending" | "sent" | "error";

export interface CloudSubmitResult {
  /** True when the record was written to Supabase. */
  stored: boolean;
  /** True when no database is configured, so nothing could be stored. */
  unconfigured: boolean;
  /** Error message when the write was attempted and failed. */
  error: string | null;
}

/**
 * Shared submit plumbing for every form on the site.
 *
 * Behaviour, deliberately:
 *  - cloud configured + write succeeds  → stored
 *  - cloud configured + write fails     → error, the form stays filled so the
 *                                         visitor can retry (never silently
 *                                         pretend a message was delivered)
 *  - cloud not configured               → "demo" success, flagged as
 *                                         unconfigured so the UI can say so
 *
 * The simulated delay is kept only for the unconfigured path, so the demo still
 * feels like a real submission.
 */
export function useCloudSubmit() {
  const [state, setState] = useState<SubmitState>("idle");
  const [note, setNote] = useState<string | null>(null);

  const run = useCallback(
    async (
      task: () => Promise<unknown>,
      opts: { demoDelayMs?: number } = {},
    ): Promise<CloudSubmitResult> => {
      setState("sending");
      setNote(null);

      const cloud = await isCloudEnabled();

      if (!cloud) {
        await new Promise((r) => setTimeout(r, opts.demoDelayMs ?? 800));
        setState("sent");
        return { stored: false, unconfigured: true, error: null };
      }

      try {
        await task();
        setState("sent");
        return { stored: true, unconfigured: false, error: null };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Something went wrong while sending. Please try again.";
        setState("error");
        setNote(message);
        return { stored: false, unconfigured: false, error: message };
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState("idle");
    setNote(null);
  }, []);

  return { state, note, run, reset, setState, setNote };
}

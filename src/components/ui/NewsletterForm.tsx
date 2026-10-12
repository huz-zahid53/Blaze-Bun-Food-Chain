"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { cn, isValidEmail } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { ApiError, isCloudEnabled, subscribeNewsletter } from "@/lib/cloud";

interface Props {
  className?: string;
  dark?: boolean;
  placeholder?: string;
  buttonLabel?: string;
  source?: string;
}

/** Newsletter / promo signup form (client-side only — swap for your ESP). */
export function NewsletterForm({
  className,
  dark,
  placeholder = "you@email.com",
  buttonLabel = "Join",
  source = "footer",
}: Props) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const push = useToast((s) => s.push);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      push({ message: "Please enter a valid email address.", tone: "error" });
      return;
    }
    setState("loading");

    const cloud = await isCloudEnabled();
    if (cloud) {
      try {
        const res = await subscribeNewsletter(email);
        if (!res.alreadyExisted) {
          push({
            message: `You're on the list. Watch your inbox, ${
              source === "footer" ? "friend" : "chef"
            }.`,
            tone: "success",
          });
        } else {
          push({ message: "That email is already on the list.", tone: "info" });
        }
      } catch (err) {
        setState("idle");
        push({
          message:
            err instanceof ApiError
              ? err.message
              : "Could not sign you up just now. Please try again.",
          tone: "error",
        });
        return; // keep the email so they can retry
      }
    } else {
      // No database configured — keep the demo beat and be honest about it.
      await new Promise((r) => setTimeout(r, 700));
      push({
        message:
          "Demo mode: sign-up was not stored because cloud storage is not configured.",
        tone: "info",
      });
    }

    setState("done");
    setEmail("");
    setTimeout(() => setState("idle"), 2200);
  }

  if (state === "done") {
    return (
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-full px-5 py-3.5 text-[13.5px] font-bold",
          dark ? "bg-fresh/15 text-green-300" : "bg-fresh/12 text-green-800",
          className,
        )}
      >
        <Check className="h-4.5 w-4.5" strokeWidth={3} />
        You're subscribed. Check your inbox.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={cn("flex w-full gap-2", className)}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        aria-label="Email address"
        className={cn(
          "flex-1 rounded-full border px-5 py-3.5 text-[14px] outline-none transition-colors",
          dark
            ? "border-cream/15 bg-cream/5 text-cream placeholder:text-cream/35 focus:border-ember"
            : "border-charcoal/12 bg-white text-charcoal placeholder:text-slate-brand/60 focus:border-ember",
        )}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-ember px-7 py-3.5 text-[12px] font-black uppercase tracking-wider text-white transition-all hover:bg-ember-dark active:scale-95 disabled:opacity-70"
      >
        {state === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {buttonLabel}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
              strokeWidth={3}
            />
          </>
        )}
      </button>
    </form>
  );
}

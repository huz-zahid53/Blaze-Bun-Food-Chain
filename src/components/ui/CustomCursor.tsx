"use client";

import { useEffect, useRef } from "react";

type CursorState =
  | "default"
  | "interactive"
  | "food"
  | "cart"
  | "disabled"
  | "text";

/**
 * Editable fields keep the browser's native caret so typing, selection and
 * drag-select behave exactly as they did before. Checkboxes, radios, ranges
 * and buttons inherit the custom cursor.
 */
const EDITABLE_SELECTOR = [
  'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):not([type="file"]):not([type="image"])',
  "textarea",
  '[contenteditable="true"]',
  '[contenteditable=""]',
].join(",");

const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  '[role="button"]',
  '[role="link"]',
  '[role="radio"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="option"]',
  "summary",
  "select",
  "label[for]",
  '[data-cursor="interactive"]',
].join(",");

const DISABLED_SELECTOR =
  ':disabled, [aria-disabled="true"], [data-cursor="disabled"]';
const FOOD_SELECTOR = '[data-cursor="food"]';
const CART_SELECTOR = '[data-cursor="cart"]';

/** Work out which cursor treatment a hit-tested element should receive. */
function classifyCursor(target: EventTarget | null): CursorState {
  if (!(target instanceof Element)) return "default";

  if (target.closest(DISABLED_SELECTOR)) return "disabled";
  if (target.closest(EDITABLE_SELECTOR)) return "text";
  if (target.closest(CART_SELECTOR)) return "cart";

  const food = target.closest(FOOD_SELECTOR);
  const interactive = target.closest(INTERACTIVE_SELECTOR);

  /*
   * A food card can itself be a link (deal tiles) or contain links/buttons
   * (menu cards). The element that is lower in the tree wins, so a wishlist
   * button inside a food card reads as interactive while the card body reads
   * as food.
   */
  if (food && (!interactive || interactive === food || !food.contains(interactive))) {
    return "food";
  }
  if (interactive) return "interactive";
  if (food) return "food";

  return "default";
}

/** Crisp 22px burger built from the existing charcoal / cream / gold palette. */
function BurgerCursorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="block h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      {/* top bun */}
      <path
        d="M3.4 9.2C3.4 5.6 7.2 3.1 12 3.1s8.6 2.5 8.6 6.1c0 .7-.5 1.2-1.2 1.2H4.6c-.7 0-1.2-.5-1.2-1.2Z"
        fill="var(--color-bone)"
        stroke="var(--color-charcoal)"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      {/* sesame seeds */}
      <g fill="var(--color-gold)">
        <ellipse cx="8.9" cy="6.5" rx="1.15" ry=".62" transform="rotate(-18 8.9 6.5)" />
        <ellipse cx="12" cy="5.8" rx="1.15" ry=".62" />
        <ellipse cx="15.1" cy="6.5" rx="1.15" ry=".62" transform="rotate(18 15.1 6.5)" />
      </g>
      {/* melted cheese */}
      <path
        d="M3.6 10.4h16.8l-1.4 2.8-2-1.2-2 1.1-2-1.1-2 1.1-2-1.1-2 1.1-1.4-2.7Z"
        fill="var(--color-gold)"
        stroke="var(--color-charcoal)"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      {/* patty */}
      <rect
        x="4.3"
        y="13.2"
        width="15.4"
        height="3.2"
        rx="1.6"
        fill="#4a2b1b"
        stroke="var(--color-charcoal)"
        strokeWidth="1.15"
      />
      {/* bottom bun */}
      <path
        d="M4.3 16.4h15.4v1.5c0 1.6-1.3 2.9-2.9 2.9H7.2c-1.6 0-2.9-1.3-2.9-2.9v-1.5Z"
        fill="var(--color-bone)"
        stroke="var(--color-charcoal)"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusBadge() {
  return (
    <svg viewBox="0 0 10 10" className="h-2 w-2" aria-hidden="true" focusable="false">
      <path
        d="M5 1.6v6.8M1.6 5h6.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Site-wide custom cursor.
 *
 * All movement happens on `requestAnimationFrame` and writes CSS variables,
 * so mouse movement never triggers a React render. The component renders
 * identical markup on the server and client and only opts in after mount, on
 * a fine pointer, with motion enabled.
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const ring = ringRef.current;
    const icon = iconRef.current;
    if (!root || !ring || !icon) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    const documentElement = document.documentElement;
    documentElement.classList.add("bb-cursor-enabled");

    let pointerX = -100;
    let pointerY = -100;
    let iconX = -100;
    let iconY = -100;
    let ringX = -100;
    let ringY = -100;
    let isVisible = false;
    let lastTarget: EventTarget | null = null;
    let frame = 0;
    let clickedTimer: ReturnType<typeof setTimeout> | undefined;

    const setState = (next: CursorState) => {
      if (root.dataset.state !== next) root.dataset.state = next;
    };

    const show = () => {
      if (isVisible) return;
      isVisible = true;
      root.dataset.visible = "true";
    };

    const hide = () => {
      if (!isVisible) return;
      isVisible = false;
      root.dataset.visible = "false";
    };

    const isMouseLike = (event: PointerEvent) => event.pointerType !== "touch";

    const onMove = (event: PointerEvent) => {
      if (!isMouseLike(event)) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      show();
      if (event.target !== lastTarget) {
        lastTarget = event.target;
        setState(classifyCursor(event.target));
      }
    };

    const onOver = (event: PointerEvent) => {
      if (!isMouseLike(event)) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      lastTarget = event.target;
      setState(classifyCursor(event.target));
      show();
    };

    const onDown = (event: PointerEvent) => {
      if (!isMouseLike(event)) return;

      const next = classifyCursor(event.target);
      if (next === "disabled") return;
      root.dataset.pressed = "true";

      if (next === "cart") {
        root.dataset.clicked = "true";
        if (clickedTimer) clearTimeout(clickedTimer);
        clickedTimer = setTimeout(() => {
          delete root.dataset.clicked;
        }, 420);
      }
    };

    const onUp = () => {
      root.dataset.pressed = "false";
    };

    const onOut = (event: PointerEvent) => {
      if (!isMouseLike(event)) return;
      if (!event.relatedTarget) hide();
    };

    const onScroll = () => {
      if (!isVisible) return;
      const underPointer = document.elementFromPoint(pointerX, pointerY);
      if (underPointer) {
        lastTarget = underPointer;
        setState(classifyCursor(underPointer));
      }
    };

    const tick = () => {
      // The burger chases the pointer quickly; the ring trails a little.
      iconX += (pointerX - iconX) * 0.55;
      iconY += (pointerY - iconY) * 0.55;
      ringX += (pointerX - ringX) * 0.2;
      ringY += (pointerY - ringY) * 0.2;

      icon.style.setProperty("--cursor-x", `${iconX}px`);
      icon.style.setProperty("--cursor-y", `${iconY}px`);
      ring.style.setProperty("--cursor-x", `${ringX}px`);
      ring.style.setProperty("--cursor-y", `${ringY}px`);

      frame = requestAnimationFrame(tick);
    };

    root.dataset.state = "default";
    root.dataset.visible = "false";
    root.dataset.pressed = "false";
    frame = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("blur", hide);
    document.addEventListener("pointerout", onOut, { passive: true });
    document.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    documentElement.addEventListener("mouseleave", hide);

    return () => {
      cancelAnimationFrame(frame);
      if (clickedTimer) clearTimeout(clickedTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", hide);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("scroll", onScroll, true);
      documentElement.removeEventListener("mouseleave", hide);
      documentElement.classList.remove("bb-cursor-enabled");
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="bb-cursor"
      data-state="default"
      data-visible="false"
      aria-hidden="true"
    >
      <div ref={ringRef} className="bb-cursor__ring">
        <span className="bb-cursor__ring-inner" />
      </div>
      <div ref={iconRef} className="bb-cursor__icon">
        <span className="bb-cursor__icon-inner">
          <BurgerCursorIcon />
          <span className="bb-cursor__label">YUM!</span>
          <span className="bb-cursor__badge">
            <PlusBadge />
          </span>
        </span>
      </div>
    </div>
  );
}

"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "scale" | "none";

const offsets: Record<Direction, { x: number; y: number; scale?: number }> = {
  up: { x: 0, y: 34 },
  down: { x: 0, y: -34 },
  left: { x: 34, y: 0 },
  right: { x: -34, y: 0 },
  scale: { x: 0, y: 18, scale: 0.94 },
  none: { x: 0, y: 0 },
};

interface RevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: Direction;
  className?: string;
  once?: boolean;
  amount?: number;
}

/** Scroll-triggered entrance animation. */
export function Reveal({
  children,
  delay = 0,
  duration = 0.65,
  direction = "up",
  className,
  once = true,
  amount = 0.2,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount });
  const o = offsets[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: o.x, y: o.y, scale: o.scale ?? 1 }}
      animate={
        inView
          ? { opacity: 1, x: 0, y: 0, scale: 1 }
          : { opacity: 0, x: o.x, y: o.y, scale: o.scale ?? 1 }
      }
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container — pair with `StaggerItem`. */
export function Stagger({
  children,
  className,
  stagger = 0.07,
  delay = 0,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
}) {
  const o = offsets[direction];
  const item: Variants = {
    hidden: { opacity: 0, x: o.x, y: o.y, scale: o.scale ?? 1 },
    show: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Floating3DElementProps {
  src: string;
  alt: string;
  size?: number; // width & height in px (e.g. 240, 320, 420)
  className?: string;
  glow?: "flame" | "ember" | "gold" | "indigo" | "none";
  delay?: number;
  duration?: number;
  rotate?: number;
  opacity?: number;
  priority?: boolean;
}

const glowStyles: Record<string, string> = {
  flame: "drop-shadow-[0_12px_36px_rgba(255,138,0,0.35)]",
  ember: "drop-shadow-[0_12px_36px_rgba(255,77,20,0.4)]",
  gold: "drop-shadow-[0_12px_36px_rgba(255,194,75,0.35)]",
  indigo: "drop-shadow-[0_12px_36px_rgba(99,102,241,0.45)]",
  none: "drop-shadow-[0_14px_30px_rgba(0,0,0,0.4)]",
};

/**
 * 21st.dev inspired Floating 3D Element.
 * Renders an isolated 3D food asset with smooth floating physics,
 * luminous rim aura, and subtle rotation.
 */
export function Floating3DElement({
  src,
  alt,
  size = 320,
  className,
  glow = "ember",
  delay = 0,
  duration = 6,
  rotate = 6,
  opacity = 0.85,
  priority = false,
}: Floating3DElementProps) {
  return (
    <motion.div
      className={cn("pointer-events-none select-none", className)}
      initial={{ opacity: 0, scale: 0.9, y: 15 }}
      animate={{
        opacity,
        scale: 1,
        y: [-10, 10, -10],
        rotate: [-rotate / 2, rotate / 2, -rotate / 2],
      }}
      transition={{
        opacity: { duration: 0.8, ease: "easeOut" },
        scale: { duration: 0.8, ease: "easeOut" },
        y: {
          duration,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          delay,
        },
        rotate: {
          duration: duration * 1.35,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          delay,
        },
      }}
      aria-hidden="true"
    >
      <div className={cn("relative transition-transform", glowStyles[glow])}>
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          priority={priority}
          className="h-auto w-full object-contain filter"
        />
      </div>
    </motion.div>
  );
}

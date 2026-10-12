"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/** Thin ember bar tracking scroll depth on article pages. */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      className="fixed left-0 top-0 z-[130] h-1 origin-left bg-gradient-to-r from-ember to-flame"
      style={{ width: "100%", scaleX: progress / 100 }}
      aria-hidden
    />
  );
}

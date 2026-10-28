"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import { useLenis } from "lenis/react";
import { Logo } from "@/components/brand/Logo";

const KEY = "dudes-intro";

/** Brand intro shown once per browser session. */
export function Preloader() {
  const [visible, setVisible] = useState(true);
  const progress = useMotionValue(0);
  const counter = useTransform(progress, (v) => String(Math.round(v)).padStart(3, "0"));
  const clip = useTransform(progress, (v) => `inset(${100 - v}% 0 0 0)`);
  const bar = useTransform(progress, [0, 100], [0, 1]);
  const lenis = useLenis();

  useEffect(() => {
    let seen = false;
    try {
      seen = Boolean(sessionStorage.getItem(KEY));
    } catch {}
    if (seen) {
      setVisible(false);
      return;
    }
    lenis?.stop();
    const controls = animate(progress, 100, {
      duration: 1.1,
      ease: [0.65, 0, 0.35, 1],
      onComplete: () => {
        try {
          sessionStorage.setItem(KEY, "1");
        } catch {}
        setTimeout(() => setVisible(false), 80);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!visible) {
      lenis?.start();
      document.documentElement.classList.add("intro-done");
    }
  }, [visible, lenis]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="preloader fixed inset-0 z-[100] flex items-center justify-center bg-ink"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="relative h-40 w-[5.6rem] md:h-56 md:w-32">
            <Logo variant="mark" tone="current" className="absolute inset-0 h-full w-full text-bone/[0.07]" />
            <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
              <Logo variant="mark" className="h-full w-full" />
            </motion.div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 md:p-10">
            <p className="eyebrow text-bone/40">Fashion Redefined — Est. 1991</p>
            <motion.p className="font-display text-5xl leading-none text-bone md:text-6xl">{counter}</motion.p>
          </div>
          <motion.div className="bg-fire-x absolute inset-x-0 bottom-0 h-1 origin-left" style={{ scaleX: bar }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

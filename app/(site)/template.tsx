"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Logo } from "@/components/brand/Logo";

let firstMount = true;

/** Page transition: a curtain wipes away and the page rises in. */
export default function Template({ children }: { children: React.ReactNode }) {
  const [animateCurtain] = useState(() => !firstMount);
  useEffect(() => {
    firstMount = false;
  }, []);

  return (
    <>
      {animateCurtain && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-coal"
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          animate={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
            <Logo variant="mark" className="h-24 w-auto" />
          </motion.div>
          <div className="bg-fire-x absolute inset-x-0 bottom-0 h-1" />
        </motion.div>
      )}
      <motion.div
        initial={animateCurtain ? { opacity: 0, y: 24 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}

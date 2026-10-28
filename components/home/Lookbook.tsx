"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { SplitReveal } from "@/components/ui/Reveal";

export function Lookbook() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["18%", "-18%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.25, 1]);
  const x = useTransform(scrollYProgress, [0, 1], ["10%", "-25%"]);

  return (
    <section ref={ref} className="relative overflow-hidden py-24 md:py-40">
      <motion.p
        aria-hidden
        style={{ x }}
        className="text-outline pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 font-display text-[18vw] leading-none whitespace-nowrap uppercase"
      >
        Fashion Redefined
      </motion.p>

      <div className="container-x relative grid items-center gap-10 md:grid-cols-12">
        <div className="relative aspect-square overflow-hidden md:col-span-7">
          <motion.div style={{ y: y1, scale }} className="absolute inset-[-12%]">
            <Image src="/brand/logo-black-fabric.jpg" alt="Dudes logo printed on black fabric" fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
          </motion.div>
        </div>

        <div className="md:col-span-5 md:pl-6">
          <p className="eyebrow flex items-center gap-3 text-ember">
            <span className="h-px w-8 bg-ember" /> The Look
          </p>
          <SplitReveal as="h2" text="Built loud. Worn louder." className="mt-4 block font-display text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] uppercase" />
          <p className="mt-6 max-w-md text-bone/60">
            White on black. Black on white. Every graphic is designed in-house and printed to stand out — no
            basics, no blending in.
          </p>
          <div className="relative mt-10 aspect-[16/10] w-full overflow-hidden md:w-[85%]">
            <motion.div style={{ y: y2 }} className="absolute inset-[-18%]">
              <Image src="/brand/logo-red-fabric.jpg" alt="Dudes logo embroidered on fabric" fill sizes="(min-width: 768px) 35vw, 100vw" className="object-cover" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

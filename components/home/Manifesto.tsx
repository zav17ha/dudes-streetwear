"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Logo } from "@/components/brand/Logo";

const WORDS = "We aren't just dropping fits, we're buildin' the biggest community.".split(" ");
const HOT = new Set(["fits,", "biggest", "community."]);

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [12, 0]);
  return (
    <span className="relative mr-[0.22em] inline-block">
      <motion.span style={{ opacity, y }} className={`inline-block ${HOT.has(word) ? "text-fire" : ""}`}>
        {word}
      </motion.span>
    </span>
  );
}

export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.6"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-25, 25]);

  return (
    <section ref={ref} className="relative overflow-hidden border-y border-bone/10 bg-coal py-24 md:py-32">
      <motion.div style={{ rotate }} aria-hidden className="pointer-events-none absolute -top-10 -right-24 h-[120%] w-auto opacity-[0.05] md:-right-10">
        <Logo variant="mark" tone="current" className="h-full w-auto text-bone" title="" />
      </motion.div>
      <div className="container-x relative">
        <p className="eyebrow mb-10 flex items-center gap-3 text-ember">
          <span className="h-px w-8 bg-ember" /> The Manifesto
        </p>
        <p className="max-w-[20ch] font-display text-[clamp(2.25rem,5.5vw,5rem)] leading-[0.95] uppercase">
          {WORDS.map((w, i) => {
            const start = i / WORDS.length;
            return <Word key={i} word={w} progress={scrollYProgress} range={[start, start + 1 / WORDS.length]} />;
          })}
        </p>
        <div className="mt-14 grid gap-8 md:ml-auto md:max-w-2xl md:grid-cols-2">
          <p className="text-bone/60">
            Dudes started as a crew with a vision: streetwear that hits as hard as the culture it comes from. Every
            drop is designed loud, made to last and built for the people who wear it.
          </p>
          <p className="text-bone/60">
            From Bandaragama to wherever you&apos;re reppin&apos; — when you wear Dudes, you&apos;re not a customer,
            you&apos;re part of the crew.
          </p>
        </div>
      </div>
    </section>
  );
}

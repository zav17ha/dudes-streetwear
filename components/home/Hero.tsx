"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { Marquee } from "@/components/ui/Marquee";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Embers } from "./Embers";
import { site } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [delay, setDelay] = useState<number | null>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = Boolean(sessionStorage.getItem("dudes-intro"));
    } catch {}
    setDelay(seen ? 0.1 : 1.55);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const logoScale = useTransform(scrollYProgress, [0, 1], [1, 0.75]);
  const logoY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Mouse parallax
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 20 });
  const bgX = useSpring(useTransform(mx, [-0.5, 0.5], [30, -30]), { stiffness: 80, damping: 20 });

  const d = delay ?? 0;
  const ready = delay !== null;

  return (
    <section
      ref={ref}
      className="grain relative flex min-h-[100svh] flex-col overflow-hidden"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
    >
      {/* Glow + sparks */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[-20%] bottom-[-35%] h-[85%] bg-[radial-gradient(closest-side,rgba(150,120,240,0.16),rgba(150,120,240,0.05)_50%,transparent_78%)]"
      />
      <Embers className="pointer-events-none absolute inset-0 h-full w-full" density={0.9} />

      {/* Giant outlined type behind */}
      <motion.div aria-hidden style={{ x: bgX }} className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-2 opacity-60">
        <Marquee speed={30} className="font-display text-[18vw] leading-[0.85] uppercase md:text-[12vw]">
          <span className="text-outline pr-[4vw]">Streetwear</span>
          <span className="text-outline pr-[4vw]">Streetwear</span>
        </Marquee>
        <Marquee speed={30} reverse className="font-display text-[18vw] leading-[0.85] uppercase md:text-[12vw]">
          <span className="text-outline pr-[4vw]">Community</span>
          <span className="text-outline pr-[4vw]">Community</span>
        </Marquee>
      </motion.div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--color-ink)_85%)]" aria-hidden />

      <motion.div style={{ opacity: fade }} className="container-x relative z-10 flex flex-1 flex-col items-center justify-center pt-32 pb-16 text-center md:pt-36">
        <motion.p
          className="eyebrow flex items-center gap-3 text-bone/70"
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: d, ease }}
        >
          <span className="hidden h-px w-8 bg-ember sm:block" /> {site.claim} <span className="hidden h-px w-8 bg-ember sm:block" />
        </motion.p>

        <motion.div style={{ scale: logoScale, y: logoY, rotateX: rx, rotateY: ry, transformPerspective: 1200 }} className="mt-6 w-[min(80vw,620px,calc((100svh-400px)*1.59))] will-change-transform md:mt-8">
          <motion.div
            initial={{ opacity: 0, scale: 1.12 }}
            animate={ready ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 1.1, delay: d + 0.05, ease }}
          >
            <Logo variant="full" className="h-auto w-full" title="Dudes 1991 — Fashion Redefined" />
          </motion.div>
        </motion.div>

        <motion.p
          className="mt-8 max-w-lg text-balance text-sm text-bone/70 md:text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: d + 0.35, ease }}
        >
          We aren&apos;t just dropping fits — we&apos;re buildin&apos; the <span className="text-bone">biggest community</span> in Sri Lankan streetwear.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: d + 0.5, ease }}
        >
          <Magnetic>
            <ButtonLink href="/shop">
              Shop the drop <ArrowUpRight className="h-4 w-4" />
            </ButtonLink>
          </Magnetic>
          <Magnetic>
            <ButtonLink href={whatsappLink("Hey DUDES! 👋")} external variant="ghost">
              <WhatsAppIcon className="h-4 w-4" /> Order on WhatsApp
            </ButtonLink>
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.div
        className="container-x relative z-10 flex items-end justify-between pb-6 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-bone/45"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : undefined}
        transition={{ duration: 0.8, delay: d + 0.7 }}
      >
        <span className="hidden sm:block">
          {site.address.city}, {site.address.country}
        </span>
        <span className="flex items-center gap-2">
          Scroll
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <ArrowDown className="h-3.5 w-3.5" />
          </motion.span>
        </span>
        <span className="hidden sm:block">Est. {site.established}</span>
      </motion.div>
    </section>
  );
}

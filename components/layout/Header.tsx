"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ShoppingBag } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { InstagramIcon } from "@/components/ui/Icons";
import { Marquee } from "@/components/ui/Marquee";
import { useCart } from "@/components/providers/CartProvider";
import { MobileMenu } from "./MobileMenu";
import { nav, site } from "@/lib/site";
import { cn } from "@/lib/format";

const ticker = [
  "Order via WhatsApp",
  site.phoneDisplay,
  site.claim,
  "Fashion Redefined",
  "Made for the streets",
];

export function Header() {
  const pathname = usePathname();
  const { count, open } = useCart();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 220 && y > prev && !menuOpen);
  });

  useEffect(() => setMenuOpen(false), [pathname]);

  // Expose the visible header height so sticky bars can sit right below it
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => root.style.setProperty("--header-offset", hidden ? "0px" : `${headerRef.current?.offsetHeight ?? 0}px`);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [hidden]);

  return (
    <>
      <motion.header
        ref={headerRef}
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="bg-fire-x text-ink">
          <Marquee speed={40} className="py-1.5">
            {[0, 1, 2].map((k) =>
              ticker.map((t) => (
                <span key={`${k}-${t}`} className="flex items-center gap-6 pr-6 font-mono text-[0.66rem] font-bold uppercase tracking-[0.22em]">
                  {t}
                  <span aria-hidden>✦</span>
                </span>
              )),
            )}
          </Marquee>
        </div>

        <div
          className={cn(
            "transition-[background-color,border-color,backdrop-filter] duration-500",
            scrolled || menuOpen ? "border-b border-bone/10 bg-ink/95" : "border-b border-transparent",
          )}
        >
          <div className="container-x flex h-16 items-center justify-between md:h-20">
            <Link href="/" className="group flex items-center gap-3" aria-label="Dudes Streetwear — home">
              <Logo variant="mark" className="h-9 w-auto transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 md:h-11" />
              <span className="font-display text-xl tracking-[0.08em] uppercase md:text-2xl">
                Dudes<span className="text-fire-x">.</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-10 md:flex" aria-label="Main">
              {nav.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} className="group relative overflow-hidden py-1 font-mono text-xs uppercase tracking-[0.2em]">
                    <span className={cn("block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-full", active ? "text-bone" : "text-bone/65")}>
                      {item.label}
                    </span>
                    <span aria-hidden className="text-fire-x absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0">
                      {item.label}
                    </span>
                    {active && <motion.span layoutId="nav-active" className="bg-fire-x absolute inset-x-0 bottom-0 h-px" />}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1 md:gap-3">
              <a
                href={site.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hidden h-11 w-11 items-center justify-center text-bone/70 transition-colors hover:text-bone sm:flex"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <button
                onClick={open}
                className="relative flex h-11 items-center gap-2 px-2 font-mono text-xs uppercase tracking-[0.2em] text-bone/80 transition-colors hover:text-bone"
                aria-label={`Open bag (${count} items)`}
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
                <span className="hidden sm:inline">Bag</span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={count}
                    initial={{ y: -12, opacity: 0, scale: 0.6 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 12, opacity: 0 }}
                    className={cn(
                      "grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.65rem] font-bold",
                      count ? "bg-fire-x text-ink" : "bg-bone/10 text-bone/60",
                    )}
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </button>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="relative flex h-11 w-11 flex-col items-center justify-center gap-[6px] md:hidden"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
              >
                <motion.span animate={menuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }} className="block h-[2px] w-6 bg-bone" />
                <motion.span animate={menuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }} className="block h-[2px] w-6 bg-bone" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

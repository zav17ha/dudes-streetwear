"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect } from "react";
import { nav, site } from "@/lib/site";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { whatsappLink } from "@/lib/whatsapp";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lenis = useLenis();
  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open, lenis]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex flex-col bg-ink pt-32 md:hidden"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <nav className="container-x flex flex-col" aria-label="Mobile">
            {nav.map((item, i) => (
              <div key={item.href} className="overflow-hidden border-b border-bone/10">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={item.href} onClick={onClose} className="flex items-baseline justify-between py-3 font-display text-5xl uppercase">
                    {item.label}
                    <span className="font-mono text-xs text-bone/40">0{i + 1}</span>
                  </Link>
                </motion.div>
              </div>
            ))}
          </nav>

          <motion.div
            className="container-x mt-auto flex items-center justify-between pb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em]">
              <WhatsAppIcon className="h-5 w-5 text-whatsapp" />
              {site.phoneDisplay}
            </a>
            <div className="flex gap-4">
              <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href={site.socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookIcon className="h-5 w-5" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

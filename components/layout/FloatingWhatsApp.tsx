"use client";

import { motion } from "motion/react";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { whatsappLink } from "@/lib/whatsapp";

export function FloatingWhatsApp() {
  return (
    <motion.a
      href={whatsappLink("Hey DUDES! 👋 I have a question.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Dudes Streetwear on WhatsApp"
      className="group fixed right-4 bottom-4 z-30 flex h-14 items-center gap-0 overflow-hidden rounded-full bg-whatsapp pr-4 pl-4 text-ink shadow-[0_10px_40px_-12px_rgba(190,170,255,0.4)] md:right-8 md:bottom-8"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.8, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-whatsapp opacity-20 [animation-duration:2.4s]" aria-hidden />
      <WhatsAppIcon className="relative h-6 w-6" />
      <span className="relative max-w-0 overflow-hidden font-mono text-xs font-bold whitespace-nowrap uppercase tracking-[0.16em] transition-[max-width,margin] duration-500 group-hover:ml-3 group-hover:max-w-40">
        Chat with us
      </span>
    </motion.a>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { Minus, Plus, X, ChevronDown } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { ProductImage } from "@/components/shop/ProductImage";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Button, ButtonLink } from "@/components/ui/Button";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const { items, isOpen, close, setQty, remove, subtotal, count, customer, setCustomer } = useCart();
  const lenis = useLenis();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) lenis?.stop();
    else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, lenis, close]);

  const sendOrder = () => {
    const message = buildOrderMessage(items, customer, window.location.origin);
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Your bag">
          <motion.button
            aria-label="Close bag"
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col border-l border-bone/10 bg-coal"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="flex items-center justify-between border-b border-bone/10 px-6 py-5">
              <h2 className="font-display text-2xl uppercase">
                Your Bag <span className="text-fire-x">({count})</span>
              </h2>
              <button onClick={close} className="grid h-10 w-10 place-items-center text-bone/70 transition hover:rotate-90 hover:text-bone" aria-label="Close">
                <X className="h-6 w-6" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
                <p className="font-display text-4xl uppercase text-bone/15">Empty</p>
                <p className="max-w-xs text-sm text-bone/60">Your bag is waiting for its first fit. Go cop something loud.</p>
                <ButtonLink href="/shop" onClick={close}>
                  Shop the drop
                </ButtonLink>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6" data-lenis-prevent>
                  <ul>
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <motion.li
                          key={item.key}
                          layout
                          initial={{ opacity: 0, x: 40 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 40, height: 0, paddingTop: 0, paddingBottom: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="flex gap-4 overflow-hidden border-b border-bone/10 py-5"
                        >
                          <Link href={`/product/${item.slug}`} onClick={close} className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-smoke">
                            <ProductImage src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <Link href={`/product/${item.slug}`} onClick={close} className="font-display text-lg leading-tight uppercase hover:text-ember">
                                {item.name}
                              </Link>
                              <button onClick={() => remove(item.key)} className="text-bone/40 hover:text-blood" aria-label={`Remove ${item.name}`}>
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-bone/50">
                              {[item.size, item.color].filter(Boolean).join(" / ")}
                            </p>
                            <div className="mt-auto flex items-center justify-between pt-3">
                              <div className="flex items-center border border-bone/15">
                                <button className="grid h-8 w-8 place-items-center hover:bg-bone/10" onClick={() => setQty(item.key, item.qty - 1)} aria-label="Decrease quantity">
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-8 text-center font-mono text-sm">{item.qty}</span>
                                <button className="grid h-8 w-8 place-items-center hover:bg-bone/10" onClick={() => setQty(item.key, item.qty + 1)} aria-label="Increase quantity">
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <span className="font-mono text-sm">{formatPrice(item.price * item.qty)}</span>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>

                  <div className="py-5">
                    <button
                      onClick={() => setShowDetails((v) => !v)}
                      className="flex w-full items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-bone/70 hover:text-bone"
                      aria-expanded={showDetails}
                    >
                      Delivery details <span className="text-bone/40 normal-case tracking-normal">(optional, speeds things up)</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {showDetails && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid gap-3 pt-4">
                            <input className="field" placeholder="Your name" value={customer.name ?? ""} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} autoComplete="name" />
                            <input className="field" placeholder="Phone number" value={customer.phone ?? ""} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} autoComplete="tel" inputMode="tel" />
                            <textarea className="field min-h-20 resize-none" placeholder="Delivery address & city" value={customer.address ?? ""} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} autoComplete="street-address" />
                            <input className="field" placeholder="Note (optional)" value={customer.note ?? ""} onChange={(e) => setCustomer({ ...customer, note: e.target.value })} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="border-t border-bone/10 bg-ink/40 px-6 pt-5 pb-6">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-bone/60">Subtotal</span>
                    <span className="font-display text-2xl">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-bone/45">Delivery & payment are confirmed with you on WhatsApp.</p>
                  <Button variant="whatsapp" className="mt-5 w-full" onClick={sendOrder}>
                    <WhatsAppIcon className="h-5 w-5" /> Order on WhatsApp
                  </Button>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

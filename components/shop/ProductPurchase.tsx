"use client";

import { useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { Check, Minus, Plus, ChevronDown } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/components/providers/CartProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Badges, Price } from "./ProductCard";
import { buildEnquiryMessage, buildOrderMessage, whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/format";

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-bone/10">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between py-5 text-left font-mono text-xs uppercase tracking-[0.2em]" aria-expanded={open}>
        {title}
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className="pb-6 text-sm leading-relaxed text-bone/65">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductPurchase({ product }: { product: Product }) {
  const { add } = useCart();
  const needsSize = product.sizes.length > 1;
  const [size, setSize] = useState<string | null>(needsSize ? null : (product.sizes[0] ?? null));
  const [color, setColor] = useState<string | null>(product.colors[0] ?? null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const shake = useAnimationControls();

  const validate = () => {
    if (needsSize && !size) {
      setSizeError(true);
      shake.start({ x: [0, -10, 10, -8, 8, -4, 0], transition: { duration: 0.5 } });
      return false;
    }
    return true;
  };

  const item = () => ({
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.images[0] ?? "",
    size,
    color,
  });

  const addToBag = () => {
    if (!validate()) return;
    add(item(), qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const orderNow = () => {
    if (!validate()) return;
    const message = buildOrderMessage([{ ...item(), key: "now", qty }], {}, window.location.origin);
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
      <Badges product={product} />
      <p className="mt-5 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-bone/45">Oversized T-shirt</p>
      <h1 className="mt-2 font-display text-[clamp(2rem,3.5vw,3rem)] leading-[0.95] uppercase">{product.name}</h1>
      <Price product={product} className="mt-4 text-xl" />

      <p className="mt-6 max-w-prose text-bone/65">{product.description}</p>

      {product.colors.length > 0 && (
        <div className="mt-8">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-bone/50">
            Colour: <span className="text-bone">{color}</span>
          </p>
          {product.colors.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn("border px-4 py-2 text-sm transition-colors", c === color ? "border-bone bg-bone text-ink" : "border-bone/20 hover:border-bone/60")}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {product.sizes.length > 0 && (
        <motion.div className="mt-8" animate={shake}>
          <div className="flex items-center justify-between">
            <p className={cn("font-mono text-[0.68rem] uppercase tracking-[0.2em]", sizeError ? "text-flame" : "text-bone/50")}>
              {sizeError ? "Pick a size first" : "Size"}
              {size && !sizeError && <span className="text-bone">: {size}</span>}
            </p>
            <a
              href={whatsappLink(`Hey DUDES! Which size should I get for the ${product.name}?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-bone/50 underline decoration-bone/20 underline-offset-4 hover:text-bone"
            >
              Size help?
            </a>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                disabled={product.soldOut}
                onClick={() => {
                  setSize(s);
                  setSizeError(false);
                }}
                className={cn(
                  "relative h-12 border font-mono text-sm uppercase transition-colors disabled:opacity-30",
                  s === size ? "border-transparent text-ink" : sizeError ? "border-flame/60" : "border-bone/20 hover:border-bone/60",
                  product.sizes.length === 1 && "col-span-2",
                )}
              >
                {s === size && <motion.span layoutId={`size-${product.id}`} className="bg-fire-x absolute inset-0" transition={{ type: "spring", stiffness: 500, damping: 35 }} />}
                <span className="relative">{s}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {product.soldOut ? (
        <div className="mt-10 space-y-3">
          <Button disabled className="w-full" variant="light">
            Sold out
          </Button>
          <ButtonLink
            href={whatsappLink(`Hey DUDES! Will the ${product.name} be restocked? Let me know 🙏`)}
            external
            variant="ghost"
            className="w-full"
          >
            <WhatsAppIcon className="h-4 w-4" /> Ask about a restock
          </ButtonLink>
        </div>
      ) : (
        <div className="mt-10 space-y-3">
          <div className="flex gap-3">
            <div className="flex items-center border border-bone/20">
              <button className="grid h-full w-11 place-items-center hover:bg-bone/10" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-mono" aria-live="polite">
                {qty}
              </span>
              <button className="grid h-full w-11 place-items-center hover:bg-bone/10" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={addToBag} className="flex-1">
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span key="added" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> Added
                  </motion.span>
                ) : (
                  <motion.span key="add" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}>
                    Add to bag
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
          <Button variant="whatsapp" onClick={orderNow} className="w-full">
            <WhatsAppIcon className="h-5 w-5" /> Order now on WhatsApp
          </Button>
          <p className="pt-1 text-center text-xs text-bone/40">No online payment needed — we confirm your order, delivery & payment on WhatsApp.</p>
        </div>
      )}

      <div className="mt-10 border-t border-bone/10">
        {product.details.length > 0 && (
          <Accordion title="Details" defaultOpen>
            <ul className="space-y-2">
              {product.details.map((d) => (
                <li key={d} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 bg-ember" /> {d}
                </li>
              ))}
            </ul>
          </Accordion>
        )}
        <Accordion title="How ordering works">
          <ol className="list-inside list-decimal space-y-2">
            <li>Choose your size and add to your bag (or tap &ldquo;Order now&rdquo;).</li>
            <li>Your order is sent to us as a WhatsApp message.</li>
            <li>We confirm availability, delivery charges and payment with you directly.</li>
          </ol>
        </Accordion>
        <Accordion title="Questions?">
          <p>
            Not sure about sizing, colours or delivery?{" "}
            <a
              href={whatsappLink(buildEnquiryMessage(product.name))}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ember underline underline-offset-4"
            >
              Message us on WhatsApp
            </a>{" "}
            — we— we reply fast.apos;re happy to help.
          </p>
        </Accordion>
      </div>
    </motion.div>
  );
}

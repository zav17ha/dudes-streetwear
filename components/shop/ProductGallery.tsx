"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { cn } from "@/lib/format";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    if (zoom !== null) lenis?.stop();
    else lenis?.start();
  }, [zoom, lenis]);

  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
      if (e.key === "ArrowRight") setZoom((z) => (z === null ? z : (z + 1) % images.length));
      if (e.key === "ArrowLeft") setZoom((z) => (z === null ? z : (z - 1 + images.length) % images.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, images.length]);

  if (!images.length) {
    return <div className="aspect-[4/5] bg-smoke" />;
  }

  return (
    <>
      {/* Mobile: swipe carousel */}
      <div className="md:hidden">
        <div
          ref={scroller}
          className="scrollbar-none -mx-4 flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((src, i) => (
            <button key={src + i} onClick={() => setZoom(i)} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-smoke" aria-label={`Zoom image ${i + 1}`}>
              <ProductImage src={src} alt={`${name} — image ${i + 1}`} fill priority={i === 0} sizes="(min-width: 768px) 1px, 100vw" className="object-cover" />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`Show image ${i + 1}`}
                onClick={() => scroller.current?.scrollTo({ left: i * scroller.current.clientWidth, behavior: "smooth" })}
                className={cn("h-1 transition-all duration-500", i === active ? "bg-fire-x w-8" : "w-4 bg-bone/25")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: editorial stack */}
      <div className="hidden gap-3 md:grid md:grid-cols-2">
        {images.map((src, i) => (
          <motion.button
            key={src + i}
            onClick={() => setZoom(i)}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: i < 2 ? 0.15 * i : 0, ease: [0.16, 1, 0.3, 1] }}
            className={cn("group relative aspect-[4/5] cursor-zoom-in overflow-hidden bg-smoke", (i === 0 || (i === images.length - 1 && images.length % 2 === 0)) && "col-span-2")}
            aria-label={`Zoom image ${i + 1}`}
          >
            <ProductImage
              src={src}
              alt={`${name} — image ${i + 1}`}
              fill
              priority={i === 0}
              sizes={i === 0 ? "58vw" : "29vw"}
              className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105"
            />
            <span className="absolute right-4 bottom-4 grid h-10 w-10 place-items-center bg-ink/70 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-4 w-4" />
            </span>
          </motion.button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {zoom !== null && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${name} images`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={zoom}
                className="relative h-[85svh] w-[min(92vw,calc(85svh*0.8))]"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
              >
                <ProductImage src={images[zoom]} alt={`${name} — image ${zoom + 1}`} fill sizes="92vw" className="object-contain" />
              </motion.div>
            </AnimatePresence>
            <button className="absolute top-5 right-5 grid h-12 w-12 place-items-center bg-bone/10 hover:bg-bone/20" aria-label="Close" onClick={() => setZoom(null)}>
              <X className="h-6 w-6" />
            </button>
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-3 grid h-12 w-12 place-items-center bg-bone/10 hover:bg-bone/20 md:left-8"
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoom((zoom - 1 + images.length) % images.length);
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  className="absolute right-3 grid h-12 w-12 place-items-center bg-bone/10 hover:bg-bone/20 md:right-8"
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoom((zoom + 1) % images.length);
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <p className="absolute bottom-6 font-mono text-xs tracking-[0.2em] text-bone/50">
              {zoom + 1} / {images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

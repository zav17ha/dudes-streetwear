"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice, cn } from "@/lib/format";
import { useCart } from "@/components/providers/CartProvider";
import { ProductImage } from "./ProductImage";

export function Badges({ product, className }: { product: Product; className?: string }) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {product.soldOut && <span className="bg-bone px-2 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-ink">Sold out</span>}
      {!product.soldOut && product.isNew && (
        <span className="bg-fire-x px-2 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-ink">New drop</span>
      )}
      {!product.soldOut && discount > 0 && (
        <span className="border border-bone/60 bg-ink px-2 py-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-bone">-{discount}%</span>
      )}
    </div>
  );
}

export function Price({ product, className }: { product: Product; className?: string }) {
  const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
  return (
    <span className={cn("flex items-baseline gap-2 font-mono", className)}>
      <span className={onSale ? "text-ember" : undefined}>{formatPrice(product.price)}</span>
      {onSale && <s className="text-[0.85em] text-bone/40">{formatPrice(product.compareAtPrice!)}</s>}
    </span>
  );
}

export function ProductCard({ product, priority = false, index = 0 }: { product: Product; priority?: boolean; index?: number }) {
  const { add } = useCart();
  const [cover, hover] = product.images;

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -5% 0px" }}
      transition={{ duration: 0.8, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-smoke">
        <Link href={`/product/${product.slug}`} className="absolute inset-0" aria-label={product.name}>
          {cover && (
            <ProductImage
              src={cover}
              alt={product.name}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
              className={cn(
                "object-cover transition-[transform,opacity] duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]",
                hover && "group-hover:opacity-0",
                product.soldOut && "grayscale-[0.6]",
              )}
            />
          )}
          {hover && (
            <ProductImage
              src={hover}
              alt=""
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="scale-[1.08] object-cover opacity-0 transition-[transform,opacity] duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-100 group-hover:opacity-100"
            />
          )}
        </Link>

        <Badges product={product} className="pointer-events-none absolute top-3 left-3" />

        {/* Quick add: pick a size right from the grid (pointer devices) */}
        {!product.soldOut && product.sizes.length > 0 && (
          <div className="absolute inset-x-3 bottom-3 hidden translate-y-[120%] bg-ink/90 p-3 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 md:block">
            <p className="mb-2 flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-bone/60">
              <Plus className="h-3 w-3" /> Quick add
            </p>
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    add({
                      productId: product.id,
                      slug: product.slug,
                      name: product.name,
                      price: product.price,
                      image: cover ?? "",
                      size,
                      color: product.colors[0] ?? null,
                    })
                  }
                  className="min-w-10 border border-bone/20 px-2 py-1.5 font-mono text-[0.7rem] uppercase transition-colors hover:border-ember hover:bg-ember hover:text-ink"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-bone/40">{product.colors.length > 1 ? `${product.colors.length} colours` : (product.colors[0] ?? "T-shirt")}</p>
          <h3 className="mt-1 font-display text-base leading-tight uppercase md:text-lg">
            <Link href={`/product/${product.slug}`} className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
              {product.name}
            </Link>
          </h3>
        </div>
        <Price product={product} className="shrink-0 text-sm md:pt-4" />
      </div>
    </motion.article>
  );
}

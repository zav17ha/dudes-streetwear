"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { cn } from "@/lib/format";

const SORTS = {
  new: { label: "Newest", fn: (a: Product, b: Product) => b.createdAt.localeCompare(a.createdAt) },
  "price-asc": { label: "Price: low → high", fn: (a: Product, b: Product) => a.price - b.price },
  "price-desc": { label: "Price: high → low", fn: (a: Product, b: Product) => b.price - a.price },
} as const;
type SortKey = keyof typeof SORTS;

export function ShopBrowser({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const sort = (params.get("sort") as SortKey) in SORTS ? (params.get("sort") as SortKey) : "new";
  const [query, setQuery] = useState("");

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => !q || `${p.name} ${p.colors.join(" ")} ${p.description}`.toLowerCase().includes(q))
      .sort((a, b) => Number(a.soldOut) - Number(b.soldOut) || SORTS[sort].fn(a, b));
  }, [products, sort, query]);

  return (
    <>
      <div className="sticky top-[var(--header-offset,0px)] z-20 -mx-4 transition-[top] duration-500 ease-[var(--ease-out-expo)] mt-6 flex flex-col gap-4 border-b border-bone/10 bg-ink/95 px-4 py-4 md:-mx-8 md:flex-row md:items-center md:justify-between md:px-8 xl:-mx-12 xl:px-12">
        <p className="hidden font-mono text-[0.68rem] uppercase tracking-[0.2em] text-bone/50 md:block">
          {visible.length} {visible.length === 1 ? "T-shirt" : "T-shirts"}
        </p>
        <div className="flex items-center gap-3">
          <label className="relative flex-1 md:w-72 md:flex-none">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-bone/40" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="field py-2 pr-8 pl-9 text-sm" />
            {query && (
              <button onClick={() => setQuery("")} className="absolute top-1/2 right-2 -translate-y-1/2 text-bone/50" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <label className="relative">
            <span className="sr-only">Sort products</span>
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value === "new" ? null : e.target.value)}
              className="field appearance-none py-2 pr-8 font-mono text-[0.7rem] uppercase tracking-[0.14em]"
            >
              {Object.entries(SORTS).map(([key, s]) => (
                <option key={key} value={key} className="bg-coal">
                  {s.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-bone/50">▾</span>
          </label>
        </div>
      </div>

      <motion.div layout className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 md:gap-y-14 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductCard product={p} index={i} priority={i < 4} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <div className="py-32 text-center">
          <p className="font-display text-4xl text-bone/15 uppercase">Nothing here</p>
          <p className="mt-4 text-bone/60">Try another search term.</p>
        </div>
      )}
    </>
  );
}

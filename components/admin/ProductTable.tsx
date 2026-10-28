"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Search, Star, Trash2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/shop/ProductImage";
import { deleteProductAction, toggleFlagAction } from "@/app/admin/actions";
import { formatPrice, cn } from "@/lib/format";

function Toggle({ on, onClick, label, disabled }: { on: boolean; onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50", on ? "bg-fire-x" : "bg-bone/15")}
    >
      <span className={cn("absolute top-1 left-1 h-4 w-4 rounded-full bg-bone transition-transform", on && "translate-x-5 bg-ink")} />
    </button>
  );
}

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const list = useMemo(() => {
    const q = query.toLowerCase().trim();
    return q ? products.filter((p) => `${p.name} ${p.colors.join(" ")}`.toLowerCase().includes(q)) : products;
  }, [products, query]);

  const run = (id: string, fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusy(id);
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong");
      router.refresh();
      setBusy(null);
    });
  };

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between gap-4">
        <label className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-bone/40" />
          <input className="field py-2 pl-9 text-sm" placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <p className="hidden font-mono text-[0.65rem] uppercase tracking-[0.2em] text-bone/40 sm:block">{list.length} shown</p>
      </div>

      {error && <p className="mt-4 border border-flame/40 bg-flame/10 p-3 text-sm text-flame">{error}</p>}

      <div className="mt-4 overflow-x-auto border border-bone/10">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-coal font-mono text-[0.62rem] uppercase tracking-[0.18em] text-bone/45">
            <tr>
              <th className="px-4 py-3 font-normal">Product</th>
              <th className="px-4 py-3 font-normal">Price</th>
              <th className="px-4 py-3 text-center font-normal">New</th>
              <th className="px-4 py-3 text-center font-normal">Featured</th>
              <th className="px-4 py-3 text-center font-normal">Sold out</th>
              <th className="px-4 py-3 text-center font-normal">Visible</th>
              <th className="px-4 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className={cn("border-t border-bone/10 transition-opacity", busy === p.id && "opacity-50", p.hidden && "bg-bone/[0.02]")}>
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                    <span className="relative aspect-[4/5] w-12 shrink-0 overflow-hidden bg-smoke">
                      {p.images[0] && <ProductImage src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />}
                    </span>
                    <span>
                      <span className={cn("block font-medium", p.hidden && "text-bone/45")}>{p.name}</span>
                      <span className="block font-mono text-[0.65rem] uppercase tracking-[0.14em] text-bone/40">{p.colors.join(", ") || "T-shirt"}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono whitespace-nowrap">
                  {formatPrice(p.price)}
                  {p.compareAtPrice ? <s className="ml-2 text-bone/35">{formatPrice(p.compareAtPrice)}</s> : null}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <Toggle label="New drop" on={p.isNew} disabled={busy === p.id} onClick={() => run(p.id, () => toggleFlagAction(p.id, "isNew", !p.isNew))} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <Toggle label="Featured" on={p.featured} disabled={busy === p.id} onClick={() => run(p.id, () => toggleFlagAction(p.id, "featured", !p.featured))} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <Toggle label="Sold out" on={p.soldOut} disabled={busy === p.id} onClick={() => run(p.id, () => toggleFlagAction(p.id, "soldOut", !p.soldOut))} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center">
                    <Toggle label="Visible in store" on={!p.hidden} disabled={busy === p.id} onClick={() => run(p.id, () => toggleFlagAction(p.id, "hidden", !p.hidden))} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {!p.hidden && (
                      <a href={`/product/${p.slug}`} target="_blank" className="grid h-9 w-9 place-items-center text-bone/50 hover:bg-bone/10 hover:text-bone" aria-label="View in store">
                        <Eye className="h-4 w-4" />
                      </a>
                    )}
                    {p.hidden && (
                      <span className="grid h-9 w-9 place-items-center text-bone/25" title="Hidden from store">
                        <EyeOff className="h-4 w-4" />
                      </span>
                    )}
                    <Link href={`/admin/products/${p.id}`} className="grid h-9 w-9 place-items-center text-bone/50 hover:bg-bone/10 hover:text-bone" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Delete “${p.name}”? This can't be undone.`)) run(p.id, () => deleteProductAction(p.id));
                      }}
                      className="grid h-9 w-9 place-items-center text-bone/50 hover:bg-blood/20 hover:text-flame"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-bone/50">
                  No products yet.{" "}
                  <Link href="/admin/products/new" className="text-ember underline">
                    Add your first one
                  </Link>
                  .
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-bone/40">
        <Star className="h-3.5 w-3.5" /> Featured products appear first in &ldquo;Latest Drops&rdquo; on the home page.
      </p>
    </section>
  );
}

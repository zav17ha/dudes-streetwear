"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Check, Loader2, Trash2 } from "lucide-react";
import type { Product, ProductInput } from "@/lib/types";
import { ImageUploader } from "./ImageUploader";
import { deleteProductAction, saveProductAction } from "@/app/admin/actions";
import { cn, formatPrice, slugify } from "@/lib/format";

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "One Size"];

const empty: ProductInput = {
  slug: "",
  name: "",
  price: 0,
  compareAtPrice: null,
  category: "T-Shirts",
  description: "",
  details: [],
  sizes: ["S", "M", "L", "XL", "XXL"],
  colors: [],
  images: [],
  isNew: true,
  featured: false,
  soldOut: false,
  hidden: false,
};

function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("grid content-start gap-2", className)}>
      <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-bone/55">{label}</span>
      {children}
      {hint && <span className="text-xs text-bone/35">{hint}</span>}
    </label>
  );
}

function Switch({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 border-b border-bone/10 py-4 text-left last:border-0">
      <span>
        <span className="block text-sm">{label}</span>
        <span className="block text-xs text-bone/40">{description}</span>
      </span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-fire-x" : "bg-bone/15")}>
        <span className={cn("absolute top-1 left-1 h-4 w-4 rounded-full bg-bone transition-transform", checked && "translate-x-5 bg-ink")} />
      </span>
    </button>
  );
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [data, setData] = useState<ProductInput>(product ?? empty);
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [customSize, setCustomSize] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setSaved(false);
  };

  const allSizes = Array.from(new Set([...SIZE_PRESETS, ...data.sizes]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveProductAction(data);
      if (!res.ok) {
        setError(res.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setSaved(true);
      if (!product) router.push(`/admin/products/${res.id}`);
      router.refresh();
    });
  };

  const remove = () => {
    if (!product || !confirm(`Delete “${product.name}”? This can't be undone.`)) return;
    startTransition(async () => {
      const res = await deleteProductAction(product.id);
      if (!res.ok) return setError(res.error);
      router.push("/admin");
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit}>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link href="/admin" className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-bone/50 hover:text-bone">
            <ArrowLeft className="h-3.5 w-3.5" /> All products
          </Link>
          <h1 className="mt-3 font-display text-5xl uppercase md:text-6xl">{product ? "Edit product" : "New product"}</h1>
        </div>
        <div className="flex gap-2">
          {product && !product.hidden && (
            <a href={`/product/${product.slug}`} target="_blank" className="border border-bone/20 px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] hover:border-bone/60">
              View
            </a>
          )}
          <button disabled={pending} className="bg-fire-x flex min-w-36 items-center justify-center gap-2 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink disabled:opacity-60">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
            {pending ? "Saving" : saved ? "Saved" : product ? "Save changes" : "Publish"}
          </button>
        </div>
      </div>

      {error && <p className="mt-6 border border-flame/40 bg-flame/10 p-4 text-sm text-flame">{error}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section className="border border-bone/10 bg-coal p-6">
            <h2 className="font-display text-2xl uppercase">Photos</h2>
            <div className="mt-5">
              <ImageUploader value={data.images} onChange={(images) => set("images", images)} />
            </div>
          </section>

          <section className="grid gap-5 border border-bone/10 bg-coal p-6">
            <h2 className="font-display text-2xl uppercase">Details</h2>
            <Field label="Product name *">
              <input
                className="field"
                required
                value={data.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
                placeholder="e.g. Inferno Logo Tee"
              />
            </Field>
            <Field label="Description">
              <textarea className="field min-h-32" value={data.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell the story of this piece…" />
            </Field>
            <Field label="Highlights" hint="One per line — e.g. fabric, fit, print type.">
              <textarea
                className="field min-h-28"
                value={data.details.join("\n")}
                onChange={(e) => set("details", e.target.value.split("\n"))}
                placeholder={"Oversized fit\n240 GSM cotton\nScreen printed"}
              />
            </Field>
            <Field label="URL" hint={`Store link: /product/${data.slug || "…"}`}>
              <input
                className="field font-mono text-sm"
                value={data.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
              />
            </Field>
          </section>

          <section className="grid gap-5 border border-bone/10 bg-coal p-6">
            <h2 className="font-display text-2xl uppercase">Variants</h2>
            <div>
              <span className="font-mono text-[0.66rem] uppercase tracking-[0.2em] text-bone/55">Sizes</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {allSizes.map((s) => {
                  const on = data.sizes.includes(s);
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => set("sizes", on ? data.sizes.filter((x) => x !== s) : [...data.sizes, s].sort((a, b) => allSizes.indexOf(a) - allSizes.indexOf(b)))}
                      className={cn("min-w-12 border px-3 py-2 font-mono text-xs uppercase transition-colors", on ? "border-transparent bg-bone text-ink" : "border-bone/20 text-bone/60 hover:border-bone/50")}
                    >
                      {s}
                    </button>
                  );
                })}
                <span className="flex">
                  <input className="field w-24 py-2 text-xs" placeholder="Custom" value={customSize} onChange={(e) => setCustomSize(e.target.value)} />
                  <button
                    type="button"
                    className="border border-l-0 border-bone/20 px-3 font-mono text-xs"
                    onClick={() => {
                      const v = customSize.trim().toUpperCase();
                      if (v && !data.sizes.includes(v)) set("sizes", [...data.sizes, v]);
                      setCustomSize("");
                    }}
                  >
                    +
                  </button>
                </span>
              </div>
            </div>
            <Field label="Colours" hint="Comma separated. Customers pick one if you add more than one.">
              <input
                className="field"
                value={data.colors.join(", ")}
                onChange={(e) => set("colors", e.target.value.split(",").map((s) => s.trimStart()))}
                placeholder="Black, Red"
              />
            </Field>
          </section>
        </div>

        <div className="space-y-8">
          <section className="grid gap-5 border border-bone/10 bg-coal p-6">
            <h2 className="font-display text-2xl uppercase">Pricing</h2>
            <Field label="Price (LKR) *" hint={data.price ? formatPrice(data.price) : undefined}>
              <input className="field font-mono" type="number" min={0} step={10} required value={data.price || ""} onChange={(e) => set("price", Number(e.target.value))} placeholder="3990" />
            </Field>
            <Field label="Compare-at price" hint="Optional. Shows a sale badge when higher than the price.">
              <input className="field font-mono" type="number" min={0} step={10} value={data.compareAtPrice || ""} onChange={(e) => set("compareAtPrice", e.target.value ? Number(e.target.value) : null)} placeholder="4990" />
            </Field>
          </section>

          <section className="border border-bone/10 bg-coal px-6 py-2">
            <Switch label="New drop" description="Shows a “New drop” badge." checked={data.isNew} onChange={(v) => set("isNew", v)} />
            <Switch label="Featured" description="Shown first on the home page." checked={data.featured} onChange={(v) => set("featured", v)} />
            <Switch label="Sold out" description="Visible, but can't be ordered." checked={data.soldOut} onChange={(v) => set("soldOut", v)} />
            <Switch label="Hidden" description="Only visible here in the admin." checked={data.hidden} onChange={(v) => set("hidden", v)} />
          </section>

          {product && (
            <button type="button" onClick={remove} disabled={pending} className="flex w-full items-center justify-center gap-2 border border-blood/40 py-3 font-mono text-xs uppercase tracking-[0.16em] text-flame hover:bg-blood/15">
              <Trash2 className="h-4 w-4" /> Delete product
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

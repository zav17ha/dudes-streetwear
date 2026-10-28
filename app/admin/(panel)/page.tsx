import Link from "next/link";
import { getProducts } from "@/lib/store";
import { ProductTable } from "@/components/admin/ProductTable";

export const metadata = { title: "Products" };

export default async function AdminHome() {
  const products = await getProducts({ includeHidden: true });
  const stats = [
    { label: "Products", value: products.length },
    { label: "Live", value: products.filter((p) => !p.hidden).length },
    { label: "Featured", value: products.filter((p) => p.featured).length },
    { label: "Sold out", value: products.filter((p) => p.soldOut).length },
  ];

  return (
    <>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-ember">Store manager</p>
          <h1 className="mt-2 font-display text-6xl uppercase">Products</h1>
        </div>
        <Link href="/admin/products/new" className="bg-fire-x self-start px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-ink md:self-auto">
          + Add product
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-px bg-bone/10 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-ink p-5">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-bone/45">{s.label}</p>
            <p className="mt-2 font-display text-4xl">{s.value}</p>
          </div>
        ))}
      </div>

      <ProductTable products={products} />
    </>
  );
}

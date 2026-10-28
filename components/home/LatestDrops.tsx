import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/shop/ProductCard";
import { SectionHeading } from "./SectionHeading";

export function LatestDrops({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="container-x py-20 md:py-32">
      <SectionHeading eyebrow={`${products.length} pieces — fresh off the press`} title="Latest Drops">
        <Link href="/shop" className="group flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-bone/70 hover:text-bone">
          View the full shop
          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </SectionHeading>
      <div className="mt-14 grid grid-cols-2 gap-x-3 gap-y-10 md:mt-20 md:grid-cols-3 md:gap-x-5 md:gap-y-14 xl:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} priority={i < 2} />
        ))}
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { SplitReveal } from "@/components/ui/Reveal";
import { getProducts } from "@/lib/store";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop the latest Dudes Streetwear drops — oversized graphic T-shirts. Order straight from WhatsApp.",
};

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <div className="container-x pt-36 pb-24 md:pt-48">
      <div className="flex flex-col gap-6 border-b border-bone/10 pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow text-ember">Dudes Streetwear — {products.length} T-shirts</p>
          <SplitReveal as="h1" immediate delay={0.3} text="The Shop" className="mt-3 block font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.9] uppercase" />
        </div>
        <p className="max-w-sm text-bone/60">
          Every fit, every drop. Pick your size, add to bag and send your order to us on WhatsApp — we handle the rest.
        </p>
      </div>
      <Suspense>
        <ShopBrowser products={products} />
      </Suspense>
    </div>
  );
}

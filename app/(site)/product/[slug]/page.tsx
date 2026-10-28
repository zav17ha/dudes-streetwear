import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductPurchase } from "@/components/shop/ProductPurchase";
import { ProductCard } from "@/components/shop/ProductCard";
import { SectionHeading } from "@/components/home/SectionHeading";
import { getProductBySlug, getProducts } from "@/lib/store";
import { site, siteUrl } from "@/lib/site";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} | ${site.name}`,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const all = await getProducts();
  const related = all.filter((p) => p.id !== product.id && !p.soldOut).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((src) => (src.startsWith("http") ? src : `${siteUrl}${src}`)),
    brand: { "@type": "Brand", name: site.name },
    category: "T-Shirts",
    offers: {
      "@type": "Offer",
      priceCurrency: "LKR",
      price: product.price,
      availability: product.soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${siteUrl}/product/${product.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-x pt-28 md:pt-36">
        <nav className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-bone/45" aria-label="Breadcrumb">
          <Link href="/shop" className="flex items-center gap-2 hover:text-bone">
            <ArrowLeft className="h-3.5 w-3.5" /> Shop
          </Link>
          <span>/</span>
          <span className="truncate text-bone/70">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 md:mt-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            <ProductGallery images={product.images} name={product.name} />
          </div>
          <div className="md:col-span-5">
            <div className="md:sticky md:top-[calc(var(--header-offset,0px)+2rem)] md:transition-[top] md:duration-500">
              <ProductPurchase product={product} />
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-x py-24 md:py-36">
          <SectionHeading eyebrow="Complete the fit" title="You might also like" />
          <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 md:mt-16 md:grid-cols-4 md:gap-x-5">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

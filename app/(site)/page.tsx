import { Hero } from "@/components/home/Hero";
import { TickerBand } from "@/components/home/TickerBand";
import { LatestDrops } from "@/components/home/LatestDrops";
import { Manifesto } from "@/components/home/Manifesto";
import { Lookbook } from "@/components/home/Lookbook";
import { HowToOrder } from "@/components/home/HowToOrder";
import { Community } from "@/components/home/Community";
import { getProducts } from "@/lib/store";

export const revalidate = 300;

export default async function HomePage() {
  const products = await getProducts();

  const featured = [...products.filter((p) => p.featured && !p.soldOut), ...products.filter((p) => !p.featured || p.soldOut)].slice(0, 8);

  return (
    <>
      <Hero />
      <TickerBand />
      <LatestDrops products={featured} />
      <Manifesto />
      <Lookbook />
      <HowToOrder />
      <Community />
    </>
  );
}

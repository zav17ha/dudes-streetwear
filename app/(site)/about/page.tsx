import type { Metadata } from "next";
import Image from "next/image";
import { Logo } from "@/components/brand/Logo";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { TickerBand } from "@/components/home/TickerBand";
import { Community } from "@/components/home/Community";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${site.claim}. ${site.manifesto}`,
};

const pillars = [
  { title: "Designed loud", text: "Every graphic is drawn in-house. Dragon marks, bold type and heavy contrast — fits made to be noticed." },
  { title: "Built for the streets", text: "Oversized cuts and heavy fabrics that hold their shape, wash after wash, day after day." },
  { title: "Community first", text: "We drop for the crew. Your feedback, your fit pics and your energy shape what comes next." },
];

export default function AboutPage() {
  return (
    <>
      <section className="grain relative overflow-hidden pt-40 pb-20 md:pt-52 md:pb-32">
        <div className="container-x relative">
          <p className="eyebrow text-ember">About Dudes</p>
          <SplitReveal
            as="h1"
            immediate
            delay={0.3}
            text="Fashion, redefined."
            className="mt-4 block max-w-[12ch] font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.9] uppercase"
          />
          <Reveal delay={0.6} className="mt-12 grid gap-10 md:grid-cols-12">
            <p className="text-lg text-bone/80 md:col-span-6 md:text-xl">
              {site.manifesto}
            </p>
            <p className="text-bone/60 md:col-span-5 md:col-start-8">
              Dudes Streetwear is a Sri Lankan streetwear label out of Bandaragama. We make oversized T-shirts with graphics
              that hit hard — and we sell them straight to the people who wear them. No
              middlemen, no checkout queues: just pick your fit and hit us up on WhatsApp.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-x">
        <div className="relative grid gap-3 md:grid-cols-2">
          <Reveal className="relative aspect-square overflow-hidden bg-smoke">
            <Image src="/brand/logo-black-fabric.jpg" alt="Dudes logo printed on black fabric" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </Reveal>
          <Reveal delay={0.1} className="relative flex aspect-square items-center justify-center overflow-hidden bg-smoke">
            <Image src="/brand/logo-red-fabric.jpg" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover opacity-30" />
            <Logo variant="mark" tone="current" className="relative h-1/2 w-auto text-bone" />
          </Reveal>
        </div>
      </section>

      <TickerBand />

      <section className="container-x pb-24 md:pb-36">
        <div className="grid gap-px bg-bone/10 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1} className="bg-ink p-8 md:p-12">
              <span className="text-fire font-display text-4xl">0{i + 1}</span>
              <h2 className="mt-6 font-display text-2xl uppercase">{p.title}</h2>
              <p className="mt-4 text-bone/60">{p.text}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-16 flex justify-center">
          <ButtonLink href="/shop">Shop the collection</ButtonLink>
        </div>
      </section>

      <Community />
    </>
  );
}

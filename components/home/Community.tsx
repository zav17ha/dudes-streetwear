import { ArrowUpRight } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/ui/Icons";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

const channels = [
  {
    name: "Instagram",
    handle: site.socials.instagramHandle,
    href: site.socials.instagram,
    icon: InstagramIcon,
    text: "First look at every drop, fit pics and behind the scenes.",
  },
  {
    name: "Facebook",
    handle: "Dudes Streetwear",
    href: site.socials.facebook,
    icon: FacebookIcon,
    text: "Announcements, restocks and the community.",
  },
];

export function Community() {
  return (
    <section className="grain relative overflow-hidden border-t border-bone/10 py-24 md:py-36">
      <div className="pointer-events-none absolute inset-x-0 bottom-[-40%] h-[80%] bg-[radial-gradient(closest-side,rgba(150,120,240,0.12),transparent_75%)]" aria-hidden />
      <div className="container-x relative text-center">
        <p className="eyebrow text-ember">The biggest community</p>
        <SplitReveal
          as="h2"
          text="Join the crew"
          className="mt-4 block font-display text-[clamp(2.5rem,6.5vw,5.5rem)] leading-[0.9] uppercase"
        />
        <p className="mx-auto mt-6 max-w-lg text-bone/60">
          Tag us in your fits, catch drops before they sell out and be part of what we&apos;re building.
        </p>

        <div className="mx-auto mt-14 grid max-w-4xl gap-4 text-left md:grid-cols-2">
          {channels.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.1}>
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex h-full flex-col overflow-hidden border border-bone/15 bg-ink p-8 transition-colors duration-500 hover:border-transparent"
              >
                <span className="bg-fire-x absolute inset-0 translate-y-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-y-0" aria-hidden />
                <span className="relative flex items-center justify-between transition-colors duration-500 group-hover:text-ink">
                  <c.icon className="h-8 w-8" />
                  <ArrowUpRight className="h-7 w-7 transition-transform duration-500 group-hover:rotate-45" />
                </span>
                <span className="relative mt-10 font-display text-3xl uppercase transition-colors duration-500 group-hover:text-ink">{c.name}</span>
                <span className="relative mt-1 font-mono text-xs uppercase tracking-[0.18em] text-ember transition-colors duration-500 group-hover:text-ink">
                  {c.handle}
                </span>
                <span className="relative mt-4 text-sm text-bone/60 transition-colors duration-500 group-hover:text-ink/80">{c.text}</span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

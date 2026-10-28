import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { SplitReveal, Reveal } from "@/components/ui/Reveal";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { site } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with Dudes Streetwear — WhatsApp ${site.phoneDisplay}, ${site.email}. ${site.address.line1}, ${site.address.city}.`,
};

const cards = [
  { icon: WhatsAppIcon, label: "WhatsApp", value: site.phoneDisplay, href: whatsappLink("Hey DUDES! 👋"), external: true },
  { icon: Phone, label: "Call", value: site.phoneDisplay, href: site.phoneHref },
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
  {
    icon: MapPin,
    label: "Visit",
    value: `${site.address.line1}, ${site.address.city} ${site.address.postalCode}`,
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`,
    external: true,
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="container-x pt-40 pb-16 md:pt-52">
        <p className="eyebrow text-ember">Contact</p>
        <SplitReveal as="h1" immediate delay={0.3} text="Talk to the Dudes" className="mt-4 block max-w-[10ch] font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.9] uppercase" />
      </section>

      <section className="container-x pb-24 md:pb-32">
        <div className="grid gap-px bg-bone/10 sm:grid-cols-2">
          {cards.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.06}>
              <a
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex h-full items-center gap-5 bg-ink p-6 transition-colors hover:bg-smoke md:p-8"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center border border-bone/15 transition-colors group-hover:border-ember group-hover:text-ember">
                  <c.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[0.65rem] uppercase tracking-[0.2em] text-bone/45">{c.label}</span>
                  <span className="mt-1 block break-words text-lg">{c.value}</span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 flex gap-3">
          <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-12 w-12 place-items-center border border-bone/15 hover:border-ember hover:text-ember">
            <InstagramIcon className="h-5 w-5" />
          </a>
          <a href={site.socials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-12 w-12 place-items-center border border-bone/15 hover:border-ember hover:text-ember">
            <FacebookIcon className="h-5 w-5" />
          </a>
        </div>
      </section>

      <section className="relative h-[60vh] min-h-[380px] w-full border-t border-bone/10">
        <iframe
          title="Dudes Streetwear location"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(site.mapQuery)}&z=15&output=embed`}
          className="absolute inset-0 h-full w-full grayscale invert-[0.92] hue-rotate-180 contrast-[0.9]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </>
  );
}

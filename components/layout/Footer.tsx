import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { site, nav } from "@/lib/site";
import { whatsappLink } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-bone/10 bg-coal pt-16 md:pt-20">
      <div className="container-x">
        <Reveal className="flex flex-col items-start justify-between gap-10 border-b border-bone/10 pb-16 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-ember">Join the movement</p>
            <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.9] uppercase">
              Rep the <span className="text-fire">Dudes.</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={site.socials.instagram} external variant="light">
              <InstagramIcon className="h-4 w-4" /> Follow {site.socials.instagramHandle}
            </ButtonLink>
            <ButtonLink href={whatsappLink("Hey DUDES! 👋")} external variant="ghost">
              <WhatsAppIcon className="h-4 w-4" /> Chat with us
            </ButtonLink>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-10 py-14 md:grid-cols-4">
          <div>
            <h3 className="eyebrow text-bone/40">Shop</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/shop" className="text-bone/80 transition-colors hover:text-ember">
                  All T-shirts
                </Link>
              </li>
              <li>
                <Link href="/shop?sort=price-asc" className="text-bone/80 transition-colors hover:text-ember">
                  Price: low to high
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="eyebrow text-bone/40">Explore</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-bone/80 transition-colors hover:text-ember">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="eyebrow text-bone/40">Contact</h3>
            <ul className="mt-5 space-y-3 text-sm text-bone/80">
              <li>
                <a href={site.phoneHref} className="hover:text-ember">
                  {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="break-all hover:text-ember">
                  {site.email}
                </a>
              </li>
              <li className="text-bone/60">
                {site.address.line1},<br />
                {site.address.city} {site.address.postalCode}
              </li>
            </ul>
          </div>
          <div>
            <h3 className="eyebrow text-bone/40">Follow</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-bone/80 hover:text-ember">
                  <InstagramIcon className="h-4 w-4" /> Instagram
                </a>
              </li>
              <li>
                <a href={site.socials.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-bone/80 hover:text-ember">
                  <FacebookIcon className="h-4 w-4" /> Facebook
                </a>
              </li>
              <li>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-bone/80 hover:text-ember">
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container-x flex justify-center">
        <Logo variant="wordmark" className="w-full max-w-[min(100%,420px)]" />
      </div>

      <div className="container-x mt-8 flex flex-col gap-3 border-t border-bone/10 py-6 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-bone/40 md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <p>
          Web Solutions by{" "}
          <a
            href="https://www.craxe.org"
            target="_blank"
            rel="noopener"
            className="text-fire-x font-bold transition-opacity hover:opacity-80"
          >
            Craxe
          </a>
        </p>
      </div>
    </footer>
  );
}

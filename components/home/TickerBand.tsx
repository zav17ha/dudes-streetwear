import { Marquee } from "@/components/ui/Marquee";
import { Logo } from "@/components/brand/Logo";

const words = ["Fashion Redefined", "Est. 1991", "Made for the streets", "Dudes Streetwear"];

export function TickerBand() {
  return (
    <section aria-label="Dudes Streetwear" className="relative z-10 overflow-hidden py-10 md:py-14">
      <div className="bg-fire-x -rotate-2 scale-105 text-ink">
        <Marquee speed={70} className="py-3 md:py-4">
          {[0, 1].map((k) =>
            words.map((w) => (
              <span key={`${k}${w}`} className="flex items-center gap-6 pr-6 font-display text-2xl uppercase md:text-4xl">
                {w}
                <Logo variant="mark" tone="current" className="h-6 w-auto md:h-9" title="" />
              </span>
            )),
          )}
        </Marquee>
      </div>
      <div className="-mt-3 rotate-1 scale-105 border-y border-bone/10 bg-coal">
        <Marquee speed={55} reverse className="py-2 md:py-3">
          {[0, 1, 2].map((k) =>
            ["Order via WhatsApp", "Oversized fits", "Limited drops", "Join the community"].map((w) => (
              <span key={`${k}${w}`} className="flex items-center gap-6 pr-6 font-display text-lg text-bone/70 uppercase md:text-2xl">
                {w}
                <span className="text-fire-x">✦</span>
              </span>
            )),
          )}
        </Marquee>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <main className="grain relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      <Logo variant="mark" className="h-28 w-auto animate-flicker" />
      <h1 className="mt-8 font-display text-[clamp(4rem,12vw,9rem)] leading-[0.8]">
        4<span className="text-fire">0</span>4
      </h1>
      <p className="mt-6 max-w-sm text-bone/60">This fit doesn&apos;t exist (yet). It might have sold out, or the link is broken.</p>
      <div className="mt-10 flex gap-3">
        <Link href="/shop" className="bg-fire-x px-7 py-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink">
          Back to the shop
        </Link>
        <Link href="/" className="border border-bone/25 px-7 py-4 font-mono text-xs uppercase tracking-[0.18em] hover:border-bone">
          Home
        </Link>
      </div>
    </main>
  );
}

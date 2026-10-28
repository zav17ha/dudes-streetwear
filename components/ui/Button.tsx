import Link from "next/link";
import { cn } from "@/lib/format";

type Variant = "fire" | "light" | "ghost" | "whatsapp";

const styles: Record<Variant, string> = {
  fire: "bg-fire-x text-ink",
  light: "bg-bone text-ink",
  ghost: "border border-bone/25 text-bone hover:border-bone",
  whatsapp: "bg-whatsapp text-ink",
};

type Common = { variant?: Variant; className?: string; children: React.ReactNode };

const base =
  "group/btn relative inline-flex items-center justify-center gap-3 overflow-hidden px-7 py-4 font-mono text-[0.78rem] font-semibold uppercase tracking-[0.18em] transition-[transform,border-color,opacity] duration-300 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";

/** Text rolls up and is replaced by a copy on hover. */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative flex items-center gap-3 overflow-hidden">
      <span className="flex items-center gap-3 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:-translate-y-[130%]">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 flex translate-y-[130%] items-center gap-3 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/btn:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}

export function ButtonLink({
  href,
  variant = "fire",
  className,
  children,
  external,
  ...rest
}: Common & { href: string; external?: boolean } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const cls = cn(base, styles[variant], className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest}>
        <Label>{children}</Label>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      <Label>{children}</Label>
    </Link>
  );
}

export function Button({
  variant = "fire",
  className,
  children,
  ...rest
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, styles[variant], className)} {...rest}>
      <Label>{children}</Label>
    </button>
  );
}

import { SplitReveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/format";

export function SectionHeading({
  eyebrow,
  title,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div>
        <p className="eyebrow flex items-center gap-3 text-ember">
          <span className="h-px w-8 bg-ember" />
          {eyebrow}
        </p>
        <SplitReveal as="h2" text={title} className="mt-4 block font-display text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[0.95] uppercase" />
      </div>
      {children}
    </div>
  );
}

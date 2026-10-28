import { ShoppingBag, Shirt } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "./SectionHeading";

const steps = [
  { icon: Shirt, title: "Pick your fit", text: "Browse the drops, choose your size and colour." },
  { icon: ShoppingBag, title: "Add to bag", text: "Stack as many pieces as you want — your bag saves automatically." },
  { icon: WhatsAppIcon, title: "Send on WhatsApp", text: "One tap sends your full order to us. We confirm delivery & payment with you directly." },
];

export function HowToOrder() {
  return (
    <section className="container-x py-20 md:py-32">
      <SectionHeading eyebrow="No checkout. No stress." title="How to order" />
      <div className="mt-14 grid gap-px bg-bone/10 md:mt-20 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.1} className="group relative overflow-hidden bg-ink p-8 md:p-10">
            <span className="bg-fire-x absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
            <div className="flex items-start justify-between">
              <s.icon className="h-8 w-8 text-ember" strokeWidth={1.5} />
              <span className="text-outline font-display text-5xl leading-none transition-colors duration-500 group-hover:text-bone/10">0{i + 1}</span>
            </div>
            <h3 className="mt-8 font-display text-2xl uppercase">{s.title}</h3>
            <p className="mt-3 text-bone/60">{s.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

import { Banknote, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

const VALUES = [
  { icon: Truck, title: "Free delivery", text: "On orders over Rs. 10,000, nationwide." },
  { icon: Banknote, title: "Cash on delivery", text: "Pay when your order reaches your door." },
  { icon: RefreshCcw, title: "7-day exchanges", text: "Wrong size? Swap it, hassle free." },
  { icon: ShieldCheck, title: "Secure payments", text: "Card, JazzCash & Easypaisa." },
];

export function Values() {
  return (
    <section className="grid grid-cols-2 border-y border-line lg:grid-cols-4">
      {VALUES.map((v, i) => (
        <Reveal
          key={v.title}
          delay={i * 0.08}
          y={20}
          className="flex flex-col gap-3 border-line p-6 odd:border-r md:p-10 lg:border-r lg:last:border-r-0 [&:nth-child(-n+2)]:border-b lg:[&:nth-child(-n+2)]:border-b-0"
        >
          <v.icon size={22} strokeWidth={1.4} className="text-maroon" />
          <p className="label">{v.title}</p>
          <p className="text-sm text-muted">{v.text}</p>
        </Reveal>
      ))}
    </section>
  );
}

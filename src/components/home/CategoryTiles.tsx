import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/products";
import { Reveal } from "@/components/motion/Reveal";

export function CategoryTiles() {
  return (
    <section className="grid gap-1 md:grid-cols-3">
      {CATEGORIES.map((c, i) => (
        <Reveal key={c.slug} delay={i * 0.1} y={60}>
          <Link href={`/shop/${c.slug}`} className="group relative block aspect-[3/4] overflow-hidden bg-ink text-bone md:aspect-[2/3]">
            <Image
              src={`${c.image}?w=1200&q=80`}
              alt={c.title}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover opacity-90 transition-transform duration-[1.4s] ease-[var(--ease-drift)] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-maroon opacity-0 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-40" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
              <div>
                <p className="label text-bone/70">0{i + 1}</p>
                <h3 className="font-display text-7xl font-black uppercase leading-[0.85]">{c.title}</h3>
                <p className="mt-2 text-sm text-bone/80">{c.blurb}</p>
              </div>
              <span className="label translate-x-2 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                Shop →
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </section>
  );
}

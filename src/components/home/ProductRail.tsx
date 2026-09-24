"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PRODUCTS, type Category } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/motion/Reveal";

const TABS: { key: "all" | Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "hoodies", label: "Hoodies" },
  { key: "tees", label: "Tees" },
  { key: "jackets", label: "Jackets" },
];

/** Represent-style "New Arrivals" rail with category tabs and a horizontal scroller. */
export function ProductRail({ title, eyebrow }: { title: string; eyebrow: string }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const scroller = useRef<HTMLDivElement>(null);
  const items = PRODUCTS.filter((p) => tab === "all" || p.category === tab);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="py-16 md:py-24">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6 px-4 md:px-8">
        <Reveal>
          <p className="label text-maroon">{eyebrow}</p>
          <h2 className="font-display mt-2 text-6xl font-black uppercase leading-[0.85] md:text-8xl">{title}</h2>
        </Reveal>
        <div className="flex items-center gap-6">
          <div className="flex gap-1" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className="label relative px-3 py-2"
              >
                {tab === t.key && (
                  <motion.span layoutId="rail-tab" className="absolute inset-0 bg-ink" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
                )}
                <span className={`relative transition-colors ${tab === t.key ? "text-bone" : ""}`}>{t.label}</span>
              </button>
            ))}
          </div>
          <div className="hidden gap-2 md:flex">
            <button aria-label="Previous" onClick={() => scrollBy(-1)} className="grid h-10 w-10 place-items-center border border-line transition-colors hover:border-ink hover:bg-ink hover:text-bone">
              <ArrowLeft size={16} />
            </button>
            <button aria-label="Next" onClick={() => scrollBy(1)} className="grid h-10 w-10 place-items-center border border-line transition-colors hover:border-ink hover:bg-ink hover:text-bone">
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div ref={scroller} data-lenis-prevent-wheel className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:gap-4 md:px-8">
        <AnimatePresence mode="popLayout">
          {items.map((p, i) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className="w-[70vw] shrink-0 snap-start sm:w-[42vw] lg:w-[calc((100vw-4rem-3rem)/4)]"
            >
              <ProductCard product={p} priority={i < 4} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-10 px-4 md:px-8">
        <Link href="/shop" className="label link-underline pb-1">
          View all products →
        </Link>
      </div>
    </section>
  );
}

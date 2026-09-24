"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CATEGORIES, PRODUCTS, type Category } from "@/lib/products";
import { ProductCard } from "@/components/product/ProductCard";
import { SplitText } from "@/components/motion/Reveal";

const SORTS = {
  featured: "Featured",
  new: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
} as const;
type Sort = keyof typeof SORTS;

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export function ShopView({ category, newOnly = false }: { category?: Category; newOnly?: boolean }) {
  const [sort, setSort] = useState<Sort>(newOnly ? "new" : "featured");
  const [sizes, setSizes] = useState<string[]>([]);
  const [columns, setColumns] = useState<2 | 4>(4);

  const meta = CATEGORIES.find((c) => c.slug === category);
  const title = meta?.title ?? (newOnly ? "New arrivals" : "Shop all");

  const products = useMemo(() => {
    let list = PRODUCTS.filter((p) => !category || p.category === category);
    if (newOnly) list = list.filter((p) => p.badge === "New" || p.badge === "Limited");
    if (sizes.length) list = list.filter((p) => sizes.some((s) => p.sizes.includes(s) && !p.soldOut?.includes(s)));
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "new") sorted.sort((a, b) => Number(b.badge === "New") - Number(a.badge === "New"));
    return sorted;
  }, [category, newOnly, sizes, sort]);

  const toggleSize = (s: string) => setSizes((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <div className="pb-24">
      <header className="px-4 pb-8 pt-12 md:px-8 md:pt-20">
        <p className="label text-maroon">{meta ? meta.blurb : "Collection 01 — Men / Unisex"}</p>
        <SplitText
          as="h1"
          animateOnMount
          text={title}
          className="font-display mt-3 text-7xl font-black uppercase leading-[0.85] md:text-[9vw]"
        />
      </header>

      {/* Filter bar */}
      <div className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-4 border-y border-line bg-bone/90 px-4 py-3 backdrop-blur md:px-8">
        <nav className="no-scrollbar flex gap-5 overflow-x-auto">
          <Link href="/shop" className={`label whitespace-nowrap ${!category && !newOnly ? "text-maroon" : "text-muted hover:text-ink"}`}>
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/shop/${c.slug}`}
              className={`label whitespace-nowrap ${category === c.slug ? "text-maroon" : "text-muted hover:text-ink"}`}
            >
              {c.title}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-1">
            {ALL_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={`h-8 min-w-9 border px-2 text-[11px] transition-colors ${
                  sizes.includes(s) ? "border-ink bg-ink text-bone" : "border-line hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="label h-8 border border-line bg-transparent px-2 outline-none"
            aria-label="Sort products"
          >
            {Object.entries(SORTS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <div className="hidden gap-1 lg:flex">
            {([2, 4] as const).map((n) => (
              <button
                key={n}
                onClick={() => setColumns(n)}
                aria-label={`${n} columns`}
                className={`label h-8 w-8 border ${columns === n ? "border-ink" : "border-line text-muted"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="px-4 py-4 text-xs text-muted md:px-8">{products.length} products</p>

      <motion.div
        layout
        className={`grid grid-cols-2 gap-x-3 gap-y-10 px-4 md:gap-x-4 md:px-8 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-2"}`}
      >
        <AnimatePresence mode="popLayout">
          {products.map((p, i) => (
            <motion.div
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, delay: (i % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProductCard product={p} priority={i < 4} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {products.length === 0 && (
        <div className="px-4 py-24 text-center md:px-8">
          <p className="font-display text-5xl font-black uppercase">Nothing in that size yet</p>
          <button onClick={() => setSizes([])} className="label mt-4 underline underline-offset-4">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

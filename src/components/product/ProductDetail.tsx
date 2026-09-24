"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Minus, Plus, Ruler, X } from "lucide-react";
import { formatPrice, FREE_SHIPPING_THRESHOLD, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/Button";

const SIZE_CHART = [
  ["XS", "64", "54", "58"],
  ["S", "67", "57", "60"],
  ["M", "70", "60", "62"],
  ["L", "73", "63", "64"],
  ["XL", "76", "66", "66"],
  ["XXL", "79", "69", "68"],
];

export function ProductDetail({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const [size, setSize] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("Description");

  const lowStock = product.soldOut?.length ? "Selling fast. Some sizes are sold out" : null;

  const addToBag = () => {
    if (!size) {
      setError(true);
      return;
    }
    add(product.slug, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const sections = [
    { title: "Description", body: <p>{product.description}</p> },
    {
      title: "Details & fabric",
      body: (
        <ul className="list-inside list-disc space-y-1">
          {product.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      ),
    },
    {
      title: "Delivery & exchanges",
      body: (
        <p>
          Delivered in 2–5 working days across Pakistan. Free delivery over {formatPrice(FREE_SHIPPING_THRESHOLD)}. Cash on
          delivery available. Exchanges accepted within 7 days of delivery on unworn items with tags.
        </p>
      ),
    },
  ];

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr]">
      {/* Gallery: stacked on desktop, swipeable on mobile */}
      <div className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto lg:grid lg:grid-cols-2 lg:gap-1 lg:overflow-visible">
        {[...product.images, ...product.images].map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            className={`relative aspect-[3/4] w-full shrink-0 snap-start overflow-hidden bg-blush ${i === 0 ? "lg:col-span-2 lg:aspect-[4/5]" : ""}`}
          >
            <Image
              src={`${src}?w=1400&q=80`}
              alt={`${product.name} view ${i + 1}`}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover transition-transform duration-[1.5s] ease-[var(--ease-drift)] hover:scale-110"
            />
          </motion.div>
        ))}
      </div>

      {/* Info panel */}
      <div className="px-4 py-8 md:px-8 lg:py-12">
        <div className="lg:sticky lg:top-24">
          <p className="label text-muted">{product.category}</p>
          <h1 className="font-display mt-2 text-6xl font-black uppercase leading-[0.85] md:text-7xl">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className={`text-xl ${product.compareAt ? "text-maroon" : ""}`}>{formatPrice(product.price)}</span>
            {product.compareAt && <span className="text-sm text-muted line-through">{formatPrice(product.compareAt)}</span>}
          </div>
          <p className="mt-1 text-xs text-muted">Tax included. Cash on delivery available.</p>

          <p className="mt-8 text-sm">
            Colour: <span className="font-medium">{product.colour}</span>
          </p>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm">
                Size: <span className="font-medium">{size ?? "Select"}</span>
              </p>
              <button onClick={() => setGuideOpen(true)} className="flex items-center gap-1 text-xs underline underline-offset-4 hover:text-maroon">
                <Ruler size={14} /> Size guide
              </button>
            </div>
            <motion.div
              animate={error ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              onAnimationComplete={() => setError(false)}
              className="grid grid-cols-6 gap-1"
            >
              {product.sizes.map((s) => {
                const out = product.soldOut?.includes(s);
                return (
                  <button
                    key={s}
                    disabled={out}
                    onClick={() => setSize(s)}
                    className={`h-12 border text-sm transition-colors ${
                      size === s ? "border-ink bg-ink text-bone" : "border-line hover:border-ink"
                    } disabled:cursor-not-allowed disabled:text-muted/40 disabled:line-through disabled:hover:border-line`}
                  >
                    {s}
                  </button>
                );
              })}
            </motion.div>
            {lowStock && <p className="mt-3 text-xs text-maroon">● {lowStock}</p>}
          </div>

          <Button onClick={addToBag} variant={added ? "maroon" : "ink"} className="mt-6 h-14 w-full">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={added ? "added" : "add"}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                className="flex items-center gap-2"
              >
                {added ? (
                  <>
                    <Check size={16} /> Added to bag
                  </>
                ) : (
                  <>Add to bag · {formatPrice(product.price)}</>
                )}
              </motion.span>
            </AnimatePresence>
          </Button>

          <ul className="mt-6 grid grid-cols-2 gap-2 text-xs text-muted">
            <li>✦ Cash on delivery</li>
            <li>✦ 7-day exchanges</li>
            <li>✦ Delivery in 2–5 days</li>
            <li>✦ Free over Rs. 10,000</li>
          </ul>

          {/* Accordion */}
          <div className="mt-8 border-t border-line">
            {sections.map((s) => {
              const open = openSection === s.title;
              return (
                <div key={s.title} className="border-b border-line">
                  <button
                    onClick={() => setOpenSection(open ? null : s.title)}
                    className="label flex w-full items-center justify-between py-4"
                    aria-expanded={open}
                  >
                    {s.title}
                    {open ? <Minus size={14} /> : <Plus size={14} />}
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pb-5 text-sm leading-relaxed text-ink-soft">{s.body}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Size guide modal */}
      <AnimatePresence>
        {guideOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setGuideOpen(false)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-bone p-8"
            >
              <button onClick={() => setGuideOpen(false)} aria-label="Close" className="absolute right-4 top-4">
                <X size={20} strokeWidth={1.5} />
              </button>
              <p className="label text-maroon">Size guide</p>
              <h2 className="font-display mt-2 text-5xl font-black uppercase">Find your fit</h2>
              <p className="mt-2 text-sm text-muted">Measurements in cm, garment laid flat. Our fit is boxy. Size down for a regular look.</p>
              <table className="mt-6 w-full text-sm">
                <thead>
                  <tr className="label border-b border-line text-left text-muted">
                    <th className="py-2">Size</th>
                    <th>Length</th>
                    <th>Chest</th>
                    <th>Shoulder</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART.map((row) => (
                    <tr key={row[0]} className={`border-b border-line ${row[0] === size ? "bg-blush" : ""}`}>
                      {row.map((cell, i) => (
                        <td key={i} className={`py-2 ${i === 0 ? "font-medium" : ""}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

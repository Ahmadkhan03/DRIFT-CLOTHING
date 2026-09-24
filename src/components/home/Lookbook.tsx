"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { EDITORIAL, PRODUCTS } from "@/lib/products";

const FRAMES = [
  { src: EDITORIAL.campaignB, caption: "Look 01", product: PRODUCTS[4] },
  { src: EDITORIAL.alley, caption: "Look 02", product: PRODUCTS[12] },
  { src: PRODUCTS[10].images[0], caption: "Look 03", product: PRODUCTS[10] },
  { src: EDITORIAL.wall, caption: "Look 04", product: PRODUCTS[1] },
  { src: PRODUCTS[11].images[0], caption: "Look 05", product: PRODUCTS[11] },
];

/** Pinned section that scrolls horizontally as the page scrolls vertically. */
export function Lookbook() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-62%"]);

  return (
    <section ref={ref} className="relative h-[300vh] bg-ink text-bone">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mb-8 flex items-end justify-between px-4 md:px-8">
          <div>
            <p className="label text-bone/60">Lookbook</p>
            <h2 className="font-display mt-2 text-6xl font-black uppercase leading-[0.85] md:text-8xl">Collection 01</h2>
          </div>
          <p className="label hidden text-bone/60 md:block">Shop the look ↓</p>
        </div>

        <motion.div style={{ x }} className="flex gap-4 pl-4 md:gap-6 md:pl-8">
          {FRAMES.map((f, i) => (
            <Link
              key={i}
              href={`/product/${f.product.slug}`}
              className="group relative aspect-[3/4] h-[58vh] shrink-0 overflow-hidden bg-ink-soft"
            >
              <Image
                src={`${f.src}?w=1000&q=80`}
                alt={f.caption}
                fill
                sizes="40vw"
                className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-drift)] group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between bg-bone p-4 text-ink transition-transform duration-500 ease-[var(--ease-drift)] group-hover:translate-y-0">
                <span className="text-sm font-medium">{f.product.name}</span>
                <span className="label text-maroon">Shop →</span>
              </div>
              <span className="label absolute left-4 top-4">{f.caption}</span>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

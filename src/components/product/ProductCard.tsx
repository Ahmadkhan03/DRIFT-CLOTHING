"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart-store";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const add = useCart((s) => s.add);
  const [hovered, setHovered] = useState(false);
  const available = product.sizes.filter((s) => !product.soldOut?.includes(s));

  return (
    <div className="group relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-blush">
          <Image
            src={`${product.images[0]}?w=900&q=80`}
            alt={`${product.name} in ${product.colour}`}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-drift)] group-hover:scale-105"
          />
          {/* Second image fades in on hover */}
          <Image
            src={`${product.images[1]}?w=900&q=80`}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-700 ease-[var(--ease-drift)] group-hover:opacity-100"
          />
          {product.badge && (
            <span
              className={`label absolute left-3 top-3 px-2 py-1 text-[10px] ${
                product.badge === "Limited" ? "bg-maroon text-bone" : "bg-bone text-ink"
              }`}
            >
              {product.badge}
            </span>
          )}
        </div>
      </Link>

      {/* Quick add: sizes slide up over the image on hover (desktop) */}
      <motion.div
        initial={false}
        animate={{ y: hovered ? 0 : "100%", opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-x-0 top-0 hidden aspect-[3/4] items-end overflow-hidden md:flex"
      >
        <div className="pointer-events-auto w-full bg-bone/95 p-3 backdrop-blur">
          <p className="label mb-2 text-muted">Quick add</p>
          <div className="flex flex-wrap gap-1">
            {product.sizes.map((size) => {
              const out = !available.includes(size);
              return (
                <button
                  key={size}
                  disabled={out}
                  onClick={() => add(product.slug, size)}
                  className="h-8 min-w-10 border border-line px-2 text-xs transition-colors hover:border-maroon hover:bg-maroon hover:text-bone disabled:cursor-not-allowed disabled:text-muted/50 disabled:line-through"
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <Link href={`/product/${product.slug}`} className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">{product.name}</h3>
          <p className="text-xs text-muted">{product.colour}</p>
        </div>
        <div className="text-right text-sm">
          <span className={product.compareAt ? "text-maroon" : ""}>{formatPrice(product.price)}</span>
          {product.compareAt && (
            <span className="block text-xs text-muted line-through">{formatPrice(product.compareAt)}</span>
          )}
        </div>
      </Link>
    </div>
  );
}

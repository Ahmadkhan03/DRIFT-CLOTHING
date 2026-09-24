"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { FREE_SHIPPING_THRESHOLD, formatPrice, getProduct, PRODUCTS } from "@/lib/products";
import { ButtonLink } from "@/components/ui/Button";

export function CartDrawer() {
  const { lines, isOpen, close, setQuantity, remove, add } = useCart();
  const lenis = useLenis();

  const items = lines
    .map((l) => ({ ...l, product: getProduct(l.slug) }))
    .filter((l): l is typeof l & { product: NonNullable<typeof l.product> } => !!l.product);
  const subtotal = items.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const progress = Math.min(subtotal / FREE_SHIPPING_THRESHOLD, 1);

  const inCart = new Set(lines.map((l) => l.slug));
  const suggestions = PRODUCTS.filter((p) => !inCart.has(p.slug) && p.category === "tees").slice(0, 2);

  // Lock page scroll while the drawer is open.
  useEffect(() => {
    if (isOpen) lenis?.stop();
    else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, lenis, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[70] bg-ink/40 backdrop-blur-[2px]"
          />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-label="Shopping bag"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col bg-bone"
            data-lenis-prevent
          >
            <div className="flex h-16 items-center justify-between border-b border-line px-6">
              <p className="label">Your bag ({items.reduce((n, l) => n + l.quantity, 0)})</p>
              <button onClick={close} aria-label="Close bag">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Free shipping progress */}
            <div className="border-b border-line px-6 py-4">
              <p className="mb-2 text-xs">
                {remaining > 0 ? (
                  <>
                    You&apos;re <span className="font-semibold text-maroon">{formatPrice(remaining)}</span> away from free delivery
                  </>
                ) : (
                  <span className="font-semibold text-maroon">You&apos;ve unlocked free delivery ✦</span>
                )}
              </p>
              <div className="h-[3px] w-full bg-line">
                <motion.div
                  className="h-full bg-maroon"
                  initial={false}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                  <p className="font-display text-5xl font-black uppercase">Your bag is empty</p>
                  <ButtonLink href="/shop" onClick={close}>
                    Shop the collection
                  </ButtonLink>
                </div>
              ) : (
                <ul>
                  <AnimatePresence initial={false}>
                    {items.map((l) => (
                      <motion.li
                        key={`${l.slug}-${l.size}`}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 30, height: 0 }}
                        className="flex gap-4 border-b border-line py-5"
                      >
                        <Link href={`/product/${l.slug}`} onClick={close} className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-blush">
                          <Image src={`${l.product.images[0]}?w=300&q=80`} alt={l.product.name} fill sizes="96px" className="object-cover" />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">{l.product.name}</p>
                              <p className="text-xs text-muted">
                                {l.product.colour} · Size {l.size}
                              </p>
                            </div>
                            <p className="text-sm">{formatPrice(l.product.price * l.quantity)}</p>
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center border border-line">
                              <button className="p-2" aria-label="Decrease" onClick={() => setQuantity(l.slug, l.size, l.quantity - 1)}>
                                <Minus size={12} />
                              </button>
                              <span className="w-6 text-center text-xs">{l.quantity}</span>
                              <button className="p-2" aria-label="Increase" onClick={() => setQuantity(l.slug, l.size, l.quantity + 1)}>
                                <Plus size={12} />
                              </button>
                            </div>
                            <button onClick={() => remove(l.slug, l.size)} className="text-xs text-muted underline-offset-4 hover:text-maroon hover:underline">
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}

              {items.length > 0 && suggestions.length > 0 && (
                <div className="py-6">
                  <p className="label mb-3 text-muted">Complete the fit</p>
                  <div className="grid grid-cols-2 gap-3">
                    {suggestions.map((p) => (
                      <div key={p.slug} className="text-xs">
                        <div className="relative aspect-[3/4] overflow-hidden bg-blush">
                          <Image src={`${p.images[0]}?w=300&q=80`} alt={p.name} fill sizes="200px" className="object-cover" />
                        </div>
                        <p className="mt-2 font-medium">{p.name}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-muted">{formatPrice(p.price)}</span>
                          <button onClick={() => add(p.slug, "M")} className="label text-[10px] text-maroon hover:underline">
                            + Add M
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-line px-6 py-5">
                <div className="mb-1 flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <p className="mb-4 text-xs text-muted">Shipping & discounts calculated at checkout.</p>
                <ButtonLink href="/checkout" onClick={close} variant="maroon" className="w-full">
                  Checkout · {formatPrice(subtotal)}
                </ButtonLink>
                <p className="mt-3 text-center text-[11px] text-muted">Cash on Delivery · Card · JazzCash · Easypaisa</p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

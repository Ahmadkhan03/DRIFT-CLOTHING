import { FREE_SHIPPING_THRESHOLD } from "@/lib/products";

/** Flat nationwide delivery fee (PKR) below the free-delivery threshold. */
export const SHIPPING_FEE = 250;

export function shippingFor(subtotal: number) {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function computeTotals(subtotal: number, discount = 0) {
  const shipping = shippingFor(subtotal);
  const safeDiscount = Math.min(Math.max(discount, 0), subtotal);
  return { subtotal, discount: safeDiscount, shipping, total: subtotal - safeDiscount + shipping };
}

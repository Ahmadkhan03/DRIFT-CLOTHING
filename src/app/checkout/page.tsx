import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Checkout" };

// Placeholder until phase 3 (checkout, orders and payments).
export default function CheckoutPage() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="label text-maroon">Phase 3</p>
      <h1 className="font-display text-7xl font-black uppercase leading-[0.85] md:text-9xl">Checkout</h1>
      <p className="max-w-md text-sm text-muted">
        Checkout with Cash on Delivery, card and wallet payments will be built in the next phase.
      </p>
      <ButtonLink href="/shop">Continue shopping</ButtonLink>
    </section>
  );
}

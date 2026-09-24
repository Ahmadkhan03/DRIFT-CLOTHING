import type { Metadata } from "next";
import { TrackOrderForm } from "@/components/order/TrackOrderForm";
import { SplitText } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Track your order" };

export default function TrackOrderPage() {
  return (
    <div className="px-4 pb-24 pt-12 md:px-8 md:pt-20">
      <div className="mx-auto max-w-4xl">
        <p className="label text-maroon">Order status</p>
        <SplitText
          as="h1"
          animateOnMount
          text="Track your order"
          className="font-display mt-3 text-7xl font-black uppercase leading-[0.85] md:text-9xl"
        />
        <p className="mb-10 mt-6 max-w-lg text-ink-soft">
          Enter your order number (from your confirmation email) and the mobile number you used at checkout.
        </p>
        <TrackOrderForm />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MessageCircle, Package, PhoneCall } from "lucide-react";
import { getOrderForBuyer } from "@/lib/orders";
import { formatPrice } from "@/lib/products";
import { StatusTimeline } from "@/components/order/StatusTimeline";
import { ButtonLink } from "@/components/ui/Button";
import { SplitText } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default async function OrderPage(props: PageProps<"/order/[number]">) {
  const { number } = await props.params;
  const { t } = await props.searchParams;
  const order = typeof t === "string" ? await getOrderForBuyer(number, t) : null;
  if (!order) notFound();

  const firstName = order.full_name.split(" ")[0];
  const placed = order.status === "pending";

  return (
    <div className="px-4 pb-24 pt-12 md:px-8 md:pt-20">
      <div className="mx-auto max-w-5xl">
        <p className="label text-maroon">Order {order.order_number}</p>
        <SplitText
          as="h1"
          animateOnMount
          text={placed ? `Thank you, ${firstName}` : `Hi ${firstName}`}
          className="font-display mt-3 text-7xl font-black uppercase leading-[0.85] md:text-9xl"
        />
        <p className="mt-6 max-w-xl text-ink-soft">
          {placed
            ? `Your order is in. We'll call or WhatsApp you on ${order.phone} to confirm, then it ships within 1–2 working days.`
            : "Here's the latest on your order."}
        </p>

        <div className="mt-12 border-y border-line py-8">
          <StatusTimeline status={order.status} events={order.order_events} />
          {order.tracking_number && (
            <p className="mt-6 text-sm">
              {order.courier ?? "Courier"} tracking: <span className="font-mono">{order.tracking_number}</span>
            </p>
          )}
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <section>
            <p className="label mb-6">Items</p>
            <ul className="flex flex-col divide-y divide-line border-y border-line">
              {order.order_items.map((item) => (
                <li key={`${item.product_slug}-${item.size}`} className="flex items-center gap-4 py-4">
                  <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden bg-blush">
                    {item.image && <Image src={`${item.image}?w=240&q=75`} alt={item.product_name} fill sizes="80px" className="object-cover" />}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-xs text-muted">
                      {item.colour} · Size {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm">{formatPrice(item.line_total)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-6 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-maroon">
                  <dt>Discount {order.discount_code && `(${order.discount_code})`}</dt>
                  <dd>−{formatPrice(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-soft">Delivery</dt>
                <dd>{order.shipping ? formatPrice(order.shipping) : "Free"}</dd>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
                <dt className="label">{order.payment_method === "cod" ? "Pay on delivery" : "Total"}</dt>
                <dd className="font-display text-4xl font-black">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <aside className="flex flex-col gap-8">
            <div>
              <p className="label mb-3">Delivering to</p>
              <address className="text-sm not-italic leading-relaxed text-ink-soft">
                {order.full_name}
                <br />
                {order.address_line1}
                {order.address_line2 && (
                  <>
                    <br />
                    {order.address_line2}
                  </>
                )}
                <br />
                {order.city}, {order.province} {order.postal_code}
                <br />
                {order.phone}
              </address>
            </div>
            <div>
              <p className="label mb-3">Payment</p>
              <p className="text-sm text-ink-soft">
                {order.payment_method === "cod" ? "Cash on Delivery" : "Card / wallet"} ·{" "}
                {order.payment_status === "paid" ? "Paid" : "Unpaid"}
              </p>
            </div>
            <div className="bg-maroon p-6 text-bone">
              <p className="label text-bone/70">What happens next</p>
              <ul className="mt-4 flex flex-col gap-4 text-sm">
                <li className="flex gap-3">
                  <PhoneCall size={18} className="shrink-0" /> We confirm your order by call or WhatsApp.
                </li>
                <li className="flex gap-3">
                  <Package size={18} className="shrink-0" /> Packed and handed to the courier in 1–2 days.
                </li>
                <li className="flex gap-3">
                  <MessageCircle size={18} className="shrink-0" /> Delivered in 2–5 working days. Keep {formatPrice(order.total)} ready.
                </li>
              </ul>
            </div>
            <ButtonLink href="/shop" variant="outline">
              Continue shopping
            </ButtonLink>
          </aside>
        </div>
      </div>
    </div>
  );
}

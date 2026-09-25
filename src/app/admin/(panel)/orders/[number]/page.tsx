import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminOrder } from "@/lib/admin/data";
import { STATUS_LABEL } from "@/lib/order-status";
import { formatPrice } from "@/lib/products";
import { Card, fmtDate, PaymentBadge, StatusBadge, whatsappUrl } from "@/components/admin/ui";
import { OrderActions } from "@/components/admin/OrderActions";

export async function generateMetadata(props: PageProps<"/admin/orders/[number]">): Promise<Metadata> {
  const { number } = await props.params;
  return { title: `Order ${number}` };
}

export default async function AdminOrderPage(props: PageProps<"/admin/orders/[number]">) {
  await requireAdmin();
  const { number } = await props.params;
  const order = await getAdminOrder(number.toUpperCase());
  if (!order) notFound();

  const firstName = order.full_name.split(" ")[0];
  const confirmMsg = `Assalam o Alaikum ${firstName}! This is DRIFT. Please reply YES to confirm your order ${order.order_number} of ${formatPrice(order.total)} (Cash on Delivery) to ${order.city}.`;

  return (
    <>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1 text-xs text-muted hover:text-ink print:hidden">
        <ArrowLeft size={13} /> All orders
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label text-maroon">{fmtDate(order.created_at, true)}</p>
          <h1 className="font-display text-5xl font-black uppercase leading-[0.9] md:text-6xl">{order.order_number}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge status={order.status} />
            <PaymentBadge status={order.payment_status} method={order.payment_method} />
          </div>
        </div>
        <div className="w-full max-w-xl">
          <OrderActions
            orderNumber={order.order_number}
            status={order.status}
            paymentStatus={order.payment_status}
            paymentMethod={order.payment_method}
            whatsapp={whatsappUrl(order.phone, order.status === "pending" ? confirmMsg : undefined)}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card title={`Items (${order.order_items.reduce((n, i) => n + i.quantity, 0)})`}>
            <ul className="-my-3 divide-y divide-line">
              {order.order_items.map((i) => (
                <li key={`${i.product_slug}-${i.size}`} className="flex items-center gap-4 py-3">
                  <div className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden bg-blush print:hidden">
                    {i.image && <Image src={`${i.image}?w=160&q=70`} alt="" fill sizes="56px" className="object-cover" />}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{i.product_name}</p>
                    <p className="text-xs text-muted">
                      {i.colour} · Size <strong className="text-ink">{i.size}</strong>
                    </p>
                  </div>
                  <p className="text-sm text-muted">
                    {formatPrice(i.unit_price)} × {i.quantity}
                  </p>
                  <p className="w-24 text-right text-sm font-medium">{formatPrice(i.line_total)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-5 flex flex-col gap-1.5 border-t border-line pt-4 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              {order.discount > 0 && <Row label={`Discount (${order.discount_code})`} value={`−${formatPrice(order.discount)}`} />}
              <Row label="Delivery" value={order.shipping ? formatPrice(order.shipping) : "Free"} />
              <div className="mt-2 flex justify-between border-t border-line pt-3 text-base font-semibold">
                <dt>{order.payment_method === "cod" ? "Collect on delivery" : "Total"}</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Timeline">
            <ol className="flex flex-col gap-4">
              {[...order.order_events].reverse().map((e, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${idx === 0 ? "bg-maroon" : "bg-line"}`} />
                  <div>
                    <p className="font-medium">{STATUS_LABEL[e.status]}</p>
                    {e.note && <p className="text-ink-soft">{e.note}</p>}
                    <p className="text-xs text-muted">
                      {fmtDate(e.created_at, true)}
                      {e.created_by && ` · ${e.created_by}`}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card
            title="Customer"
            action={
              order.customer_id && (
                <Link href={`/admin/customers/${order.customer_id}`} className="text-xs text-muted hover:text-ink print:hidden">
                  Profile →
                </Link>
              )
            }
          >
            <p className="font-medium">{order.full_name}</p>
            <p className="text-sm">
              <a href={`tel:${order.phone}`} className="hover:text-maroon">
                {order.phone}
              </a>
            </p>
            <p className="text-sm text-muted">{order.email}</p>
          </Card>
          <Card title="Ship to">
            <address className="text-sm not-italic leading-relaxed">
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
            {order.notes && <p className="mt-3 border-l-2 border-maroon bg-blush/50 px-3 py-2 text-sm">“{order.notes}”</p>}
          </Card>
          {order.tracking_number && (
            <Card title="Shipment">
              <p className="text-sm">{order.courier}</p>
              <p className="font-mono text-sm">{order.tracking_number}</p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

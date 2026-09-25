import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getCustomer } from "@/lib/admin/data";
import { isCounted } from "@/lib/order-status";
import { formatPrice } from "@/lib/products";
import { Card, fmtDate, PaymentBadge, StatusBadge, Table, whatsappUrl } from "@/components/admin/ui";
import { CustomerEditor } from "@/components/admin/CustomerEditor";

export const metadata: Metadata = { title: "Customer" };

export default async function CustomerPage(props: PageProps<"/admin/customers/[id]">) {
  await requireAdmin();
  const { id } = await props.params;
  const data = await getCustomer(id);
  if (!data) notFound();
  const { customer: c, orders } = data;

  const counted = orders.filter((o) => isCounted(o.status));
  const cancelled = orders.filter((o) => o.status === "cancelled" || o.status === "returned").length;
  const aov = counted.length ? Math.round(c.total_spent / counted.length) : 0;

  // Favourite size & category from order history
  const sizes = new Map<string, number>();
  for (const o of counted) for (const i of o.order_items) sizes.set(i.size, (sizes.get(i.size) ?? 0) + i.quantity);
  const topSize = [...sizes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <>
      <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
        <ArrowLeft size={13} /> All customers
      </Link>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-maroon">Customer since {fmtDate(c.created_at)}</p>
          <h1 className="font-display text-5xl font-black uppercase leading-[0.9] md:text-6xl">{c.full_name ?? c.phone}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 hover:text-maroon">
              <Phone size={14} /> {c.phone}
            </a>
            <a href={whatsappUrl(c.phone)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-maroon">
              <MessageCircle size={14} /> WhatsApp
            </a>
            {c.email && (
              <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 hover:text-maroon">
                <Mail size={14} /> {c.email}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Lifetime value" value={formatPrice(c.total_spent)} />
        <Stat label="Orders" value={String(c.order_count)} />
        <Stat label="Avg. order" value={formatPrice(aov)} />
        <Stat label="Usual size" value={topSize ?? "—"} />
        <Stat label="Cancelled / returned" value={String(cancelled)} warn={cancelled >= 2} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div>
          <h2 className="label mb-3">Order history</h2>
          <Table head={["Order", "Date", "Items", "Status", "Payment", "Total"]}>
            {orders.map((o) => (
              <tr key={o.order_number} className="hover:bg-bone/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.order_number}`} className="font-mono text-xs font-medium hover:text-maroon">
                    {o.order_number}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">{fmtDate(o.created_at)}</td>
                <td className="px-4 py-3 text-xs">{o.order_items.map((i) => `${i.product_name} (${i.size})`).join(", ")}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3">
                  <PaymentBadge status={o.payment_status} method={o.payment_method} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">{formatPrice(o.total)}</td>
              </tr>
            ))}
          </Table>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Tags & notes">
            <CustomerEditor id={c.id} tags={c.tags} notes={c.notes} />
          </Card>
          <Card title="Latest address">
            {orders[0] ? (
              <address className="text-sm not-italic leading-relaxed">
                {orders[0].address_line1}
                <br />
                {orders[0].city}, {orders[0].province}
              </address>
            ) : (
              <p className="text-sm text-muted">—</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="border border-line bg-paper p-4">
      <p className="label text-[10px] text-muted">{label}</p>
      <p className={`font-display mt-1 text-3xl font-black ${warn ? "text-maroon" : ""}`}>{value}</p>
    </div>
  );
}

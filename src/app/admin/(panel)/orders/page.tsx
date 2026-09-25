import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { countOrdersByStatus, listOrders } from "@/lib/admin/data";
import { STATUS_LABEL, type OrderStatus } from "@/lib/order-status";
import { formatPrice } from "@/lib/products";
import { Empty, fmtDate, PageHeader, Pagination, PaymentBadge, StatusBadge, Table } from "@/components/admin/ui";
import { SearchBox } from "@/components/admin/SearchBox";

export const metadata: Metadata = { title: "Orders" };

const TABS: (OrderStatus | "all")[] = ["all", "pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"];

export default async function OrdersPage(props: PageProps<"/admin/orders">) {
  await requireAdmin();
  const sp = await props.searchParams;
  const status = TABS.includes(sp.status as OrderStatus) && sp.status !== "all" ? (sp.status as OrderStatus) : undefined;
  const q = typeof sp.q === "string" ? sp.q : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const [result, counts] = await Promise.all([listOrders({ status, q, page }), countOrdersByStatus()]);
  const href = (next: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status, q: q || undefined, page, ...next };
    Object.entries(merged).forEach(([k, v]) => v !== undefined && v !== "" && !(k === "page" && v === 1) && p.set(k, String(v)));
    return `/admin/orders${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <PageHeader eyebrow="Sales" title="Orders" />

      <div className="no-scrollbar mb-4 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => {
          const active = (t === "all" && !status) || t === status;
          return (
            <Link
              key={t}
              href={href({ status: t === "all" ? undefined : t, page: 1 })}
              className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm ${active ? "border-maroon text-ink" : "border-transparent text-muted hover:text-ink"}`}
            >
              {t === "all" ? "All" : STATUS_LABEL[t]}
              <span className="ml-1.5 text-xs text-muted">{counts[t]}</span>
            </Link>
          );
        })}
      </div>

      <div className="mb-4">
        <Suspense>
          <SearchBox placeholder="Search order #, name or phone" />
        </Suspense>
      </div>

      <Table head={["Order", "Date", "Customer", "City", "Items", "Status", "Payment", "Total"]}>
        {result.rows.map((o) => (
          <tr key={o.order_number} className="hover:bg-bone/60">
            <td className="px-4 py-3">
              <Link href={`/admin/orders/${o.order_number}`} className="font-mono text-xs font-medium hover:text-maroon">
                {o.order_number}
              </Link>
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">{fmtDate(o.created_at, true)}</td>
            <td className="px-4 py-3">
              <Link href={`/admin/orders/${o.order_number}`} className="hover:text-maroon">
                {o.full_name}
              </Link>
              <p className="text-xs text-muted">{o.phone}</p>
            </td>
            <td className="px-4 py-3 text-xs">{o.city}</td>
            <td className="px-4 py-3 text-xs">{o.order_items.reduce((n, i) => n + i.quantity, 0)}</td>
            <td className="px-4 py-3">
              <StatusBadge status={o.status} />
            </td>
            <td className="px-4 py-3">
              <PaymentBadge status={o.payment_status} method={o.payment_method} />
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right font-medium">{formatPrice(o.total)}</td>
          </tr>
        ))}
      </Table>
      {result.rows.length === 0 && <Empty>No orders match.</Empty>}
      <Pagination page={result.page} total={result.total} pageSize={result.pageSize} href={(p) => href({ page: p })} />
    </>
  );
}

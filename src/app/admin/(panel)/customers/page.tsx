import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { listCustomers } from "@/lib/admin/data";
import { formatPrice } from "@/lib/products";
import { Empty, fmtDate, PageHeader, Pagination, Table } from "@/components/admin/ui";
import { SearchBox } from "@/components/admin/SearchBox";

export const metadata: Metadata = { title: "Customers" };

const SORTS = { recent: "Last order", spent: "Total spent", orders: "Orders" } as const;
type Sort = keyof typeof SORTS;

export default async function CustomersPage(props: PageProps<"/admin/customers">) {
  await requireAdmin();
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const sort: Sort = sp.sort === "spent" || sp.sort === "orders" ? sp.sort : "recent";
  const page = Math.max(1, Number(sp.page) || 1);
  const result = await listCustomers({ q, sort, page });

  const href = (next: Record<string, string | number>) => {
    const p = new URLSearchParams();
    const merged: Record<string, string | number> = { ...(q && { q }), sort, page, ...next };
    Object.entries(merged).forEach(([k, v]) => !(k === "page" && v === 1) && !(k === "sort" && v === "recent") && p.set(k, String(v)));
    return `/admin/customers${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <PageHeader eyebrow="CRM" title="Customers" />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Suspense>
          <SearchBox placeholder="Search name, phone, email, city" />
        </Suspense>
        <div className="flex items-center gap-2 text-xs text-muted">
          Sort by
          {(Object.keys(SORTS) as Sort[]).map((s) => (
            <Link key={s} href={href({ sort: s, page: 1 })} className={`border px-2 py-1 ${s === sort ? "border-ink text-ink" : "border-line hover:text-ink"}`}>
              {SORTS[s]}
            </Link>
          ))}
        </div>
      </div>

      <Table head={["Customer", "Phone", "City", "Orders", "Total spent", "Last order", "Tags"]}>
        {result.rows.map((c) => (
          <tr key={c.id} className="hover:bg-bone/60">
            <td className="px-4 py-3">
              <Link href={`/admin/customers/${c.id}`} className="font-medium hover:text-maroon">
                {c.full_name ?? "—"}
              </Link>
              <p className="text-xs text-muted">{c.email}</p>
            </td>
            <td className="px-4 py-3 text-xs">{c.phone}</td>
            <td className="px-4 py-3 text-xs">{c.city}</td>
            <td className="px-4 py-3">{c.order_count}</td>
            <td className="whitespace-nowrap px-4 py-3 font-medium">{formatPrice(c.total_spent)}</td>
            <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">{fmtDate(c.last_order_at)}</td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap gap-1">
                {c.order_count >= 3 && <span className="bg-maroon px-1.5 py-0.5 text-[10px] text-bone">Repeat</span>}
                {c.tags.map((t) => (
                  <span key={t} className="border border-line px-1.5 py-0.5 text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </Table>
      {result.rows.length === 0 && <Empty>No customers yet. They appear here after their first order.</Empty>}
      <Pagination page={result.page} total={result.total} pageSize={result.pageSize} href={(p) => href({ page: p })} />
    </>
  );
}

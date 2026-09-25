import type { Metadata } from "next";
import { Suspense } from "react";
import { Download } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { listSubscribers } from "@/lib/admin/data";
import { Empty, fmtDate, PageHeader, Pagination, Table } from "@/components/admin/ui";
import { SearchBox } from "@/components/admin/SearchBox";

export const metadata: Metadata = { title: "Subscribers" };

const SOURCE_LABEL: Record<string, string> = {
  popup: "Popup",
  footer: "Footer",
  "drop-waitlist": "Drop waitlist",
  checkout: "Checkout",
};

export default async function SubscribersPage(props: PageProps<"/admin/subscribers">) {
  await requireAdmin();
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const result = await listSubscribers({ q, page });

  return (
    <>
      <PageHeader
        eyebrow="Marketing"
        title="Subscribers"
        actions={
          <a href="/admin/subscribers/export" className="label flex h-10 items-center gap-2 border border-ink px-4 text-[11px] hover:bg-ink hover:text-bone">
            <Download size={14} /> Export CSV
          </a>
        }
      />
      <div className="mb-4">
        <Suspense>
          <SearchBox placeholder="Search email" />
        </Suspense>
      </div>
      <Table head={["Email", "Source", "Joined"]}>
        {result.rows.map((s) => (
          <tr key={s.id}>
            <td className="px-4 py-3">{s.email}</td>
            <td className="px-4 py-3 text-xs">{SOURCE_LABEL[s.source] ?? s.source}</td>
            <td className="px-4 py-3 text-xs text-muted">{fmtDate(s.created_at)}</td>
          </tr>
        ))}
      </Table>
      {result.rows.length === 0 && <Empty>No subscribers yet.</Empty>}
      <Pagination
        page={result.page}
        total={result.total}
        pageSize={result.pageSize}
        href={(p) => `/admin/subscribers?${new URLSearchParams({ ...(q && { q }), page: String(p) })}`}
      />
    </>
  );
}

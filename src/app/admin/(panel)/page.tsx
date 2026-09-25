import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Clock, Wallet } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getDashboard } from "@/lib/admin/data";
import { formatPrice } from "@/lib/products";
import { Card, fmtDate, PageHeader, PaymentBadge, StatusBadge } from "@/components/admin/ui";
import { RevenueChart } from "@/components/admin/RevenueChart";

const RANGES = [7, 30, 90];

export default async function DashboardPage(props: PageProps<"/admin">) {
  const admin = await requireAdmin();
  const { range } = await props.searchParams;
  const days = RANGES.includes(Number(range)) ? Number(range) : 30;
  const d = await getDashboard(days);

  return (
    <>
      <PageHeader
        eyebrow={`Welcome back, ${admin.name.split(" ")[0]}`}
        title="Dashboard"
        actions={
          <div className="flex border border-line bg-paper">
            {RANGES.map((r) => (
              <Link
                key={r}
                href={`/admin?range=${r}`}
                className={`label px-3 py-2 text-[10px] ${r === days ? "bg-ink text-bone" : "text-muted hover:text-ink"}`}
              >
                {r} days
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        <Kpi label="Revenue" value={formatPrice(d.revenue)} now={d.revenue} prev={d.revenuePrev} days={days} />
        <Kpi label="Orders" value={String(d.orders)} now={d.orders} prev={d.ordersPrev} days={days} />
        <Kpi label="Avg. order value" value={formatPrice(d.aov)} now={d.aov} prev={d.aovPrev} days={days} />
        <Link href="/admin/orders?status=pending" className="group border border-line bg-paper p-5 transition-colors hover:border-maroon">
          <p className="label flex items-center gap-1.5 text-[10px] text-muted">
            <Clock size={12} /> To confirm
          </p>
          <p className={`font-display mt-2 whitespace-nowrap text-3xl font-black 2xl:text-4xl ${d.toConfirm ? "text-maroon" : ""}`}>{d.toConfirm}</p>
          <p className="mt-1 text-xs text-muted group-hover:text-maroon">Review pending orders →</p>
        </Link>
        <div className="col-span-2 border border-line bg-paper p-5 xl:col-span-1">
          <p className="label flex items-center gap-1.5 text-[10px] text-muted">
            <Wallet size={12} /> COD to collect
          </p>
          <p className="font-display mt-2 whitespace-nowrap text-3xl font-black 2xl:text-4xl">{formatPrice(d.codOutstanding)}</p>
          <p className="mt-1 text-xs text-muted">Shipped or delivered, cash not yet received</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card title={`Revenue · last ${days} days`}>
          <RevenueChart data={d.daily} />
        </Card>
        <Card title="Top products">
          {d.topProducts.length === 0 ? (
            <p className="text-sm text-muted">No sales yet.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {d.topProducts.map((p, i) => {
                const share = p.revenue / d.topProducts[0].revenue;
                return (
                  <li key={p.slug}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="truncate">
                        <span className="mr-2 font-mono text-xs text-muted">{i + 1}</span>
                        {p.name}
                      </span>
                      <span className="whitespace-nowrap text-xs text-muted">
                        {p.units} sold · {formatPrice(p.revenue)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 bg-line">
                      <div className="h-full bg-maroon" style={{ width: `${share * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
          {d.topCities.length > 0 && (
            <div className="mt-6 border-t border-line pt-4">
              <p className="label mb-3 text-[10px] text-muted">Top cities</p>
              <ul className="flex flex-wrap gap-2">
                {d.topCities.map((c) => (
                  <li key={c.city} className="border border-line px-2 py-1 text-xs">
                    {c.city} <span className="text-muted">· {c.orders}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <Card
        title="Recent orders"
        className="mt-6"
        action={
          <Link href="/admin/orders" className="text-xs text-muted hover:text-ink">
            View all →
          </Link>
        }
      >
        {d.recent.length === 0 ? (
          <p className="text-sm text-muted">No orders in this period.</p>
        ) : (
          <ul className="-my-3 divide-y divide-line">
            {d.recent.map((o) => (
              <li key={o.order_number}>
                <Link href={`/admin/orders/${o.order_number}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm hover:text-maroon">
                  <span className="w-20 font-mono text-xs">{o.order_number}</span>
                  <span className="min-w-32 flex-1">{o.full_name}</span>
                  <span className="w-24 text-xs text-muted">{o.city}</span>
                  <StatusBadge status={o.status} />
                  <PaymentBadge status={o.payment_status} method={o.payment_method} />
                  <span className="w-24 text-right">{formatPrice(o.total)}</span>
                  <span className="w-28 text-right text-xs text-muted">{fmtDate(o.created_at, true)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

function Kpi({ label, value, now, prev, days }: { label: string; value: string; now: number; prev: number; days: number }) {
  const change = prev ? (now - prev) / prev : null;
  const up = (change ?? 0) >= 0;
  return (
    <div className="border border-line bg-paper p-5">
      <p className="label text-[10px] text-muted">{label}</p>
      <p className="font-display mt-2 whitespace-nowrap text-3xl font-black 2xl:text-4xl">{value}</p>
      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
        {change === null ? (
          `No data for previous ${days} days`
        ) : (
          <>
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            <span className="font-medium text-ink">{`${up ? "+" : ""}${Math.round(change * 100)}%`}</span> vs previous {days} days
          </>
        )}
      </p>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { STATUS_LABEL, type OrderStatus, type PaymentStatus } from "@/lib/order-status";

export function fmtDate(iso: string | null, withTime = false) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    year: withTime ? undefined : "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "Asia/Karachi",
  });
}

export function PageHeader({ title, eyebrow, actions }: { title: string; eyebrow?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="label text-maroon">{eyebrow}</p>}
        <h1 className="font-display text-5xl font-black uppercase leading-[0.9] md:text-6xl">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`border border-line bg-paper ${className}`}>
      {title && (
        <header className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="label">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

// Status is shown as a dot + label, never colour alone.
const STATUS_TONE: Record<OrderStatus, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-sky-600",
  packed: "bg-indigo-500",
  shipped: "bg-violet-600",
  delivered: "bg-emerald-600",
  cancelled: "bg-muted",
  returned: "bg-maroon-bright",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap border border-line bg-bone px-2 py-0.5 text-[11px] font-medium">
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_TONE[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PaymentBadge({ status, method }: { status: PaymentStatus; method: "cod" | "safepay" }) {
  const label = status === "paid" ? "Paid" : status === "refunded" ? "Refunded" : method === "cod" ? "COD · unpaid" : "Unpaid";
  return (
    <span
      className={`inline-flex whitespace-nowrap px-2 py-0.5 text-[11px] font-medium ${
        status === "paid" ? "bg-ink text-bone" : "border border-dashed border-line text-muted"
      }`}
    >
      {label}
    </span>
  );
}

export function Pagination({ page, total, pageSize, href }: { page: number; total: number; pageSize: number; href: (page: number) => string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return <p className="mt-4 text-xs text-muted">{total} total</p>;
  return (
    <div className="mt-4 flex items-center justify-between text-xs">
      <p className="text-muted">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
      </p>
      <div className="flex gap-1">
        {page > 1 && (
          <Link href={href(page - 1)} className="border border-line px-3 py-1.5 hover:border-ink">
            ← Prev
          </Link>
        )}
        {page < pages && (
          <Link href={href(page + 1)} className="border border-line px-3 py-1.5 hover:border-ink">
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-12 text-center text-sm text-muted">{children}</p>;
}

/** Table shell with consistent header styling and horizontal scroll on small screens. */
export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-line bg-paper">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            {head.map((h, i) => (
              <th key={i} className="label whitespace-nowrap px-4 py-3 text-[10px] font-medium text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

/** WhatsApp deep link for a Pakistani number stored as 03XXXXXXXXX. */
export function whatsappUrl(phone: string, text?: string) {
  const intl = phone.startsWith("0") ? `92${phone.slice(1)}` : phone;
  return `https://wa.me/${intl}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

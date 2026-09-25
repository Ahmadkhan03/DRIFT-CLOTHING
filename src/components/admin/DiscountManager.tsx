"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { addDiscount, toggleDiscount } from "@/app/admin/actions";
import type { AdminDiscount } from "@/lib/admin/types";
import { formatPrice } from "@/lib/products";
import { Button } from "@/components/ui/Button";
import { Table, fmtDate } from "@/components/admin/ui";

export function DiscountManager({ discounts }: { discounts: AdminDiscount[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const create = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const form = e.currentTarget;
    setError(null);
    start(async () => {
      const res = await addDiscount({
        code: String(f.get("code")),
        type,
        value: Number(f.get("value")),
        min_subtotal: Number(f.get("min_subtotal") || 0),
        first_order_only: f.get("first_order_only") === "on",
        usage_limit: f.get("usage_limit") ? Number(f.get("usage_limit")) : null,
        expires_at: String(f.get("expires_at") || "") || null,
      });
      if (!res.ok) return setError(res.message);
      form.reset();
      setOpen(false);
      router.refresh();
    });
  };

  const toggle = (code: string, active: boolean) =>
    start(async () => {
      await toggleDiscount(code, active);
      router.refresh();
    });

  const state = (d: AdminDiscount) => {
    if (!d.active) return { label: "Off", tone: "text-muted" };
    if (d.expires_at && new Date(d.expires_at) < new Date()) return { label: "Expired", tone: "text-muted" };
    if (d.usage_limit !== null && d.times_used >= d.usage_limit) return { label: "Used up", tone: "text-muted" };
    return { label: "Live", tone: "text-emerald-700" };
  };

  const input = "h-10 border border-line bg-bone px-3 text-sm outline-none focus:border-ink";

  return (
    <>
      <div className="mb-4">
        {!open ? (
          <Button onClick={() => setOpen(true)} variant="maroon" className="h-10 px-5">
            <Plus size={15} /> New code
          </Button>
        ) : (
          <form onSubmit={create} className="grid gap-4 border border-line bg-paper p-5 md:grid-cols-4">
            <label className="flex flex-col gap-1 text-xs text-muted md:col-span-2">
              Code
              <input name="code" required placeholder="e.g. EID25" className={`${input} font-mono uppercase text-ink`} />
            </label>
            <div className="flex flex-col gap-1 text-xs text-muted">
              Type
              <div className="flex h-10 border border-line">
                {(["percent", "fixed"] as const).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 text-sm ${type === t ? "bg-ink text-bone" : "bg-bone text-ink"}`}
                  >
                    {t === "percent" ? "% off" : "Rs. off"}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex flex-col gap-1 text-xs text-muted">
              {type === "percent" ? "Percent" : "Amount (Rs.)"}
              <input name="value" type="number" min={1} required className={`${input} text-ink`} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted">
              Minimum spend (Rs.)
              <input name="min_subtotal" type="number" min={0} placeholder="0" className={`${input} text-ink`} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted">
              Usage limit
              <input name="usage_limit" type="number" min={1} placeholder="Unlimited" className={`${input} text-ink`} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted">
              Expires on
              <input name="expires_at" type="date" className={`${input} text-ink`} />
            </label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm">
              <input name="first_order_only" type="checkbox" className="h-4 w-4 accent-[var(--maroon)]" /> First order only
            </label>
            <div className="flex items-center gap-3 md:col-span-4">
              <Button type="submit" variant="maroon" disabled={pending} className="h-10 px-5">
                {pending ? "Creating…" : "Create code"}
              </Button>
              <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted hover:text-ink">
                Cancel
              </button>
              {error && <span className="text-sm text-maroon">{error}</span>}
            </div>
          </form>
        )}
      </div>

      <Table head={["Code", "Discount", "Conditions", "Used", "Expires", "Status", ""]}>
        {discounts.map((d) => {
          const s = state(d);
          return (
            <tr key={d.code} className="hover:bg-bone/60">
              <td className="px-4 py-3 font-mono text-sm font-medium">{d.code}</td>
              <td className="px-4 py-3">{d.type === "percent" ? `${d.value}% off` : `${formatPrice(d.value)} off`}</td>
              <td className="px-4 py-3 text-xs text-muted">
                {[d.min_subtotal ? `Min. ${formatPrice(d.min_subtotal)}` : null, d.first_order_only ? "First order only" : null].filter(Boolean).join(" · ") || "—"}
              </td>
              <td className="px-4 py-3 text-xs">
                {d.times_used}
                {d.usage_limit !== null && ` / ${d.usage_limit}`}
              </td>
              <td className="px-4 py-3 text-xs text-muted">{d.expires_at ? fmtDate(d.expires_at) : "Never"}</td>
              <td className={`px-4 py-3 text-xs font-medium ${s.tone}`}>● {s.label}</td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => toggle(d.code, !d.active)} disabled={pending} className="text-xs text-muted underline-offset-4 hover:text-ink hover:underline">
                  {d.active ? "Turn off" : "Turn on"}
                </button>
              </td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}

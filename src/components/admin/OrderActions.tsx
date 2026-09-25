"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle, Printer } from "lucide-react";
import { markOrderPaid, updateOrderStatus } from "@/app/admin/actions";
import { ACTION_LABEL, COURIERS, NEXT_STATUSES, type OrderStatus, type PaymentStatus } from "@/lib/order-status";
import { Button } from "@/components/ui/Button";

export function OrderActions({
  orderNumber,
  status,
  paymentStatus,
  paymentMethod,
  whatsapp,
}: {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "cod" | "safepay";
  whatsapp: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [target, setTarget] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState("");
  const [courier, setCourier] = useState(COURIERS[0]);
  const [tracking, setTracking] = useState("");
  const [error, setError] = useState<string | null>(null);

  const next = NEXT_STATUSES[status];
  const needsForm = (s: OrderStatus) => s === "shipped" || s === "cancelled" || s === "returned";

  const run = (s: OrderStatus) => {
    setError(null);
    start(async () => {
      const res = await updateOrderStatus({
        orderNumber,
        status: s,
        note: note || undefined,
        courier: s === "shipped" ? courier : undefined,
        trackingNumber: s === "shipped" ? tracking : undefined,
      });
      if (!res.ok) return setError(res.message);
      setTarget(null);
      setNote("");
      setTracking("");
      router.refresh();
    });
  };

  const togglePaid = () =>
    start(async () => {
      const res = await markOrderPaid(orderNumber, paymentStatus !== "paid");
      if (!res.ok) setError(res.message);
      router.refresh();
    });

  return (
    <div className="flex flex-col gap-3 print:hidden">
      {next.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {next.map((s) => {
            const primary = s !== "cancelled" && s !== "returned";
            return (
              <Button
                key={s}
                variant={primary ? "maroon" : "outline"}
                disabled={pending}
                onClick={() => (needsForm(s) ? setTarget(target === s ? null : s) : run(s))}
                className="h-10 px-5"
              >
                {pending && target === null && primary ? <Loader2 size={14} className="animate-spin" /> : ACTION_LABEL[s]}
              </Button>
            );
          })}
        </div>
      )}

      {target && (
        <div className="flex flex-col gap-3 border border-line bg-bone p-4">
          {target === "shipped" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-muted">
                Courier
                <select value={courier} onChange={(e) => setCourier(e.target.value)} className="h-10 border border-line bg-paper px-2 text-sm text-ink">
                  {COURIERS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted">
                Tracking number
                <input value={tracking} onChange={(e) => setTracking(e.target.value)} className="h-10 border border-line bg-paper px-2 font-mono text-sm text-ink" />
              </label>
            </div>
          )}
          <label className="flex flex-col gap-1 text-xs text-muted">
            {target === "cancelled" ? "Reason for cancelling (visible to customer)" : "Note (optional)"}
            <input value={note} onChange={(e) => setNote(e.target.value)} className="h-10 border border-line bg-paper px-2 text-sm text-ink" />
          </label>
          <div className="flex gap-2">
            <Button variant={target === "cancelled" ? "ink" : "maroon"} disabled={pending} onClick={() => run(target)} className="h-10 px-5">
              {pending ? <Loader2 size={14} className="animate-spin" /> : ACTION_LABEL[target]}
            </Button>
            <button onClick={() => setTarget(null)} className="px-3 text-xs text-muted hover:text-ink">
              Back
            </button>
          </div>
        </div>
      )}

      {error && <p className="border-l-2 border-maroon bg-blush/60 px-3 py-2 text-sm text-maroon">{error}</p>}

      <div className="flex flex-wrap gap-4 pt-1 text-xs">
        <a href={whatsapp} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-muted hover:text-ink">
          <MessageCircle size={14} /> WhatsApp customer
        </a>
        <button onClick={() => window.print()} className="flex items-center gap-1.5 text-muted hover:text-ink">
          <Printer size={14} /> Print packing slip
        </button>
        {paymentMethod === "cod" && (status === "shipped" || status === "delivered") && (
          <button onClick={togglePaid} disabled={pending} className="flex items-center gap-1.5 text-muted hover:text-ink">
            {paymentStatus === "paid" ? "Undo: mark COD unpaid" : "Mark COD cash received"}
          </button>
        )}
      </div>
    </div>
  );
}

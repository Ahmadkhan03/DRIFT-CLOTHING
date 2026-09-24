"use client";

import { useState, useTransition, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { trackOrder, type TrackResult } from "@/app/actions/track";
import { formatPrice } from "@/lib/products";
import { Button } from "@/components/ui/Button";
import { StatusTimeline } from "@/components/order/StatusTimeline";

export function TrackOrderForm() {
  const [result, setResult] = useState<TrackResult | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    startTransition(async () => {
      setResult(await trackOrder(String(f.get("orderNumber")), String(f.get("phone"))));
    });
  };

  return (
    <div>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input
          name="orderNumber"
          required
          placeholder="Order number, e.g. DR10001"
          aria-label="Order number"
          className="h-12 border border-line bg-paper px-4 text-sm uppercase outline-none focus:border-ink"
        />
        <input
          name="phone"
          type="tel"
          required
          placeholder="Mobile number used at checkout"
          aria-label="Mobile number"
          className="h-12 border border-line bg-paper px-4 text-sm outline-none focus:border-ink"
        />
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" /> : "Track"}
        </Button>
      </form>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.ok ? result.order.orderNumber : result.message}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            {result.ok ? (
              <div className="border border-line bg-paper p-6 md:p-8">
                <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <p className="label text-maroon">Order {result.order.orderNumber}</p>
                    <p className="mt-1 text-sm text-muted">
                      {result.order.itemCount} item{result.order.itemCount > 1 ? "s" : ""} · {formatPrice(result.order.total)} · to{" "}
                      {result.order.city}
                    </p>
                  </div>
                  {result.order.trackingNumber && (
                    <p className="text-sm">
                      {result.order.courier ?? "Courier"}: <span className="font-mono">{result.order.trackingNumber}</span>
                    </p>
                  )}
                </div>
                <StatusTimeline status={result.order.status} events={result.order.events} />
              </div>
            ) : (
              <p className="border-l-2 border-maroon bg-blush/60 px-4 py-3 text-sm text-maroon">{result.message}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import type { OrderEvent, OrderStatus } from "@/lib/orders";

const STEPS: { status: OrderStatus; label: string; hint: string }[] = [
  { status: "pending", label: "Placed", hint: "We've received your order" },
  { status: "confirmed", label: "Confirmed", hint: "Our team verified your order" },
  { status: "packed", label: "Packed", hint: "Packed and ready for the courier" },
  { status: "shipped", label: "Shipped", hint: "On its way to you" },
  { status: "delivered", label: "Delivered", hint: "Enjoy your DRIFT" },
];

function when(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-PK", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Karachi" });
}

export function StatusTimeline({ status, events }: { status: OrderStatus; events: OrderEvent[] }) {
  if (status === "cancelled" || status === "returned") {
    return (
      <div className="border border-maroon/30 bg-blush/50 p-5">
        <p className="label text-maroon">{status === "cancelled" ? "Order cancelled" : "Order returned"}</p>
        <p className="mt-1 text-sm text-ink-soft">
          {events.at(-1)?.note ?? "Contact us on WhatsApp if you have any questions."}
        </p>
      </div>
    );
  }

  const current = STEPS.findIndex((s) => s.status === status);

  return (
    <ol className="grid gap-0 sm:grid-cols-5">
      {STEPS.map((step, i) => {
        const done = i <= current;
        const event = events.findLast((e) => e.status === step.status);
        return (
          <li key={step.status} className="relative flex gap-4 pb-6 sm:flex-col sm:gap-3 sm:pb-0 sm:pr-4">
            {/* connector */}
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={`absolute left-[7px] top-4 h-full w-px sm:left-4 sm:top-[7px] sm:h-px sm:w-full ${i < current ? "bg-maroon" : "bg-line"}`}
              />
            )}
            <span
              className={`relative z-10 mt-0.5 h-[15px] w-[15px] shrink-0 rounded-full border-2 ${
                done ? "border-maroon bg-maroon" : "border-line bg-bone"
              } ${i === current ? "ring-4 ring-maroon/20" : ""}`}
            />
            <div>
              <p className={`label ${done ? "text-ink" : "text-muted"}`}>{step.label}</p>
              <p className="mt-0.5 text-xs text-muted">{done && event ? when(event.created_at) : step.hint}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

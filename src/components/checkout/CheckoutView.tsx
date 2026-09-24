"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Banknote, ChevronDown, CreditCard, Lock, Loader2 } from "lucide-react";
import { checkDiscount, placeOrder } from "@/app/actions/checkout";
import { useCart } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";
import { CITIES, PROVINCES } from "@/lib/pakistan";
import { computeTotals } from "@/lib/pricing";
import { formatPrice, FREE_SHIPPING_THRESHOLD, getProduct } from "@/lib/products";
import { Button, ButtonLink } from "@/components/ui/Button";

type Applied = { code: string; amount: number; label: string } | null;

export function CheckoutView() {
  const mounted = useMounted();
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);

  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [codeInput, setCodeInput] = useState("");
  const [applied, setApplied] = useState<Applied>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [checkingCode, startCodeTransition] = useTransition();
  const [phone, setPhone] = useState("");

  const items = lines
    .map((l) => ({ ...l, product: getProduct(l.slug) }))
    .filter((l): l is typeof l & { product: NonNullable<typeof l.product> } => !!l.product);
  const subtotal = items.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const totals = computeTotals(subtotal, applied?.amount ?? 0);
  const count = items.reduce((n, l) => n + l.quantity, 0);

  const applyCode = () => {
    setCodeError(null);
    startCodeTransition(async () => {
      const res = await checkDiscount(codeInput, lines, phone || undefined);
      if (res.ok) {
        setApplied({ code: res.code, amount: res.amount, label: res.label });
        setCodeInput("");
      } else {
        setApplied(null);
        setCodeError(res.message);
      }
    });
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    setFormError(null);
    setErrors({});

    startTransition(async () => {
      const res = await placeOrder({
        email: get("email"),
        phone: get("phone"),
        fullName: get("fullName"),
        address1: get("address1"),
        address2: get("address2"),
        city: get("city"),
        province: get("province") as (typeof PROVINCES)[number],
        postalCode: get("postalCode"),
        notes: get("notes"),
        newsletter: f.get("newsletter") === "on",
        paymentMethod: "cod",
        discountCode: applied?.code ?? "",
        lines,
        company: get("company"),
      });
      if (res.ok) {
        clear();
        router.push(`/order/${res.orderNumber}?t=${res.token}`);
      } else {
        setFormError(res.message);
        setErrors(res.fieldErrors ?? {});
        if (res.fieldErrors?.discountCode) setApplied(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  if (!mounted) return <div className="min-h-[70vh]" />;

  if (items.length === 0) {
    return (
      <section className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="font-display text-7xl font-black uppercase leading-[0.85]">Your bag is empty</h1>
        <ButtonLink href="/shop">Shop the collection</ButtonLink>
      </section>
    );
  }

  const summary = (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col gap-4">
        {items.map((l) => (
          <li key={`${l.slug}-${l.size}`} className="flex items-center gap-4">
            <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden bg-blush">
              <Image src={`${l.product.images[0]}?w=200&q=75`} alt={l.product.name} fill sizes="64px" className="object-cover" />
              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center bg-ink px-1 text-[10px] text-bone">
                {l.quantity}
              </span>
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium">{l.product.name}</p>
              <p className="text-xs text-muted">
                {l.product.colour} · {l.size}
              </p>
            </div>
            <p className="text-sm">{formatPrice(l.product.price * l.quantity)}</p>
          </li>
        ))}
      </ul>

      {/* Discount code */}
      <div>
        <div className="flex gap-2">
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="Discount code"
            aria-label="Discount code"
            className="h-11 flex-1 border border-line bg-paper px-3 text-sm uppercase outline-none focus:border-ink"
          />
          <button
            type="button"
            onClick={applyCode}
            disabled={!codeInput || checkingCode}
            className="label h-11 border border-ink px-4 transition-colors hover:bg-ink hover:text-bone disabled:opacity-40"
          >
            {checkingCode ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
          </button>
        </div>
        {codeError && <p className="mt-2 text-xs text-maroon-bright">{codeError}</p>}
        {applied && (
          <p className="mt-2 flex items-center justify-between text-xs">
            <span className="border border-dashed border-maroon px-2 py-1 font-mono text-maroon">
              {applied.code} · {applied.label}
            </span>
            <button type="button" onClick={() => setApplied(null)} className="text-muted underline underline-offset-4">
              Remove
            </button>
          </p>
        )}
      </div>

      <dl className="flex flex-col gap-2 border-t border-line pt-4 text-sm">
        <Row label={`Subtotal · ${count} item${count > 1 ? "s" : ""}`} value={formatPrice(totals.subtotal)} />
        {totals.discount > 0 && <Row label="Discount" value={`−${formatPrice(totals.discount)}`} accent />}
        <Row
          label="Delivery"
          value={totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
          hint={totals.shipping > 0 ? `Free over ${formatPrice(FREE_SHIPPING_THRESHOLD)}` : undefined}
        />
        <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
          <dt className="label">Total</dt>
          <dd className="font-display text-4xl font-black">{formatPrice(totals.total)}</dd>
        </div>
      </dl>
    </div>
  );

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(380px,40%)]">
      {/* Mobile summary toggle */}
      <div className="border-b border-line bg-paper lg:hidden">
        <button onClick={() => setSummaryOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-4">
          <span className="label flex items-center gap-2">
            {summaryOpen ? "Hide" : "Show"} order summary
            <ChevronDown size={14} className={`transition-transform ${summaryOpen ? "rotate-180" : ""}`} />
          </span>
          <span className="font-semibold">{formatPrice(totals.total)}</span>
        </button>
        <AnimatePresence initial={false}>
          {summaryOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="px-4 pb-6">{summary}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={submit} noValidate className="order-2 px-4 py-10 md:px-8 lg:order-1 lg:px-16 lg:py-14">
        <p className="label text-maroon">Secure checkout</p>
        <h1 className="font-display mt-2 text-6xl font-black uppercase leading-[0.85] md:text-7xl">Checkout</h1>

        <AnimatePresence>
          {formError && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="mt-6 border-l-2 border-maroon bg-blush/60 px-4 py-3 text-sm text-maroon"
            >
              {formError}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Honeypot: hidden from people, bots fill it in */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

        <Section step="01" title="Contact">
          <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} required />
          <Field
            label="Mobile number"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="03XX XXXXXXX"
            error={errors.phone}
            onChange={(v) => setPhone(v)}
            hint="We'll call or WhatsApp to confirm your order."
            required
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="newsletter" defaultChecked className="h-4 w-4 accent-[var(--maroon)]" />
            Email me about new drops and exclusive offers
          </label>
        </Section>

        <Section step="02" title="Delivery address">
          <Field label="Full name" name="fullName" autoComplete="name" error={errors.fullName} required />
          <Field label="Address" name="address1" autoComplete="address-line1" placeholder="House #, street, area" error={errors.address1} required />
          <Field label="Apartment, landmark (optional)" name="address2" autoComplete="address-line2" error={errors.address2} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City" name="city" autoComplete="address-level2" list="pk-cities" error={errors.city} required />
            <datalist id="pk-cities">
              {CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted">Province</span>
              <select
                name="province"
                defaultValue=""
                required
                className={`h-12 border bg-paper px-3 text-sm outline-none focus:border-ink ${errors.province ? "border-maroon-bright" : "border-line"}`}
              >
                <option value="" disabled>
                  Select province
                </option>
                {PROVINCES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              {errors.province && <span className="text-xs text-maroon-bright">{errors.province}</span>}
            </label>
          </div>
          <Field label="Postal code (optional)" name="postalCode" autoComplete="postal-code" error={errors.postalCode} />
          <Field label="Delivery notes (optional)" name="notes" placeholder="e.g. call before delivery" error={errors.notes} />
        </Section>

        <Section step="03" title="Payment">
          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-start gap-4 border border-ink bg-paper p-4">
              <input type="radio" name="payment" value="cod" defaultChecked className="mt-1 accent-[var(--maroon)]" />
              <div className="flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Banknote size={16} className="text-maroon" /> Cash on Delivery
                </p>
                <p className="mt-1 text-xs text-muted">Pay {formatPrice(totals.total)} in cash when your order arrives.</p>
              </div>
            </label>
            <div className="flex items-start gap-4 border border-line p-4 opacity-50">
              <input type="radio" disabled className="mt-1" aria-label="Card or wallet (coming soon)" />
              <div className="flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard size={16} /> Card, JazzCash, Easypaisa
                </p>
                <p className="mt-1 text-xs text-muted">Coming soon</p>
              </div>
            </div>
          </div>
        </Section>

        <Button type="submit" variant="maroon" disabled={pending} className="mt-10 h-14 w-full">
          {pending ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Placing order…
            </>
          ) : (
            <>Place order · {formatPrice(totals.total)}</>
          )}
        </Button>
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
          <Lock size={12} /> By placing your order you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-4">
            terms
          </Link>
          .
        </p>
      </form>

      <aside className="order-1 hidden border-l border-line bg-paper px-8 py-14 lg:order-2 lg:block">
        <div className="sticky top-24">
          <p className="label mb-6">Order summary</p>
          {summary}
        </div>
      </aside>
    </div>
  );
}

function Section({ step, title, children }: { step: string; title: string; children: ReactNode }) {
  return (
    <fieldset className="mt-10 flex flex-col gap-4">
      <legend className="mb-4 flex items-baseline gap-3">
        <span className="font-mono text-xs text-maroon">{step}</span>
        <span className="label">{title}</span>
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  onChange,
  ...props
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  onChange?: (value: string) => void;
} & Omit<React.ComponentProps<"input">, "onChange">) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">{label}</span>
      <input
        name={name}
        aria-invalid={!!error}
        onChange={(e) => onChange?.(e.target.value)}
        className={`h-12 border bg-paper px-3 text-sm outline-none transition-colors focus:border-ink ${
          error ? "border-maroon-bright" : "border-line"
        }`}
        {...props}
      />
      {error ? <span className="text-xs text-maroon-bright">{error}</span> : hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Row({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-ink-soft">
        {label}
        {hint && <span className="block text-[11px] text-muted">{hint}</span>}
      </dt>
      <dd className={accent ? "text-maroon" : ""}>{value}</dd>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { subscribe } from "@/app/actions/newsletter";
import { ArrowRight } from "lucide-react";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/shop/hoodies", label: "Hoodies" },
      { href: "/shop/tees", label: "Tees" },
      { href: "/shop/jackets", label: "Jackets" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/track-order", label: "Track your order" },
      { href: "/shipping", label: "Shipping & delivery" },
      { href: "/returns", label: "Exchanges & returns" },
      { href: "/size-guide", label: "Size guide" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    title: "DRIFT",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/lookbook", label: "Lookbook" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await subscribe(email, "footer");
      if (res.ok) setSent(true);
      else setError(res.message);
    });
  };

  return (
    <footer className="bg-ink text-bone">
      <div className="grid gap-12 px-4 py-16 md:grid-cols-[1.4fr_2fr] md:px-8 md:py-20">
        <div>
          <p className="label text-bone/60">Newsletter</p>
          <h3 className="font-display mt-3 text-5xl font-black uppercase leading-[0.9] md:text-6xl">
            Don&apos;t miss
            <br />
            the next drop
          </h3>
          {sent ? (
            <p className="mt-6 text-sm text-bone/80">Thanks. You&apos;re on the list ✦</p>
          ) : (
            <form onSubmit={submit} className="mt-6 flex max-w-md border-b border-bone/40 focus-within:border-bone">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-bone/50"
              />
              <button aria-label="Subscribe" disabled={pending} className="group px-2 disabled:opacity-40">
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          )}
          {error && <p className="mt-2 text-xs text-blush">{error}</p>}
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="label mb-4 text-bone/60">{col.title}</p>
              <ul className="flex flex-col gap-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-underline text-bone/90 hover:text-bone">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-bone/15 px-4 py-5 text-xs text-bone/60 md:px-8">
        <div className="flex gap-5">
          <a href="#" className="hover:text-bone">Instagram</a>
          <a href="#" className="hover:text-bone">TikTok</a>
          <a href="#" className="hover:text-bone">WhatsApp</a>
        </div>
        <p>Cash on Delivery · Visa · Mastercard · JazzCash · Easypaisa</p>
      </div>

      {/* Oversized wordmark */}
      <div className="overflow-hidden bg-maroon">
        <p className="font-display select-none py-2 text-center text-[31vw] font-black uppercase leading-[0.78] text-bone">
          Drift
        </p>
      </div>
      <p className="bg-maroon px-4 pb-4 text-center text-[11px] text-bone/60">
        © {new Date().getFullYear()} DRIFT. Made in Pakistan.
      </p>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BadgePercent, ExternalLink, LayoutDashboard, LogOut, Mail, Menu, Package, ShoppingBag, Users, X } from "lucide-react";
import { signOut } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/discounts", label: "Discounts", icon: BadgePercent },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
];

export function AdminShell({
  children,
  admin,
  pendingCount,
}: {
  children: ReactNode;
  admin: { name: string; email: string; role: string; demo: boolean };
  pendingCount: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`group relative flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
              active ? "bg-bone/10 text-bone" : "text-bone/60 hover:bg-bone/5 hover:text-bone"
            }`}
          >
            {active && <motion.span layoutId="admin-nav" className="absolute inset-y-0 left-0 w-[3px] bg-maroon-bright" />}
            <Icon size={17} strokeWidth={1.6} />
            {label}
            {label === "Orders" && pendingCount > 0 && (
              <span className="ml-auto bg-maroon-bright px-1.5 py-0.5 text-[10px] font-semibold text-bone" title="Orders waiting for confirmation">
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const sidebar = (
    <div className="flex h-full flex-col bg-ink text-bone">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/admin" className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-black uppercase leading-none">Drift</span>
          <span className="label text-[9px] text-bone/50">Admin</span>
        </Link>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 px-3 py-4">{nav}</div>
      <div className="border-t border-bone/10 p-4">
        <Link href="/" target="_blank" className="mb-4 flex items-center gap-2 text-xs text-bone/60 hover:text-bone">
          <ExternalLink size={13} /> View store
        </Link>
        <p className="truncate text-sm">{admin.name}</p>
        <p className="truncate text-xs text-bone/50">
          {admin.email} · {admin.role}
        </p>
        {!admin.demo && (
          <form action={signOut}>
            <button className="mt-3 flex items-center gap-2 text-xs text-bone/60 hover:text-bone">
              <LogOut size={13} /> Sign out
            </button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-bone">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 lg:block print:hidden">{sidebar}</aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {admin.demo && (
          <div className="bg-maroon px-4 py-2 text-center text-xs text-bone print:hidden">
            <strong>Demo mode</strong> · sample data, changes reset when the dev server restarts. Connect Supabase to go live.
          </div>
        )}
        <header className="flex h-14 items-center gap-3 border-b border-line bg-paper px-4 lg:hidden print:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} strokeWidth={1.5} />
          </button>
          <span className="font-display text-2xl font-black uppercase">Drift</span>
        </header>
        <main className="flex-1 px-4 py-8 md:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

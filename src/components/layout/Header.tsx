"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { CATEGORIES } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";

const NAV = [
  { href: "/shop", label: "Shop", mega: true },
  { href: "/shop/hoodies", label: "Hoodies" },
  { href: "/shop/tees", label: "Tees" },
  { href: "/shop/jackets", label: "Jackets" },
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const openCart = useCart((s) => s.open);
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.quantity, 0));
  const mounted = useMounted();

  // Hide on scroll down, reveal on scroll up; go solid once past the hero edge.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > prev && y > 300 && !megaOpen);
  });

  const transparent = isHome && !scrolled && !megaOpen;

  return (
    <>
      <motion.header
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onMouseLeave={() => setMegaOpen(false)}
        className={`sticky top-0 z-40 transition-colors duration-500 ${
          transparent ? "-mb-16 bg-transparent text-bone" : "bg-bone/90 text-ink backdrop-blur-md"
        } ${!transparent ? "border-b border-line" : ""}`}
      >
        <div className="mx-auto grid h-16 grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8">
          {/* Left: nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setMegaOpen(!!item.mega)}
                className={`label link-underline pb-0.5 ${pathname === item.href ? "text-maroon-bright" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button className="md:hidden" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
            <Menu size={22} strokeWidth={1.5} />
          </button>

          {/* Centre: wordmark (swap for the real logo later) */}
          <Link href="/" aria-label="DRIFT home" className="font-display text-3xl font-black uppercase leading-none tracking-tight">
            Drift
          </Link>

          {/* Right: actions */}
          <div className="flex items-center justify-end gap-4 md:gap-6">
            <button aria-label="Search" className="hidden md:block">
              <Search size={19} strokeWidth={1.5} />
            </button>
            <Link href="/account" aria-label="Account" className="hidden md:block">
              <User size={19} strokeWidth={1.5} />
            </Link>
            <button aria-label="Open cart" onClick={openCart} className="relative flex items-center gap-2">
              <ShoppingBag size={19} strokeWidth={1.5} />
              <AnimatePresence>
                {mounted && count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-semibold text-bone"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mega menu */}
        <AnimatePresence>
          {megaOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full overflow-hidden border-b border-line bg-bone text-ink"
            >
              <div className="grid grid-cols-[220px_1fr] gap-10 px-8 py-8">
                <div className="flex flex-col gap-3">
                  <p className="label text-muted">Shop</p>
                  <Link href="/shop" className="text-lg hover:text-maroon">All products</Link>
                  <Link href="/shop?filter=new" className="text-lg hover:text-maroon">New arrivals</Link>
                  {CATEGORIES.map((c) => (
                    <Link key={c.slug} href={`/shop/${c.slug}`} className="text-lg hover:text-maroon">
                      {c.title}
                    </Link>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {CATEGORIES.map((c, i) => (
                    <motion.div
                      key={c.slug}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
                    >
                      <Link href={`/shop/${c.slug}`} className="group block" onClick={() => setMegaOpen(false)}>
                        <div className="relative aspect-[4/3] overflow-hidden bg-blush">
                          <Image
                            src={`${c.image}?w=700&q=80`}
                            alt={c.title}
                            fill
                            sizes="25vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <p className="label mt-2">{c.title}</p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const links = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop All" },
    ...CATEGORIES.map((c) => ({ href: `/shop/${c.slug}`, label: c.title })),
    { href: "/account", label: "Account" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[60] flex flex-col bg-maroon text-bone"
        >
          <div className="flex h-16 items-center justify-between px-4">
            <span className="font-display text-3xl font-black uppercase">Drift</span>
            <button aria-label="Close menu" onClick={onClose}>
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center gap-2 px-6">
            {links.map((l, i) => (
              <div key={l.href} className="overflow-hidden">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link href={l.href} onClick={onClose} className="font-display block text-6xl font-black uppercase leading-[0.95]">
                    {l.label}
                  </Link>
                </motion.div>
              </div>
            ))}
          </nav>
          <p className="label px-6 pb-8 text-bone/60">Cash on delivery · Free shipping over Rs. 10,000</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

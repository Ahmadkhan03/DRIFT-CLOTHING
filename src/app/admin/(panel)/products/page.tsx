import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { CATEGORIES, formatPrice, PRODUCTS } from "@/lib/products";
import { PageHeader, Table } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader eyebrow="Catalogue" title="Products" />
      <p className="mb-6 max-w-2xl border-l-2 border-maroon bg-paper px-4 py-3 text-sm text-ink-soft">
        Products are read-only for now and come from <code className="font-mono text-xs">src/lib/products.ts</code>. The next step moves
        them into the database so you can add products, upload photos and manage stock per size from here.
      </p>
      {CATEGORIES.map((cat) => (
        <section key={cat.slug} className="mb-10">
          <h2 className="label mb-3">
            {cat.title} <span className="text-muted">· {PRODUCTS.filter((p) => p.category === cat.slug).length}</span>
          </h2>
          <Table head={["Product", "Colour", "Price", "Sizes", "Badge", ""]}>
            {PRODUCTS.filter((p) => p.category === cat.slug).map((p) => (
              <tr key={p.slug} className="hover:bg-bone/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative aspect-[3/4] w-10 shrink-0 overflow-hidden bg-blush">
                      <Image src={`${p.images[0]}?w=120&q=70`} alt="" fill sizes="40px" className="object-cover" />
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{p.colour}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {formatPrice(p.price)}
                  {p.compareAt && <span className="ml-2 text-xs text-muted line-through">{formatPrice(p.compareAt)}</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.sizes.map((s) => {
                      const out = p.soldOut?.includes(s);
                      return (
                        <span key={s} className={`border px-1.5 py-0.5 text-[10px] ${out ? "border-dashed border-line text-muted line-through" : "border-line"}`} title={out ? "Sold out" : "In stock"}>
                          {s}
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{p.badge ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/product/${p.slug}`} target="_blank" className="text-xs text-muted hover:text-ink">
                    View ↗
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        </section>
      ))}
    </>
  );
}

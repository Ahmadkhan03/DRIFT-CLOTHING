import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, PRODUCTS } from "@/lib/products";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/motion/Reveal";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — ${product.colour}`,
    description: product.description,
    openGraph: { images: [`${product.images[0]}?w=1200&q=80`] },
  };
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  // "Complete the fit": pieces from the other categories first
  const related = [
    ...PRODUCTS.filter((p) => p.category !== product.category),
    ...PRODUCTS.filter((p) => p.category === product.category && p.slug !== product.slug),
  ].slice(0, 4);

  return (
    <>
      <ProductDetail product={product} />
      <section className="px-4 py-20 md:px-8">
        <Reveal>
          <p className="label text-maroon">Pairs well with</p>
          <h2 className="font-display mt-2 text-6xl font-black uppercase leading-[0.85] md:text-7xl">Complete the fit</h2>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-4 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}

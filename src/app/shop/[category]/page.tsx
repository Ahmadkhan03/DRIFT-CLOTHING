import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, type Category } from "@/lib/products";
import { ShopView } from "@/components/shop/ShopView";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata(props: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await props.params;
  const meta = CATEGORIES.find((c) => c.slug === category);
  return { title: meta?.title ?? "Shop" };
}

export default async function CategoryPage(props: PageProps<"/shop/[category]">) {
  const { category } = await props.params;
  if (!CATEGORIES.some((c) => c.slug === category)) notFound();
  return <ShopView category={category as Category} />;
}

import type { Metadata } from "next";
import { ShopView } from "@/components/shop/ShopView";

export const metadata: Metadata = { title: "Shop all" };

export default async function ShopPage(props: PageProps<"/shop">) {
  const { filter } = await props.searchParams;
  return <ShopView newOnly={filter === "new"} />;
}

import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { listDiscounts } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui";
import { DiscountManager } from "@/components/admin/DiscountManager";

export const metadata: Metadata = { title: "Discounts" };

export default async function DiscountsPage() {
  await requireAdmin();
  const discounts = await listDiscounts();
  return (
    <>
      <PageHeader eyebrow="Marketing" title="Discounts" />
      <DiscountManager discounts={discounts} />
    </>
  );
}

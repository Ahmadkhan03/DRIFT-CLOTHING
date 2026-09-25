import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { countOrdersByStatus } from "@/lib/admin/data";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · DRIFT Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const counts = await countOrdersByStatus();
  return (
    <AdminShell admin={admin} pendingCount={counts.pending}>
      {children}
    </AdminShell>
  );
}

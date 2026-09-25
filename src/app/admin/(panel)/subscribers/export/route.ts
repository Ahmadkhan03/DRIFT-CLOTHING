import { getAdmin } from "@/lib/admin/auth";
import { listSubscribers } from "@/lib/admin/data";

export async function GET() {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });

  const { rows } = await listSubscribers({ all: true });
  // Prefix cells that spreadsheet apps would treat as formulas
  const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
  const csv = ["email,source,joined", ...rows.map((s) => [s.email, s.source, s.created_at].map(cell).join(","))].join("\n");

  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="drift-subscribers-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

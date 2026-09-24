import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { formatPrice } from "@/lib/products";

export type DiscountResult = { ok: true; code: string; amount: number; label: string } | { ok: false; message: string };

type DiscountRow = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_subtotal: number;
  first_order_only: boolean;
  usage_limit: number | null;
  times_used: number;
  active: boolean;
  expires_at: string | null;
};

/** Checks a discount code against the subtotal (and, if known, the buyer's order history). */
export async function evaluateDiscount(
  db: SupabaseClient,
  rawCode: string,
  subtotal: number,
  phone?: string | null,
): Promise<DiscountResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, message: "Enter a code." };

  const { data, error } = await db.from("discount_codes").select("*").eq("code", code).maybeSingle<DiscountRow>();
  if (error) throw error;

  if (!data || !data.active) return { ok: false, message: "That code isn't valid." };
  if (data.expires_at && new Date(data.expires_at) < new Date()) return { ok: false, message: "That code has expired." };
  if (data.usage_limit !== null && data.times_used >= data.usage_limit)
    return { ok: false, message: "That code has reached its limit." };
  if (subtotal < data.min_subtotal)
    return { ok: false, message: `Spend ${formatPrice(data.min_subtotal)} or more to use this code.` };

  if (data.first_order_only && phone) {
    const { count, error: countError } = await db
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("phone", phone)
      .neq("status", "cancelled");
    if (countError) throw countError;
    if ((count ?? 0) > 0) return { ok: false, message: "This code is for first orders only." };
  }

  const amount = data.type === "percent" ? Math.round((subtotal * data.value) / 100) : Math.min(data.value, subtotal);
  const label = data.type === "percent" ? `${data.value}% off` : `${formatPrice(data.value)} off`;
  return { ok: true, code, amount, label };
}

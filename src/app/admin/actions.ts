"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, isDemoMode } from "@/lib/admin/auth";
import { createDiscount, getAdminOrder, setDiscountActive, setOrderStatus, setPaymentStatus, updateCustomer } from "@/lib/admin/data";
import { NEXT_STATUSES, type OrderStatus } from "@/lib/order-status";
import { createAuthClient } from "@/lib/supabase/auth";
import { getDb } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; message: string };

function fail(err: unknown): Result {
  console.error("[admin]", err);
  return { ok: false, message: err instanceof Error ? err.message : "Something went wrong." };
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export async function signIn(_: unknown, form: FormData): Promise<Result> {
  if (isDemoMode()) redirect("/admin");
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { ok: false, message: "Enter your email and password." };

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: "Incorrect email or password." };

  const { data: staff } = await getDb()!.from("staff").select("email").eq("email", email).maybeSingle();
  if (!staff) {
    await supabase.auth.signOut();
    return { ok: false, message: "This account doesn't have admin access." };
  }
  redirect("/admin");
}

export async function signOut() {
  if (!isDemoMode()) {
    const supabase = await createAuthClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
const statusSchema = z.object({
  orderNumber: z.string().max(20),
  status: z.enum(["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned"]),
  note: z.string().trim().max(500).optional(),
  courier: z.string().trim().max(40).optional(),
  trackingNumber: z.string().trim().max(60).optional(),
});

export async function updateOrderStatus(input: z.input<typeof statusSchema>): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };
  const { orderNumber, status, ...extra } = parsed.data;

  try {
    const order = await getAdminOrder(orderNumber);
    if (!order) return { ok: false, message: "Order not found." };
    if (!NEXT_STATUSES[order.status].includes(status as OrderStatus))
      return { ok: false, message: `Can't move an order from ${order.status} to ${status}.` };
    if (status === "shipped" && !extra.trackingNumber) return { ok: false, message: "Add the courier tracking number to mark as shipped." };
    if (status === "cancelled" && !extra.note) return { ok: false, message: "Add a reason for cancelling." };

    await setOrderStatus(orderNumber, status, admin.email, extra);
  } catch (err) {
    return fail(err);
  }
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function markOrderPaid(orderNumber: string, paid: boolean): Promise<Result> {
  await requireAdmin();
  try {
    await setPaymentStatus(String(orderNumber).slice(0, 20), paid ? "paid" : "unpaid");
  } catch (err) {
    return fail(err);
  }
  revalidatePath("/admin", "layout");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
const customerSchema = z.object({
  id: z.string().max(40),
  notes: z.string().trim().max(2000),
  tags: z.array(z.string().trim().min(1).max(30)).max(10),
});

export async function saveCustomer(input: z.input<typeof customerSchema>): Promise<Result> {
  await requireAdmin();
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Tags must be 1–30 characters, up to 10 tags." };
  try {
    await updateCustomer(parsed.data.id, { notes: parsed.data.notes || null, tags: [...new Set(parsed.data.tags)] });
  } catch (err) {
    return fail(err);
  }
  revalidatePath("/admin/customers", "layout");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Discounts
// ---------------------------------------------------------------------------
const discountSchema = z
  .object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/, "Use 3–30 letters, numbers, - or _."),
    type: z.enum(["percent", "fixed"]),
    value: z.coerce.number().int().positive("Enter a value above 0."),
    min_subtotal: z.coerce.number().int().min(0).default(0),
    first_order_only: z.boolean().default(false),
    usage_limit: z.coerce.number().int().positive().nullable().default(null),
    expires_at: z.string().nullable().default(null),
  })
  .refine((d) => d.type !== "percent" || d.value <= 90, { message: "Percentage can be at most 90%.", path: ["value"] });

export async function addDiscount(input: z.input<typeof discountSchema>): Promise<Result> {
  await requireAdmin();
  const parsed = discountSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  const d = parsed.data;
  try {
    await createDiscount({ ...d, expires_at: d.expires_at ? new Date(`${d.expires_at}T23:59:59+05:00`).toISOString() : null });
  } catch (err) {
    return fail(err);
  }
  revalidatePath("/admin/discounts");
  return { ok: true };
}

export async function toggleDiscount(code: string, active: boolean): Promise<Result> {
  await requireAdmin();
  try {
    await setDiscountActive(String(code).slice(0, 30), active);
  } catch (err) {
    return fail(err);
  }
  revalidatePath("/admin/discounts");
  return { ok: true };
}

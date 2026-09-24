"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getDb } from "@/lib/supabase/server";
import { evaluateDiscount } from "@/lib/discounts";
import { sendOrderConfirmation } from "@/lib/email";
import { computeTotals } from "@/lib/pricing";
import { normalizePhone, PROVINCES } from "@/lib/pakistan";
import { getProduct } from "@/lib/products";

const NOT_CONFIGURED = "Checkout isn't connected to the database yet. Add your Supabase keys to .env.local.";

const lineSchema = z.object({
  slug: z.string().max(100),
  size: z.string().max(10),
  quantity: z.number().int().min(1).max(10),
});

const orderSchema = z.object({
  email: z.email("Enter a valid email address.").max(200),
  phone: z.string().max(30).refine((v) => normalizePhone(v) !== null, "Enter a valid mobile number, e.g. 0300 1234567."),
  fullName: z.string().trim().min(3, "Enter your full name.").max(100),
  address1: z.string().trim().min(5, "Enter your street address.").max(200),
  address2: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().min(2, "Enter your city.").max(60),
  province: z.enum(PROVINCES, "Select your province."),
  postalCode: z.string().trim().max(10).optional().default(""),
  notes: z.string().trim().max(500).optional().default(""),
  newsletter: z.boolean().optional().default(false),
  paymentMethod: z.literal("cod"),
  discountCode: z.string().trim().max(40).optional().default(""),
  lines: z.array(lineSchema).min(1, "Your bag is empty.").max(30),
  company: z.string().max(0).optional(), // honeypot: real people leave this empty
});

export type PlaceOrderInput = z.input<typeof orderSchema>;
export type PlaceOrderResult =
  | { ok: true; orderNumber: string; token: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/** Re-prices the cart from the server catalogue so the client can't tamper with prices. */
function priceLines(lines: z.infer<typeof lineSchema>[]) {
  const merged = new Map<string, z.infer<typeof lineSchema>>();
  for (const l of lines) {
    const key = `${l.slug}::${l.size}`;
    const prev = merged.get(key);
    merged.set(key, { ...l, quantity: Math.min((prev?.quantity ?? 0) + l.quantity, 10) });
  }

  const items = [];
  for (const l of merged.values()) {
    const product = getProduct(l.slug);
    if (!product) return { error: "An item in your bag is no longer available." };
    if (!product.sizes.includes(l.size) || product.soldOut?.includes(l.size))
      return { error: `${product.name} in size ${l.size} is sold out.` };
    items.push({
      product_slug: product.slug,
      product_name: product.name,
      colour: product.colour,
      size: l.size,
      image: product.images[0],
      unit_price: product.price,
      quantity: l.quantity,
      line_total: product.price * l.quantity,
    });
  }
  return { items, subtotal: items.reduce((s, i) => s + i.line_total, 0) };
}

export async function checkDiscount(code: string, lines: PlaceOrderInput["lines"], phone?: string) {
  const db = getDb();
  if (!db) return { ok: false as const, message: NOT_CONFIGURED };
  const parsedLines = z.array(lineSchema).max(30).safeParse(lines);
  if (!parsedLines.success) return { ok: false as const, message: "Your bag couldn't be read." };
  const priced = priceLines(parsedLines.data);
  if ("error" in priced) return { ok: false as const, message: priced.error! };
  return evaluateDiscount(db, String(code).slice(0, 40), priced.subtotal, phone ? normalizePhone(phone) : null);
}

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors };
  }
  const data = parsed.data;

  const phone = normalizePhone(data.phone)!;

  const db = getDb();
  if (!db) return { ok: false, message: NOT_CONFIGURED };

  const priced = priceLines(data.lines);
  if ("error" in priced) return { ok: false, message: priced.error! };

  let discount = 0;
  let discountCode: string | null = null;
  if (data.discountCode) {
    const result = await evaluateDiscount(db, data.discountCode, priced.subtotal, phone);
    if (!result.ok) return { ok: false, message: result.message, fieldErrors: { discountCode: result.message } };
    discount = result.amount;
    discountCode = result.code;
  }

  const totals = computeTotals(priced.subtotal, discount);

  const { data: rows, error } = await db.rpc("create_order", {
    payload: {
      phone,
      email: data.email.toLowerCase(),
      full_name: data.fullName,
      address_line1: data.address1,
      address_line2: data.address2,
      city: data.city,
      province: data.province,
      postal_code: data.postalCode,
      notes: data.notes,
      payment_method: data.paymentMethod,
      discount_code: discountCode,
      ...totals,
      items: priced.items,
    },
  });

  if (error || !rows?.[0]) {
    console.error("[checkout] create_order failed", error);
    return { ok: false, message: "Something went wrong placing your order. Please try again." };
  }
  const { order_number: orderNumber, access_token: token } = rows[0] as { order_number: string; access_token: string };

  if (data.newsletter) {
    await db.from("newsletter_subscribers").upsert({ email: data.email.toLowerCase(), source: "checkout" }, { onConflict: "email", ignoreDuplicates: true });
  }

  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
  await sendOrderConfirmation({
    to: data.email,
    orderNumber,
    orderUrl: `${origin}/order/${orderNumber}?t=${token}`,
    fullName: data.fullName,
    items: priced.items,
    ...totals,
    address: [data.address1, data.address2, data.city, data.province].filter(Boolean).join(", "),
  });

  return { ok: true, orderNumber, token };
}

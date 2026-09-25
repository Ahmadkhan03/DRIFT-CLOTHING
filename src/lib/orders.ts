import "server-only";
import { getDb } from "@/lib/supabase/server";

import type { OrderStatus } from "@/lib/order-status";

export type { OrderStatus };

export type OrderItem = {
  product_slug: string;
  product_name: string;
  colour: string;
  size: string;
  image: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type OrderEvent = { status: OrderStatus; note: string | null; created_at: string };

export type Order = {
  order_number: string;
  status: OrderStatus;
  payment_method: "cod" | "safepay";
  payment_status: "unpaid" | "paid" | "refunded";
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  province: string;
  postal_code: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  discount_code: string | null;
  courier: string | null;
  tracking_number: string | null;
  created_at: string;
  order_items: OrderItem[];
  order_events: OrderEvent[];
};

const ORDER_SELECT = `order_number, status, payment_method, payment_status, full_name, email, phone,
  address_line1, address_line2, city, province, postal_code, subtotal, discount, shipping, total,
  discount_code, courier, tracking_number, created_at,
  order_items (product_slug, product_name, colour, size, image, unit_price, quantity, line_total),
  order_events (status, note, created_at)`;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Loads an order for its buyer. Requires the private access token from the confirmation link. */
export async function getOrderForBuyer(orderNumber: string, token: string): Promise<Order | null> {
  const db = getDb();
  if (!db || !UUID.test(token)) return null;
  const { data, error } = await db
    .from("orders")
    .select(ORDER_SELECT)
    .eq("order_number", orderNumber.toUpperCase())
    .eq("access_token", token)
    .order("created_at", { referencedTable: "order_events" })
    .maybeSingle<Order>();
  if (error) throw error;
  return data;
}

/** Loads an order for the tracking page, matched by order number + phone. */
export async function getOrderByPhone(orderNumber: string, phone: string): Promise<Order | null> {
  const db = getDb();
  if (!db) return null;
  const { data, error } = await db
    .from("orders")
    .select(ORDER_SELECT)
    .eq("order_number", orderNumber.trim().toUpperCase())
    .eq("phone", phone)
    .order("created_at", { referencedTable: "order_events" })
    .maybeSingle<Order>();
  if (error) throw error;
  return data;
}

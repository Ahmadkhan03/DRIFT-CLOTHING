"use server";

import { getOrderByPhone, type OrderEvent, type OrderStatus } from "@/lib/orders";
import { normalizePhone } from "@/lib/pakistan";
import { getDb } from "@/lib/supabase/server";

export type TrackResult =
  | {
      ok: true;
      order: {
        orderNumber: string;
        status: OrderStatus;
        city: string;
        total: number;
        itemCount: number;
        courier: string | null;
        trackingNumber: string | null;
        placedAt: string;
        events: OrderEvent[];
      };
    }
  | { ok: false; message: string };

export async function trackOrder(orderNumber: string, phoneInput: string): Promise<TrackResult> {
  if (!getDb()) return { ok: false, message: "Order tracking isn't connected yet." };
  const phone = normalizePhone(String(phoneInput));
  const number = String(orderNumber).trim().slice(0, 20);
  if (!number || !phone) return { ok: false, message: "Enter your order number and the mobile number used at checkout." };

  const order = await getOrderByPhone(number, phone);
  // Same message whether the order doesn't exist or the phone doesn't match.
  if (!order) return { ok: false, message: "We couldn't find an order with those details." };

  // Only return what the tracking page needs: no address, email or phone.
  return {
    ok: true,
    order: {
      orderNumber: order.order_number,
      status: order.status,
      city: order.city,
      total: order.total,
      itemCount: order.order_items.reduce((n, i) => n + i.quantity, 0),
      courier: order.courier,
      trackingNumber: order.tracking_number,
      placedAt: order.created_at,
      events: order.order_events,
    },
  };
}

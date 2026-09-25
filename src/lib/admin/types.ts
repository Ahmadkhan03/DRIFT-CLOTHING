import type { OrderStatus, PaymentStatus } from "@/lib/order-status";

export type AdminOrderItem = {
  product_slug: string;
  product_name: string;
  colour: string;
  size: string;
  image: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type AdminOrderEvent = { status: OrderStatus; note: string | null; created_by: string | null; created_at: string };

export type AdminOrder = {
  id: string;
  order_number: string;
  customer_id: string | null;
  status: OrderStatus;
  payment_method: "cod" | "safepay";
  payment_status: PaymentStatus;
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  province: string;
  postal_code: string | null;
  notes: string | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  discount_code: string | null;
  courier: string | null;
  tracking_number: string | null;
  created_at: string;
  order_items: AdminOrderItem[];
  order_events: AdminOrderEvent[];
};

export type AdminCustomer = {
  id: string;
  phone: string;
  email: string | null;
  full_name: string | null;
  city: string | null;
  tags: string[];
  notes: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
  last_order_at: string | null;
};

export type AdminDiscount = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_subtotal: number;
  first_order_only: boolean;
  usage_limit: number | null;
  times_used: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
};

export type AdminSubscriber = { id: string; email: string; source: string; created_at: string };

export type Page<T> = { rows: T[]; total: number; page: number; pageSize: number };

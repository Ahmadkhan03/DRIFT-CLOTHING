import "server-only";
import { getDb } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/admin/auth";
import { demo } from "@/lib/admin/demo-data";
import { isCounted, type OrderStatus } from "@/lib/order-status";
import type { AdminCustomer, AdminDiscount, AdminOrder, AdminSubscriber, Page } from "@/lib/admin/types";

export const PAGE_SIZE = 25;

const ORDER_SELECT = `id, order_number, customer_id, status, payment_method, payment_status, full_name, email, phone,
  address_line1, address_line2, city, province, postal_code, notes, subtotal, discount, shipping, total,
  discount_code, courier, tracking_number, created_at,
  order_items (product_slug, product_name, colour, size, image, unit_price, quantity, line_total),
  order_events (status, note, created_by, created_at)`;

/** Strip characters that have meaning in PostgREST filter strings. */
const clean = (q: string) => q.replace(/[,()*%\\"']/g, " ").trim().slice(0, 60);

function paginate<T>(rows: T[], page: number): Page<T> {
  return { rows: rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: rows.length, page, pageSize: PAGE_SIZE };
}

function db() {
  const client = getDb();
  if (!client) throw new Error("Supabase is not configured");
  return client;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
export async function listOrders({ status, q = "", page = 1 }: { status?: OrderStatus; q?: string; page?: number }): Promise<Page<AdminOrder>> {
  const term = clean(q);
  if (isDemoMode()) {
    const t = term.toLowerCase();
    const rows = demo().orders.filter(
      (o) =>
        (!status || o.status === status) &&
        (!t || o.order_number.toLowerCase().includes(t) || o.full_name.toLowerCase().includes(t) || o.phone.includes(t)),
    );
    return paginate(rows, page);
  }

  let query = db()
    .from("orders")
    .select(ORDER_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status) query = query.eq("status", status);
  if (term) query = query.or(`order_number.ilike.%${term}%,full_name.ilike.%${term}%,phone.ilike.%${term}%`);
  const { data, count, error } = await query;
  if (error) throw error;
  return { rows: (data ?? []) as AdminOrder[], total: count ?? 0, page, pageSize: PAGE_SIZE };
}

export async function countOrdersByStatus(): Promise<Record<OrderStatus | "all", number>> {
  const counts = { all: 0, pending: 0, confirmed: 0, packed: 0, shipped: 0, delivered: 0, cancelled: 0, returned: 0 };
  const statuses: OrderStatus[] = isDemoMode()
    ? demo().orders.map((o) => o.status)
    : ((await db().from("orders").select("status")).data ?? []).map((r) => r.status as OrderStatus);
  for (const s of statuses) {
    counts[s]++;
    counts.all++;
  }
  return counts;
}

export async function getAdminOrder(orderNumber: string): Promise<AdminOrder | null> {
  if (isDemoMode()) return demo().orders.find((o) => o.order_number === orderNumber) ?? null;
  const { data, error } = await db()
    .from("orders")
    .select(ORDER_SELECT)
    .eq("order_number", orderNumber)
    .order("created_at", { referencedTable: "order_events" })
    .maybeSingle<AdminOrder>();
  if (error) throw error;
  return data;
}

export async function setOrderStatus(
  orderNumber: string,
  status: OrderStatus,
  by: string,
  extra: { note?: string; courier?: string; trackingNumber?: string } = {},
) {
  const patch: Partial<AdminOrder> = { status };
  if (extra.courier) patch.courier = extra.courier;
  if (extra.trackingNumber) patch.tracking_number = extra.trackingNumber;

  if (isDemoMode()) {
    const o = demo().orders.find((x) => x.order_number === orderNumber);
    if (!o) throw new Error("Order not found");
    Object.assign(o, patch);
    o.order_events.push({ status, note: extra.note || null, created_by: by, created_at: new Date().toISOString() });
    return;
  }

  const { data: order, error } = await db().from("orders").update(patch).eq("order_number", orderNumber).select("id").single();
  if (error) throw error;
  const { error: evErr } = await db()
    .from("order_events")
    .insert({ order_id: order.id, status, note: extra.note || null, created_by: by });
  if (evErr) throw evErr;
}

export async function setPaymentStatus(orderNumber: string, paymentStatus: AdminOrder["payment_status"]) {
  if (isDemoMode()) {
    const o = demo().orders.find((x) => x.order_number === orderNumber);
    if (o) o.payment_status = paymentStatus;
    return;
  }
  const { error } = await db().from("orders").update({ payment_status: paymentStatus }).eq("order_number", orderNumber);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export type Dashboard = {
  rangeDays: number;
  revenue: number;
  revenuePrev: number;
  orders: number;
  ordersPrev: number;
  aov: number;
  aovPrev: number;
  toConfirm: number;
  codOutstanding: number;
  daily: { date: string; revenue: number; orders: number }[];
  topProducts: { slug: string; name: string; units: number; revenue: number }[];
  topCities: { city: string; orders: number }[];
  recent: AdminOrder[];
};

export async function getDashboard(rangeDays = 30): Promise<Dashboard> {
  const DAY = 86_400_000;
  const now = Date.now();
  const since = new Date(now - rangeDays * 2 * DAY).toISOString();

  let orders: AdminOrder[];
  if (isDemoMode()) {
    orders = demo().orders.filter((o) => o.created_at >= since);
  } else {
    const { data, error } = await db().from("orders").select(ORDER_SELECT).gte("created_at", since).order("created_at", { ascending: false }).limit(5000);
    if (error) throw error;
    orders = (data ?? []) as AdminOrder[];
  }

  const start = now - rangeDays * DAY;
  const current = orders.filter((o) => Date.parse(o.created_at) >= start);
  const previous = orders.filter((o) => Date.parse(o.created_at) < start);
  const sum = (list: AdminOrder[]) => list.filter((o) => isCounted(o.status)).reduce((s, o) => s + o.total, 0);
  const count = (list: AdminOrder[]) => list.filter((o) => isCounted(o.status)).length;

  // Daily series in Pakistan time
  const dayKey = (iso: string | number) => new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
  const daily = Array.from({ length: rangeDays }, (_, i) => ({ date: dayKey(now - (rangeDays - 1 - i) * DAY), revenue: 0, orders: 0 }));
  const byDay = new Map(daily.map((d) => [d.date, d]));
  const products = new Map<string, { slug: string; name: string; units: number; revenue: number }>();
  const cities = new Map<string, number>();

  for (const o of current) {
    if (!isCounted(o.status)) continue;
    const d = byDay.get(dayKey(o.created_at));
    if (d) {
      d.revenue += o.total;
      d.orders += 1;
    }
    cities.set(o.city, (cities.get(o.city) ?? 0) + 1);
    for (const i of o.order_items) {
      const p = products.get(i.product_slug) ?? { slug: i.product_slug, name: i.product_name, units: 0, revenue: 0 };
      p.units += i.quantity;
      p.revenue += i.line_total;
      products.set(i.product_slug, p);
    }
  }

  // Outstanding COD = shipped/delivered but cash not yet received (all time)
  let toConfirm: number;
  let codOutstanding: number;
  if (isDemoMode()) {
    toConfirm = demo().orders.filter((o) => o.status === "pending").length;
    codOutstanding = demo()
      .orders.filter((o) => o.payment_method === "cod" && o.payment_status === "unpaid" && (o.status === "shipped" || o.status === "delivered"))
      .reduce((s, o) => s + o.total, 0);
  } else {
    const [{ count: pendingCount }, { data: cod }] = await Promise.all([
      db().from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      db().from("orders").select("total").eq("payment_method", "cod").eq("payment_status", "unpaid").in("status", ["shipped", "delivered"]),
    ]);
    toConfirm = pendingCount ?? 0;
    codOutstanding = (cod ?? []).reduce((s, o) => s + o.total, 0);
  }

  const revenue = sum(current);
  const revenuePrev = sum(previous);
  const n = count(current);
  const nPrev = count(previous);

  return {
    rangeDays,
    revenue,
    revenuePrev,
    orders: n,
    ordersPrev: nPrev,
    aov: n ? Math.round(revenue / n) : 0,
    aovPrev: nPrev ? Math.round(revenuePrev / nPrev) : 0,
    toConfirm,
    codOutstanding,
    daily,
    topProducts: [...products.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    topCities: [...cities.entries()].map(([city, orders]) => ({ city, orders })).sort((a, b) => b.orders - a.orders).slice(0, 5),
    recent: current.slice(0, 8),
  };
}

// ---------------------------------------------------------------------------
// Customers (CRM)
// ---------------------------------------------------------------------------
type CustomerSort = "recent" | "spent" | "orders";

function demoCustomers(): AdminCustomer[] {
  return demo().customers.map((c) => {
    const mine = demo().orders.filter((o) => o.customer_id === c.id);
    const counted = mine.filter((o) => isCounted(o.status));
    return {
      ...c,
      order_count: counted.length,
      total_spent: counted.reduce((s, o) => s + o.total, 0),
      last_order_at: mine[0]?.created_at ?? null,
    };
  });
}

export async function listCustomers({ q = "", page = 1, sort = "recent" }: { q?: string; page?: number; sort?: CustomerSort }): Promise<Page<AdminCustomer>> {
  const term = clean(q);
  if (isDemoMode()) {
    const t = term.toLowerCase();
    const rows = demoCustomers()
      .filter((c) => !t || c.full_name?.toLowerCase().includes(t) || c.phone.includes(t) || c.email?.toLowerCase().includes(t) || c.city?.toLowerCase().includes(t))
      .sort((a, b) =>
        sort === "spent" ? b.total_spent - a.total_spent
        : sort === "orders" ? b.order_count - a.order_count
        : (b.last_order_at ?? "").localeCompare(a.last_order_at ?? ""),
      );
    return paginate(rows, page);
  }

  const column = sort === "spent" ? "total_spent" : sort === "orders" ? "order_count" : "last_order_at";
  let query = db()
    .from("customer_stats")
    .select("*", { count: "exact" })
    .order(column, { ascending: false, nullsFirst: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (term) query = query.or(`full_name.ilike.%${term}%,phone.ilike.%${term}%,email.ilike.%${term}%,city.ilike.%${term}%`);
  const { data, count, error } = await query;
  if (error) throw error;
  return { rows: (data ?? []) as AdminCustomer[], total: count ?? 0, page, pageSize: PAGE_SIZE };
}

export async function getCustomer(id: string): Promise<{ customer: AdminCustomer; orders: AdminOrder[] } | null> {
  if (isDemoMode()) {
    const customer = demoCustomers().find((c) => c.id === id);
    if (!customer) return null;
    return { customer, orders: demo().orders.filter((o) => o.customer_id === id) };
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [{ data: customer, error }, { data: orders, error: oErr }] = await Promise.all([
    db().from("customer_stats").select("*").eq("id", id).maybeSingle<AdminCustomer>(),
    db().from("orders").select(ORDER_SELECT).eq("customer_id", id).order("created_at", { ascending: false }),
  ]);
  if (error) throw error;
  if (oErr) throw oErr;
  return customer ? { customer, orders: (orders ?? []) as AdminOrder[] } : null;
}

export async function updateCustomer(id: string, patch: { tags?: string[]; notes?: string | null }) {
  if (isDemoMode()) {
    const c = demo().customers.find((x) => x.id === id);
    if (c) Object.assign(c, patch);
    return;
  }
  const { error } = await db().from("customers").update(patch).eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Discounts
// ---------------------------------------------------------------------------
export async function listDiscounts(): Promise<AdminDiscount[]> {
  if (isDemoMode()) return [...demo().discounts].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const { data, error } = await db().from("discount_codes").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminDiscount[];
}

export async function createDiscount(d: Omit<AdminDiscount, "times_used" | "created_at" | "active">) {
  if (isDemoMode()) {
    if (demo().discounts.some((x) => x.code === d.code)) throw new Error("A code with that name already exists.");
    demo().discounts.push({ ...d, times_used: 0, active: true, created_at: new Date().toISOString() });
    return;
  }
  const { error } = await db().from("discount_codes").insert(d);
  if (error) throw error.code === "23505" ? new Error("A code with that name already exists.") : error;
}

export async function setDiscountActive(code: string, active: boolean) {
  if (isDemoMode()) {
    const d = demo().discounts.find((x) => x.code === code);
    if (d) d.active = active;
    return;
  }
  const { error } = await db().from("discount_codes").update({ active }).eq("code", code);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Newsletter subscribers
// ---------------------------------------------------------------------------
export async function listSubscribers({ q = "", page = 1, all = false }: { q?: string; page?: number; all?: boolean }): Promise<Page<AdminSubscriber>> {
  const term = clean(q).toLowerCase();
  if (isDemoMode()) {
    const rows = demo().subscribers.filter((s) => !term || s.email.includes(term));
    return all ? { rows, total: rows.length, page: 1, pageSize: rows.length } : paginate(rows, page);
  }
  let query = db().from("newsletter_subscribers").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (!all) query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (term) query = query.ilike("email", `%${term}%`);
  const { data, count, error } = await query;
  if (error) throw error;
  return { rows: (data ?? []) as AdminSubscriber[], total: count ?? 0, page, pageSize: all ? count ?? 0 : PAGE_SIZE };
}

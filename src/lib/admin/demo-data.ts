import "server-only";
import { PRODUCTS } from "@/lib/products";
import { computeTotals } from "@/lib/pricing";
import type { OrderStatus } from "@/lib/order-status";
import type { AdminCustomer, AdminDiscount, AdminOrder, AdminSubscriber } from "@/lib/admin/types";

/**
 * Sample data for the admin while Supabase isn't connected (local dev only).
 * Deterministic, and kept on globalThis so edits survive hot reloads.
 */
type DemoStore = {
  orders: AdminOrder[];
  customers: Omit<AdminCustomer, "order_count" | "total_spent" | "last_order_at">[];
  discounts: AdminDiscount[];
  subscribers: AdminSubscriber[];
};

const FIRST = ["Ali", "Hamza", "Usman", "Bilal", "Ahmed", "Hassan", "Zain", "Saad", "Faizan", "Omer", "Daniyal", "Haris", "Talha", "Rayan", "Ibrahim", "Ayaan", "Moiz", "Shahzaib", "Areeb", "Fahad", "Noor", "Ayesha", "Zara", "Hira", "Maham", "Sana", "Emaan", "Aliza"];
const LAST = ["Khan", "Ahmed", "Malik", "Butt", "Sheikh", "Qureshi", "Chaudhry", "Raza", "Siddiqui", "Hashmi", "Mirza", "Abbasi", "Iqbal", "Javed"];
const PLACES: [string, string][] = [
  ["Lahore", "Punjab"], ["Karachi", "Sindh"], ["Islamabad", "Islamabad Capital Territory"], ["Rawalpindi", "Punjab"],
  ["Faisalabad", "Punjab"], ["Multan", "Punjab"], ["Peshawar", "Khyber Pakhtunkhwa"], ["Sialkot", "Punjab"], ["Hyderabad", "Sindh"],
];
const AREAS = ["DHA Phase 5", "Gulberg III", "Bahria Town", "Johar Town", "Clifton Block 4", "F-7/2", "Model Town", "PECHS", "G-11/3", "Cantt"];

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function uuid(r: () => number) {
  const h = () => Math.floor(r() * 16).toString(16);
  const s = (n: number) => Array.from({ length: n }, h).join("");
  return `${s(8)}-${s(4)}-4${s(3)}-a${s(3)}-${s(12)}`;
}

function build(): DemoStore {
  const r = rng(2026);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const now = Date.now();
  const DAY = 86_400_000;

  const customers: DemoStore["customers"] = Array.from({ length: 30 }, (_, i) => {
    const first = FIRST[i % FIRST.length];
    const last = pick(LAST);
    const [city] = pick(PLACES);
    return {
      id: uuid(r),
      phone: `03${Math.floor(r() * 5)}${String(Math.floor(r() * 1e8)).padStart(8, "0")}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@gmail.com`,
      full_name: `${first} ${last}`,
      city,
      tags: i % 7 === 0 ? ["VIP"] : i % 11 === 0 ? ["Wholesale"] : [],
      notes: i % 7 === 0 ? "Prefers WhatsApp. Always orders on drop day." : null,
      created_at: new Date(now - (60 + i) * DAY).toISOString(),
    };
  });

  const orders: AdminOrder[] = [];
  for (let n = 0; n < 78; n++) {
    const ageDays = Math.floor(Math.pow(r(), 1.3) * 58);
    const created = new Date(now - ageDays * DAY - Math.floor(r() * DAY));
    // Repeat buyers: first few customers order more often
    const customer = customers[Math.floor(Math.pow(r(), 1.8) * customers.length)];
    const [, province] = PLACES.find(([c]) => c === customer.city) ?? PLACES[0];

    const lineCount = 1 + Math.floor(r() * 2.4);
    const items = Array.from({ length: lineCount }, () => {
      const p = pick(PRODUCTS);
      const qty = r() < 0.8 ? 1 : 2;
      return {
        product_slug: p.slug,
        product_name: p.name,
        colour: p.colour,
        size: pick(p.sizes.filter((s) => !p.soldOut?.includes(s))),
        image: p.images[0],
        unit_price: p.price,
        quantity: qty,
        line_total: p.price * qty,
      };
    });
    const subtotal = items.reduce((s, i) => s + i.line_total, 0);
    const useCode = r() < 0.18;
    const totals = computeTotals(subtotal, useCode ? Math.round(subtotal * 0.1) : 0);

    const roll = r();
    let status: OrderStatus =
      ageDays > 7 ? (roll < 0.08 ? "cancelled" : roll < 0.12 ? "returned" : "delivered")
      : ageDays > 4 ? (roll < 0.5 ? "delivered" : "shipped")
      : ageDays > 2 ? (roll < 0.5 ? "shipped" : "packed")
      : ageDays > 0 ? (roll < 0.5 ? "confirmed" : "packed")
      : roll < 0.7 ? "pending" : "confirmed";
    if (ageDays === 0 && n % 3 === 0) status = "pending";

    const flow: OrderStatus[] = ["pending", "confirmed", "packed", "shipped", "delivered"];
    const reached = status === "cancelled" ? ["pending", "cancelled"] as OrderStatus[]
      : status === "returned" ? [...flow, "returned"] as OrderStatus[]
      : flow.slice(0, flow.indexOf(status) + 1);
    const events = reached.map((s, i) => ({
      status: s,
      note: s === "pending" ? "Order placed" : s === "cancelled" ? "Customer didn't answer confirmation calls" : null,
      created_by: s === "pending" ? null : "demo@drift.local",
      created_at: new Date(created.getTime() + i * 0.6 * DAY).toISOString(),
    }));

    orders.push({
      id: uuid(r),
      order_number: "", // assigned below in date order
      customer_id: customer.id,
      status,
      payment_method: "cod",
      payment_status: status === "delivered" && ageDays > 9 ? "paid" : "unpaid",
      full_name: customer.full_name!,
      email: customer.email!,
      phone: customer.phone,
      address_line1: `House ${1 + Math.floor(r() * 300)}, Street ${1 + Math.floor(r() * 30)}, ${pick(AREAS)}`,
      address_line2: null,
      city: customer.city!,
      province,
      postal_code: null,
      notes: r() < 0.15 ? "Please call before delivery" : null,
      ...totals,
      discount_code: useCode ? "DRIFT10" : null,
      courier: ["shipped", "delivered", "returned"].includes(status) ? pick(["TCS", "Leopards", "PostEx"]) : null,
      tracking_number: ["shipped", "delivered", "returned"].includes(status) ? String(Math.floor(r() * 1e10)).padStart(10, "7") : null,
      created_at: created.toISOString(),
      order_items: items,
      order_events: events,
    });
  }
  orders.sort((a, b) => a.created_at.localeCompare(b.created_at));
  orders.forEach((o, i) => (o.order_number = `DR${10001 + i}`));
  orders.reverse();

  const discounts: AdminDiscount[] = [
    { code: "DRIFT10", type: "percent", value: 10, min_subtotal: 0, first_order_only: true, usage_limit: null, times_used: orders.filter((o) => o.discount_code).length, active: true, expires_at: null, created_at: new Date(now - 60 * DAY).toISOString() },
    { code: "LAUNCH500", type: "fixed", value: 500, min_subtotal: 7000, first_order_only: false, usage_limit: 100, times_used: 100, active: false, expires_at: new Date(now - 20 * DAY).toISOString(), created_at: new Date(now - 58 * DAY).toISOString() },
    { code: "VIP15", type: "percent", value: 15, min_subtotal: 10000, first_order_only: false, usage_limit: 50, times_used: 6, active: true, expires_at: null, created_at: new Date(now - 30 * DAY).toISOString() },
  ];

  const sources = ["popup", "popup", "footer", "drop-waitlist", "checkout"];
  const subscribers: AdminSubscriber[] = Array.from({ length: 64 }, (_, i) => ({
    id: uuid(r),
    email: `${pick(FIRST).toLowerCase()}${Math.floor(r() * 999)}@${pick(["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"])}`,
    source: sources[i % sources.length],
    created_at: new Date(now - Math.floor(r() * 58) * DAY - Math.floor(r() * DAY)).toISOString(),
  })).sort((a, b) => b.created_at.localeCompare(a.created_at));

  return { orders, customers, discounts, subscribers };
}

const g = globalThis as unknown as { __driftDemo?: DemoStore };

export function demo(): DemoStore {
  g.__driftDemo ??= build();
  return g.__driftDemo;
}

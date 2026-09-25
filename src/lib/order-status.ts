export type OrderStatus = "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled" | "returned";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

/** Allowed next steps for an order, in the order the buttons should appear. */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export const ACTION_LABEL: Record<OrderStatus, string> = {
  pending: "Mark pending",
  confirmed: "Confirm order",
  packed: "Mark packed",
  shipped: "Mark shipped",
  delivered: "Mark delivered",
  cancelled: "Cancel order",
  returned: "Mark returned",
};

export const COURIERS = ["TCS", "Leopards", "PostEx", "Trax", "M&P", "BlueEx", "Call Courier", "Rider"];

/** Orders that still count towards revenue. */
export const isCounted = (s: OrderStatus) => s !== "cancelled" && s !== "returned";

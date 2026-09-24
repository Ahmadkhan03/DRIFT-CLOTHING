import "server-only";
import { formatPrice } from "@/lib/products";

type OrderEmail = {
  to: string;
  orderNumber: string;
  orderUrl: string;
  fullName: string;
  items: { product_name: string; size: string; quantity: number; line_total: number }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  address: string;
};

/**
 * Sends the order confirmation through Resend (https://resend.com).
 * Skipped silently when RESEND_API_KEY / EMAIL_FROM aren't set, so orders
 * never fail because of email.
 */
export async function sendOrderConfirmation(order: OrderEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.info(`[email] skipped confirmation for ${order.orderNumber} (Resend not configured)`);
    return;
  }

  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0">${escape(i.product_name)} · ${escape(i.size)} × ${i.quantity}</td><td style="padding:8px 0;text-align:right">${formatPrice(i.line_total)}</td></tr>`,
    )
    .join("");

  const html = `
  <div style="background:#f4f1ec;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;color:#111010">
    <div style="max-width:560px;margin:0 auto;background:#fbfaf7;padding:32px">
      <p style="font-size:28px;font-weight:900;letter-spacing:-0.5px;margin:0 0 24px">DRIFT</p>
      <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#5c0a14;margin:0">Order confirmed</p>
      <h1 style="font-size:26px;margin:8px 0 16px">Thanks, ${escape(order.fullName.split(" ")[0])}. We've got your order.</h1>
      <p style="font-size:14px;line-height:1.6;color:#2a2727">Order <strong>${order.orderNumber}</strong> will be confirmed by our team shortly. Please keep cash ready. You'll pay <strong>${formatPrice(order.total)}</strong> on delivery.</p>
      <table style="width:100%;font-size:14px;border-top:1px solid #ddd;margin-top:24px">${rows}</table>
      <table style="width:100%;font-size:14px;border-top:1px solid #ddd">
        <tr><td style="padding:6px 0">Subtotal</td><td style="text-align:right">${formatPrice(order.subtotal)}</td></tr>
        ${order.discount ? `<tr><td style="padding:6px 0">Discount</td><td style="text-align:right">−${formatPrice(order.discount)}</td></tr>` : ""}
        <tr><td style="padding:6px 0">Delivery</td><td style="text-align:right">${order.shipping ? formatPrice(order.shipping) : "Free"}</td></tr>
        <tr><td style="padding:6px 0;font-weight:bold">Total (COD)</td><td style="text-align:right;font-weight:bold">${formatPrice(order.total)}</td></tr>
      </table>
      <p style="font-size:13px;color:#6f6964;margin-top:24px">Delivering to: ${escape(order.address)}</p>
      <a href="${order.orderUrl}" style="display:inline-block;margin-top:16px;background:#5c0a14;color:#f4f1ec;padding:14px 24px;text-decoration:none;font-size:12px;letter-spacing:2px;text-transform:uppercase">View your order</a>
    </div>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: order.to, subject: `Your DRIFT order ${order.orderNumber}`, html }),
    });
    if (!res.ok) console.error(`[email] Resend error ${res.status}: ${await res.text()}`);
  } catch (err) {
    console.error("[email] failed to send confirmation", err);
  }
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

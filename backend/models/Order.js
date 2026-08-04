// Orders. In Demo mode they are stored in memory. In Live mode they are created
// as real WooCommerce orders in WordPress (and also kept in memory so the
// customer can see them during their session). All reset on backend restart.
import { isLive } from "../lib/mode.js";
import * as woo from "../lib/woo.js";

export const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

let orders = [];
let counter = 0;

const clone = (o) => (o ? JSON.parse(JSON.stringify(o)) : o);

export async function getAll() {
  return orders.map(clone).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getById(id) {
  return clone(orders.find((o) => o.id === id) || null);
}

export async function getByUserId(userId) {
  return orders.filter((o) => o.userId === Number(userId)).map(clone);
}

export async function create(payload) {
  let order;
  if (isLive()) {
    // Throws on failure; the controller turns this into a clear message.
    order = await woo.createOrder(payload);
  } else {
    counter += 1;
    order = {
      id: `ORD${1000 + counter}`,
      userId: Number(payload.userId),
      customerName: payload.customerName,
      customerEmail: payload.customerEmail,
      shippingAddress: payload.shippingAddress,
      subtotal: payload.subtotal,
      shipping: payload.shipping,
      total: payload.total,
      status: "pending",
      items: payload.items.map((item, index) => ({
        id: index + 1,
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image,
      })),
      createdAt: new Date().toISOString(),
    };
  }
  orders.unshift(order);
  return clone(order);
}

export async function updateStatus(id, status) {
  const order = orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status.toLowerCase();
  return clone(order);
}

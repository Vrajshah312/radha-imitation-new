// Orders are app-managed and stored in memory (reset on restart). They work the
// same in Demo and Live mode so checkout is fully functional in the preview.
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

export async function create({ userId, customerName, customerEmail, items, shippingAddress, subtotal, shipping, total }) {
  counter += 1;
  const order = {
    id: `ORD${1000 + counter}`,
    userId: Number(userId),
    customerName,
    customerEmail,
    shippingAddress,
    subtotal,
    shipping,
    total,
    status: "pending",
    items: items.map((item, index) => ({
      id: index + 1,
      productId: item.productId,
      name: item.name,
      price: item.price,
      qty: item.qty,
      image: item.image,
    })),
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);
  return clone(order);
}

export async function updateStatus(id, status) {
  const order = orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status.toLowerCase();
  return clone(order);
}

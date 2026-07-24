import * as Order from "../../models/Order.js";

export async function listOrders(req, res) {
  const orders = [...await Order.getAll()].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  return res.json({ orders });
}

export async function getOrder(req, res) {
  const order = await Order.getById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  return res.json({ order });
}

export async function updateOrderStatus(req, res) {
  const { status } = req.body;
  if (!Order.STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${Order.STATUSES.join(", ")}` });
  }
  const order = await Order.updateStatus(req.params.id, status);
  if (!order) return res.status(404).json({ message: "Order not found" });
  return res.json({ order });
}

export default { listOrders, getOrder, updateOrderStatus };

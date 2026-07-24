import * as Order from "../models/Order.js";
import * as Product from "../models/Product.js";

// Customer creates an order at checkout. Also decrements stock for
// each purchased product (basic inventory sync).
export async function createOrder(req, res) {
  const { items, shippingAddress } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order must contain at least one item" });
  }
  if (!shippingAddress) {
    return res.status(400).json({ message: "Shipping address is required" });
  }

  const orderItems = [];
  for (const item of items) {
    const product = await Product.getById(item.id);
    if (!product) {
      return res.status(404).json({ message: `Product ${item.id} not found` });
    }
    orderItems.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: item.qty,
      image: product.images?.[0],
    });
  }

  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal + shipping;

  const order = await Order.create({
    userId: req.user.id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    items: orderItems,
    shippingAddress,
    subtotal,
    shipping,
    total,
  });

  // Decrement stock for each item purchased.
  await Promise.all(orderItems.map((item) => Product.adjustStock(item.productId, -item.qty)));

  return res.status(201).json({ order });
}

export async function getMyOrders(req, res) {
  const orders = (await Order.getByUserId(req.user.id)).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  return res.json({ orders });
}

export async function getMyOrderById(req, res) {
  const order = await Order.getById(req.params.id);
  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ message: "Order not found" });
  }
  return res.json({ order });
}

export default { createOrder, getMyOrders, getMyOrderById };

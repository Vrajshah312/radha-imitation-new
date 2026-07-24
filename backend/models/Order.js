import prisma from "../lib/prisma.js";
export const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const includeItems = { items: { orderBy: { id: "asc" } } };
const mapOrder = (order) => order && ({ ...order, subtotal: Number(order.subtotal), shipping: Number(order.shipping), total: Number(order.total), status: order.status.toLowerCase(), items: order.items.map((item) => ({ ...item, productId: item.productId, price: Number(item.price) })) });
export async function getAll() { return (await prisma.order.findMany({ include: includeItems, orderBy: { createdAt: "desc" } })).map(mapOrder); }
export async function getById(id) { return mapOrder(await prisma.order.findUnique({ where: { id }, include: includeItems })); }
export async function getByUserId(userId) { return (await prisma.order.findMany({ where: { userId: Number(userId) }, include: includeItems, orderBy: { createdAt: "desc" } })).map(mapOrder); }
export async function create({ userId, customerName, customerEmail, items, shippingAddress, subtotal, shipping, total }) {
  const count = await prisma.order.count();
  return mapOrder(await prisma.order.create({ data: { id: `ORD${1001 + count}`, userId: Number(userId), customerName, customerEmail, shippingAddress, subtotal, shipping, total, items: { create: items.map((item) => ({ productId: item.productId, name: item.name, price: item.price, qty: item.qty, image: item.image })) } }, include: includeItems }));
}
export async function updateStatus(id, status) { try { return mapOrder(await prisma.order.update({ where: { id }, data: { status: status.toUpperCase() }, include: includeItems })); } catch { return null; } }

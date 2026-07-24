import * as Product from "../../models/Product.js";
import * as Order from "../../models/Order.js";
import * as User from "../../models/User.js";

export async function getStats(req, res) {
  const [products, orders, users] = await Promise.all([Product.getAll(), Order.getAll(), User.getAllUsers()]);

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const ordersByStatus = Order.STATUSES.reduce((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status).length;
    return acc;
  }, {});

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Revenue for the last 7 days, for a simple sparkline/bar chart.
  const revenueByDay = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const dayKey = day.toISOString().slice(0, 10);
    const dayTotal = orders
      .filter((o) => o.createdAt.slice(0, 10) === dayKey && o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
    revenueByDay.push({ date: dayKey, revenue: dayTotal });
  }

  return res.json({
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: products.length,
    totalCustomers: users.filter((u) => u.role === "customer").length,
    ordersByStatus,
    lowStockCount,
    outOfStockCount,
    recentOrders,
    revenueByDay,
  });
}

export default { getStats };

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./Admin.css";

const STATUS_PILL = {
  pending: "pill-amber",
  processing: "pill-blue",
  shipped: "pill-blue",
  delivered: "pill-green",
  cancelled: "pill-red",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader">Loading dashboard…</div>;
  if (!stats) return null;

  const maxRevenue = Math.max(...stats.revenueByDay.map((d) => d.revenue), 1);

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">Overview</span>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Revenue</span>
          <div className="admin-stat-value">₹{stats.totalRevenue.toLocaleString("en-IN")}</div>
          <div className="admin-stat-sub">Across {stats.totalOrders} orders</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Orders</span>
          <div className="admin-stat-value">{stats.totalOrders}</div>
          <div className="admin-stat-sub">{stats.ordersByStatus.pending} pending</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Products</span>
          <div className="admin-stat-value">{stats.totalProducts}</div>
          <div className={`admin-stat-sub ${stats.lowStockCount > 0 ? "is-warning" : ""}`}>
            {stats.lowStockCount} low stock · {stats.outOfStockCount} out of stock
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Customers</span>
          <div className="admin-stat-value">{stats.totalCustomers}</div>
          <div className="admin-stat-sub">Registered shoppers</div>
        </div>
      </div>

      <div className="admin-panels">
        <div className="admin-panel">
          <h3>Revenue — Last 7 Days</h3>
          <div className="admin-bar-chart">
            {stats.revenueByDay.map((d) => (
              <div className="admin-bar-col" key={d.date}>
                <div
                  className="admin-bar"
                  style={{ height: `${Math.max(6, (d.revenue / maxRevenue) * 100)}%` }}
                  title={`₹${d.revenue.toLocaleString("en-IN")}`}
                />
                <span className="admin-bar-label">
                  {new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-panel">
          <h3>Orders by Status</h3>
          <div className="admin-status-list">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div className="admin-status-row" key={status}>
                <span className={`pill ${STATUS_PILL[status] || "pill-grey"}`}>{status}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-panel" style={{ marginTop: 24 }}>
        <h3>Recent Orders</h3>
        {stats.recentOrders.length === 0 ? (
          <div className="admin-empty-state">No orders placed yet.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.customerName}</td>
                    <td>₹{o.total.toLocaleString("en-IN")}</td>
                    <td>
                      <span className={`pill ${STATUS_PILL[o.status] || "pill-grey"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ marginTop: 16 }}>
          <Link to="/admin/orders" className="btn btn-outline btn-small">
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

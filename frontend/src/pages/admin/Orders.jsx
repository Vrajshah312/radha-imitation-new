import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./Admin.css";

const STATUS_PILL = {
  pending: "pill-amber",
  processing: "pill-blue",
  shipped: "pill-blue",
  delivered: "pill-green",
  cancelled: "pill-red",
};
const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  function loadOrders() {
    setLoading(true);
    api
      .get("/admin/orders")
      .then((res) => setOrders(res.data.orders))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  async function handleStatusChange(orderId, status) {
    setUpdating(true);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      loadOrders();
      setSelected((s) => (s && s.id === orderId ? { ...s, status } : s));
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">Sales</span>
          <h1>Orders</h1>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search by order ID or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-toolbar-filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="page-loader">Loading orders…</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-state">No orders found.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>
                    <div className="admin-row-name">{o.customerName}</div>
                    <div className="admin-row-sub">{o.customerEmail}</div>
                  </td>
                  <td>{o.items.reduce((sum, i) => sum + i.qty, 0)} items</td>
                  <td>₹{o.total.toLocaleString("en-IN")}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      disabled={updating}
                      className={`pill ${STATUS_PILL[o.status] || "pill-grey"}`}
                      style={{ border: "none", cursor: "pointer" }}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    <button className="icon-btn" title="View details" onClick={() => setSelected(o)}>
                      <svg viewBox="0 0 20 20" fill="none">
                        <path d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6S1.5 10 1.5 10z" stroke="currentColor" strokeWidth="1.4" />
                        <circle cx="10" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Order {selected.id}</h2>
            <p className="admin-row-sub" style={{ marginBottom: 20 }}>
              Placed on {new Date(selected.createdAt).toLocaleString("en-IN")}
            </p>

            <div style={{ marginBottom: 20 }}>
              <strong style={{ fontSize: "0.82rem" }}>Customer</strong>
              <p style={{ margin: "6px 0 0" }}>
                {selected.customerName} · {selected.customerEmail}
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <strong style={{ fontSize: "0.82rem" }}>Shipping Address</strong>
              <p style={{ margin: "6px 0 0" }}>
                {selected.shippingAddress.address}, {selected.shippingAddress.city},{" "}
                {selected.shippingAddress.state} - {selected.shippingAddress.pincode}
                <br />
                Phone: {selected.shippingAddress.phone}
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <strong style={{ fontSize: "0.82rem" }}>Items</strong>
              {selected.items.map((item) => (
                <div
                  key={item.productId}
                  style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "0.86rem" }}
                >
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <span>₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 10,
                  marginTop: 6,
                  borderTop: "1px solid var(--line)",
                  fontWeight: 600,
                }}
              >
                <span>Total</span>
                <span>₹{selected.total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

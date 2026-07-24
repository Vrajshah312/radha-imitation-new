import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./Admin.css";

const STATUS_PILL = {
  "in-stock": "pill-green",
  "low-stock": "pill-amber",
  "out-of-stock": "pill-red",
};
const STATUS_LABEL = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
};

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingId, setPendingId] = useState(null);

  function loadInventory() {
    setLoading(true);
    api
      .get("/admin/inventory")
      .then((res) => {
        setInventory(res.data.inventory);
        setThreshold(res.data.lowStockThreshold);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const filtered = useMemo(() => {
    return inventory.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [inventory, search, statusFilter]);

  async function adjust(id, delta) {
    setPendingId(id);
    try {
      await api.patch(`/admin/inventory/${id}/adjust`, { delta });
      loadInventory();
    } finally {
      setPendingId(null);
    }
  }

  const lowStockCount = inventory.filter((p) => p.status === "low-stock").length;
  const outOfStockCount = inventory.filter((p) => p.status === "out-of-stock").length;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">Stock Control</span>
          <h1>Inventory</h1>
        </div>
      </div>

      <div className="admin-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total SKUs</span>
          <div className="admin-stat-value">{inventory.length}</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Low Stock (&le; {threshold})</span>
          <div className="admin-stat-value">{lowStockCount}</div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Out of Stock</span>
          <div className="admin-stat-value">{outOfStockCount}</div>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-toolbar-filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="page-loader">Loading inventory…</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-state">No products match your filters.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Adjust</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-row-media">
                      <img src={p.image} alt={p.name} />
                      <div className="admin-row-name">{p.name}</div>
                    </div>
                  </td>
                  <td className="admin-row-sub" style={{ textTransform: "capitalize" }}>
                    {p.category.replace("-", " ")}
                  </td>
                  <td>{p.stock} units</td>
                  <td>
                    <span className={`pill ${STATUS_PILL[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                  </td>
                  <td>
                    <div className="stock-adjust">
                      <button onClick={() => adjust(p.id, -1)} disabled={pendingId === p.id || p.stock === 0}>
                        –
                      </button>
                      <span className="stock-value">{p.stock}</span>
                      <button onClick={() => adjust(p.id, 1)} disabled={pendingId === p.id}>
                        +
                      </button>
                      <button
                        className="btn btn-outline btn-small"
                        onClick={() => adjust(p.id, 10)}
                        disabled={pendingId === p.id}
                        style={{ marginLeft: 8 }}
                      >
                        +10 (Restock)
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

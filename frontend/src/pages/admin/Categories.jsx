import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Admin.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", tagline: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [subForms, setSubForms] = useState({});

  function loadCategories() {
    setLoading(true);
    api
      .get("/admin/categories")
      .then((res) => setCategories(res.data.categories))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", tagline: "" });
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(category) {
    setEditing(category);
    setForm({ name: category.name, tagline: category.tagline });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/categories/${editing.id}`, form);
      } else {
        await api.post("/admin/categories", form);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save category");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCategory(category) {
    if (
      !window.confirm(
        `Delete "${category.name}" and all its subcategories? This cannot be undone.`
      )
    )
      return;
    await api.delete(`/admin/categories/${category.id}`);
    loadCategories();
  }

  async function handleAddSubcategory(categoryId) {
    const name = subForms[categoryId]?.trim();
    if (!name) return;
    await api.post(`/admin/categories/${categoryId}/subcategories`, { name });
    setSubForms((f) => ({ ...f, [categoryId]: "" }));
    loadCategories();
  }

  async function handleDeleteSubcategory(categoryId, subId) {
    if (!window.confirm("Remove this subcategory?")) return;
    await api.delete(`/admin/categories/${categoryId}/subcategories/${subId}`);
    loadCategories();
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">Catalogue</span>
          <h1>Categories</h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Category
        </button>
      </div>

      {loading ? (
        <div className="page-loader">Loading categories…</div>
      ) : (
        <div className="admin-panels" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {categories.map((cat) => (
            <div className="admin-panel" key={cat.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3>{cat.name}</h3>
                  <p className="admin-row-sub" style={{ marginTop: -12, marginBottom: 16 }}>
                    {cat.tagline}
                  </p>
                </div>
                <div className="admin-row-actions">
                  <button className="icon-btn" onClick={() => openEdit(cat)} title="Edit">
                    <svg viewBox="0 0 20 20" fill="none">
                      <path d="M13 3.5l3.5 3.5L6 17.5H2.5V14L13 3.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    className="icon-btn icon-btn-danger"
                    onClick={() => handleDeleteCategory(cat)}
                    title="Delete"
                  >
                    <svg viewBox="0 0 20 20" fill="none">
                      <path d="M4 6h12M8 6V4.5h4V6M5.5 6l.8 10a1.5 1.5 0 001.5 1.4h4.4a1.5 1.5 0 001.5-1.4l.8-10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {cat.subcategories.map((sub) => (
                  <div
                    key={sub.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      background: "var(--ivory-deep)",
                      borderRadius: 8,
                      fontSize: "0.84rem",
                    }}
                  >
                    {sub.name}
                    <button
                      className="icon-btn icon-btn-danger"
                      style={{ width: 24, height: 24, border: "none", background: "none" }}
                      onClick={() => handleDeleteSubcategory(cat.id, sub.id)}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {cat.subcategories.length === 0 && (
                  <span className="admin-row-sub">No subcategories yet</span>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className="admin-search"
                  style={{ maxWidth: "none" }}
                  placeholder="New subcategory name"
                  value={subForms[cat.id] || ""}
                  onChange={(e) => setSubForms((f) => ({ ...f, [cat.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubcategory(cat.id)}
                />
                <button className="btn btn-outline btn-small" onClick={() => handleAddSubcategory(cat.id)}>
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <h2>{editing ? "Edit Category" : "Add Category"}</h2>
            {formError && <div className="form-error">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Category Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="form-field">
                <label>Tagline</label>
                <input
                  value={form.tagline}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editing ? "Save Changes" : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

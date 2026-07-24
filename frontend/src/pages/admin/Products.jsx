import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";
import "./Admin.css";

const emptyForm = {
  id: "",
  name: "",
  category: "",
  subcategory: "",
  price: "",
  mrp: "",
  stock: "",
  material: "",
  colors: "",
  description: "",
  images: "",
  isNew: false,
  isBestseller: false,
};

const CSV_HEADERS = [
  "name", "category", "subcategory", "price", "mrp", "stock", "material",
  "colors", "images", "description", "isNew", "isBestseller",
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i += 1; } else quoted = !quoted;
    } else if (char === "," && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  if (quoted) throw new Error("The CSV contains an unclosed quoted value.");
  if (rows.length < 2) throw new Error("Add a header row and at least one product row.");
  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim());
  const missing = CSV_HEADERS.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Missing columns: ${missing.join(", ")}`);
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = useRef(null);

  function loadProducts() {
    setLoading(true);
    api
      .get("/admin/products")
      .then((res) => setProducts(res.data.products))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProducts();
    api.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function downloadTemplate() {
    const example = [
      "Example Kundan Set", "necklaces", "kundan-sets", "2499", "3999", "10",
      "Gold-plated brass", "Gold|Rose Gold", "https://example.com/image-1.jpg|https://example.com/image-2.jpg",
      "Describe the product here", "true", "false",
    ];
    const csv = [CSV_HEADERS, example].map((row) => row.map((value) => `\"${String(value).replaceAll('"', '\"\"')}\"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url; link.download = "radha-products-template.csv"; link.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImportMessage("");
    setImporting(true);
    try {
      const productsToImport = parseCsv(await file.text());
      const response = await api.post("/admin/products/bulk", { products: productsToImport });
      setImportMessage(`${response.data.count} product${response.data.count === 1 ? "" : "s"} imported successfully.`);
      loadProducts();
    } catch (err) {
      const rowErrors = err.response?.data?.errors;
      const detail = rowErrors?.slice(0, 3).map((entry) => `Row ${entry.row}: ${entry.errors.join(", ")}`).join(" | ");
      setImportMessage(`Import failed. ${detail || err.response?.data?.message || err.message || "Please check the CSV and try again."}`);
    } finally {
      setImporting(false);
    }
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      id: product.id,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price,
      mrp: product.mrp,
      stock: product.stock,
      material: product.material,
      colors: product.colors.join(", "),
      description: product.description,
      images: product.images.join(", "),
      isNew: product.isNew,
      isBestseller: product.isBestseller,
    });
    setFormError("");
    setModalOpen(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  const activeCategory = categories.find((c) => c.id === form.category);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    const payload = {
      name: form.name,
      category: form.category,
      subcategory: form.subcategory,
      price: Number(form.price),
      mrp: Number(form.mrp),
      stock: Number(form.stock),
      material: form.material,
      colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
      description: form.description,
      images: form.images.split(",").map((i) => i.trim()).filter(Boolean),
      isNew: form.isNew,
      isBestseller: form.isBestseller,
    };

    try {
      if (editing) {
        await api.put(`/admin/products/${editing.id}`, payload);
      } else {
        await api.post("/admin/products", payload);
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    await api.delete(`/admin/products/${product.id}`);
    loadProducts();
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <span className="eyebrow">Catalogue</span>
          <h1>Products</h1>
        </div>
        <div className="admin-page-actions">
          <button className="btn btn-outline" onClick={downloadTemplate}>Download CSV Template</button>
          <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? "Importing…" : "Import CSV"}
          </button>
          <input ref={fileInputRef} className="visually-hidden" type="file" accept=".csv,text/csv" onChange={handleImportFile} />
          <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
        </div>
      </div>

      {importMessage && <div className={`admin-import-message ${importMessage.startsWith("Import failed") ? "is-error" : ""}`}>{importMessage}</div>}

      <div className="admin-toolbar">
        <input
          className="admin-search"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-toolbar-filters">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="page-loader">Loading products…</div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty-state">No products match your filters.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Tags</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-row-media">
                      <img src={p.images[0]} alt={p.name} />
                      <div>
                        <div className="admin-row-name">{p.name}</div>
                        <div className="admin-row-sub">{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="admin-row-sub" style={{ textTransform: "capitalize" }}>
                    {p.category.replace("-", " ")} <br />
                    <span>{p.subcategory.replace("-", " ")}</span>
                  </td>
                  <td>
                    ₹{p.price.toLocaleString("en-IN")}
                    <br />
                    <span className="admin-row-sub">
                      <s>₹{p.mrp.toLocaleString("en-IN")}</s>
                    </span>
                  </td>
                  <td>
                    <span
                      className={`pill ${
                        p.stock === 0 ? "pill-red" : p.stock <= 10 ? "pill-amber" : "pill-green"
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    {p.isNew && <span className="pill pill-blue">New</span>}{" "}
                    {p.isBestseller && <span className="pill pill-amber">Bestseller</span>}
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button className="icon-btn" onClick={() => openEdit(p)} title="Edit">
                        <svg viewBox="0 0 20 20" fill="none">
                          <path d="M13 3.5l3.5 3.5L6 17.5H2.5V14L13 3.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        className="icon-btn icon-btn-danger"
                        onClick={() => handleDelete(p)}
                        title="Delete"
                      >
                        <svg viewBox="0 0 20 20" fill="none">
                          <path d="M4 6h12M8 6V4.5h4V6M5.5 6l.8 10a1.5 1.5 0 001.5 1.4h4.4a1.5 1.5 0 001.5-1.4l.8-10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Edit Product" : "Add Product"}</h2>
            {formError && <div className="form-error">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>Product Name</label>
                <input name="name" required value={form.name} onChange={handleChange} />
              </div>

              <div className="admin-modal-row">
                <div className="form-field">
                  <label>Category</label>
                  <select name="category" required value={form.category} onChange={handleChange}>
                    <option value="">Select…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Subcategory</label>
                  <select
                    name="subcategory"
                    required
                    value={form.subcategory}
                    onChange={handleChange}
                    disabled={!activeCategory}
                  >
                    <option value="">Select…</option>
                    {activeCategory?.subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-modal-row">
                <div className="form-field">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-field">
                  <label>MRP (₹)</label>
                  <input
                    type="number"
                    name="mrp"
                    required
                    min="0"
                    value={form.mrp}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="admin-modal-row">
                <div className="form-field">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-field">
                  <label>Material</label>
                  <input name="material" value={form.material} onChange={handleChange} />
                </div>
              </div>

              <div className="form-field">
                <label>Colours (comma separated)</label>
                <input name="colors" value={form.colors} onChange={handleChange} placeholder="Gold, Rose Gold" />
              </div>

              <div className="form-field">
                <label>Image URLs (comma separated)</label>
                <input name="images" value={form.images} onChange={handleChange} placeholder="https://…, https://…" />
              </div>

              <div className="form-field">
                <label>Description</label>
                <textarea name="description" rows={3} value={form.description} onChange={handleChange} />
              </div>

              <label className="checkbox-field">
                <input type="checkbox" name="isNew" checked={form.isNew} onChange={handleChange} />
                Mark as New Arrival
              </label>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  name="isBestseller"
                  checked={form.isBestseller}
                  onChange={handleChange}
                />
                Mark as Bestseller
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editing ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

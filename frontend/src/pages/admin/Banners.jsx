import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Admin.css";

const blank = { eyebrow: "", title: "", accent: "", description: "", buttonLabel: "", buttonLink: "/shop", image: "", active: true, order: 1 };

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const load = () => api.get("/admin/banners").then((res) => setBanners(res.data.banners));
  useEffect(() => { load(); }, []);
  const change = (event) => { const { name, value, type, checked } = event.target; setForm((state) => ({ ...state, [name]: type === "checkbox" ? checked : value })); };
  const edit = (banner) => { setEditing(banner); setForm(banner); setSelectedImage(null); setPreview(banner.image); setError(""); setOpen(true); };
  const create = () => { setEditing(null); setForm({ ...blank, order: banners.length + 1 }); setSelectedImage(null); setPreview(""); setError(""); setOpen(true); };
  function selectImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be 5 MB or smaller."); return; }
    setError(""); setSelectedImage(file); setPreview(URL.createObjectURL(file));
  }
  async function submit(event) {
    event.preventDefault(); setError("");
    try {
      let image = form.image;
      if (selectedImage) {
        const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(selectedImage); });
        image = (await api.post("/admin/uploads/banners", { dataUrl })).data.url;
      }
      const payload = { ...form, image };
      editing ? await api.put(`/admin/banners/${editing.id}`, payload) : await api.post("/admin/banners", payload);
      setOpen(false); load();
    }
    catch (err) { setError(err.response?.data?.message || "Could not save banner"); }
  }
  async function remove(banner) { if (window.confirm(`Delete “${banner.title}”?`)) { await api.delete(`/admin/banners/${banner.id}`); load(); } }
  return <div>
    <div className="admin-page-head"><div><span className="eyebrow">Storefront Content</span><h1>Home Banners</h1></div><button className="btn btn-primary" onClick={create}>+ Add Banner</button></div>
    <p className="admin-page-intro">These slides appear at the top of the home page. Use a short offer headline, an image URL and a link to the relevant collection.</p>
    <div className="banner-admin-grid">{banners.map((banner) => <article className="banner-admin-card" key={banner.id}><img src={banner.image} alt="" /><div><span className={`pill ${banner.active ? "pill-green" : "pill-grey"}`}>{banner.active ? "Active" : "Hidden"}</span><span className="admin-row-sub"> Slide {banner.order}</span><h3>{banner.title} {banner.accent && <em>{banner.accent}</em>}</h3><p>{banner.eyebrow} · {banner.buttonLabel}</p><div className="admin-row-actions"><button className="icon-btn" onClick={() => edit(banner)} title="Edit">✎</button><button className="icon-btn icon-btn-danger" onClick={() => remove(banner)} title="Delete">×</button></div></div></article>)}</div>
    {open && <div className="admin-modal-overlay" onClick={() => setOpen(false)}><div className="admin-modal" onClick={(event) => event.stopPropagation()}><h2>{editing ? "Edit Banner" : "Add Home Banner"}</h2>{error && <div className="form-error">{error}</div>}<form onSubmit={submit}>
      <div className="admin-modal-row"><div className="form-field"><label>Small Offer Text</label><input name="eyebrow" required value={form.eyebrow} onChange={change} placeholder="Limited-Time Offer" /></div><div className="form-field"><label>Display Order</label><input type="number" min="1" name="order" value={form.order} onChange={change} /></div></div>
      <div className="form-field"><label>Headline</label><input name="title" required value={form.title} onChange={change} placeholder="Festive sparkle," /></div><div className="form-field"><label>Highlighted Words (optional)</label><input name="accent" value={form.accent} onChange={change} placeholder="special prices" /></div>
      <div className="form-field"><label>Description</label><textarea name="description" rows="3" value={form.description} onChange={change} /></div><div className="form-field"><label>Banner Image</label><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={selectImage} /><small className="admin-upload-help">Choose an image from your computer (JPG, PNG, WebP or GIF, up to 5 MB). It is stored locally for now.</small>{preview && <img className="banner-upload-preview" src={preview} alt="Banner preview" />}</div><div className="form-field"><label>Or use an Image URL</label><input type="url" name="image" value={form.image} onChange={(event) => { change(event); setPreview(event.target.value); setSelectedImage(null); }} placeholder="https://..." /></div>
      <div className="admin-modal-row"><div className="form-field"><label>Button Text</label><input name="buttonLabel" required value={form.buttonLabel} onChange={change} placeholder="Shop the Offer" /></div><div className="form-field"><label>Button Link</label><input name="buttonLink" required value={form.buttonLink} onChange={change} placeholder="/shop?isNew=true" /></div></div>
      <label className="checkbox-field"><input type="checkbox" name="active" checked={form.active} onChange={change} /> Show this banner on the home page</label><div className="admin-modal-actions"><button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-primary">Save Banner</button></div>
    </form></div></div>}
  </div>;
}

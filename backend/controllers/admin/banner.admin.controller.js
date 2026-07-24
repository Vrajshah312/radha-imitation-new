import * as Banner from "../../models/Banner.js";

function validate(data) {
  const required = ["eyebrow", "title", "buttonLabel", "buttonLink", "image"];
  return required.filter((field) => !String(data[field] || "").trim());
}
export async function listBanners(req, res) { return res.json({ banners: await Banner.getAll() }); }
export async function createBanner(req, res) {
  const missing = validate(req.body);
  if (missing.length) return res.status(400).json({ message: `Required: ${missing.join(", ")}` });
  return res.status(201).json({ banner: await Banner.create(req.body) });
}
export async function updateBanner(req, res) {
  const missing = validate(req.body);
  if (missing.length) return res.status(400).json({ message: `Required: ${missing.join(", ")}` });
  const banner = await Banner.update(req.params.id, req.body);
  if (!banner) return res.status(404).json({ message: "Banner not found" });
  return res.json({ banner });
}
export async function deleteBanner(req, res) {
  if (!await Banner.remove(req.params.id)) return res.status(404).json({ message: "Banner not found" });
  return res.json({ message: "Banner deleted" });
}

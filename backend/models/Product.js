import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isLive } from "../lib/mode.js";
import * as woo from "../lib/woo.js";

const dir = path.dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(fs.readFileSync(path.join(dir, "../data/products.json"), "utf8"));

// DEMO data lives in memory (seeded from JSON). Admin edits persist until the
// server restarts. LIVE data is read from WordPress/WooCommerce via GraphQL.
let demoProducts = seed.map((p) => ({ ...p }));

const clone = (p) => (p ? { ...p, images: [...(p.images || [])], colors: [...(p.colors || [])] } : p);
const nextId = () => `p${String(demoProducts.length + 1).padStart(3, "0")}`;

export async function getAll() {
  if (isLive()) return woo.getProducts();
  return demoProducts.map(clone);
}

export async function getById(id) {
  if (isLive()) return woo.getProductById(id);
  return clone(demoProducts.find((p) => p.id === id) || null);
}

export async function create(data) {
  const product = {
    id: data.id || nextId(),
    name: data.name,
    category: data.category,
    subcategory: data.subcategory,
    price: Number(data.price),
    mrp: Number(data.mrp),
    rating: Number(data.rating ?? 0),
    reviews: Number(data.reviews ?? 0),
    stock: Number(data.stock ?? 0),
    material: data.material || "",
    colors: data.colors || [],
    isNew: !!data.isNew,
    isBestseller: !!data.isBestseller,
    description: data.description || "",
    images: data.images?.length
      ? data.images
      : [`https://picsum.photos/seed/${encodeURIComponent(data.name || "product")}/700/850`],
  };
  demoProducts.unshift(product);
  return clone(product);
}

export async function update(id, updates) {
  const product = demoProducts.find((p) => p.id === id);
  if (!product) return null;
  for (const field of ["name", "category", "subcategory", "material", "colors", "isNew", "isBestseller", "description", "images"]) {
    if (updates[field] !== undefined) product[field] = updates[field];
  }
  for (const field of ["price", "mrp", "rating", "reviews", "stock"]) {
    if (updates[field] !== undefined) product[field] = Number(updates[field]);
  }
  return clone(product);
}

export async function remove(id) {
  const before = demoProducts.length;
  demoProducts = demoProducts.filter((p) => p.id !== id);
  return demoProducts.length < before;
}

export async function adjustStock(id, delta) {
  const product = demoProducts.find((p) => p.id === id);
  if (!product) return null;
  product.stock = Math.max(0, product.stock + Number(delta));
  return clone(product);
}

export async function setStock(id, stock) {
  const product = demoProducts.find((p) => p.id === id);
  if (!product) return null;
  product.stock = Math.max(0, Number(stock));
  return clone(product);
}

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isLive } from "../lib/mode.js";
import * as woo from "../lib/woo.js";

const dir = path.dirname(fileURLToPath(import.meta.url));
const seed = JSON.parse(fs.readFileSync(path.join(dir, "../data/categories.json"), "utf8"));

let demoCategories = seed.map((c) => ({ ...c, subcategories: c.subcategories.map((s) => ({ ...s })) }));

const slugify = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const clone = (c) => (c ? { ...c, subcategories: (c.subcategories || []).map((s) => ({ ...s })) } : c);

export async function getAll() {
  if (isLive()) return woo.getCategories();
  return demoCategories.map(clone);
}

export async function getById(id) {
  if (isLive()) return (await woo.getCategories()).find((c) => c.id === id) || null;
  const category = demoCategories.find((c) => c.id === id);
  return category ? clone(category) : null;
}

export async function create(data) {
  const category = {
    id: data.id || slugify(data.name),
    name: data.name,
    tagline: data.tagline || "",
    subcategories: (data.subcategories || []).map((sub) => ({ id: sub.id || slugify(sub.name), name: sub.name })),
  };
  demoCategories.push(category);
  return clone(category);
}

export async function update(id, updates) {
  const category = demoCategories.find((c) => c.id === id);
  if (!category) return null;
  if (updates.name !== undefined) category.name = updates.name;
  if (updates.tagline !== undefined) category.tagline = updates.tagline;
  return clone(category);
}

export async function remove(id) {
  const before = demoCategories.length;
  demoCategories = demoCategories.filter((c) => c.id !== id);
  return demoCategories.length < before;
}

export async function addSubcategory(categoryId, sub) {
  const category = demoCategories.find((c) => c.id === categoryId);
  if (!category) return null;
  category.subcategories.push({ id: sub.id || slugify(sub.name), name: sub.name });
  return clone(category);
}

export async function removeSubcategory(categoryId, subId) {
  const category = demoCategories.find((c) => c.id === categoryId);
  if (!category) return null;
  category.subcategories = category.subcategories.filter((s) => s.id !== subId);
  return clone(category);
}

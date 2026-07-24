import prisma from "../lib/prisma.js";

const includeSubcategories = { subcategories: { orderBy: { name: "asc" } } };
const mapCategory = (category) => ({ ...category, subcategories: category.subcategories || [] });

export async function getAll() { return (await prisma.category.findMany({ include: includeSubcategories, orderBy: { name: "asc" } })).map(mapCategory); }
export async function getById(id) { const category = await prisma.category.findUnique({ where: { id }, include: includeSubcategories }); return category && mapCategory(category); }
export async function create(data) {
  const id = data.id || slugify(data.name);
  const category = await prisma.category.create({ data: { id, name: data.name, tagline: data.tagline || "", subcategories: { create: (data.subcategories || []).map((sub) => ({ id: sub.id || slugify(sub.name), name: sub.name })) } }, include: includeSubcategories });
  return mapCategory(category);
}
export async function update(id, updates) {
  try { return mapCategory(await prisma.category.update({ where: { id }, data: { name: updates.name, tagline: updates.tagline }, include: includeSubcategories })); } catch { return null; }
}
export async function remove(id) { try { await prisma.category.delete({ where: { id } }); return true; } catch { return false; } }
export async function addSubcategory(categoryId, sub) {
  try { await prisma.subcategory.create({ data: { id: sub.id || slugify(sub.name), name: sub.name, categoryId } }); return getById(categoryId); } catch { return null; }
}
export async function removeSubcategory(categoryId, subId) {
  try { await prisma.subcategory.delete({ where: { id_categoryId: { id: subId, categoryId } } }); return getById(categoryId); } catch { return null; }
}
function slugify(name) { return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

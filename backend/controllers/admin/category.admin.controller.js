import * as Category from "../../models/Category.js";

export async function listCategories(req, res) {
  return res.json({ categories: await Category.getAll() });
}

export async function createCategory(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Category name is required" });
  const category = await Category.create(req.body);
  return res.status(201).json({ category });
}

export async function updateCategory(req, res) {
  const category = await Category.update(req.params.id, req.body);
  if (!category) return res.status(404).json({ message: "Category not found" });
  return res.json({ category });
}

export async function deleteCategory(req, res) {
  const ok = await Category.remove(req.params.id);
  if (!ok) return res.status(404).json({ message: "Category not found" });
  return res.json({ message: "Category deleted" });
}

export async function addSubcategory(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Subcategory name is required" });
  const category = await Category.addSubcategory(req.params.id, req.body);
  if (!category) return res.status(404).json({ message: "Category not found" });
  return res.status(201).json({ category });
}

export async function deleteSubcategory(req, res) {
  const category = await Category.removeSubcategory(req.params.id, req.params.subId);
  if (!category) return res.status(404).json({ message: "Category not found" });
  return res.json({ category });
}

export default {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubcategory,
  deleteSubcategory,
};

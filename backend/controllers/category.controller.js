import * as Category from "../models/Category.js";

export async function getAllCategories(req, res) {
  return res.json({ categories: await Category.getAll() });
}

export default { getAllCategories };

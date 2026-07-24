import * as Product from "../models/Product.js";

export async function getAllProducts(req, res) {
  const { category, subcategory, search, bestseller, isNew } = req.query;
  let result = [...await Product.getAll()];

  if (category) result = result.filter((p) => p.category === category);
  if (subcategory) result = result.filter((p) => p.subcategory === subcategory);
  if (bestseller === "true") result = result.filter((p) => p.isBestseller);
  if (isNew === "true") result = result.filter((p) => p.isNew);
  if (search) {
    const term = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }

  return res.json({ count: result.length, products: result });
}

export async function getProductById(req, res) {
  const product = await Product.getById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json({ product });
}

export default { getAllProducts, getProductById };

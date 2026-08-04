// Maps WooCommerce data (via WPGraphQL + WooGraphQL) into the shapes the
// storefront already expects. Read-only: the live catalogue is managed in
// WordPress. All functions fail soft (return [] / null) so a missing or
// misconfigured endpoint never crashes the API.
import { wpQuery, isWordPressConfigured } from "./wpgraphql.js";

const stripHtml = (html = "") => html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const num = (value) => {
  const n = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const CATEGORIES_QUERY = `
query WooCategories {
  productCategories(first: 100, where: { parent: 0, hideEmpty: false }) {
    nodes {
      databaseId
      slug
      name
      description
      children { nodes { databaseId slug name } }
    }
  }
}`;

const PRODUCT_FIELDS = `
  databaseId
  slug
  name
  description(format: RENDERED)
  shortDescription(format: RENDERED)
  averageRating
  reviewCount
  image { sourceUrl }
  galleryImages { nodes { sourceUrl } }
  productTags { nodes { slug } }
  productCategories { nodes { slug name parentDatabaseId } }
  ... on SimpleProduct { price(format: RAW) regularPrice(format: RAW) stockQuantity }
  ... on VariableProduct { price(format: RAW) regularPrice(format: RAW) stockQuantity }
  ... on ExternalProduct { price(format: RAW) regularPrice(format: RAW) }
`;

const PRODUCTS_QUERY = `query WooProducts($first: Int!) { products(first: $first) { nodes { ${PRODUCT_FIELDS} } } }`;
const PRODUCT_QUERY = `query WooProduct($slug: ID!) { product(id: $slug, idType: SLUG) { ${PRODUCT_FIELDS} } }`;

function mapCategory(node) {
  return {
    id: node.slug,
    name: node.name,
    tagline: stripHtml(node.description || ""),
    subcategories: (node.children?.nodes || []).map((child) => ({ id: child.slug, name: child.name })),
  };
}

export async function getCategories() {
  try {
    const data = await wpQuery(CATEGORIES_QUERY);
    return (data.productCategories?.nodes || []).map(mapCategory);
  } catch (error) {
    console.warn("[woo] getCategories failed:", error.message);
    return [];
  }
}

async function buildChildParentMap() {
  const categories = await getCategories();
  const map = {};
  for (const category of categories) {
    for (const sub of category.subcategories) map[sub.id] = category.id;
  }
  return map;
}

function mapProduct(node, childParent = {}) {
  const catNodes = node.productCategories?.nodes || [];
  const child = catNodes.find((c) => c.parentDatabaseId) || catNodes.find((c) => childParent[c.slug]);
  const parentNode = catNodes.find((c) => !c.parentDatabaseId && !childParent[c.slug]);
  const category = childParent[child?.slug] || parentNode?.slug || catNodes[0]?.slug || "";
  const subcategory = child ? child.slug : "";
  const tags = (node.productTags?.nodes || []).map((t) => t.slug);
  const images = [node.image?.sourceUrl, ...((node.galleryImages?.nodes || []).map((i) => i.sourceUrl))].filter(Boolean);
  const price = num(node.price);
  const mrp = num(node.regularPrice) || price;

  return {
    id: node.slug || String(node.databaseId),
    name: node.name,
    category,
    subcategory,
    price,
    mrp,
    rating: Number(node.averageRating) || 0,
    reviews: Number(node.reviewCount) || 0,
    stock: Number.isFinite(node.stockQuantity) ? node.stockQuantity : 99,
    material: "",
    colors: [],
    isNew: tags.includes("new") || tags.includes("new-arrival"),
    isBestseller: tags.includes("bestseller") || tags.includes("featured"),
    description: stripHtml(node.description || node.shortDescription || ""),
    images: images.length ? images : [`https://picsum.photos/seed/${encodeURIComponent(node.slug || "woo")}/700/850`],
  };
}

export async function getProducts() {
  try {
    const childParent = await buildChildParentMap();
    const data = await wpQuery(PRODUCTS_QUERY, { first: 100 });
    return (data.products?.nodes || []).map((node) => mapProduct(node, childParent));
  } catch (error) {
    console.warn("[woo] getProducts failed:", error.message);
    return [];
  }
}

export async function getProductById(slug) {
  try {
    const childParent = await buildChildParentMap();
    const data = await wpQuery(PRODUCT_QUERY, { slug });
    return data.product ? mapProduct(data.product, childParent) : null;
  } catch (error) {
    console.warn("[woo] getProductById failed:", error.message);
    return null;
  }
}

export { isWordPressConfigured };

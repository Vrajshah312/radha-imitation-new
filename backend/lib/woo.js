// Maps WooCommerce data (via WPGraphQL + WooGraphQL) into the shapes the
// storefront already expects, and creates real orders in WordPress. Read
// helpers fail soft (return [] / null). createOrder throws on failure so the
// controller can surface a clear message.
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

const CREATE_ORDER = `
mutation CreateOrder($input: CreateOrderInput!) {
  createOrder(input: $input) {
    order { databaseId orderNumber status total date }
  }
}`;

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
    databaseId: node.databaseId,
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

// Creates a real WooCommerce order via the WooGraphQL createOrder mutation.
// Requires WORDPRESS_GRAPHQL_URL and (for order creation) WORDPRESS_AUTH_TOKEN
// belonging to a WordPress user allowed to create orders. Uses Cash-on-Delivery
// so no payment gateway is needed. Throws on any failure.
export async function createOrder(payload) {
  const lineItems = (payload.items || [])
    .filter((item) => item.databaseId)
    .map((item) => ({ productId: Number(item.databaseId), quantity: item.qty }));

  if (!lineItems.length) {
    const error = new Error("These products could not be matched to your WordPress store.");
    error.code = "NO_LINE_ITEMS";
    throw error;
  }

  const [firstName, ...rest] = String(payload.customerName || "Guest").trim().split(" ");
  const lastName = rest.join(" ") || "-";
  const address1 = payload.shippingAddress || "";

  const input = {
    paymentMethod: "cod",
    paymentMethodTitle: "Cash on Delivery",
    isPaid: false,
    billing: { firstName, lastName, email: payload.customerEmail, address1, country: "IN" },
    shipping: { firstName, lastName, address1, country: "IN" },
    lineItems,
  };

  const data = await wpQuery(CREATE_ORDER, { input });
  const order = data.createOrder?.order;
  if (!order) throw new Error("WordPress did not return the created order.");

  return {
    id: order.orderNumber || String(order.databaseId),
    userId: Number(payload.userId),
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    shippingAddress: payload.shippingAddress,
    subtotal: payload.subtotal,
    shipping: payload.shipping,
    total: num(order.total) || payload.total,
    status: (order.status || "pending").toLowerCase(),
    items: (payload.items || []).map((item, index) => ({
      id: index + 1,
      productId: item.productId,
      name: item.name,
      price: item.price,
      qty: item.qty,
      image: item.image,
    })),
    createdAt: order.date || new Date().toISOString(),
    source: "wordpress",
  };
}

export { isWordPressConfigured };

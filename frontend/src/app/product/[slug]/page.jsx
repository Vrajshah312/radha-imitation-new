import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/wp";
import ProductView from "@/components/ProductView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Product not found — Radha Imitation Jewellery" };
  const description = (product.description || `${product.name} — handcrafted imitation jewellery.`).slice(0, 160);
  return {
    title: `${product.name} — Radha Imitation Jewellery`,
    description,
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: product.images?.[0] ? [{ url: product.images[0] }] : [],
    },
    twitter: { card: "summary_large_image", title: product.name, description, images: product.images?.slice(0, 1) },
  };
}

export default async function Page({ params }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const all = await getProducts();
  const related = all.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    brand: { "@type": "Brand", name: "Radha Imitation Jewellery" },
    aggregateRating: product.reviews > 0 ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductView product={product} related={related} />
    </>
  );
}

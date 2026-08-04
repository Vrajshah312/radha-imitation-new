import ProductView from "@/components/ProductView";
export default function Page({ params }) {
  return <ProductView slug={params.slug} />;
}

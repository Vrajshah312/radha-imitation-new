import ShopView from "@/components/ShopView";
export default function Page({ params }) {
  return <ShopView categoryId={params.category} subcategoryId={params.subcategory} />;
}

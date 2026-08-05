import { Suspense } from "react";
import ShopView from "@/components/ShopView";

export default function Page({ params }) {
  return (
    <Suspense fallback={<div className="page-loader">Loading products…</div>}>
      <ShopView categoryId={params.category} />
    </Suspense>
  );
}

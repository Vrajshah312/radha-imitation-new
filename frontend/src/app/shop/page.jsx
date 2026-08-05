import { Suspense } from "react";
import ShopView from "@/components/ShopView";

export default function Page() {
  return (
    <Suspense fallback={<div className="page-loader">Loading products…</div>}>
      <ShopView />
    </Suspense>
  );
}

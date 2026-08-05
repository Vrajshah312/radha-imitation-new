import { Suspense } from "react";
import RegisterForm from "@/components/RegisterForm";

export default function Page() {
  return (
    <Suspense fallback={<div className="page-loader">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}

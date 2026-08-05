import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function Page() {
  return (
    <Suspense fallback={<div className="page-loader">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "@/styles/Breadcrumbs.css";

const LABELS = { shop: "Shop", product: "Product Details", cart: "Shopping Bag", checkout: "Checkout", account: "My Account", login: "Sign In", register: "Create Account" };

export default function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === "/" ) return null;

  const parts = pathname.split("/").filter(Boolean);
  const crumbs = [{ label: "Home", to: "/" }];
  if (parts[0] === "product") crumbs.push({ label: "Shop", to: "/shop" });

  parts.forEach((part, index) => {
    if (parts[0] === "product" && index === 1) { crumbs.push({ label: "Product Details" }); return; }
    const label = LABELS[part] || part.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    const to = `/${parts.slice(0, index + 1).join("/")}`;
    crumbs.push({ label, to: index === parts.length - 1 ? undefined : to });
  });

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <div className="container breadcrumbs-inner">
        {crumbs.map((crumb, index) => (
          <span className="breadcrumb-item" key={`${crumb.label}-${index}`}>
            {index > 0 && <span className="breadcrumb-separator" aria-hidden="true">/</span>}
            {crumb.to ? <Link href={crumb.to}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
          </span>
        ))}
      </div>
    </nav>
  );
}

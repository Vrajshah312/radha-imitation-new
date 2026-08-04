"use client";
import { useCart } from "@/context/CartContext";

export default function CartToast() {
  const { toast } = useCart();
  if (!toast) return null;
  return <div className="toast">{toast}</div>;
}

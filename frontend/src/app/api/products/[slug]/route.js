import { NextResponse } from "next/server";
import { getProduct } from "@/lib/wp";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const product = await getProduct(params.slug);
  if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
  return NextResponse.json({ product });
}

import { NextResponse } from "next/server";
import { getProducts } from "@/lib/wp";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let result = await getProducts();

  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const search = searchParams.get("search");

  if (category) result = result.filter((p) => p.category === category);
  if (subcategory) result = result.filter((p) => p.subcategory === subcategory);
  if (searchParams.get("bestseller") === "true") result = result.filter((p) => p.isBestseller);
  if (searchParams.get("isNew") === "true") result = result.filter((p) => p.isNew);
  if (search) {
    const t = search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(t) || p.description.toLowerCase().includes(t));
  }

  return NextResponse.json({ count: result.length, products: result });
}

import { NextResponse } from "next/server";
import { getCategories } from "@/lib/wp";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ categories: await getCategories() });
}

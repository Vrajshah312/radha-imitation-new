import { NextResponse } from "next/server";
import { wpConfigured } from "@/lib/wp";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ wordpressConfigured: wpConfigured() });
}

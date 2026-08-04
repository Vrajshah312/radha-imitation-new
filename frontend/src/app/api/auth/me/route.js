import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getSession();
  if (!session?.user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  return NextResponse.json({ user: session.user });
}

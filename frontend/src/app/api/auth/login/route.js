import { NextResponse } from "next/server";
import { wpConfigured, wpLogin } from "@/lib/wp";
import { setSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const { email, password } = await request.json();
  if (!email || !password) return NextResponse.json({ message: "Email and password are required" }, { status: 400 });

  try {
    let user;
    if (wpConfigured()) {
      ({ user } = await wpLogin(email, password));
    } else {
      user = { id: 1, email: String(email).toLowerCase(), name: String(email).split("@")[0], createdAt: new Date().toISOString(), demo: true };
    }
    setSession({ user });
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ message: e.message || "Could not sign you in" }, { status: 401 });
  }
}

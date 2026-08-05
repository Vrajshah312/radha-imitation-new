import { NextResponse } from "next/server";
import { wpConfigured, wpLogin } from "@/lib/wp";
import { setSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const { email, password } = await request.json();
  if (!email || !password) return NextResponse.json({ message: "Email and password are required" }, { status: 400 });

  try {
    let user, wpToken;
    if (wpConfigured()) {
      const r = await wpLogin(email, password);
      user = r.user;
      wpToken = r.token;
    } else {
      user = { id: 1, email: String(email).toLowerCase(), name: String(email).split("@")[0], createdAt: new Date().toISOString(), demo: true };
    }
    setSession({ user, wpToken });
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ message: e.message || "Could not sign you in" }, { status: 401 });
  }
}

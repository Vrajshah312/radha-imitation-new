import { NextResponse } from "next/server";
import { wpConfigured, wpRegister } from "@/lib/wp";
import { setSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const { name, email, password } = await request.json();
  if (!name || !email || !password) return NextResponse.json({ message: "Name, email and password are all required" }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });

  try {
    let user, wpToken;
    if (wpConfigured()) {
      const r = await wpRegister({ name, email, password });
      user = r.user;
      wpToken = r.token;
    } else {
      user = { id: Date.now(), email: String(email).toLowerCase(), name, createdAt: new Date().toISOString(), demo: true };
    }
    setSession({ user, wpToken });
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: e.message || "Could not create your account" }, { status: 400 });
  }
}

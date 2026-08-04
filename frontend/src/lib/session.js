// Signed session cookie helpers (JWT). Stores the logged-in user; when a real
// WordPress store is connected the user comes from WPGraphQL JWT login.
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE = "radha_session";
const secret = () => process.env.SESSION_SECRET || "radha_next_secret_change_me_2026";

export function setSession(payload) {
  const token = jwt.sign(payload, secret(), { expiresIn: "7d" });
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSession() {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export function getSession() {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return null;
  try {
    return jwt.verify(raw, secret());
  } catch {
    return null;
  }
}

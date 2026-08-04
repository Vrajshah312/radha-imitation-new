import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { wpConfigured, getProduct, wpCreateOrder } from "@/lib/wp";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const session = getSession();
  if (!session?.user) return NextResponse.json({ message: "Please sign in to place an order" }, { status: 401 });

  const { items, shippingAddress } = await request.json();
  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ message: "Your bag is empty" }, { status: 400 });
  }

  const resolved = [];
  for (const item of items) {
    const product = await getProduct(item.id);
    if (!product) return NextResponse.json({ message: `Product ${item.id} not found` }, { status: 404 });
    resolved.push({ ...product, qty: item.qty });
  }

  const subtotal = resolved.reduce((s, p) => s + p.price * p.qty, 0);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal + shipping;

  if (!wpConfigured()) {
    // Preview mode: no store connected, return a mock confirmation.
    return NextResponse.json(
      { order: { id: `PREVIEW-${Date.now().toString().slice(-6)}`, status: "pending", total, preview: true } },
      { status: 201 }
    );
  }

  try {
    const order = await wpCreateOrder({
      items: resolved.map((p) => ({ databaseId: p.databaseId, qty: p.qty })),
      customerName: session.user.name,
      customerEmail: session.user.email,
      address: shippingAddress,
      total,
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    const message =
      e.code === "WP_NOT_CONFIGURED"
        ? "Connect your WordPress store (WORDPRESS_GRAPHQL_URL) to place live orders."
        : e.message || "Could not place the order in the live store.";
    return NextResponse.json({ message }, { status: 502 });
  }
}

export async function GET() {
  // Order history in Live mode is viewed in the customer's WordPress account.
  return NextResponse.json({ orders: [] });
}

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    banners: [
      {
        id: "banner-1",
        eyebrow: "Limited-Time Offer",
        title: "Festive sparkle,",
        accent: "special prices",
        description: "Discover statement jewellery for every celebration.",
        buttonLabel: "Shop the Festive Edit",
        buttonLink: "/shop?isNew=true",
        image: "https://images.unsplash.com/photo-1600685890506-593fdf55949b?auto=format&fit=crop&w=1600&q=80",
      },
    ],
  });
}

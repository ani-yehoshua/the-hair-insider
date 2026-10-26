import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getGrowthEditOffer } from "@/lib/pricing/growthEditFounder";

export const dynamic = "force-dynamic";

// What the Growth Edit costs right now and how many founder spots are taken.
// Public by design: it returns only prices and a count, never customer data.
export async function GET() {
    try {
        const admin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SECRET_KEY!,
        );
        const { data: course } = await admin
            .from("courses")
            .select("stripe_price_id")
            .eq("slug", "hair-growth-edit")
            .eq("is_published", true)
            .maybeSingle();
        if (!course?.stripe_price_id) throw new Error("No price configured");

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        const { promotionCodeId, ...offer } = await getGrowthEditOffer(
            stripe,
            course.stripe_price_id,
        );
        void promotionCodeId;
        return NextResponse.json(offer, {
            headers: { "Cache-Control": "no-store" },
        });
    } catch {
        return NextResponse.json(
            { error: "Pricing is temporarily unavailable." },
            { status: 503, headers: { "Cache-Control": "no-store" } },
        );
    }
}

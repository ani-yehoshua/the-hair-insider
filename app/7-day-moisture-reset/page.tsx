import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import FreeGuideClient from "./FreeGuideClient";

export const metadata: Metadata = {
    title: "7-Day Moisture Reset",
    description:
        "Stop breakage and keep length with Lauren's free 7-day interactive guide to resetting your hair's moisture balance: daily check-ins, science-backed steps, and progress tracking.",
    keywords: [
        "7 day moisture reset",
        "hair moisture reset",
        "stop hair breakage",
        "hair care routine",
        "natural hair moisture",
        "hair hydration guide",
        "The Hair Insider",
    ],
    alternates: { canonical: "/7-day-moisture-reset" },
    openGraph: {
        title: "7-Day Moisture Reset: Free Interactive Guide",
        description:
            "Stop breakage and keep length. A stylist-designed 7-day guide with daily check-ins and progress tracking, free from The Hair Insider.",
        url: "/7-day-moisture-reset",
        type: "article",
        images: [
            {
                url: "/braided_pony_double_bow.jpeg",
                width: 1200,
                height: 630,
                alt: "Braided hair, 7-Day Moisture Reset guide",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "7-Day Moisture Reset: Free Interactive Guide",
        description:
            "Stop breakage and keep length. A stylist-designed 7-day guide with daily check-ins and progress tracking.",
        images: ["/braided_pony_double_bow.jpeg"],
    },
};

export default async function FreeGuidePage() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/signin?next=/7-day-moisture-reset");
    return <FreeGuideClient />;
}

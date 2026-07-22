import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import GrowthEditClient from "./GrowthEditClient";

export const metadata: Metadata = {
    title: "The Growth Edit",
    description:
        "Find your hair type and get a matched, salon-grade product routine, with professional picks and an affordable match for every step.",
    robots: { index: false, follow: false },
};

export default async function GrowthEditPage() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/signin?next=/hair-growth-edit");
    }

    const { data: course } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", "hair-growth-edit")
        .eq("is_published", true)
        .maybeSingle();

    if (!course) {
        redirect("/account?tab=library");
    }

    const { data: entitlement } = await supabase
        .from("entitlements")
        .select("status")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .eq("status", "active")
        .maybeSingle();

    if (!entitlement) {
        redirect("/#hair-growth-edit");
    }

    return <GrowthEditClient />;
}

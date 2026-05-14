import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import WorkbookClient from "./WorkbookClient";

export const metadata: Metadata = {
    title: "Hair Growth Workbook",
    description:
        "A guided journal and companion to the mini course — SMART goals, habit tracking, daily check-ins, and weekly reviews to lock in your hair routine.",
    robots: { index: false, follow: false },
};

export default async function WorkbookPage() {
    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/signin?next=/workbook");
    }

    const { data: course } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", "21-day-workbook")
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
        redirect("/workbook/upgrade");
    }

    return <WorkbookClient />;
}

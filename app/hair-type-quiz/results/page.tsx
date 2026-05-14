import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import HairQuizResultsClient from "./HairQuizResultsClient";

export const metadata: Metadata = {
    title: "Your Hair Profile Results",
    description:
        "Your personalized hair type profile and product recommendations.",
    robots: { index: false, follow: false },
};

export default async function HairQuizResultsPage() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/signin?next=/hair-type-quiz/results");
    return <HairQuizResultsClient />;
}

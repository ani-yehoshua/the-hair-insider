import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import HairQuizClient from "./HairQuizClient";

export const metadata: Metadata = {
    title: "Hair Type Quiz",
    description:
        "Discover your hair type and get personalized product recommendations.",
    robots: { index: false, follow: false },
};

export default async function HairQuizPage() {
    redirect("/");
}

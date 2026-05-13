import type { Metadata } from "next";
import FreeGuideClient from "./FreeGuideClient";

export const metadata: Metadata = {
    title: "7-Day Moisture Reset | The Hair Insider",
    description:
        "A free interactive guide to resetting your hair's moisture balance in 7 days — from The Hair Insider.",
    alternates: { canonical: "/7-day-moisture-reset" },
};

export default function FreeGuidePage() {
    return <FreeGuideClient />;
}

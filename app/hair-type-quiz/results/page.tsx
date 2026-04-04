import type { Metadata } from "next";
import HairQuizResultsClient from "./HairQuizResultsClient";

export const metadata: Metadata = {
    title: "Your Hair Profile Results",
    description:
        "Your personalized hair type profile and product recommendations.",
    robots: { index: false, follow: false },
};

export default function HairQuizResultsPage() {
    return <HairQuizResultsClient />;
}

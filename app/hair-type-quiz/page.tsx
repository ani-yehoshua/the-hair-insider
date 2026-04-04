import type { Metadata } from "next";
import HairQuizClient from "./HairQuizClient";

export const metadata: Metadata = {
    title: "Hair Type Quiz",
    description:
        "Discover your hair type and get personalized product recommendations.",
    robots: { index: false, follow: false },
};

export default function HairQuizPage() {
    return <HairQuizClient />;
}

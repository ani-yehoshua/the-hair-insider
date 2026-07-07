import type { Metadata } from "next";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
    title: "FAQ | The Hair Insider",
    description:
        "Answers to the most common questions about The Hair Insider: the courses, what's inside, how access works, and what to expect.",
    alternates: { canonical: "/faq" },
};

export default function FaqPage() {
    return <FaqClient />;
}

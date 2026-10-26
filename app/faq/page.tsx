import type { Metadata } from "next";
import FaqClient from "./FaqClient";
import { FAQ_SECTIONS } from "./faqData";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
    title: "FAQ | The Hair Insider",
    description:
        "Answers to the most common questions about The Hair Insider: the courses, what's inside, how access works, and what to expect.",
    alternates: { canonical: "/faq" },
};

export default function FaqPage() {
    return (
        <>
            <FaqClient />
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    mainEntity: FAQ_SECTIONS.flatMap((section) =>
                        section.items.map(({ q, a }) => ({
                            "@type": "Question",
                            name: q,
                            acceptedAnswer: { "@type": "Answer", text: a },
                        })),
                    ),
                }}
            />
        </>
    );
}

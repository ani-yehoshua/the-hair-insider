import type { Metadata } from "next";
import MeetYourEducatorClient from "./MeetYourEducatorClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { LAUREN, SITE_NAME, SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
    title: "Meet Your Educator | The Hair Insider",
    description:
        "Meet Lauren Jackson, licensed cosmetologist and educator behind The Hair Insider. Learn why the course is built around clarity, routines, and practical hair science.",
    alternates: {
        canonical: "/meet-your-educator",
    },
    openGraph: {
        title: "Meet Your Educator",
        description:
            "Meet Lauren Jackson, the educator behind The Hair Insider and the clarity-first approach to hair routines.",
        url: "/meet-your-educator",
        siteName: "The Hair Insider",
        type: "website",
    },
};

export default function Page() {
    return (
        <>
            <MeetYourEducatorClient />
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "ProfilePage",
                    mainEntity: {
                        "@type": "Person",
                        name: LAUREN.name,
                        jobTitle: LAUREN.jobTitle,
                        description: LAUREN.description,
                        url: LAUREN.url,
                        image: LAUREN.image,
                        sameAs: LAUREN.sameAs,
                        worksFor: {
                            "@type": "Organization",
                            name: SITE_NAME,
                            url: SITE_URL,
                        },
                    },
                }}
            />
        </>
    );
}

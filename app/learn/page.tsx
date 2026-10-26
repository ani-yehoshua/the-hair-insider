import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Overlay } from "@/components/site/Overlay";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedArticles, getVisibleArticles } from "@/lib/articles";
import { LAUREN, SITE_NAME, absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
    title: "Hair Care Answers from a Licensed Cosmetologist",
    description:
        "Clear answers to common hair care, hair growth and hair health questions from Lauren Jackson, licensed cosmetologist and founder of The Hair Insider.",
    alternates: { canonical: "/learn" },
    // An empty index is not worth indexing; it opens up once an article is published.
    robots: { index: getPublishedArticles().length > 0 },
};

export default function LearnPage() {
    const articles = getVisibleArticles();

    return (
        <div className="relative min-h-[100dvh] text-foreground">
            <Overlay />
            <Navbar />

            <main className="mx-auto max-w-3xl px-6 pt-10">
                <div className="space-y-6 rounded-3xl bg-background p-6 sm:p-10">
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                        Hair care answers from a licensed cosmetologist
                    </h1>
                    <p className="text-lg leading-8">
                        Short, plain answers to common hair questions, written
                        by{" "}
                        <Link href="/meet-your-educator" className="underline">
                            {LAUREN.name}
                        </Link>
                        , {LAUREN.jobTitle.toLowerCase()} and founder of{" "}
                        {SITE_NAME}.
                    </p>
                    <ul className="space-y-5">
                        {articles.map((article) => (
                            <li key={article.slug} className="space-y-1">
                                <Link
                                    href={`/learn/${article.slug}`}
                                    className="text-xl font-semibold underline"
                                >
                                    {article.title}
                                </Link>
                                <p className="text-lg leading-8">
                                    {article.description}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>

            <Footer />
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    name: "Hair care answers from a licensed cosmetologist",
                    url: absoluteUrl("/learn"),
                    hasPart: articles.map((article) => ({
                        "@type": "Article",
                        headline: article.title,
                        url: absoluteUrl(`/learn/${article.slug}`),
                    })),
                }}
            />
        </div>
    );
}

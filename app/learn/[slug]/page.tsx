import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Overlay } from "@/components/site/Overlay";
import { JsonLd } from "@/components/seo/JsonLd";
import { getArticle, getVisibleArticles } from "@/lib/articles";
import type { Article } from "@/lib/articles/types";
import { LAUREN, SITE_NAME, absoluteUrl } from "@/lib/seo/site";

export function generateStaticParams() {
    return getVisibleArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const article = getArticle((await params).slug);
    if (!article) return {};
    const path = `/learn/${article.slug}`;
    return {
        title: article.title,
        description: article.description,
        alternates: { canonical: path },
        authors: [{ name: LAUREN.name, url: LAUREN.url }],
        openGraph: {
            title: article.title,
            description: article.description,
            url: path,
            siteName: SITE_NAME,
            type: "article",
            publishedTime: article.datePublished,
            modifiedTime: article.dateModified,
            authors: [LAUREN.name],
        },
        twitter: {
            card: "summary_large_image",
            title: article.title,
            description: article.description,
        },
        robots: { index: article.published, follow: article.published },
    };
}

function structuredData(article: Article) {
    const url = absoluteUrl(`/learn/${article.slug}`);
    return [
        {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.description,
            mainEntityOfPage: url,
            datePublished: article.datePublished,
            dateModified: article.dateModified,
            image: absoluteUrl("/Lauren_headshot.jpg"),
            author: {
                "@type": "Person",
                name: LAUREN.name,
                jobTitle: LAUREN.jobTitle,
                url: LAUREN.url,
            },
            publisher: {
                "@type": "Organization",
                name: SITE_NAME,
                logo: {
                    "@type": "ImageObject",
                    url: absoluteUrl("/thi_navbar_logo.svg"),
                },
            },
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: article.faq.map(({ q, a }) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
            })),
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: absoluteUrl("/"),
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: "Learn",
                    item: absoluteUrl("/learn"),
                },
                {
                    "@type": "ListItem",
                    position: 3,
                    name: article.title,
                    item: url,
                },
            ],
        },
    ];
}

function formatDate(iso: string) {
    return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });
}

export default async function ArticlePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const article = getArticle((await params).slug);
    if (!article) notFound();

    const related = article.related
        .map((slug) => getArticle(slug))
        .filter((item): item is Article => Boolean(item));

    return (
        <div className="relative min-h-[100dvh] text-foreground">
            <Overlay />
            <Navbar />

            <main className="mx-auto max-w-3xl px-6 pt-10">
                {!article.published && (
                    <p className="mb-4 rounded-2xl bg-muted px-4 py-3 text-sm">
                        Draft: only visible in development until Lauren has
                        reviewed it and it is marked published.
                    </p>
                )}

                <article className="space-y-6 rounded-3xl bg-background p-6 sm:p-10">
                    <header className="space-y-4">
                        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            {article.title}
                        </h1>
                        <p className="text-sm">
                            By{" "}
                            <Link
                                href="/meet-your-educator"
                                className="underline"
                            >
                                {LAUREN.name}
                            </Link>
                            , {LAUREN.jobTitle.toLowerCase()}. Updated{" "}
                            <time dateTime={article.dateModified}>
                                {formatDate(article.dateModified)}
                            </time>
                            .
                        </p>
                    </header>

                    <div className="rounded-2xl bg-muted px-6 py-5">
                        <p className="text-sm font-semibold uppercase tracking-wide">
                            The short answer
                        </p>
                        <p className="mt-2 text-lg leading-8">
                            {article.answer}
                        </p>
                    </div>

                    {article.body.map((block, i) => {
                        switch (block.type) {
                            case "h2":
                                return (
                                    <h2
                                        key={i}
                                        className="pt-4 text-2xl font-semibold tracking-tight"
                                    >
                                        {block.text}
                                    </h2>
                                );
                            case "p":
                                return (
                                    <p key={i} className="text-lg leading-8">
                                        {block.text}
                                    </p>
                                );
                            case "ul":
                                return (
                                    <ul
                                        key={i}
                                        className="list-disc space-y-2 pl-6 text-lg leading-8"
                                    >
                                        {block.items.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                );
                            case "ol":
                                return (
                                    <ol
                                        key={i}
                                        className="list-decimal space-y-2 pl-6 text-lg leading-8"
                                    >
                                        {block.items.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ol>
                                );
                            case "callout":
                                return (
                                    <p
                                        key={i}
                                        className="rounded-2xl bg-muted px-6 py-5 text-lg leading-8"
                                    >
                                        {block.text}
                                    </p>
                                );
                        }
                    })}

                    <section className="space-y-4 pt-4">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Frequently asked questions
                        </h2>
                        {article.faq.map(({ q, a }) => (
                            <div key={q} className="space-y-1">
                                <h3 className="text-lg font-semibold">{q}</h3>
                                <p className="text-lg leading-8">{a}</p>
                            </div>
                        ))}
                    </section>

                    <section className="rounded-2xl bg-muted px-6 py-5">
                        <p className="text-lg leading-8">
                            Want a simple plan for the first week? Lauren&apos;s
                            free{" "}
                            <Link
                                href="/7-day-moisture-reset"
                                className="underline"
                            >
                                7-Day Moisture Reset
                            </Link>{" "}
                            walks you through it.
                        </p>
                    </section>

                    {related.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-2xl font-semibold tracking-tight">
                                Keep reading
                            </h2>
                            <ul className="list-disc space-y-1 pl-6 text-lg">
                                {related.map((item) => (
                                    <li key={item.slug}>
                                        <Link
                                            href={`/learn/${item.slug}`}
                                            className="underline"
                                        >
                                            {item.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <footer className="border-t pt-4 text-sm leading-6">
                        {LAUREN.description} This article is general education
                        and is not medical advice.
                    </footer>
                </article>
            </main>

            <Footer />
            {structuredData(article).map((data, i) => (
                <JsonLd key={i} data={data} />
            ))}
        </div>
    );
}

export const dynamicParams = false;

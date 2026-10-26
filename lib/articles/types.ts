export type ArticleBlock =
    | { type: "h2"; text: string }
    | { type: "p"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "ol"; items: string[] }
    | { type: "callout"; text: string };

export interface Article {
    slug: string;
    title: string;
    // The page's <meta description> and the summary shown to search/AI tools.
    description: string;
    // The direct answer, shown first. Written to stand on its own when quoted.
    answer: string;
    datePublished: string; // YYYY-MM-DD
    dateModified: string; // YYYY-MM-DD
    // Drafts render only in development and stay out of the sitemap, llms.txt
    // and the index until Lauren has reviewed them and this is set to true.
    published: boolean;
    body: ArticleBlock[];
    faq: { q: string; a: string }[];
    related: string[]; // slugs
}

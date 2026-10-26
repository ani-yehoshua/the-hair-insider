import type { Article } from "./types";
import { lengthRetention } from "./data/length-retention";
import { breakageVsShedding } from "./data/breakage-vs-shedding";
import { proteinVsMoisture } from "./data/protein-vs-moisture";
import { moistureRetention } from "./data/moisture-retention";
import { washFrequency } from "./data/wash-frequency";
import { heatDamage } from "./data/heat-damage";

const ARTICLES: Article[] = [
    lengthRetention,
    breakageVsShedding,
    proteinVsMoisture,
    moistureRetention,
    washFrequency,
    heatDamage,
];

// Published articles are what crawlers, the sitemap and llms.txt see.
export function getPublishedArticles() {
    return ARTICLES.filter((article) => article.published);
}

// Drafts are visible only while developing, so they can be proofread in place.
export function getVisibleArticles() {
    return process.env.NODE_ENV === "development"
        ? ARTICLES
        : getPublishedArticles();
}

export function getArticle(slug: string) {
    return getVisibleArticles().find((article) => article.slug === slug);
}

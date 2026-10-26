import type { MetadataRoute } from 'next';
import { getPublishedArticles } from '@/lib/articles';
import { SITE_URL } from '@/lib/seo/site';

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = SITE_URL;
    const articles = getPublishedArticles();
    const learn: MetadataRoute.Sitemap = articles.length
        ? [
              { url: `${siteUrl}/learn`, lastModified: new Date() },
              ...articles.map((article) => ({
                  url: `${siteUrl}/learn/${article.slug}`,
                  lastModified: new Date(`${article.dateModified}T00:00:00Z`),
              })),
          ]
        : [];

    return [
        { url: `${siteUrl}/`, lastModified: new Date() },
        { url: `${siteUrl}/what-is-it`, lastModified: new Date() },
        { url: `${siteUrl}/inside-the-course`, lastModified: new Date() },
        { url: `${siteUrl}/meet-your-educator`, lastModified: new Date() },
        { url: `${siteUrl}/faq`, lastModified: new Date() },
        { url: `${siteUrl}/about`, lastModified: new Date() },
        { url: `${siteUrl}/hair-growth-edit`, lastModified: new Date() },
        { url: `${siteUrl}/support`, lastModified: new Date() },
        { url: `${siteUrl}/privacy`, lastModified: new Date() },
        { url: `${siteUrl}/terms`, lastModified: new Date() },
        { url: `${siteUrl}/7-day-moisture-reset`, lastModified: new Date() },
        ...learn,
    ];
}

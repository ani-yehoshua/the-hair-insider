import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/site';

// AI crawlers are named so the intent is explicit: the public pages, including
// the /learn articles, are open to search engines and AI assistants alike.
const AI_CRAWLERS = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-SearchBot',
    'Claude-User',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
];

const PRIVATE_PATHS = ['/api/', '/admin', '/account', '/auth', '/success'];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
            { userAgent: AI_CRAWLERS, allow: '/', disallow: PRIVATE_PATHS },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}

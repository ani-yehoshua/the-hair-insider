// The one place the site's public address and Lauren's author details live,
// so structured data, sitemaps and llms.txt never disagree.
export const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://the-hair-insider.com"
).replace(/\/$/, "");

export const SITE_NAME = "The Hair Insider";

export const LAUREN = {
    name: "Lauren Jackson",
    jobTitle: "Licensed cosmetologist and hair educator",
    description:
        "Licensed cosmetologist with 8 years behind the chair and the founder of The Hair Insider, an education-first hair care library.",
    url: `${SITE_URL}/meet-your-educator`,
    image: `${SITE_URL}/Lauren_headshot.jpg`,
    sameAs: [
        "https://www.tiktok.com/@lifewith.laurenj",
        "https://www.instagram.com/thehairinsider",
        "https://www.youtube.com/@TheHairInsider",
    ],
} as const;

export function absoluteUrl(path: string) {
    return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

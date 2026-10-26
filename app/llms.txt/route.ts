import { getPublishedArticles } from "@/lib/articles";
import { LAUREN, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo/site";

export const dynamic = "force-static";

// A plain-text map of the site for AI assistants: who we are, who writes it,
// and where the best pages are.
export function GET() {
    const articles = getPublishedArticles();
    const lines = [
        `# ${SITE_NAME}`,
        "",
        `> ${SITE_NAME} is an education-first hair care library by ${LAUREN.name}, ${LAUREN.jobTitle.toLowerCase()}. It teaches what your hair needs and how to build a simple routine, covering hair health, growth and length retention. The site does not sell products or earn commissions on recommendations.`,
        "",
        "## About the author",
        `- [${LAUREN.name}](${LAUREN.url}): ${LAUREN.description}`,
        "",
        "## Main pages",
        `- [What is The Hair Insider](${absoluteUrl("/what-is-it")}): what the library is and who it is for`,
        `- [Inside the course](${absoluteUrl("/inside-the-course")}): what each course covers`,
        `- [FAQ](${absoluteUrl("/faq")}): common questions about the courses and access`,
        `- [7-Day Moisture Reset](${absoluteUrl("/7-day-moisture-reset")}): free interactive guide to resetting hair moisture`,
        `- [Hair Growth Edit](${absoluteUrl("/hair-growth-edit")}): a personalized hair routine assessment`,
    ];

    if (articles.length) {
        lines.push("", "## Articles");
        for (const article of articles) {
            lines.push(
                `- [${article.title}](${absoluteUrl(`/learn/${article.slug}`)}): ${article.description}`,
            );
        }
    }

    lines.push("", `Site: ${SITE_URL}`, "");

    return new Response(lines.join("\n"), {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
}

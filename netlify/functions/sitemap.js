const SUPABASE_URL = "https://ylaoqzmxcaxwzkpwtcup.supabase.co";
const SUPABASE_KEY = "sb_publishable_UMmxdQ59D_7toAbt0wA6bQ_iEIfbxuO";

function escapeXml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

exports.handler = async function () {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/article?select=web_link,created_at&order=created_at.desc`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Supabase error: ${response.status}`);
        }

        const articles = await response.json();

        const staticPages = [
            "https://BLITZd.blog/",
            "https://BLITZd.blog/articles.html",
            "https://BLITZd.blog/about.html",
            "https://BLITZd.blog/newsletter.html",
            "https://BLITZd.blog/power-rankings.html",
            "https://BLITZd.blog/social.html"
        ];

        const articleUrls = articles
            .filter(article => article.web_link)
            .map(article => {
                const url =
                    `https://BLITZd.blog/article.html?slug=` +
                    encodeURIComponent(article.web_link);

                const lastmod = article.created_at
                    ? new Date(article.created_at).toISOString()
                    : null;

                return `
    <url>
        <loc>${escapeXml(url)}</loc>
        ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    </url>`;
            });

        const staticUrls = staticPages.map(url => `
    <url>
        <loc>${escapeXml(url)}</loc>
    </url>`);

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.join("")}
${articleUrls.join("")}
</urlset>`;

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/xml; charset=UTF-8",
                "Cache-Control": "public, max-age=300"
            },
            body: sitemap
        };

    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "text/plain"
            },
            body: "Unable to generate sitemap"
        };
    }
};
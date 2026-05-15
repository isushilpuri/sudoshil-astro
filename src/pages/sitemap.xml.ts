import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://sudoshil.com';
  const blogs = await getCollection('blog');

  const staticPages = [
    { url: `${base}/`, priority: '1.0', changefreq: 'weekly' },
  ];

  const blogPages = blogs.map(post => ({
    url: `${base}/blog/${post.slug}/`,
    priority: '0.8',
    changefreq: 'monthly',
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticPages, ...blogPages]
  .map(p => `  <url>
    <loc>${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`)
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};

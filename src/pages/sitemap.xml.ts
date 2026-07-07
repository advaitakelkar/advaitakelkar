import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

// Hand-rolled sitemap (no extra dependency). Lists the PUBLIC surface only —
// home, about, the projects index, every category and tag archive, and the two
// Work sub-views. Individual /projects/<slug> pages are intentionally omitted:
// they sit behind the soft password gate, so they're not advertised to crawlers.
export async function GET(context: APIContext) {
  const origin = (context.site?.href ?? 'https://advaitakelkar.com/').replace(/\/$/, '');
  const cats = await getCollection('categories');
  const tags = await getCollection('tags');

  const paths = [
    '/',
    '/about',
    '/projects',
    ...cats.map((c) => `/${c.id}`),
    '/work/studio-823',
    '/work/faizan-khatri',
    ...tags.map((t) => `/tags/${t.id}`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${origin}${p}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}

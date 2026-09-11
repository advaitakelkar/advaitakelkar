import type { APIContext } from 'astro';
import { isPublicProject } from '../lib/projectAccess';
import { getCollection } from 'astro:content';

// Hand-rolled sitemap (no extra dependency). Lists the PUBLIC surface only —
// home, about, the projects index, every category and tag archive, and the two
// Work sub-views, plus reviewed public project pages. Locked projects are omitted.
export async function GET(context: APIContext) {
  const origin = (context.site?.href ?? 'https://advaitakelkar.com/').replace(/\/$/, '');
  const cats = await getCollection('categories');
  const tags = await getCollection('tags');

  const projects = await getCollection('projects');
  const paths = [
    ...projects.filter(p => isPublicProject(p.id)).map(p => `/projects/${p.id}`),
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

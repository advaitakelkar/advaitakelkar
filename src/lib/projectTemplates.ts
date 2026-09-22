/**
 * Which layout a project page renders with.
 *
 * ── AIworks ──────────────────────────────────────────────────────────────
 * Six freelance projects share one template, and it has a name: AIworks.
 * They are the AI image series — a deck of many generated frames, a counter
 * and a timer ring, and a Prompt pill — so the page is built around stepping
 * through a set rather than reading about one object. `cards` is the internal
 * flag for it; 'ai-works' is the name to write in a project's YAML.
 *
 * Play Pod was in this set and is not an AI series, so it renders with the
 * tabs template alongside the other freelance work.
 *
 * ── Project Template 01 ──────────────────────────────────────────────────
 * One full-width column: the copy, then the work under it. A tab per room if
 * the project has rooms, one big stage, and a rail of covers along the
 * bottom. Built for XBKC, where a flat is a set of rooms and each room was
 * rendered several times — but the shape suits any project that is one
 * object seen a handful of ways, which is why CARLO, SHLF and CONCRT use it
 * too. Those name no rooms, so the tab row drops out and the rail is the
 * whole navigation. See RenderRooms.astro.
 *
 * `renders` is the internal flag; **'project-01' is the name to write in a
 * project's YAML**, the same way 'ai-works' is written for `cards`. Both
 * spellings work — XBKC still says 'renders'.
 */
export type ProjectTemplate =
  | 'auto' | 'tabs' | 'cards' | 'ai-works' | 'ai-portrait' | 'ai-landscape' | 'chapters' | 'renders' | 'project-01';

const aiWorksProjects = new Set([
  'alt-verse',
  'architect-x-architects',
  'indian-royals',
  'sups-cards',
  'sups-in-the-hinterland',
]);

const tabProjects = new Set([
  'carlo',
  'concrt',
  'goonj',
  // Freelance work like the rest of this list. It was left off only because
  // it had no images to build a deck from, which made it the one page in the
  // group rendering the plain layout.
  'gully',
  'human-pods',
  'nat-geo-humans',
  'pet-pod',
  'roberto-burle-marx-stickers',
  'shelf',
  'tilak-nagar-cricket-park',
  'xbkc',
]);

export function projectTemplate(slug: string, category?: string, template?: ProjectTemplate) {
  const namedSeries = template === 'ai-portrait' || template === 'ai-landscape' ||
    ['sups-cards', 'hanma-fam', 'indian-royals', 'alt-verse', 'architect-x-architects'].includes(slug);
  const frame = template === 'ai-landscape' || (template !== 'ai-portrait' && slug === 'architect-x-architects') ? 'landscape' : 'portrait';
  if (template === 'ai-portrait' || template === 'ai-landscape') template = 'cards';
  if (template === 'auto') template = undefined;
  // 'ai-works' is the written name; `cards` is what the page reads.
  if (template === 'ai-works') template = 'cards';
  // 'project-01' is the written name; `renders` is what the page reads.
  if (template === 'project-01') template = 'renders';

    /* ── renders ────────────────────────────────────────────────────────
     A visualisation project is not a set of pictures, it is a set of ROOMS,
     and each room was rendered several times. The page is one image at a
     time with a tab per room, and inside a room it walks the views and the
     variations of each. See the `views` field on the schema. */
  const renders = template === 'renders';

  const cards = template ? template === 'cards' : aiWorksProjects.has(slug);
  const chapters = template ? template === 'chapters' : ['habersham-hall', 'scad-design-built'].includes(slug);
  const tabs = template
    ? template !== 'cards'
    : ['work', 'archv', 'academic'].includes(category ?? '') || chapters || tabProjects.has(slug) || slug === 'scarpin';

  return {
    namedSeries,
    frame,
    name: renders ? 'project-01' : cards ? (namedSeries ? `ai-${frame}` : 'ai-works') : chapters ? 'chapters' : 'tabs',
    cards,
    chapters,
    renders,
    // A renders page draws its own middle; it must not also get the tab
    // layout's filmstrip and panels.
    tabs: renders ? false : tabs,
    cardLayout: !!template || cards || tabs || category === 'freelancer',
  };
}

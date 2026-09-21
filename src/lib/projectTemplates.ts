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
 */
export type ProjectTemplate = 'auto' | 'tabs' | 'cards' | 'ai-works' | 'chapters' | 'renders';

const aiWorksProjects = new Set([
  'alt-verse',
  'architect-x-architects',
  'future-of-dance',
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
  if (template === 'auto') template = undefined;
  // 'ai-works' is the written name; `cards` is what the page reads.
  if (template === 'ai-works') template = 'cards';

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
    cards,
    chapters,
    renders,
    // A renders page draws its own middle; it must not also get the tab
    // layout's filmstrip and panels.
    tabs: renders ? false : tabs,
    cardLayout: !!template || cards || tabs || category === 'freelancer',
  };
}

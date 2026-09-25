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

/**
 * Every project names its template in its YAML, so this is a lookup, not a
 * guess. It used to fall back on slug lists (aiWorksProjects, tabProjects,
 * the chapters pair) for YAML without the field; none is left, and a project
 * that omits it now gets `tabs`, the default work page.
 */
export function projectTemplate(_slug: string, _category?: string, template: ProjectTemplate = 'tabs') {
  if (template === 'auto') template = 'tabs';
  // A named series: one sitter per frame, the name shown beside the counter.
  const namedSeries = template === 'ai-portrait' || template === 'ai-landscape';
  const frame = template === 'ai-landscape' ? 'landscape' : 'portrait';
  // 'ai-*' are the written names; `cards` is what the page reads.
  const cards = template === 'cards' || template === 'ai-works' || namedSeries;
  // 'project-01' is the written name; `renders` is what the page reads.
  const renders = template === 'renders' || template === 'project-01';
  const chapters = template === 'chapters';

  return {
    namedSeries,
    frame,
    name: renders ? 'project-01' : cards ? (namedSeries ? `ai-${frame}` : 'ai-works') : chapters ? 'chapters' : 'tabs',
    cards,
    chapters,
    renders,
    // A renders page draws its own middle; it must not also get the tab
    // layout's filmstrip and panels.
    tabs: !cards && !renders,
    cardLayout: true,
  };
}

/**
 * Which layout a project page renders with. Three, written in the YAML:
 *
 *   ai-portrait   an AI series of tall frames — a deck, a counter and timer
 *                 ring, a Prompt pill, the sitter's name (from the filename)
 *                 beside the count.
 *   ai-landscape  the same series page with wide frames.
 *   project-01    everything else: one full-width column, the copy, then a
 *                 stage and a rail of covers (RenderRooms.astro). Rooms and
 *                 variations when the YAML lists `views`; otherwise one view
 *                 per image, cover first. No images, no stage.
 *
 * `cards` and `renders` are the internal flags the page reads.
 */
export type ProjectTemplate = 'ai-portrait' | 'ai-landscape' | 'project-01';

export function projectTemplate(_slug: string, _category?: string, template: ProjectTemplate = 'project-01') {
  const namedSeries = template === 'ai-portrait' || template === 'ai-landscape';
  const frame = template === 'ai-landscape' ? 'landscape' : 'portrait';
  const cards = namedSeries;
  const renders = !cards;

  return {
    namedSeries,
    frame,
    name: renders ? 'project-01' : `ai-${frame}`,
    cards,
    renders,
  };
}

import { imageSize } from './imageSize';

/**
 * Which layout a project page renders with. Two, written in the YAML:
 *
 *   ai-series     an AI series — a deck, a counter and timer ring, a Prompt
 *                 pill, the sitter's name (from the filename) beside the
 *                 count. Adaptive: the frames are portrait or landscape
 *                 according to the series' own first image, so nobody has to
 *                 keep a second template name in step with the pictures.
 *   project-01    everything else: one full-width column, the copy, then a
 *                 stage and a rail of covers (RenderRooms.astro). Rooms and
 *                 variations when the YAML lists `views`; otherwise one view
 *                 per image, cover first. No images, no stage.
 *
 * `cards` and `renders` are the internal flags the page reads.
 */
export type ProjectTemplate = 'ai-series' | 'project-01';

export function projectTemplate(_slug: string, _category?: string, template: ProjectTemplate = 'project-01', firstImage?: string) {
  const namedSeries = template === 'ai-series';
  const size = namedSeries && firstImage ? imageSize(firstImage) : null;
  const frame: 'portrait' | 'landscape' = size && size.width > size.height ? 'landscape' : 'portrait';
  const cards = namedSeries;
  const renders = !cards;

  return {
    namedSeries,
    frame,
    name: renders ? 'project-01' : 'ai-series',
    cards,
    renders,
  };
}

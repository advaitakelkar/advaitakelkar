import curation from '../data/work-media.json';
import dimensions from '../data/work-media-dimensions.json';

export type MediaRole = 'main' | 'plan' | 'illustration' | 'section' | 'detail' | 'making';
export interface WorkFigure {
  image: string; role: MediaRole; label?: string; caption?: string; alt?: string; width?: number; height?: number;
  note?: string; annotations?: Array<{ heading: string; lines: string[] }>; drawingSource?: string;
}

// Explicit, visually reviewed asset roles. Unknown future assets stay visible
// in the article until curated, rather than silently entering the main slider.
export function workMedia(slug: string, data: any): WorkFigure[] {
  const roles = (curation as Record<string, Record<string, MediaRole>>)[slug];
  const figures = new Map<string, any>();
  for (const v of [...(data.views ?? []), ...(data.leadFigures ?? [])]) {
    figures.set(v.image, { ...figures.get(v.image), ...v });
  }
  for (const image of [data.coverImage, ...(data.multiImage ?? []), data.leadImage].filter(Boolean)) {
    if (!figures.has(image)) figures.set(image, { image });
  }
  return [...figures.values()].map(v => ({ ...v, ...(dimensions as Record<string, {width: number; height: number}>)[v.image], role: roles?.[v.image] ?? 'detail' }));
}

export function workMainImages(slug: string): string[] | undefined {
  const roles = (curation as Record<string, Record<string, MediaRole>>)[slug];
  return roles ? Object.keys(roles).filter(image => roles[image] === 'main') : undefined;
}

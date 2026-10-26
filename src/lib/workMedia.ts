import { imageSize } from './imageSize';
import type { MediaRole } from './mediaRoles';

export type { MediaRole } from './mediaRoles';
export interface WorkFigure {
  image: string; role: MediaRole; label?: string; caption?: string; alt?: string; width?: number; height?: number;
  note?: string; annotations?: Array<{ heading: string; lines: string[] }>; drawingSource?: string;
}

/* A multiImage entry is a path, or a path with its role and caption. */
export type ImageEntry = string | { image: string; role?: MediaRole; caption?: string };
export const imagePath = (e: ImageEntry) => (typeof e === 'string' ? e : e.image);
export const imagePaths = (list?: ImageEntry[]) => (list ?? []).map(imagePath);

// Every image a project lists, in page order, each with the role written
// beside it in the YAML and its size read from the file. An image with no
// role stays in the article rather than silently entering the main slider.
export function workMedia(data: any): WorkFigure[] {
  const figures = new Map<string, any>();
  const merge = (v: any) => {
    const prev = figures.get(v.image);
    figures.set(v.image, { ...prev, ...v, role: v.role ?? prev?.role });
  };
  for (const v of [...(data.views ?? []), ...(data.leadFigures ?? [])]) merge(v);
  for (const e of [data.coverImage, ...(data.multiImage ?? []), data.leadImage] as ImageEntry[]) {
    if (!e) continue;
    const v = typeof e === 'string' ? { image: e } : e;
    const prev = figures.get(v.image);
    if (!prev) figures.set(v.image, { ...v });
    else if (v.role) prev.role = v.role;
  }
  return [...figures.values()].map(v => ({ ...v, ...imageSize(v.image), role: v.role ?? 'detail' }));
}

// The main views, for the listing scrub. Undefined when the project has
// not been curated yet (no role anywhere), so the card falls back.
export function workMainImages(data: any): string[] | undefined {
  const figures = workMedia(data);
  if (!figures.some(f => f.role !== 'detail')) return undefined;
  return figures.filter(f => f.role === 'main').map(f => f.image);
}

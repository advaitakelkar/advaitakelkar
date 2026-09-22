import thumbnails from './project-thumbnails.json';
/** Only small previews use derivatives. Stages and lightboxes retain originals. */
export function projectThumbnail(src: string): string {
  return (thumbnails as Record<string, string>)[src] ?? src;
}

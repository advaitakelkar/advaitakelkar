import fs from 'node:fs';
import path from 'node:path';

// Unwritten copy from the initial content import still says "placeholder".
// Treat those strings as empty so they never reach the page or meta tags;
// edit mode still exposes them for filling in (via data-edit-only).
export function isPlaceholder(text?: string | null): boolean {
  return !!text && /placeholder/i.test(text);
}

export function realText(text?: string | null): string | undefined {
  if (!text || isPlaceholder(text)) return undefined;
  return text;
}

// True once the file actually exists in public/ — PDF links render only
// then, so dropping the file in (and rebuilding) is all it takes to
// activate them.
export function publicFileExists(publicPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), 'public', publicPath.replace(/^\//, '')));
}

// Files in a public/ directory matching a prefix + extension, naturally sorted
// (so "module-09" precedes "module-10"). Returns basenames without extension.
// The Virtual Gods fusion steps use three different numbering schemes across
// the source folders, so the pages discover them rather than hardcode a list.
export function publicFilesLike(publicDir: string, prefix: string, ext: string): string[] {
  const dir = path.join(process.cwd(), 'public', publicDir.replace(/^\//, ''));
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.startsWith(prefix) && f.endsWith(ext))
    .map(f => f.slice(0, -ext.length))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

// Slugs for public/unlocked projects that do not require site-lock password
export const BYPASS_SLUGS = [
  'alt-verse',
  'architect-x-architects',
  'carlo',
  'concrt',
  'dhal-ni-pol',
  'future-of-dance',
  'human-pods',
  'indian-royals',
  'sups-cards',
  'sups-in-the-hinterland',
];

export function isProjectLocked(slug: string, passcode?: string): boolean {
  if (passcode) return true;
  return !BYPASS_SLUGS.includes(slug);
}

/**
 * Images a listing is allowed to show for a project.
 *
 * A locked project shows no imagery: the whole point of the lock is that the
 * work is not on display, and a thumbnail strip gives it away regardless of
 * the password gate on the project page itself. Returns the images unchanged
 * for unlocked projects.
 *
 * One rule, one place — the project list, the project card and every
 * category page route through this rather than each re-deriving it.
 */
export function visibleProjectImages(
  slug: string,
  passcode: string | undefined,
  images: string[]
): string[] {
  return isProjectLocked(slug, passcode) ? [] : images;
}

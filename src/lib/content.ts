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

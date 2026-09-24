import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
// Sharp is Astro's installed image service dependency.
const sharp = createRequire(import.meta.resolve('astro'))('sharp');
const root = process.cwd();
const target = path.join(root, 'public/project-thumbnails');
await fs.mkdir(target, { recursive: true });
const sources = new Set();
for (const file of await fs.readdir('src/content/projects')) {
  if (!file.endsWith('.yaml')) continue;
  const text = await fs.readFile(path.join('src/content/projects', file), 'utf8');
  for (const match of text.matchAll(/\/images\/[^"'\n<>]+?\.(?:png|jpe?g|webp)/gi)) sources.add(match[0]);
}
const manifest = {};
let originalBytes = 0, thumbnailBytes = 0;
for (const src of [...sources].sort()) {
  const source = path.join(root, 'public', src);
  let buffer;
  try { buffer = await fs.readFile(source); } catch { continue; }
  const hash = createHash('sha256').update('480-webp-76-v1').update(buffer).digest('hex').slice(0, 20);
  const name = hash + '.webp';
  const dest = path.join(target, name);
  try { await fs.access(dest); } catch {
    await sharp(buffer).rotate().resize({ width: 480, withoutEnlargement: true }).webp({ quality: 76 }).toFile(dest);
  }
  const bytes = (await fs.stat(dest)).size;
  manifest[src] = bytes < buffer.length ? '/project-thumbnails/' + name : src;
  originalBytes += buffer.length;
  thumbnailBytes += Math.min(bytes, buffer.length);
}
/* Sweep thumbnails nothing points at any more.
   The cache is content-addressed, so a source image that is re-exported,
   renamed or deleted does not overwrite its old thumbnail — it writes a new
   one beside it and abandons the last. Nothing ever removed the abandoned
   file, and `public/` is copied into `dist/` verbatim, so every one of them
   was still being uploaded to Firebase. 118 had piled up, 3.7MB of
   thumbnails for projects that no longer exist.

   Safe because the manifest is rebuilt from scratch immediately above: a
   file that is not a value in it cannot be reached by any page, and the next
   run regenerates anything that turns out to be needed. */
const keep = new Set(Object.values(manifest).map(v => path.basename(v)));
let swept = 0, sweptBytes = 0;
for (const file of await fs.readdir(target)) {
  if (!file.endsWith('.webp') || keep.has(file)) continue;
  const dead = path.join(target, file);
  sweptBytes += (await fs.stat(dead)).size;
  await fs.unlink(dead);
  swept++;
}

const content = JSON.stringify(manifest, null, 2) + '\n';
const manifestPath = 'src/lib/project-thumbnails.json';
let prior = '';
try { prior = await fs.readFile(manifestPath, 'utf8'); } catch {}
if (prior !== content) await fs.writeFile(manifestPath, content);
console.log(JSON.stringify({ images: Object.keys(manifest).length, originalBytes, thumbnailBytes, swept, sweptBytes }));

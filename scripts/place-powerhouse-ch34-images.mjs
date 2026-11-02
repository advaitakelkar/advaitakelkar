// Place Powerhouse chapter renders (Chapters 1–4) from a folder into the site.
//   node scripts/place-powerhouse-ch34-images.mjs "~/Desktop/Powerhouse Ch3-4 Images"
// A file is matched to a slot by the slot id in its name (ch1, 1-2-penn, 3-1-a …); the newest
// file for a slot wins. The archival photographs of 2.3 (2-3-a … 2-3-d) are never replaced. Each is resized to 1536 px wide and written as webp beside the others
// in public/powerhouse/images/version2/, where powerhouse-image-slots.json already points.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
const dir = resolve(process.argv[2]?.replace(/^~/, process.env.HOME) ?? '');
const slots = ['ch1', '1-1-a', '1-2-penn', '1-2-a', '1-2-b', '1-3-a', '1-3-b', '1-3-c', '1-4-a', '1-4-b', '1-5-a', '1-5-b', '1-5-c', '1-6', '1-7-a', '1-7-b', '1-7-c', 'ch2', '2-1-a', '2-1-b', '2-2-a', '2-2-b', '2-4', '2-5', '2-6-a', '2-6-b', 'ch3', '3-1-a', '3-1-b', '3-2-a', '3-2-b', '3-3-a', '3-3-b', '3-4-a', '3-4-b', '3-5', '3-6', 'ch4', '4-1', '4-2-a', '4-2-b', '4-2-c', '4-3', '4-4-a', '4-4-b', '4-5', '4-6'];
// The folder and its first-level subfolders (Adi keeps Originals/ and WebP/ beside each other).
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? (d === dir ? walk(p) : []) : /\.(png|jpe?g|webp)$/i.test(f) ? [{ f: p.slice(dir.length + 1), t: statSync(p).mtimeMs }] : []; });
// Originals first (a PNG beats a WebP of the same render), then newest first.
const files = walk(dir).sort((a, b) => (/\.png$/i.test(b.f) ? 1 : 0) - (/\.png$/i.test(a.f) ? 1 : 0) || b.t - a.t);
const out = 'public/powerhouse/images/version2';
const placed = [];
for (const slot of [...slots].sort((a, b) => b.length - a.length)) {
  const hit = files.find(({ f }) => new RegExp(`(^|[^0-9a-z])${slot.replace(/-/g, '[-_ ]')}([^0-9a-z]|$)`, 'i').test(f) && !placed.some((p) => p.f === f));
  if (!hit) continue;
  execFileSync('cwebp', ['-quiet', '-q', '82', '-resize', '1536', '0', join(dir, hit.f), '-o', join(out, `${slot}.webp`)]);
  placed.push({ slot, f: hit.f });
}
// Point each placed slot at the new file, so older names (1-6-concept-blob, civic-room-railway …) give way.
const S = 'src/data/powerhouse-image-slots.json';
const slotData = JSON.parse(readFileSync(S, 'utf8'));
for (const list of Object.values(slotData)) for (const item of list) if (placed.some((p) => p.slot === item.id)) item.src = `/powerhouse/images/version2/${item.id}.webp`;
writeFileSync(S, JSON.stringify(slotData, null, 2) + '\n');
for (const p of placed) console.log(`${p.slot.padEnd(8)} ← ${p.f}`);
const missing = slots.filter((s) => !placed.some((p) => p.slot === s));
if (missing.length) console.log(`not in folder: ${missing.join(', ')}`);

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.resolve('astro'))('sharp');
const source = process.argv[2];
if (!source) throw new Error('Pass the audited output edit folder.');
const base = '/images/union-pier-charleston/documentation';
await fs.mkdir('public' + base, { recursive: true });
const images = [];
for (const group of (await fs.readdir(source)).sort()) {
  const dir = path.join(source, group);
  if (!(await fs.stat(dir)).isDirectory()) continue;
  for (const name of (await fs.readdir(dir)).sort()) {
    if (!name.endsWith('.png')) continue;
    const buffer = await fs.readFile(path.join(dir, name));
    const code = name.split(' ')[0];
    const variant = group.startsWith('A Before') ? 'before' : group === 'B Block plans' ? 'plan' : 'view';
    const id = `${code.toLowerCase()}-${variant}`;
    if (images.some(i => i.id === id)) throw new Error('Duplicate render identity: ' + id);
    const { width, height } = await sharp(buffer).metadata();
    const src = `${base}/${id}.webp`, thumb = `${base}/${id}-720.webp`;
    await sharp(buffer).webp({ quality: 92, effort: 5 }).toFile('public' + src);
    await sharp(buffer).resize({ width: 720, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile('public' + thumb);
    const title = name.replace(/^[A-Z]+\d+ /, '').replace(/ - (16x9|square|portrait|wide)\.png$/, '').replace(/\.png$/, '');
    images.push({ id, code, group, title, src, thumb, width, height, sourceSha256: createHash('sha256').update(buffer).digest('hex') });
  }
}
if (images.length !== 91) throw new Error(`Expected the audited 91 images; found ${images.length}.`);
await fs.writeFile('src/data/union-pier-renders.json', JSON.stringify(images, null, 2) + '\n');
console.log(`Imported ${images.length} audited renders, each with full-resolution and 720px WebP assets.`);

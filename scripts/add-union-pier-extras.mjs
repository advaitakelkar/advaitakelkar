// Adds or replaces Union Pier drawings made after the audited 91-image import
// (matched-frame aerials, Indian Miniature block axonometrics, straightened key plans).
// Run after import-union-pier-renders.mjs:  node scripts/add-union-pier-extras.mjs "/path/to/Union Pier"
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.resolve('astro'))('sharp');
const root = process.argv[2];
if (!root) throw new Error('Pass the Union Pier project folder.');
const base = '/images/union-pier-charleston/documentation';
const frame = '04 Existing vs Proposed/Aerials (Before vs After)/Proposed in Existing Frame';
const axo = '03 Drawings/Axonometrics/Block Axonometrics (B01-B09)';
const key = '03 Drawings/Plans/Block Key Plans (B01-B09)';
const blocks = { B01: 'House block', B02: 'Apartment courts', B03: 'Shop blocks', B04: 'Park terraces on the lawn edge', B05: 'Market and wall platform', B06: 'Church green and Church street', B07: 'Maritime museum and platform', B08: 'Port park, port building and step-up', B09: 'Pier' };
const extras = [
  { id: 'a01-frame', code: 'A01', group: 'A Proposed - existing frame', title: 'Aerial from the harbour', file: `${frame}/A01 Aerial from the harbour - PROPOSED in existing frame - 16x9.png` },
  { id: 'a05-frame', code: 'A05', group: 'A Proposed - existing frame', title: 'Harbour side, lower view', file: `${frame}/A05 South end - PROPOSED in existing frame - 16x9.png` },
  { id: 'a06-frame', code: 'A06', group: 'A Proposed - existing frame', title: 'Along the wharf from the south', file: `${frame}/A06 Pier, wall platform and market - PROPOSED in existing frame - 16x9.png` },
];
const hs = '03 Drawings/History & Site Analysis';
const hu = '03 Drawings/Plans/Site & Ground Plans (G01-G03)/Harbour up (landscape)';
extras.push(
  { id: 'l01-view', code: 'L01', group: 'L Location', title: 'South Carolina, Charleston, Union Pier', file: `${hs}/Location circles/Location - South Carolina, Charleston, Union Pier.png` },
  { id: 'h01-view', code: 'H01', group: 'H History', title: 'Charleston and Union Pier through five eras', file: `${hs}/Timeline/Union Pier - historical timeline board 5x2.png` },
  ...[['1-the-site', 'The site'], ['2-transportation', 'Transportation'], ['3-vegetation', 'Vegetation'], ['4-uses', 'Uses (zoning)'], ['5-water', 'Water and flood zones'], ['6-through-time', 'Through time: original ground and made land']]
    .map(([file, title], i) => ({ id: `e0${i + 1}-view`, code: `E0${i + 1}`, group: 'E Site analysis - existing', title, file: `${hs}/Site analysis - existing/existing-${file}.png` })),
  // Plans turned so the harbour runs along the top, matching the earlier boards.
  { id: 'g03-view', code: 'G03', group: 'G Plans and axonometrics', title: 'Site plan in the city', file: `${hu}/G03 Site plan in the city - harbour up - square.png` },
  { id: 'g01-view', code: 'G01', group: 'G Plans and axonometrics', title: 'Site plan', file: `${hu}/G01 Site plan - harbour up - landscape.png` },
  { id: 'g02-view', code: 'G02', group: 'G Plans and axonometrics', title: 'Ground plan (cut 1.6 m above ground)', file: `${hu}/G02 Ground plan - harbour up - landscape.png` },
);
extras.push({ id: 'g06-view', code: 'G06', group: 'G Plans and axonometrics', title: 'Ground floor plan with land use', file: `${hu}/G06 Ground floor plan with land use - harbour up - landscape.png` });
const dirs = await fs.readdir(path.join(root, axo));
for (const [code, title] of Object.entries(blocks)) {
  const dir = dirs.find(d => d.startsWith(code));
  extras.push({ id: `${code.toLowerCase()}-view`, code, group: 'B Block studies', title, file: `${axo}/${dir}/4_final.png` });
  extras.push({ id: `${code.toLowerCase()}-key`, code, group: 'B Key plans', title: `${title} - key plan`, file: `${key}/${code} ${title} - key plan.png`, replaces: `${code.toLowerCase()}-plan`, optional: true });
}
const images = JSON.parse(await fs.readFile('src/data/union-pier-renders.json', 'utf8'));
for (const extra of extras) {
  const { file, replaces, optional, ...entry } = extra;
  let buffer;
  try { buffer = await fs.readFile(path.join(root, file)); }
  catch {
    // Until a block's finished key plan exists, show its straightened cut plan.
    if (!optional) throw new Error('Missing: ' + file);
    buffer = await fs.readFile(path.join(root, key, 'Straightened sources', `${entry.code}_straight.png`));
  }
  const { width, height } = await sharp(buffer).metadata();
  const src = `${base}/${entry.id}.webp`, thumb = `${base}/${entry.id}-720.webp`;
  await sharp(buffer).webp({ quality: 92, effort: 5 }).toFile('public' + src);
  await sharp(buffer).resize({ width: 720, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile('public' + thumb);
  const record = { ...entry, src, thumb, width, height, sourceSha256: createHash('sha256').update(buffer).digest('hex') };
  const at = images.findIndex(i => i.id === entry.id || i.id === replaces);
  if (at >= 0) images[at] = record; else images.push(record);
  console.log(at >= 0 ? 'replaced' : 'added', entry.id);
}
await fs.writeFile('src/data/union-pier-renders.json', JSON.stringify(images, null, 2) + '\n');
console.log(`${images.length} drawings.`);

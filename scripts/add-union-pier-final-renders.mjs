// Adds the renders of the final SketchUp model (20 Nov 2026) to the Union Pier page:
// aerials, zone views, rendered plans, the satellite before/after and the cut sections.
// Run after add-union-pier-extras.mjs:
//   node scripts/add-union-pier-final-renders.mjs "/path/to/Union Pier"
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.resolve('astro'))('sharp');
const root = process.argv[2];
if (!root) throw new Error('Pass the Union Pier project folder.');
const base = '/images/union-pier-charleston/documentation';
const gpt = '02 Renders/Final model 2026-11-20 (GPT image)';
const gem = '02 Renders/Final model 2026-11-20 (Gemini sections - no trees)';
const sat = '04 Existing vs Proposed/Satellite plan (Google Earth frame) 2026-11-20';
const A = 'A Aerials - final model', Z = 'Z Quarters from the air', G = 'G Plans and axonometrics', X = 'X Site sections', S = 'S Street section perspectives', K = 'K Satellite plan';
const extras = [
  ['f01-view', 'F01', A, 'Harbour, from the south-east', `${gpt}/01_Aerial_01 - Harbour South-East Hero.png`],
  ['f02-view', 'F02', A, 'Harbour, from the north-east', `${gpt}/01_Aerial_02 - Harbour North-East.png`],
  ['f03-view', 'F03', A, 'From the city side', `${gpt}/01_Aerial_03 - City Side West.png`],
  ['f04-view', 'F04', A, 'South waterfront, port park and museum', `${gpt}/01_Aerial_04 - South Waterfront Port Museum.png`],
  ['f05-view', 'F05', A, 'Pier, battery wall and market', `${gpt}/01_Aerial_05 - Pier Battery Wall Market.png`],
  ...[['House blocks', 'House Blocks Plots 033 039 041'], ['Apartment courts', 'Apartment Courts Plots 028 013'], ['Community hall and market plaza', 'Community Center Market Plaza 045 026'],
    ['Southern courtyard blocks', 'Southern Courtyard Blocks 029 027 030'], ['The central park', 'Central Park Unified Plots 023 011'], ['Lake and north lawn', 'Central Park Lake North Lawn'],
    ['Hotel and south lawn', 'Central Park 5-Star Hotel South Lawn'], ['Market terraces', 'Market Terraces Bazaar Plot 010'], ['Battery wall promenade', 'Battery Wall Promenade'],
    ['Pier deck and harbour steps', 'Pier Waterfront Deck Harbor Steps'], ['Port park and maritime museum', 'Port Park Maritime Museum 009 008'], ['North hotel and terraced park', 'Pet Park North 5-Star Hotel Plot 012']]
    .map(([title, file], i) => { const n = String(i + 1).padStart(2, '0'); return [`z${n}-view`, `Z${n}`, Z, title, `${gpt}/03_Zone_${n} - ${file}.png`]; }),
  ['g01-view', 'G01', G, 'Site plan', `${gpt}/02_Plan_02 - Site Plan - harbour up.png`],
  ['g07-view', 'G07', G, 'Site plan in its surroundings', `${gpt}/02_Plan_03 - Site Plan in Context - harbour up.png`],
  ['k10-view', 'K10', K, 'Existing port, satellite view', `${sat}/Satellite plan - EXISTING.png`],
  ['k11-view', 'K11', K, 'Proposed, same frame', `${sat}/Satellite plan - PROPOSED.png`],
  ['k12-view', 'K12', K, 'Proposed, closer', `${sat}/Satellite plan - PROPOSED - zoom detailed.png`],
  ['x06-view', 'X06', X, 'Northern apartment courts and waterfront', `${gem}/05_Section_01 - North Courts Waterfront - SECTION CUT.jpeg`],
  ['x07-view', 'X07', X, 'House gardens, lake, market and pier', `${gem}/05_Section_02 - Houses Lake Market Pier - SECTION CUT.jpeg`],
  ['x08-view', 'X08', X, 'Southern housing, bandstand lawn and pier', `${gpt}/05_Section_03 - South Housing Park Pier - SECTION CUT.png`],
  ['x09-view', 'X09', X, 'Church green and southern waterfront', `${gem}/05_Section_05 - Church Green South Waterfront - SECTION CUT.jpeg`],
  ['x10-view', 'X10', X, 'Longitudinal: park and market', `${gem}/05_Section_04 - Longitudinal Park Waterfront - SECTION CUT.jpeg`],
  ['s01-view', 'S01', 'S Views', 'House street', `${gpt}/04_Street_01 - House Mews Street - TEST.png`],
  ['y01-view', 'Y01', S, 'House street, cut across', `${gpt}/04_Street_01 - House Mews Street - PERSPECTIVE SECTION.png`],
  ['y02-view', 'Y02', S, 'Apartment street, cut across', `${gem}/04_Street_02 - Apartment Street - PERSPECTIVE SECTION.jpeg`],
].map(([id, code, group, title, file]) => ({ id, code, group, title, file }));
// The three model aerials of the earlier design are replaced by F01-F05.
const retired = ['a01-view', 'a05-view', 'a06-view'];
let images = JSON.parse(await fs.readFile('src/data/union-pier-renders.json', 'utf8'));
for (const id of retired) {
  if (!images.some(i => i.id === id)) continue;
  images = images.filter(i => i.id !== id);
  for (const f of [`${id}.webp`, `${id}-720.webp`]) await fs.rm(`public${base}/${f}`, { force: true });
  console.log('retired', id);
}
for (const { file, ...entry } of extras) {
  const buffer = await fs.readFile(path.join(root, file));
  const { width, height } = await sharp(buffer).metadata();
  const src = `${base}/${entry.id}.webp`, thumb = `${base}/${entry.id}-720.webp`;
  await sharp(buffer).webp({ quality: 90, effort: 5 }).toFile('public' + src);
  await sharp(buffer).resize({ width: 720, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile('public' + thumb);
  const record = { ...entry, src, thumb, width, height, sourceSha256: createHash('sha256').update(buffer).digest('hex') };
  const at = images.findIndex(i => i.id === entry.id);
  if (at >= 0) images[at] = record; else images.push(record);
  console.log(at >= 0 ? 'replaced' : 'added', entry.id);
}
await fs.writeFile('src/data/union-pier-renders.json', JSON.stringify(images, null, 2) + '\n');
console.log(`${images.length} drawings.`);

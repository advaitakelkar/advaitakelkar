// Solid Powerhouse symbols and Figure 1.6, drawn as one family: filled black
// silhouettes on a 64-unit grid, no outlines. Replaces the hand-drawn outline set.
//   node scripts/build-powerhouse-symbols.mjs
import { mkdirSync, writeFileSync } from 'node:fs';

const INK = '#111';
const OUT = 'public/powerhouse/symbols/solid';
const FIG = 'public/powerhouse/diagrams/figure-1-6-programme-rings.svg';

// Shapes are filled; `bar()` is the one stroke, for cables, hoses and legs, drawn
// heavy so it reads as a solid limb rather than a line.
const p = (d, rule = '') => `<path d="${d}"${rule ? ` fill-rule="${rule}"` : ''}/>`;
const c = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
const bar = (d, w = 6) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="square" stroke-linejoin="miter"/>`;

const bolt = 'M38 3L12 36H28L23 61L52 25H35L42 3Z';

const icons = {
  power: ['Power', p(bolt)],
  charging: ['EV charger', p('M12 8H40Q44 8 44 12V56H8V12Q8 8 12 8ZM28 14L17 32H25L22 46L35 27H27L31 14Z', 'evenodd') + p('M4 56H48V62H4Z') + bar('M44 24H53V46Q53 50 57 50H60')],
  fuel: ['Fuel', p('M10 8H38V56H10ZM15 13V30H33V13Z', 'evenodd') + p('M5 56H43V62H5Z') + bar('M38 30H46V48Q46 52 50 52Q54 52 54 48V22L46 14')],
  train: ['Rail / train', p('M18 4H46Q54 4 54 12V44Q54 50 48 50H16Q10 50 10 44V12Q10 4 18 4ZM16 12V28H48V12ZM20 36A4 4 0 1 0 20.1 36ZM44 36A4 4 0 1 0 44.1 36Z', 'evenodd') + p('M18 50H26L18 62H10ZM38 50H46L54 62H46Z')],
  bus: ['Bus / coach', p('M6 12H54Q60 12 60 18V48H4V14Q4 12 6 12ZM9 18V30H19V18ZM23 18V30H33V18ZM37 18V30H47V18ZM51 18V40H56V18Z', 'evenodd') + c(16, 50, 7) + c(48, 50, 7)],
  aircraft: ['Aircraft', p('M29 5Q32 0 35 5L37 25L60 38V46L37 38L36 50L45 56V61L32 57L19 61V56L28 50L27 38L4 46V38L27 25Z')],
  camel: ['Camel', p('M4 30Q6 24 12 26Q16 12 24 24Q30 12 38 26L45 27L46 13Q47 8 53 8L59 11L60 16L55 17L54 32Q53 36 48 38V60H42V40H38V60H32V41H22V60H16V41H12V60H6V38Q2 35 4 30Z')],
  'horse-coach': ['Horse & coach', p('M2 14H28V44H2ZM7 19V29H23V19Z', 'evenodd') + c(9, 50, 7) + c(23, 50, 7) + p('M28 36H34V40H28Z') + p('M32 30L44 27L49 15L53 12L58 13L61 20L56 23L55 34V60H50V42H42V60H37V42L33 41Z')],
  seat: ['Seats / lounge', p('M12 4H20V32H52V40H48V60H41V40H20V60H12Z')],
  food: ['Food', p('M10 4H15V22H17V4H22V22H24V4H29V26Q29 33 22 34V60H15V34Q10 33 10 26ZM46 4Q34 14 36 36H42V60H50V4Z')],
  washroom: ['Washrooms', c(18, 9, 6) + p('M10 18H26Q30 18 30 22V40H25V60H11V40H6V22Q6 18 10 18Z') + c(46, 9, 6) + p('M40 18H52L60 44H52V60H40V44H32Z')],
  play: ['Play', p('M6 60L22 6H28L12 60ZM24 22H44V28H22ZM38 6H44L60 60H54Z') + p('M28 30H40V44H28Z') + bar('M30 28V31M38 28V31', 3)],
  gym: ['Gym', p('M6 20H14V44H6ZM15 12H24V52H15ZM40 12H49V52H40ZM50 20H58V44H50ZM24 28H40V36H24Z')],
  clinic: ['Clinic', p('M22 6H42V22H58V42H42V58H22V42H6V22H22Z')],
  reading: ['Reading room', p('M4 12Q18 6 31 14V56Q18 48 4 54ZM60 12Q46 6 33 14V56Q46 48 60 54Z')],
  workspace: ['Workspace', p('M14 8H50Q54 8 54 12V34H10V12Q10 8 14 8ZM16 14V28H48V14Z', 'evenodd') + p('M4 36H60V42H54V60H48V42H16V60H10V42H4Z')],
  bed: ['Rooms / overnight', p('M4 10H11V36H60V58H53V50H11V58H4Z') + p('M13 26Q13 20 20 20H26V34H13Z') + p('M28 22H50Q58 22 58 30V34H28Z')],
  shower: ['Showers', p('M8 28V20Q8 6 24 6Q38 6 40 18H34Q32 12 24 12Q14 12 14 20V28Z') + p('M26 22H54L50 32H30Z') + p('M30 38H35V46H30ZM39 38H44V46H39ZM48 38H53V46H48ZM27 50H32V58H27ZM40 50H45V58H40ZM52 50H57V58H52Z')],
  kitchen: ['Drivers’ kitchen', p('M8 26H56V30H52V54Q52 60 46 60H18Q12 60 12 54V30H8Z') + p('M20 16H44Q44 22 38 22H26Q20 22 20 16ZM29 8H35V14H29Z') + p('M2 34H10V40H2ZM54 34H62V40H54Z')],
};

const svg = (body, w = 64, h = 64, title = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img"><title>${title.replace(/&/g, '&amp;')}</title>${body}</svg>`;
const glyph = (key) => `<g fill="${INK}">${icons[key][1]}</g>`;

mkdirSync(OUT, { recursive: true });
for (const [key, [name]] of Object.entries(icons)) writeFileSync(`${OUT}/${key}.svg`, svg(glyph(key), 64, 64, name));

// Figure 1.6. Rings indicate length of stay, not distance or capacity. Each ring's
// symbols sit in its own band, spread round the lower half so the labels at the
// top stay clear.
const cx = 460, cy = 520;
let body = `<rect width="920" height="980" fill="white"/><g font-family="Inter, sans-serif" fill="${INK}">`
  + `<text x="460" y="40" text-anchor="middle" font-size="26" font-weight="600">The network around the charger</text>`
  + `<text x="460" y="70" text-anchor="middle" font-size="14" fill="#666">A public programme organised by the length of the pause</text>`;
for (const [r, fill, dash] of [[398, 'white', '5 7'], [302, '#f0efed', ''], [205, '#f7f6f4', ''], [104, 'white', '']])
  body += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${INK}" stroke-width="1.25"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
body += `<circle cx="${cx}" cy="${cy}" r="58" fill="${INK}"/><g transform="translate(${cx - 32} ${cy - 32})" fill="white">${p(bolt)}</g>`;
for (const [title, sub, y] of [['A night', 'rooms · showers · a drivers’ kitchen', 153], ['1–2 h', 'gym · clinic · reading room · workspace', 249], ['20 min', 'seats · food · washrooms · play', 347]])
  body += `<text x="460" y="${y}" text-anchor="middle" font-size="21" font-weight="600">${title}</text><text x="460" y="${y + 24}" text-anchor="middle" font-size="14" fill="#666">${sub}</text>`;
const size = 44;
for (const [keys, r] of [[['seat', 'food', 'washroom', 'play'], 155], [['gym', 'clinic', 'reading', 'workspace'], 254], [['bed', 'shower', 'kitchen'], 350]]) {
  const span = keys.length === 3 ? 100 : 140; // degrees across the lower half
  keys.forEach((key, i) => {
    const a = ((90 + span / 2 - (span / (keys.length - 1)) * i) * Math.PI) / 180; // reads left to right
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    body += `<g transform="translate(${(x - size / 2).toFixed(1)} ${(y - size / 2).toFixed(1)}) scale(${size / 64})">${glyph(key)}</g>`;
  });
}
body += `<text x="460" y="947" text-anchor="middle" font-size="16">Public ground · open to everyone</text><text x="460" y="971" text-anchor="middle" font-size="12" fill="#666">Conceptual durations, not distances or capacity · every ring also serves people who are not charging</text></g>`;
writeFileSync(FIG, svg(body, 920, 980, 'Figure 1.6. The network around the charger'));

// Contact sheet for review (review/ is gitignored).
const keys = Object.keys(icons);
let sheet = '<rect width="1200" height="520" fill="white"/>';
keys.forEach((k, i) => {
  const x = 30 + (i % 10) * 116, y = 30 + Math.floor(i / 10) * 240;
  sheet += `<g transform="translate(${x} ${y}) scale(1.5)">${glyph(k)}</g><g transform="translate(${x + 30} ${y + 130}) scale(.5)">${glyph(k)}</g><text x="${x + 48}" y="${y + 200}" font-family="Inter" font-size="13" text-anchor="middle">${k}</text>`;
});
mkdirSync('review', { recursive: true });
writeFileSync('review/symbols-sheet.svg', svg(sheet, 1200, 520));
console.log(`${keys.length} solid symbols → ${OUT}; ${FIG}`);

// Virtual Gods as a web exhibition: one entrance, four worlds, eight pairs.
//
// The exhibition YAML (src/content/exhibitions/virtual-gods.yaml) holds the
// people, the text and every picture; this module holds only what the YAML
// cannot say about itself — each page's address, the pair's title as archv.in
// printed it, and how a page's pictures divide into the stages the work
// actually went through:
//
//   one person, in 2D  → the illustration each member drew of their architect
//   one person, in 3D  → the module each member built from it (a rotating GIF)
//   two people         → the pair fused into one form
//   four people        → the pairs merged into a world
//   the final artwork  → the world's renders
//
// A picture's stage is read from its archv.in file name, which is the only
// thing that says it; see stageOf().

export type Stage = 'illustration' | 'module' | 'module-view' | 'fusion' | 'fusion-view' | 'fusion-step' | 'process' | 'world' | 'other';

/** World slug (YAML) → its address. */
export const WORLD_URL: Record<string, string> = {
  'hejduk-sanaa': 'vg01',
  'ando-correa': 'vg02',
  'ito-zumthor': 'vg03',
  'marx-zaha': 'vg04',
};

/** Pair slug (YAML) → the archv.in page it was, its title there, its address. */
export const PAIR: Record<string, { archv: string; title: string; url: string }> = {
  'varun-shravan':   { archv: 'HejdukxScarpa',   title: 'John Hejduk × Carlo Scarpa',         url: 'hejduk-x-scarpa' },
  'kuldeep-ishita':  { archv: 'SANAAxAndo',      title: 'SANAA × Tadao Ando',                 url: 'sanaa-x-ando' },
  'devarsh-janhavi': { archv: 'AndoxCorrea',     title: 'Tadao Ando × Charles Correa',        url: 'ando-x-correa' },
  'nayan-sneha':     { archv: 'ItoxCorbusier',   title: 'Toyo Ito × Le Corbusier',            url: 'ito-x-corbusier' },
  'varun-sneha':     { archv: 'ScarpaxIto',      title: 'Carlo Scarpa × Toyo Ito',            url: 'scarpa-x-ito' },
  'sohil-jinal':     { archv: 'VenturixZumthor', title: 'Peter Zumthor × Robert Venturi',     url: 'venturi-x-zumthor' },
  'advaita-yash':    { archv: 'ZahaxMarx',       title: 'Zaha Hadid × Roberto Burle Marx',    url: 'zaha-x-marx' },
  'siddhesh-anuj':   { archv: 'ArchigramxBaeza', title: 'Archigram × Alberto Campo Baeza',    url: 'archigram-x-baeza' },
};

export const worldHref = (q: string) => `/virtual-gods/${WORLD_URL[q]}`;
export const pairHref = (q: string, p: string) => `/virtual-gods/${WORLD_URL[q]}/${PAIR[p].url}`;

/** archv.in page name → exhibition address (for the entrance circle). */
export function hrefForArchvPage(quadrants: any[], page: string): string {
  for (const q of quadrants) {
    if ((q.number ?? '').replace('_', '') === page) return worldHref(q.slug);
    for (const p of q.pairs) if (PAIR[p.slug]?.archv === page) return pairHref(q.slug, p.slug);
  }
  return '/projects/virtual-gods';
}

const fileName = (src: string) => decodeURIComponent(src.split('/').pop() ?? '').replace(/^\d{3}_/, '');

/** Which stage a picture from an archv.in page belongs to, by its file name. */
export function stageOf(src: string): Stage {
  const n = fileName(src);
  if (/Scrapin|Scarpin|ARC\.HV-x/i.test(n)) return 'illustration';
  if (/_(Back|Front|Left|Right|Top|Bottom|Isometric|Iso)\.(jpe?g|png)$/i.test(n)) return 'module-view';
  if (/^(Back|Front|Left|Right|Top|Bottom|Isometric)\.(gif|jpe?g|png)$/i.test(n)) return 'fusion-view';
  if (/^VG_.*\.gif$/i.test(n)) return 'fusion';
  if (/^([A-F]|\d{1,2})\.gif$/i.test(n)) return 'fusion-step';
  if (/^\d{2}\.jpe?g$/i.test(n)) return 'process';
  if (/^RIght\.gif$/.test(n)) return 'fusion-view';
  if (/\.gif$/i.test(n) && !/Evolution|Detail|Model-Render|Hi4|\d+R\.gif/i.test(n)) return 'module';
  if (/Process-Diagram|Evolution|Scene|Model-Render|Detail|R0?\d|D0?\d|R00|Render/i.test(n)) return 'world';
  return 'other';
}

/** The names people's files go by on archv.in, where they differ from the YAML. */
const ALIASES: Record<string, string[]> = {
  advaita: ['advait', 'advaita'],
  sohil: ['sohail', 'sohil'],
  janhavi: ['janhavi', 'janvi', 'jahanvi', 'jhanvi'],
  siddhesh: ['siddhesh', 'sid'],
  devarsh: ['devarsh'],
};

/** Does this picture belong to this person (by first name, allowing aliases)? */
export function isPersons(src: string, name: string): boolean {
  const n = fileName(src).toLowerCase();
  const first = name.split(' ')[0].toLowerCase();
  return (ALIASES[first] ?? [first]).some(a => n.includes(a));
}

/** A fused pair's GIF on its world page is named after both members. */
export function isPairsFusion(src: string, members: { name: string }[]): boolean {
  return stageOf(src) === 'fusion' && members.every(m => isPersons(src, m.name));
}

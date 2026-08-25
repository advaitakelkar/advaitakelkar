#!/usr/bin/env node
/**
 * Guards the scramble alphabet in src/lib/glyphs.ts.
 *
 *   pnpm lint:glyphs
 *
 * Catches the ways this set breaks silently:
 *   1. a combining mark, which attaches to the previous glyph instead of
 *      standing alone and renders as a broken cluster;
 *   2. an invisible character (control, format, space) that scrambles to a
 *      blank and looks like the animation dropped a frame;
 *   3. a character outside Inter's `latin` subset, which either costs an
 *      extra font download mid-animation or renders as a tofu box;
 *   4. a duplicate, which silently double-weights that glyph;
 *   5. drift off the fixed size of the set.
 *
 * Also re-checks that nothing hard-codes the alphabet. That check used to be
 * case-sensitive (`const GLYPHS`), and projects/[slug].astro declared its own
 * copy as lowercase `const glyphs` — so it sat there passing the lint for as
 * long as both existed. Match case-insensitively.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = path.resolve('src');
const problems = [];

/** The set is fixed at this size — see the header of src/lib/glyphs.ts. */
const EXPECTED = 19;

const mod = await import(path.join(SRC, 'lib/glyphs.ts')).catch(async () => {
  // .ts import needs a loader; parse the literals out instead. Each group is
  // a top-level `const NAME = '…'`, which is why they are declared that way
  // rather than inline in GLYPH_GROUPS — this parser has to be able to read
  // them without executing TypeScript.
  const text = await readFile(path.join(SRC, 'lib/glyphs.ts'), 'utf8');
  const groups = {};
  for (const m of text.matchAll(/^const ([A-Z][A-Z_]*)\s*=\s*'([^']*)';/gm)) {
    groups[m[1].toLowerCase()] = m[2];
  }
  return { GLYPH_GROUPS: groups };
});

const groups = mod.GLYPH_GROUPS ?? {};
if (!Object.keys(groups).length) {
  console.error('✗ could not read GLYPH_GROUPS from src/lib/glyphs.ts');
  process.exit(1);
}

/** Unicode general categories that must never appear in the alphabet. */
const BANNED = /\p{Mn}|\p{Mc}|\p{Me}|\p{Cf}|\p{Cc}|\p{Zs}/u;

/** Any letter or digit — the set is symbols only, so these are all rejected. */
const LETTERLIKE = /\p{L}|\p{N}/u;

/**
 * Inter's `latin` subset, the one already loaded at first paint. Staying
 * inside it is what keeps the scramble from firing extra font downloads
 * mid-animation. Ranges taken from the Google Fonts stylesheet.
 */
const LATIN_SUBSET = [
  [0x0000, 0x00ff], [0x0131, 0x0131], [0x0152, 0x0153],
  [0x02bb, 0x02bc], [0x02c6, 0x02c6], [0x02da, 0x02da], [0x02dc, 0x02dc],
  [0x2000, 0x206f], [0x2074, 0x2074], [0x20ac, 0x20ac], [0x2122, 0x2122],
  [0x2191, 0x2191], [0x2193, 0x2193], [0x2212, 0x2212], [0x2215, 0x2215],
];
const inLatin = (cp) => LATIN_SUBSET.some(([lo, hi]) => cp >= lo && cp <= hi);

const hex = (ch) => `U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`;

let total = 0;
const seen = new Map();

for (const [group, chars] of Object.entries(groups)) {
  for (const ch of [...chars]) {
    total++;
    if (BANNED.test(ch)) {
      problems.push(`${group}: ${hex(ch)} is a combining or invisible character`);
    }
    if (LETTERLIKE.test(ch)) {
      problems.push(`${group}: '${ch}' (${hex(ch)}) is a letter or digit — the set is symbols only`);
    }
    if (!inLatin(ch.codePointAt(0))) {
      problems.push(
        `${group}: '${ch}' (${hex(ch)}) is outside Inter's latin subset — ` +
        `it would cost an extra font download mid-scramble`
      );
    }
    // Every glyph is equally likely, so a repeat silently double-weights it.
    // Unlike the old alphabet, no repeat is deliberate any more.
    const prev = seen.get(ch);
    if (prev) {
      problems.push(`${group}: '${ch}' already appears in ${prev} — the set must be unique`);
    }
    seen.set(ch, group);
  }
}

if (total !== EXPECTED) {
  problems.push(`the set is ${total} characters, expected exactly ${EXPECTED}`);
}

// Nothing may hard-code the alphabet any more.
async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(astro|ts|js)$/.test(e.name)) yield p;
  }
}
for await (const file of walk(SRC)) {
  if (file.endsWith(path.join('lib', 'glyphs.ts'))) continue;
  const text = await readFile(file, 'utf8');
  // Match on the *shape of the literal*, not the variable name. Name-matching
  // is what let three copies hide: `const glyphs` (lowercase, [slug].astro),
  // `const G` (SideNav) and `const SCRAMBLE_CHARS` (index.astro) all slipped
  // past a check that only looked for `const GLYPHS`.
  //
  // An alphabet looks like: a quoted run of 8+ characters that are all
  // punctuation, symbols or digits, with at least 6 *distinct* punctuation or
  // symbol marks. Anything containing a letter breaks the run, which is what
  // keeps URLs, CSS selectors and regex sources out.
  //
  // Unicode classes, not ASCII ranges — an ASCII-only version missed two of
  // the three real copies, because one used an em dash and the other included
  // digits. `(?!\1)` stops the class from swallowing the closing quote.
  const ALPHABET_SHAPED = /(['"`])((?:(?!\1)[\p{P}\p{S}\p{N}]|\\.){8,})\1/gu;
  for (const m of text.matchAll(ALPHABET_SHAPED)) {
    const literal = m[2];
    const marks = new Set([...literal.replace(/\\./g, '')].filter((c) => /[\p{P}\p{S}]/u.test(c)));
    if (marks.size >= 6) {
      problems.push(
        `${path.relative(process.cwd(), file)}: hard-codes an alphabet ` +
        `(${JSON.stringify(literal.slice(0, 28))}) — import GLYPHS from src/lib/glyphs.ts`
      );
    }
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} glyph problem(s):\n`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}

console.log(`✓ glyphs: ${total} characters across ${Object.keys(groups).length} groups, all standalone`);

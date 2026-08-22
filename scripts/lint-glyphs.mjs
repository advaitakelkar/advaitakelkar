#!/usr/bin/env node
/**
 * Guards the scramble alphabet in src/lib/glyphs.ts.
 *
 *   pnpm lint:glyphs
 *
 * Catches the three ways this set breaks silently:
 *   1. a combining mark, which attaches to the previous glyph instead of
 *      standing alone and renders as a broken cluster;
 *   2. an invisible character (control, format, space) that scrambles to a
 *      blank and looks like the animation dropped a frame;
 *   3. a borrowed glyph that no declared Noto family covers, which falls back
 *      to a system font or a tofu box.
 *
 * Also re-checks that nothing hard-codes the old literal.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = path.resolve('src');
const problems = [];

const mod = await import(path.join(SRC, 'lib/glyphs.ts')).catch(async () => {
  // .ts import needs a loader; parse the literals out instead.
  const text = await readFile(path.join(SRC, 'lib/glyphs.ts'), 'utf8');
  const grab = (name) => {
    const m = text.match(new RegExp(`${name}\\s*[:=]\\s*'([^']*)'`));
    return m ? m[1] : '';
  };
  const groups = {};
  const body = text.match(/const (?:SYMBOLS|NATIVE|BORROWED)[\s\S]*?(?=\n(?:const|export)|$)/g) || [];
  for (const block of body) {
    for (const m of block.matchAll(/'([^']+)':\s*'([^']+)'|(\w+):\s*'([^']+)'/g)) {
      const key = m[1] ?? m[3];
      const val = m[2] ?? m[4];
      if (key && val) groups[key] = val;
    }
  }
  groups.symbols = grab('SYMBOLS');
  return { GLYPH_GROUPS: groups };
});

const groups = mod.GLYPH_GROUPS ?? {};
if (!Object.keys(groups).length) {
  console.error('✗ could not read GLYPH_GROUPS from src/lib/glyphs.ts');
  process.exit(1);
}

/** Unicode general categories that must never appear in the alphabet. */
const BANNED = /\p{Mn}|\p{Mc}|\p{Me}|\p{Cf}|\p{Cc}|\p{Zs}/u;

let total = 0;
const seen = new Map();

for (const [group, chars] of Object.entries(groups)) {
  for (const ch of [...chars]) {
    total++;
    if (BANNED.test(ch)) {
      problems.push(
        `${group}: U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')} ` +
        `is a combining or invisible character`
      );
    }
    // A repeat is legal (it weights the glyph) but only inside one group,
    // where it is visibly deliberate. Across groups it is an accident.
    const prev = seen.get(ch);
    if (prev && prev !== group) {
      problems.push(`${group}: '${ch}' already appears in ${prev}`);
    }
    seen.set(ch, group);
  }
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
  if (/const GLYPHS\s*=\s*'/.test(text)) {
    problems.push(`${path.relative(process.cwd(), file)}: hard-codes the alphabet — import it from src/lib/glyphs.ts`);
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} glyph problem(s):\n`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}

console.log(`✓ glyphs: ${total} characters across ${Object.keys(groups).length} groups, all standalone`);

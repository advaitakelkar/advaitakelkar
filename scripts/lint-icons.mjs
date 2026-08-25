#!/usr/bin/env node
/**
 * Guards the icon family in src/components/Icon.astro.
 *
 *   pnpm lint:icons
 *
 * The site drifted into "28 kinds of arrow" once, was consolidated into
 * Arrow.astro, and then regrew to 18 inline copies plus four symbols that
 * never got a component at all. Consolidation without a guard is temporary.
 *
 * Four rules:
 *   1. No raw <svg> for a UI symbol outside Icon.astro. Genuine graphics —
 *      timer rings, the Virtual Gods wheel, admin sparklines — are exempt by
 *      class, listed below.
 *   2. No stroke-width anywhere. Weight is the pen curve in tokens.css; a
 *      literal is what produced a 4.75x stroke spread across the site.
 *   3. No raw width/height on an icon. The pen curve reads --icon-size, so a
 *      raw width mis-weights the glyph as well as mis-sizing it.
 *   4. Terminals stay on the house spec (square + miter), set once in the
 *      component.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = path.resolve('src');
const COMPONENT = path.join('components', 'Icon.astro');
const problems = [];

/**
 * Classes that are real graphics rather than UI symbols. These legitimately
 * hand-roll their <svg>: they animate stroke-dashoffset, derive geometry from
 * data, or plot values.
 */
const EXEMPT_CLASSES = [
  'home-slider__ring',   // auto-advance countdown, animates its own dasharray
  'timer-ring',          // project + lightbox countdowns, same
  'vgw__svg',            // Virtual Gods wheel — geometry derived from YAML
  'ad__spark',           // admin sparkline
];

/** Icon classes whose size is owned by a parent box, so width:100% is right. */
const FILLS_PARENT = ['sn-lock__icon'];

/**
 * Files that draw real graphics rather than UI symbols, and therefore set
 * their own stroke. Exempt wholesale — a per-shape class check is fragile
 * when the geometry is generated.
 */
const GRAPHIC_FILES = ['VGWheel.astro', 'admin.astro'];

/**
 * Every class handed to an <Icon> anywhere in src. Built first, because rule 3
 * needs to know which CSS selectors actually style an icon.
 */
const ICON_CLASSES = new Set();

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(astro|ts|css)$/.test(e.name)) yield p;
  }
}

for await (const file of walk(SRC)) {
  const text = await readFile(file, 'utf8');
  for (const m of text.matchAll(/<Icon\b[^>]*?class=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
    for (const c of (m[1] ?? m[2] ?? '').split(/\s+/)) if (c) ICON_CLASSES.add(c);
  }
}

for await (const file of walk(SRC)) {
  const rel = path.relative(process.cwd(), file);
  const text = await readFile(file, 'utf8');
  const isComponent = file.endsWith(COMPONENT);
  const isGraphic = GRAPHIC_FILES.some((f) => file.endsWith(f));
  const isTokens = file.endsWith(path.join('styles', 'tokens.css'));

  /* ── 1. raw <svg> outside the component ── */
  if (!isComponent && !isGraphic) {
    for (const m of text.matchAll(/<svg\b[\s\S]*?<\/svg>/g)) {
      const svg = m[0];
      const cls = /class(?::list)?=(?:"([^"]*)"|\{([^}]*)\})/.exec(svg);
      const clsval = (cls?.[1] ?? cls?.[2] ?? '');
      if (EXEMPT_CLASSES.some((c) => clsval.includes(c))) continue;
      const line = text.slice(0, m.index).split('\n').length;
      problems.push(
        `${rel}:${line}: raw <svg> — use <Icon name="…" />, or add its class to ` +
        `EXEMPT_CLASSES in this script if it is a real graphic`
      );
    }
  }

  /* ── 2. stroke-width literals ── */
  for (const m of isGraphic ? [] : text.matchAll(/stroke-width\s*[:=]\s*["']?([\d.]+)/g)) {
    const line = text.slice(0, m.index).split('\n').length;
    const ctx = text.slice(Math.max(0, m.index - 200), m.index);
    // Ring/spark graphics set their own stroke; they are exempt above too.
    if (EXEMPT_CLASSES.some((c) => ctx.includes(c))) continue;
    if (/timer-ring|ring-fill|ring-track/.test(ctx)) continue;
    problems.push(
      `${rel}:${line}: stroke-width: ${m[1]} — weight comes from the pen curve ` +
      `in tokens.css, never a literal`
    );
  }

  /* ── 3. raw width/height on an icon class ──
     Only classes that actually land on an <Icon> count. Matching any class
     containing "arrow" flagged the wrapper <span>s and <button>s that hold
     the icons, which legitimately have their own width. */
  for (const m of text.matchAll(/\.([\w-]+)\s*\{([^}]*)\}/g)) {
    const [, cls, body] = m;
    if (isTokens) continue;
    if (!ICON_CLASSES.has(cls)) continue;
    if (FILLS_PARENT.some((c) => cls.includes(c))) continue;
    const w = /\bwidth\s*:\s*([^;]+);/.exec(body);
    if (!w) continue;
    const line = text.slice(0, m.index).split('\n').length;
    problems.push(
      `${rel}:${line}: .${cls} sets width: ${w[1].trim()} — use --icon-size, ` +
      `or the pen curve will weight it as though it were the default size`
    );
  }

  /* ── 4. terminals stay on the house spec ── */
  if (!isComponent) {
    for (const m of text.matchAll(/stroke-linecap\s*=\s*"(\w+)"/g)) {
      const line = text.slice(0, m.index).split('\n').length;
      problems.push(
        `${rel}:${line}: stroke-linecap="${m[1]}" — terminals are set once in ` +
        `Icon.astro (square + miter)`
      );
    }
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} icon problem(s):\n`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}

console.log('✓ icons: one family, one spec, sizes on --icon-size');

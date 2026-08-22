#!/usr/bin/env node
/**
 * Responsive review harness.
 *
 * Captures every route at each band edge and records two things:
 *   1. a full-page PNG, for looking at
 *   2. a layout fingerprint (JSON), for diffing
 *
 * The fingerprint is the useful half. Byte-comparing PNGs answers "did any
 * pixel move", which during a token refactor is always yes and tells you
 * nothing. The fingerprint records the geometry that actually matters —
 * document width, overflow, section boxes, gutters, font sizes, tap-target
 * count — so a diff reads as "home@834 gutter 100 → 32" instead of a wall of
 * changed files.
 *
 *   pnpm shoot before                  # reference set
 *   ...make changes...
 *   pnpm shoot after
 *   pnpm shoot --diff before after     # what moved
 *
 * Output lands in review/ (gitignored). Needs a dev server on :4321.
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const BASE = process.env.SHOOT_BASE ?? 'http://127.0.0.1:4321';
const OUT = path.resolve('review');

/* 700 / 1024 / 1366 are the ladder stops. 699 and 1023 sit one pixel below
   two of them, which is how the old 767/768/769 dead zone would have been
   caught. 390 and 1600 are the extremes. */
const WIDTHS = [390, 699, 700, 834, 1023, 1024, 1280, 1366, 1600];

/* One route per template. Add a row when a new template lands. */
const ROUTES = [
  ['home', '/'],
  ['about', '/about'],
  ['projects', '/projects'],
  ['project-card', '/projects/alt-verse'],
  ['project-tabs', '/projects/shelf'],
  ['category', '/academic'],
  ['tag', '/tags/architecture'],
  ['virtual-gods', '/virtual-gods'],
  ['notfound', '/this-route-does-not-exist'],
];

const round = (n) => Math.round(n * 10) / 10;

/* Runs in the page. Keep it dependency-free and deterministic. */
function fingerprint() {
  const de = document.documentElement;
  const cs = getComputedStyle(de);
  const token = (n) => cs.getPropertyValue('--_tokens---' + n).trim();

  const box = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height),
      pl: s.paddingLeft, pr: s.paddingRight, pt: s.paddingTop,
      cols: s.gridTemplateColumns === 'none' ? null : s.gridTemplateColumns,
      display: s.display,
    };
  };

  /* Anything that pokes outside the viewport and is not deliberately
     positioned off-screen (the slide-out nav panel, edge-bleed carousels). */
  const overflowing = [];
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el);
    if (s.position === 'fixed' || s.display === 'none' || s.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > de.clientWidth + 1) {
      overflowing.push({
        sel: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
        right: Math.round(r.right),
      });
    }
  }

  /* Interactive elements below the 44px touch minimum. */
  let tiny = 0, interactive = 0;
  for (const el of document.querySelectorAll('a,button,[role="button"],[role="tab"],input,select,summary')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    interactive++;
    if (r.height < 44 || r.width < 44) tiny++;
  }

  /* Text clipped with no visible affordance — the T1 class of bug. */
  const clipped = [];
  for (const el of document.querySelectorAll('p,div,span')) {
    if (el.scrollHeight <= el.clientHeight + 2) continue;
    if (el.clientHeight === 0) continue;
    const s = getComputedStyle(el);
    if (s.overflowY === 'visible') continue;
    if ((el.textContent || '').trim().length < 80) continue;
    clipped.push({
      sel: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className
        ? '.' + el.className.trim().split(/\s+/)[0] : ''),
      shown: el.clientHeight, total: el.scrollHeight,
      hidden: el.scrollHeight - el.clientHeight,
      fade: s.maskImage !== 'none' || s.webkitMaskImage !== 'none',
    });
  }

  /* Content sitting underneath a fixed bar. The bars are chrome (breadcrumb,
     side rail); anything from the page body whose top half is behind one is
     unreadable. This is how the About heading hid under the breadcrumb on
     tablets without any measurement flagging it. */
  const occluded = [];
  const bars = [...document.querySelectorAll('.page-breadcrumb, .ex-lightbox')]
    .map((b) => ({ el: b, r: b.getBoundingClientRect() }))
    // Only TOP-docked bars occlude. Below 700px the breadcrumb docks to the
    // bottom, where content scrolling underneath it is the intended behaviour.
    .filter((b) => getComputedStyle(b.el).position === 'fixed' && b.r.height > 0
                   && b.r.top < de.clientHeight * 0.5);
  for (const el of document.querySelectorAll('main h1, main h2, main h3, main p, main img')) {
    const r = el.getBoundingClientRect();
    if (r.height === 0 || r.bottom < 0 || r.top > de.clientHeight) continue;
    for (const b of bars) {
      // A surface the element lives inside is not occluding it.
      if (b.el.contains(el)) continue;
      const overlap = Math.min(r.bottom, b.r.bottom) - Math.max(r.top, b.r.top);
      if (overlap > Math.min(r.height, b.r.height) * 0.5) {
        occluded.push({
          sel: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className
            ? '.' + el.className.trim().split(/\s+/)[0] : ''),
          text: (el.textContent || '').trim().slice(0, 28),
          by: b.el.className.split(/\s+/)[0],
        });
        break;
      }
    }
  }

  return {
    viewport: de.clientWidth,
    docWidth: de.scrollWidth,
    horizontalOverflow: de.scrollWidth - de.clientWidth,
    tokens: {
      gutter: token('layout--gutter'),
      spaceSmall: token('space--small'),
      spaceMedium: token('space--medium'),
      spaceBig: token('space--big'),
      nav: token('layout--nav'),
    },
    boxes: {
      main: box('.page-main'),
      firstSection: box('main > * > section, main > section, article > section'),
    },
    bodyFontSize: getComputedStyle(document.body).fontSize,
    interactive,
    tapTargetsUnder44: tiny,
    overflowing: overflowing.slice(0, 8),
    occluded: occluded.slice(0, 6),
    clippedText: clipped.slice(0, 8),
  };
}

async function capture(label) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.error(
      'playwright is not installed.\n' +
      '  pnpm add -D playwright && pnpm exec playwright install chromium'
    );
    process.exit(1);
  }

  try {
    const res = await fetch(BASE, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(String(res.status));
  } catch {
    console.error(`No dev server at ${BASE}. Start one with: pnpm dev`);
    process.exit(1);
  }

  const dir = path.join(OUT, label);
  await mkdir(dir, { recursive: true });

  const browser = await chromium.launch();
  const prints = {};
  let shots = 0;

  for (const width of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width, height: 1000 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
      colorScheme: 'light',
    });
    // Base.astro randomises the colour scheme per load; pin it so a diff
    // shows layout rather than palette.
    await ctx.addInitScript(() => {
      try { sessionStorage.setItem('aks', 'default'); } catch {}
    });
    const page = await ctx.newPage();

    for (const [name, route] of ROUTES) {
      try {
        await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 25000 });
        await page.evaluate(() => document.fonts && document.fonts.ready);
        await page.waitForTimeout(200);

        prints[`${name}@${width}`] = await page.evaluate(fingerprint);

        await page.screenshot({
          path: path.join(dir, `${name}@${width}.png`),
          fullPage: true,
        });
        shots++;
      } catch (err) {
        console.warn(`  ! ${name}@${width}: ${String(err.message).split('\n')[0]}`);
      }
    }

    await ctx.close();
    process.stdout.write(`${width} `);
  }

  await browser.close();
  await writeFile(path.join(OUT, `${label}.json`), JSON.stringify(prints, null, 1));
  console.log(`\n${shots} shots → ${dir}\nfingerprint → ${path.join(OUT, label + '.json')}`);

  report(prints);
}

/* Standing problems in the current set, regardless of any comparison. */
function report(prints) {
  const overflow = [], tiny = [], clipped = [];
  for (const [k, v] of Object.entries(prints)) {
    if (v.horizontalOverflow > 0) overflow.push(`${k} +${v.horizontalOverflow}px`);
    if (v.clippedText.length) {
      for (const c of v.clippedText) {
        if (!c.fade) clipped.push(`${k} ${c.sel} hides ${c.hidden}px`);
      }
    }
    if (v.interactive) tiny.push([k, v.tapTargetsUnder44, v.interactive]);
  }
  const hidden = [];
  for (const [k, v] of Object.entries(prints)) {
    for (const o of v.occluded || []) hidden.push(`${k} ${o.sel} "${o.text}" under .${o.by}`);
  }
  console.log('\n── standing issues ──');
  console.log(`horizontal overflow : ${overflow.length ? overflow.join(', ') : 'none'}`);
  console.log(`clipped, no fade    : ${clipped.length ? clipped.slice(0, 6).join(', ') : 'none'}`);
  console.log(`content under fixed bar: ${hidden.length ? hidden.slice(0, 6).join(', ') : 'none'}`);
  const worst = tiny.sort((a, b) => b[1] / b[2] - a[1] / a[2])[0];
  if (worst) console.log(`worst tap targets   : ${worst[0]} — ${worst[1]}/${worst[2]} under 44px`);
}

/* Diff two fingerprint sets, field by field. */
async function diff(a, b) {
  if (!a || !b) {
    console.error('usage: pnpm shoot --diff <before> <after>');
    process.exit(1);
  }
  for (const f of [a, b]) {
    if (!existsSync(path.join(OUT, `${f}.json`))) {
      console.error(`missing fingerprint: review/${f}.json`);
      process.exit(1);
    }
  }
  const A = JSON.parse(await readFile(path.join(OUT, `${a}.json`), 'utf8'));
  const B = JSON.parse(await readFile(path.join(OUT, `${b}.json`), 'utf8'));

  const lines = [];
  const walk = (pa, pb, trail) => {
    if (JSON.stringify(pa) === JSON.stringify(pb)) return;
    if (pa === null || pb === null || typeof pa !== 'object' || typeof pb !== 'object') {
      lines.push(`  ${trail}: ${JSON.stringify(pa)} → ${JSON.stringify(pb)}`);
      return;
    }
    if (Array.isArray(pa) || Array.isArray(pb)) {
      lines.push(`  ${trail}: ${(pa || []).length} → ${(pb || []).length} entries`);
      return;
    }
    for (const k of new Set([...Object.keys(pa), ...Object.keys(pb)])) {
      walk(pa[k], pb[k], trail ? `${trail}.${k}` : k);
    }
  };

  let changedKeys = 0;
  for (const key of Object.keys(A)) {
    if (!(key in B)) { lines.push(`${key}: MISSING in ${b}`); continue; }
    const before = lines.length;
    lines.push(`\n${key}`);
    walk(A[key], B[key], '');
    if (lines.length === before + 1) lines.pop(); else changedKeys++;
  }

  const out = `# ${a} → ${b}\n\n${changedKeys} of ${Object.keys(A).length} snapshots changed\n${lines.join('\n')}\n`;
  await writeFile(path.join(OUT, `diff-${a}-${b}.md`), out);
  console.log(out.slice(0, 6000));
  console.log(`\nfull diff → review/diff-${a}-${b}.md`);
}

const args = process.argv.slice(2);
if (args[0] === '--diff') diff(args[1], args[2]);
else capture(args[0] ?? 'shot');

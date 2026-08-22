#!/usr/bin/env node
/**
 * Fails if any width-based media query, or any raw viewport-width comparison
 * in JS, uses a value outside the ladder in src/lib/breakpoints.ts.
 *
 * This is the enforcement half of phase 1. CSS custom properties can't be used
 * inside media queries, so the numbers are necessarily repeated across files —
 * this check is what keeps the repetition honest.
 *
 *   pnpm lint:bp
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = path.resolve('src');

const ALLOWED = new Set([
  '(max-width: 699.98px)',
  '(min-width: 700px)',
  '(max-width: 1023.98px)',
  '(min-width: 1024px)',
  '(max-width: 1365.98px)',
  '(min-width: 1366px)',
]);

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(astro|css|ts|js)$/.test(e.name)) yield p;
  }
}

const problems = [];

for await (const file of walk(SRC)) {
  const text = await readFile(file, 'utf8');
  const rel = path.relative(process.cwd(), file);
  const lines = text.split('\n');

  lines.forEach((line, i) => {
    for (const m of line.matchAll(/\((?:max|min)-width:\s*[0-9.]+px\)/g)) {
      if (!ALLOWED.has(m[0])) {
        problems.push(`${rel}:${i + 1}  off-ladder query  ${m[0]}`);
      }
    }
    // innerWidth/clientWidth compared against a literal — these drift from the
    // CSS silently and don't re-evaluate on rotate. Use MQ + watch() instead.
    if (/\b(?:inner|client)Width\s*[<>]=?\s*\d/.test(line)) {
      problems.push(`${rel}:${i + 1}  raw width comparison — use matchMedia/watch()`);
    }
  });
}

if (problems.length) {
  console.error(`✗ ${problems.length} breakpoint problem(s):\n`);
  for (const p of problems) console.error('  ' + p);
  console.error('\nThe ladder lives in src/lib/breakpoints.ts — 700 / 1024 / 1366.');
  process.exit(1);
}

console.log('✓ breakpoints: every media query is on the ladder');

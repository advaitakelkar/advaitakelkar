#!/usr/bin/env node
/**
 * Content-readiness audit for every project page. Code does the mechanical
 * checks (fields, cover, image files); Jev (TypeSafe) judges the prose.
 * Read-only: prints a table, changes nothing.
 *
 * Needs TYPESAFE_API_KEY, kept in the Keychain by aihub:
 *
 *   aihub run typesafe -- pnpm audit:jev
 *   aihub run typesafe -- pnpm audit:jev --json   # raw rows
 *
 * A full run is ~42k input tokens (about $0.002) and takes under a second.
 * Scores are for sorting the worklist, not verdicts: spot-check before acting.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const ROOT = path.resolve('.');
const PROJECTS = path.join(ROOT, 'src/content/projects');
const KEY = process.env.TYPESAFE_API_KEY;
if (!KEY) {
  console.error('TYPESAFE_API_KEY not set. Run: aihub run typesafe -- pnpm audit:jev');
  process.exit(1);
}

// js-yaml is not a direct dependency (see AUDIT-2 #2); use pnpm's copy.
function loadYaml() {
  const require = createRequire(import.meta.url);
  try { return require('js-yaml'); } catch {}
  const store = path.join(ROOT, 'node_modules/.pnpm');
  const dir = fs.readdirSync(store).find((d) => d.startsWith('js-yaml@'));
  if (!dir) throw new Error('js-yaml not found; run pnpm install');
  return require(path.join(store, dir, 'node_modules/js-yaml'));
}
const yaml = loadYaml();

const access = fs.readFileSync(path.join(ROOT, 'src/lib/projectAccess.ts'), 'utf8');
const PUBLIC = new Set(JSON.parse(access.match(/PUBLIC_PROJECT_SLUGS = (\[[^\]]*\])/)[1].replace(/'/g, '"')));

const strip = (html = '') => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const exists = (p) => !!p && fs.existsSync(path.join(ROOT, 'public', p));
const imagesIn = (v) => typeof v === 'string'
  ? (v.startsWith('/images/') ? [v] : [])
  : v && typeof v === 'object' ? Object.values(v).flatMap(imagesIn) : [];

// Question meanings are complete on their own; ids are only for code.
const QUESTIONS = {
  intro: {
    type: 'score',
    instructions: 'This is the one-line hook shown under an architecture portfolio project title (`smallIntro`, for project `name`). How well does it work as a hook for a hiring architect skimming the portfolio?',
    criteria: [
      'Placeholder, empty, or an administrative label such as a course code or studio name, not a description of the project',
      'A generic phrase that could describe almost any project',
      'A real sentence about this project, but flat or vague',
      'A specific, vivid sentence that says what is distinctive about this project',
    ],
  },
  description: {
    type: 'score',
    instructions: 'This is the body text of an architecture portfolio project page (`description`, for project `name`). How finished is it as portfolio writing?',
    criteria: [
      'Placeholder text, empty, or a single stub line',
      'Thin: a short generic summary with no design idea or specifics',
      'Real prose with some specifics, but reads like a draft or a brief rather than a finished page',
      'Finished, specific prose that explains the design idea, context and decisions',
    ],
  },
  draft_signs: {
    type: 'noul',
    instructions: 'Does `description` or `smallIntro` contain obvious draft artifacts: placeholder wording, notes-to-self, TODOs, lorem ipsum, bracketed fill-ins, or text that plainly belongs to a different project than `name`?',
  },
};

async function judge(state) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch('https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'jev-latest', state, questions: QUESTIONS }),
    });
    if (res.ok) return res.json();
    if (res.status !== 429 && res.status < 500) throw new Error(`TypeSafe ${res.status}: ${await res.text()}`);
    await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
  }
  throw new Error('TypeSafe request failed after retries');
}

const files = fs.readdirSync(PROJECTS).filter((f) => f.endsWith('.yaml')).sort();
const rows = await Promise.all(files.map(async (f) => {
  const slug = f.replace(/\.yaml$/, '');
  const d = yaml.load(fs.readFileSync(path.join(PROJECTS, f), 'utf8')) ?? {};
  const images = [...new Set(imagesIn(d))].filter((p) => p !== d.coverImage && p !== d.sideImage);
  const missing = ['name', 'shortName', 'year', 'location', 'status', 'category', 'smallIntro', 'description']
    .filter((k) => !d[k]).concat(d.tags?.length ? [] : ['tags']);
  const r = await judge({ name: d.name, category: d.category, smallIntro: d.smallIntro ?? '', description: strip(d.description) });
  return {
    slug,
    public: PUBLIC.has(slug),
    featured: !!d.featured,
    missing,
    placeholder: /placeholder/i.test(`${d.smallIntro} ${d.description}`),
    cover: exists(d.coverImage),
    images: images.filter(exists).length,
    brokenImages: images.filter((p) => !exists(p)),
    intro: r.answers.intro.score,
    desc: r.answers.description.score,
    draft: r.answers.draft_signs.noul,
    tokens: r.usage.input_tokens,
  };
}));

// Policy lives here, not in the model. Thresholds are first guesses from the
// 2026-09-26 run, checked by eye against the lowest-scored pages.
for (const r of rows) {
  const textOk = r.intro >= 2 && r.desc >= 2.2 && r.draft < 0.5 && !r.placeholder;
  const imgOk = r.cover && r.images >= 3 && r.brokenImages.length === 0;
  r.verdict = textOk && imgOk && !r.missing.length ? 'ready' : !textOk && !imgOk ? 'far' : 'close';
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  const order = { ready: 0, close: 1, far: 2 };
  rows.sort((a, b) => order[a.verdict] - order[b.verdict] || b.desc - a.desc);
  const n = (x) => x.toFixed(1);
  console.log('verdict  pub  feat  slug                                   intro desc draft cover imgs  notes');
  for (const r of rows) {
    const notes = [r.placeholder && 'PLACEHOLDER', r.missing.length && `missing ${r.missing}`,
      r.brokenImages.length && `${r.brokenImages.length} broken`].filter(Boolean).join(', ');
    console.log(`${r.verdict.padEnd(8)} ${(r.public ? 'y' : '').padEnd(4)} ${(r.featured ? 'y' : '').padEnd(5)} ${r.slug.padEnd(38)} ${n(r.intro).padStart(5)} ${n(r.desc).padStart(4)} ${n(r.draft).padStart(5)} ${(r.cover ? 'y' : '-').padStart(5)} ${String(r.images).padStart(4)}  ${notes}`);
  }
  const count = (v) => rows.filter((r) => r.verdict === v).length;
  const tokens = rows.reduce((s, r) => s + r.tokens, 0);
  console.log(`\n${rows.length} projects: ${count('ready')} ready, ${count('close')} close, ${count('far')} far · ${tokens} input tokens (~$${(tokens * 0.042 / 1e6).toFixed(4)})`);
}

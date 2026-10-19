#!/usr/bin/env node
/**
 * Reader test for the Powerhouse evidence (section 1.1). Jev (TypeSafe) reads each slide's
 * visible text, as rendered by the dev server, and judges it as a first-time reader would.
 * Read-only: prints a table, changes nothing. Scores sort the worklist; they are not verdicts.
 *
 *   aihub run typesafe -- node scripts/jev-powerhouse.mjs [http://localhost:4322/projects/the-powerhouse]
 *   … --json   for the raw answers
 *
 * Numbers are not checked here — the build scripts check those against their sources.
 * Jev judges whether the page explains them.
 */
const KEY = process.env.TYPESAFE_API_KEY;
if (!KEY) {
  console.error('TYPESAFE_API_KEY not set. Run: aihub run typesafe -- node scripts/jev-powerhouse.mjs');
  process.exit(1);
}
const url = process.argv.find((a) => a.startsWith('http')) ?? 'http://localhost:4322/projects/the-powerhouse';

const THESIS =
  'An M.Arch thesis: the Powerhouse, an EV charging complex that turns the time spent charging into civic / community use. ' +
  'Section 1.1 (Electrification and Speed) argues the shift to electric is fast, its benefit depends on the grid, and home charging cannot serve everyone, so public charging will carry more of the load. ' +
  'The slides are the data behind that section.';

const QUESTIONS = {
  clarity: {
    type: 'score',
    instructions: 'Read `text` as a reader with no transport-data background. How easy is it to understand what is being counted and what the numbers mean?',
    criteria: [
      'Confusing: unclear what is counted, jargon unexplained, numbers without units or context',
      'Partly clear, but the reader has to work out several terms or what the numbers refer to',
      'Mostly clear; one or two terms or figures need explaining',
      'Clear throughout: each number says what it counts, and terms are explained in plain words',
    ],
  },
  argument: {
    type: 'score',
    instructions: 'Given `thesis`, how clearly does `text` connect its numbers to the thesis argument, so the reader knows why this slide is there?',
    criteria: [
      'No link: the data stands alone and the reader cannot tell why it matters to the thesis',
      'A weak or implied link the reader must infer',
      'A stated link, but general rather than tied to specific numbers',
      'Each key number is tied explicitly to a point in the thesis argument',
    ],
  },
  overload: {
    type: 'noul',
    instructions: 'Does `text` give the reader more figures than they can absorb, without saying which few matter most?',
  },
  unsupported: {
    type: 'noul',
    instructions: 'Does `text` state a projection, scenario or national estimate as if it were a measured local fact, or make a claim its own figures do not support?',
  },
  weakness: {
    type: 'choice',
    instructions: 'What is the single biggest problem a first-time reader would have with `text`, given `thesis`?',
    criteria: {
      too_many_numbers: 'Too many figures; the few that matter are not singled out',
      unexplained_terms: 'Technical terms or abbreviations (ports, Level 2, DC fast, PHEV, CAGR) used without plain explanation',
      unclear_counting: 'Unclear what is being counted or over which area and year',
      missing_why: 'The numbers are clear but the reader is not told why they matter to the thesis',
      mixed_sources: 'Figures from different years, areas or scenarios mixed without saying so',
      none: 'No real problem; the slide reads clearly and says why it matters',
    },
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

const html = await (await fetch(url)).text();
const text = (h) =>
  h
    .replace(/<(script|style|svg|select|nav)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;|&rsquo;/g, '’')
    .replace(/\s+/g, ' ')
    .trim();
const between = (startRe, endRe) => {
  const a = html.search(startRe);
  if (a < 0) return '';
  const rest = html.slice(a);
  const b = rest.slice(1).search(endRe);
  return rest.slice(0, b < 0 ? undefined : b + 1);
};

const parts = [
  ['evidence intro', between(/<div class="ph__evidence-intro"/, /<nav class="ph__nav"/)],
  ['01 united states', between(/<section id="usa"/, /<section id="california"/)],
  ['02 california', between(/<section id="california"/, /<section id="new-york"/)],
  ['03 new york', between(/<section id="new-york"/, /<section id="florida"/)],
  ['04 florida', between(/<section id="florida"/, /<section id="comparison"/)],
  ['05 comparison', between(/<section id="comparison"/, /<div class="ph__pager"/)],
].map(([name, h]) => [name, text(h)]);

const rows = await Promise.all(
  parts.map(async ([name, t]) => {
    const r = await judge({ thesis: THESIS, slide: name, text: t.slice(0, 12000) });
    const a = r.answers;
    return { name, words: t.split(' ').length, clarity: a.clarity.score, argument: a.argument.score, overload: a.overload.noul, unsupported: a.unsupported.noul, weakness: a.weakness.choice, weaknessP: a.weakness.confidence, tokens: r.usage?.input_tokens ?? 0 };
  })
);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  const n = (x) => (typeof x === 'number' ? x.toFixed(1) : '-');
  console.log('slide               words  clarity argument overload unsupported');
  for (const r of rows) console.log(`${r.name.padEnd(19)} ${String(r.words).padStart(5)}  ${n(r.clarity).padStart(7)} ${n(r.argument).padStart(8)} ${n(r.overload).padStart(8)} ${n(r.unsupported).padStart(11)}`);
  console.log('\nclarity / argument: 0–3, higher is better · overload / unsupported: 0–1, lower is better\n');
  for (const r of rows) console.log(`${r.name.padEnd(19)} main weakness: ${r.weakness} (confidence ${r.weaknessP.toFixed(2)})`);
  console.log(`\n${rows.reduce((s, r) => s + r.tokens, 0)} input tokens`);
}

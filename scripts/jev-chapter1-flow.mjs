#!/usr/bin/env node
/**
 * Reads Chapter 1 of the Powerhouse book in order and asks Jev (TypeSafe) whether each section
 * follows from the one before, repeats what came earlier, contradicts the thesis as it now
 * stands, and explains its own idea. Read-only: prints a table, or JSON with --json. The scores
 * sort the edit list; they are not verdicts.
 *
 *   aihub run typesafe -- node scripts/jev-chapter1-flow.mjs [--json]
 */
import fs from 'node:fs';

const KEY = process.env.TYPESAFE_API_KEY;
if (!KEY) {
  console.error('TYPESAFE_API_KEY not set. Run: aihub run typesafe -- node scripts/jev-chapter1-flow.mjs');
  process.exit(1);
}

const ARGUMENT =
  'Parking is idle public infrastructure; the Electric Vehicle Powerhouse is its electric version, turning it into a civic and community amenity. ' +
  'Each Powerhouse is entirely site-specific, placed where EV adoption is rising (New York first) and shaped by what the area lacks. ' +
  'The programme the community needs is the hook that brings people; charging is the outcome, the anchor that makes the site possible. ' +
  'It serves every road vehicle and every length of stay, from a 20-minute charge to an overnight rest, and people who do not charge at all. ' +
  'Paid programmes pay rent that keeps charging and the free programmes free.';

const book = JSON.parse(fs.readFileSync('src/data/powerhouse-book.json', 'utf8'));
const plain = (blocks) => blocks.map((b) => (typeof b === 'string' ? b : '')).join('\n\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+\n/g, '\n').trim();
const SECTIONS = [['1.0 A Sustainable Charging Anchor', 'ch1'], ['1.1 Electrification and Speed', '1-1'], ['1.2 The Architecture of the Stop', '1-2'], ['1.3 Charge Time', '1-3'], ['1.4 Public Space as Community', '1-4'], ['1.5 The Anchor', '1-5'], ['1.6 Argument, Objectives, and Scope', '1-6'], ['1.7 Theoretical Framework', '1-7']]
  .map(([title, key]) => ({ title, text: plain(book[key].body) }));

const QUESTIONS = {
  follows: {
    type: 'score',
    instructions: 'How well does `section.text` follow on from `previous.text`, so a reader moving from one to the next knows why this section comes now?',
    criteria: ['No link: it starts over or jumps topic', 'A weak link the reader has to infer', 'A clear link, but not stated', 'Picks up exactly where the previous section left off'],
  },
  repeats: {
    type: 'noul',
    instructions: 'Does `section.text` repeat facts, examples or claims already made in `earlier`, rather than building on them?',
  },
  contradicts: {
    type: 'noul',
    instructions: 'Does `section.text` say something that contradicts `argument`, for example that charging rather than the programme is what draws people, that the stop is a fixed short length, or that there are a fixed few kinds of site?',
  },
  explains: {
    type: 'score',
    instructions: 'How clearly does `section.text` explain its own main idea to a reader new to the subject?',
    criteria: ['Unclear what the section is arguing', 'The idea is there but buried', 'Clear, with some detours', 'One clear idea, well explained'],
  },
  weakness: {
    type: 'choice',
    instructions: 'Given `argument` and `earlier`, what is the single biggest problem with `section.text` in the flow of the chapter?',
    criteria: {
      repetition: 'It repeats what earlier sections already said',
      contradiction: 'It contradicts the argument as it now stands',
      missing_link: 'It does not connect to the section before or after',
      too_many_facts: 'Too many facts; the idea gets lost',
      unclear_idea: 'Its main idea is not clear',
      none: 'No real problem',
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

const rows = await Promise.all(
  SECTIONS.map(async (sec, i) => {
    const earlier = SECTIONS.slice(0, i).map((s) => `${s.title}\n${s.text}`).join('\n\n').slice(-14000);
    const previous = i ? SECTIONS[i - 1] : { title: '(start of chapter)', text: '' };
    const a = (await judge({ argument: ARGUMENT, earlier, previous, section: sec })).answers;
    return { section: sec.title, follows: a.follows.score, repeats: a.repeats.noul, contradicts: a.contradicts.noul, explains: a.explains.score, weakness: a.weakness.choice, weaknessP: a.weakness.confidence };
  })
);

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  console.log('section                                   follows repeats contradicts explains  weakness');
  for (const r of rows) console.log(`${r.section.padEnd(41)} ${r.follows.toFixed(1).padStart(7)} ${r.repeats.toFixed(2).padStart(7)} ${r.contradicts.toFixed(2).padStart(11)} ${r.explains.toFixed(1).padStart(8)}  ${r.weakness} (${r.weaknessP.toFixed(2)})`);
  console.log('\nfollows / explains: 0–3, higher is better · repeats / contradicts: 0–1, lower is better');
}

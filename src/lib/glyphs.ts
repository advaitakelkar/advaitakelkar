/**
 * The scramble alphabet — one source of truth for the glitch text effect.
 *
 * This used to be a literal pasted into three files (Base, SideNav, about),
 * free to drift. Everything that scrambles now imports from here.
 *
 * ── What's in it ─────────────────────────────────────────────────────────
 * Symbols, plus every exotic block Inter already carries: Greek, Cyrillic
 * (including Old Church Slavonic), polytonic Greek, IPA and Latin Extended.
 * All of it renders in Inter at the right weight and design, and costs
 * nothing but an extra font subset the first time a scramble runs.
 *
 * Deliberately Latin/Greek/Cyrillic only. A previous version borrowed twelve
 * Noto families for Devanagari, Tamil, Japanese and so on; it worked, but it
 * meant the effect rendered in a different typeface from the page around it.
 * If that comes back, it needs its own font <link> — Inter covers none of
 * those ranges, and an unbacked glyph renders as a tofu box.
 *
 * ── Rules for editing ────────────────────────────────────────────────────
 * 1. Base characters only. No combining marks (Unicode Mn/Mc/Me) — they
 *    attach to the preceding glyph instead of standing alone and render as a
 *    broken cluster. `pnpm lint:glyphs` enforces this.
 * 2. Stay inside Inter's coverage: latin, latin-ext, greek(+ext),
 *    cyrillic(+ext). Anything else needs a font shipped for it.
 * 3. Every glyph is equally likely, so a character repeated in a string is
 *    weighted twice. `#` is repeated deliberately.
 */

/** Symbols. The spine of the effect — always present, cost nothing. */
const SYMBOLS = '%$#@?*+=#-_[]{}<>/';

/** Inter covers these natively (latin-ext, greek, greek-ext, cyrillic-ext). */
const NATIVE = {
  greek:      'ΔΛΞΣΨΩΦΘΠΓ',
  cyrillic:   'ЖДБЯФЭЮЦЩЛИП',
  /** Old Church Slavonic letters — the strangest shapes Inter ships. */
  cyrArchaic: 'ꙄꙆꙈꙊꙌꙎꙐꙢꙤ',
  greekPoly:  'ἀἁᾶῆῶᾳῃῳἦὧ',
  ipa:        'ɐɔəɣɯʁʃʊʌʒɸθχ',
  latinAdd:   'ḂḊḞṀṖṠṪẀẄỲ',
  latinExtCD: 'ⱠⱢⱣⱤⱧꜰꜱꝆꝎ',
} as const;

/** The full alphabet the scrambler picks from. */
export const GLYPHS = SYMBOLS + Object.values(NATIVE).join('');

/** Grouped view — used by the preview page and the lint script. */
export const GLYPH_GROUPS = { symbols: SYMBOLS, ...NATIVE };

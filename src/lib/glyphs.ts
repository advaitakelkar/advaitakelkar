/**
 * The scramble alphabet — one source of truth for the glitch text effect.
 *
 * This used to be a literal pasted into three files (Base, SideNav, about),
 * free to drift. Everything that scrambles now imports from here.
 *
 * ── What's in it ─────────────────────────────────────────────────────────
 * Two tiers, because the site is set in Inter and Inter's coverage decides
 * whether a glyph costs anything:
 *
 *   NATIVE   Latin, Greek and Cyrillic — already inside Inter as loaded from
 *            Google Fonts. Renders at the right weight and design, and only
 *            pulls an extra subset the first time a scramble runs.
 *
 *   BORROWED Devanagari, Tamil, Kannada, Malayalam, Bengali, Telugu,
 *            Gujarati, Japanese, Korean, Hebrew, Arabic, Thai. Inter has none
 *            of these, so they come from Noto Sans, subsetted by Google to
 *            exactly the characters listed below (~22 KB for all twelve).
 *            See the <link> in Base.astro — its `text=` parameter is
 *            generated from BORROWED_TEXT, so the two cannot drift.
 *
 * ── Rules for editing ────────────────────────────────────────────────────
 * 1. Base characters only. No combining marks (Unicode Mn/Mc/Me) — they
 *    attach to the preceding glyph instead of standing alone and render as a
 *    broken cluster. `pnpm lint:glyphs` enforces this.
 * 2. Add a BORROWED character and you must not touch the font link by hand;
 *    it is derived. Re-run the build.
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

/** Not in Inter. Each maps to the Noto family that provides it. */
const BORROWED = {
  'Noto Sans Devanagari': 'कखगघङचछजझ',
  'Noto Sans Bengali':    'অআইঈকখগঘ',
  'Noto Sans Gujarati':   'અઆઇઈકખગઘ',
  'Noto Sans Tamil':      'அஆஇஈகஙசஞ',
  'Noto Sans Telugu':     'అఆఇఈకఖగఘ',
  'Noto Sans Kannada':    'ಅಆಇಈಕಖಗಘ',
  'Noto Sans Malayalam':  'അആഇഈകഖഗഘ',
  'Noto Sans JP':         'アイウエオカキクケコ',
  'Noto Sans KR':         'ㄱㄴㄷㄹㅁㅂㅅㅇ',
  'Noto Sans Thai':       'กขคฆงจฉช',
  /* Right-to-left. Safe only because scrambling elements carry
     `unicode-bidi: isolate` — without it these reorder the whole line
     mid-animation and characters jump to the wrong side. */
  'Noto Sans Hebrew':     'אבגדהוזח',
  'Noto Sans Arabic':     'بتثجحخدذ',
} as const;

/** Families in fallback order, for the font stack on scrambling elements. */
export const BORROWED_FAMILIES = Object.keys(BORROWED);

/** Every borrowed character — feeds the font link's `text=` parameter. */
export const BORROWED_TEXT = Object.values(BORROWED).join('');

/** The full alphabet the scrambler picks from. */
export const GLYPHS =
  SYMBOLS + Object.values(NATIVE).join('') + BORROWED_TEXT;

/** Font stack for an element mid-scramble: Inter first, then the Notos. */
export const GLYPH_FONT_STACK =
  `'Inter', ${BORROWED_FAMILIES.map((f) => `'${f}'`).join(', ')}, sans-serif`;

/** Grouped view — used by the preview page and the lint script. */
export const GLYPH_GROUPS = { symbols: SYMBOLS, ...NATIVE, ...BORROWED };

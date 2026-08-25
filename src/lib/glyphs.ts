/**
 * The scramble alphabet — one source of truth for the glitch text effect.
 *
 * Everything that scrambles imports from here. Four call sites do:
 * Base.astro, SideNav.astro, about.astro and projects/[slug].astro.
 *
 * ── What's in it ─────────────────────────────────────────────────────────
 * Nineteen symbols, no letterforms. Chosen by measuring advance widths in
 * Inter at 500 weight and keeping only the band close to the average letter
 * width (10.47px at 18px): the set spans 8.84px → 11.46px — 0.84 to 1.09 of
 * a letter — a 1.30× spread.
 *
 * That number is the whole point. The previous alphabet was 91 characters
 * across Greek, Cyrillic, Old Church Slavonic, polytonic Greek, IPA and two
 * Latin Extended blocks, spanning 5.58px → 22.22px — a 3.99× spread. Every
 * width the scrambler substitutes has to fit inside a box sized for the
 * original text, so that spread is exactly what forces TextScrambler.lock()
 * to pin width/height and set `white-space: nowrap` mid-animation. Two
 * documented layout bugs came out of that lock. Near-uniform widths make
 * most of it unnecessary.
 *
 * The second reason is cheaper to state: all nineteen live in Inter's
 * `latin` subset, which is already loaded at first paint. The old set
 * reached into five further Google Fonts subsets, so the first scramble on
 * a cold page kicked off up to five extra font downloads *while animating*.
 * Now it triggers none.
 *
 * ── Why these nineteen ───────────────────────────────────────────────────
 * Four density bands, so the effect still reads as texture rather than an
 * even grey. The directional group is deliberate: `< > « »` rhyme with the
 * chevron and cross in the icon family, so the scramble and the UI symbols
 * speak the same vocabulary.
 *
 * ── Rules for editing ────────────────────────────────────────────────────
 * 1. Symbols only. No letters from any script — that was the old approach
 *    and it is what dragged in the extra subsets.
 * 2. Stay inside Inter's `latin` subset (Basic Latin, Latin-1 Supplement,
 *    General Punctuation). Anything outside it costs a font request and may
 *    render as tofu.
 * 3. Base characters only. No combining marks (Unicode Mn/Mc/Me) — they
 *    attach to the preceding glyph and render as a broken cluster.
 * 4. Nineteen unique characters, no repeats. Every glyph is equally likely,
 *    so a repeat silently double-weights it. `pnpm lint:glyphs` enforces
 *    the count, the uniqueness and rules 3.
 * 5. Keep new entries inside the measured width band. A glyph much wider or
 *    narrower than a letter reintroduces the reflow this set exists to
 *    remove — `%` (17.40px) and `@` (17.69px) are the two to avoid.
 * 6. Confirm Inter actually draws it. The subset's unicode-range says what
 *    the file *may* cover, not what it does — `‡` U+2021 is inside `latin`
 *    and Inter has no glyph for it. `/glyphs` runs a per-glyph coverage test
 *    in the browser and says plainly if anything is falling back.
 */

/** Angular and directional — rhymes with the chevron/cross icon family. */
const DIRECTIONAL = '<>«»';

/** Operators. The technical spine of the set. */
const OPERATOR = '×+=~±÷¬';

/**
 * Editorial marks — the archival register the site already writes in.
 *
 * `‖` (U+2016) stands where `‡` (U+2021) was. A codepoint being inside the
 * `latin` subset's declared unicode-range does NOT mean Inter ships a glyph
 * for it: the range is what the file *may* cover. Inter has no double dagger,
 * so it silently fell back to a system serif — a different typeface, mid
 * animation, which is the exact failure this set exists to avoid. Verify
 * coverage in the browser (see /glyphs), never from the range table alone.
 */
const EDITORIAL = '§¶†‖';

/** The dense end of the ramp, for contrast against the hairline glyphs. */
const DENSE = '#$&*';

/** Grouped view — used by the preview page and the lint script. */
export const GLYPH_GROUPS = {
  directional: DIRECTIONAL,
  operator:    OPERATOR,
  editorial:   EDITORIAL,
  dense:       DENSE,
} as const;

/** The full alphabet the scrambler picks from. Nineteen unique symbols. */
export const GLYPHS = DIRECTIONAL + OPERATOR + EDITORIAL + DENSE;

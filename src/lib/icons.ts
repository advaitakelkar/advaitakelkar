/**
 * Types and geometry constants for the icon family.
 *
 * These live in a real module rather than in `Icon.astro`'s frontmatter
 * because `.astro` files do not emit type declarations — `import type { … }
 * from './Icon.astro'` fails the build. Anything that needs to annotate an
 * icon prop imports from here.
 */

/** Compass point a directional symbol should aim at. */
export type IconDir = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

export type IconName =
  | 'arrow'
  | 'chevron'
  | 'close'
  | 'check'
  | 'copy'
  | 'download'
  | 'home'
  | 'lock'
  | 'square'
  | 'circle';

/**
 * Degrees clockwise, measured from north-east — the orientation the site's
 * arrow is drawn at, and therefore the zero this system already used before
 * the family existed.
 */
export const ICON_ROT: Record<IconDir, number> = {
  ne: 0,
  e: 45,
  se: 90,
  s: 135,
  sw: 180,
  w: 225,
  nw: 270,
  n: 315,
};

/**
 * The orientation each symbol is actually drawn at, so `dir` means the same
 * thing for all of them: an arrow drawn north-east and a chevron drawn east
 * both point east at `dir="e"`.
 */
export const ICON_DRAWN_AT: Record<IconName, IconDir> = {
  arrow: 'ne',
  chevron: 'e',
  close: 'ne',
  check: 'ne',
  copy: 'ne',
  download: 'ne',
  home: 'ne',
  lock: 'ne',
  square: 'ne',
  circle: 'ne',
};

/** Rotation to apply to `name` so it points at `dir`, normalised to 0–359. */
export function iconTurn(name: IconName, dir: IconDir): number {
  const turn = ICON_ROT[dir] - ICON_ROT[ICON_DRAWN_AT[name]];
  return ((turn % 360) + 360) % 360;
}

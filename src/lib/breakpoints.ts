/**
 * The one breakpoint ladder.
 *
 *   compact    <  700    phones
 *   medium    700–1023   tablet portrait, phones in landscape
 *   expanded 1024–1365   tablet landscape, small laptops
 *   wide      >= 1366    desktop
 *
 * Every media query in the codebase uses one of these six strings. The `.98`
 * max complements make each min/max pair exhaustive and mutually exclusive —
 * that is what stops a viewport falling between two rules, the way 768px used
 * to fall between `max-width: 767px` and `min-width: 769px`.
 *
 * CSS custom properties cannot be used inside media queries, so the CSS side
 * repeats these numbers literally. Keep them in sync — `pnpm lint:bp` fails
 * the build if a stray value appears.
 */

export const BP = {
  md: 700,
  lg: 1024,
  xl: 1366,
} as const;

export const MQ = {
  /** < 700 — phones */
  compactDown: '(max-width: 699.98px)',
  /** >= 700 — tablet portrait and up */
  mediumUp: '(min-width: 700px)',
  /** < 1024 — phones and tablet portrait. The old "mobile" branch. */
  mediumDown: '(max-width: 1023.98px)',
  /** >= 1024 — tablet landscape and up. The old "desktop" branch. */
  expandedUp: '(min-width: 1024px)',
  /** < 1366 — everything below desktop */
  expandedDown: '(max-width: 1365.98px)',
  /** >= 1366 — desktop */
  wideUp: '(min-width: 1366px)',
} as const;

/** One-shot check. Prefer `watch` for anything that must survive a rotate. */
export const matches = (q: string): boolean =>
  typeof window !== 'undefined' && window.matchMedia(q).matches;

/**
 * Run `fn` now and again whenever the query flips.
 *
 * Several call sites used to read `innerWidth` once at load, so rotating a
 * tablet left them on the wrong branch until a reload. Returns a disposer.
 */
export function watch(q: string, fn: (matches: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia(q);
  const handler = (e: MediaQueryList | MediaQueryListEvent) => fn(e.matches);
  handler(mql);
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}

// Site-wide randomness helpers. Every per-load shuffle on the site goes
// through these, so random behaviour stays consistent and lives in one place.

/** Fisher-Yates shuffle, in place. Returns the same array for chaining. */
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Random selection of up to `n` items, original array untouched. */
export function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle([...arr]).slice(0, n);
}

/** Reorder an element's children randomly in the DOM. */
export function shuffleChildren(container: Element): void {
  shuffle(Array.from(container.children)).forEach(child => container.appendChild(child));
}

/**
 * Reorder an element's children to follow `order` — a permutation of each
 * child's original `data-index` value. Used to keep a shuffled-once
 * navigation sequence (computed at load) and the visible strip/deck in
 * lockstep, so stepping through them next/prev always lands on a DOM-adjacent
 * item instead of jumping around.
 */
export function reorderChildrenByIndex(container: Element, order: number[]): void {
  const children = Array.from(container.children) as HTMLElement[];
  order.forEach(originalIdx => {
    const el = children.find(c => parseInt(c.getAttribute('data-index') || '-1', 10) === originalIdx);
    if (el) container.appendChild(el);
  });
}

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

/**
 * Shuffle a flat list of children *within* its groups.
 *
 * `isDivider` marks the elements that pin the sequence — they keep their
 * order and their position, and only the run of children between two of them
 * is shuffled. The Skillset cloud uses this so the skills inside "Languages"
 * reshuffle on every load while the category labels stay put.
 */
export function shuffleWithinGroups(
  container: Element,
  isDivider: (el: Element) => boolean
): void {
  const out: Element[] = [];
  let run: Element[] = [];
  const flushRun = () => {
    if (run.length) out.push(...shuffle(run));
    run = [];
  };
  for (const child of Array.from(container.children)) {
    if (isDivider(child)) {
      flushRun();
      out.push(child);
    } else {
      run.push(child);
    }
  }
  flushRun();
  out.forEach((el) => container.appendChild(el));
}

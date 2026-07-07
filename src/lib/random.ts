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

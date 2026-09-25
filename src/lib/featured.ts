/**
 * Which projects the home slider features — switched live from /admin.
 *
 * The list lives in one Firestore document, config/featured, as
 * { ids: string[], t: ISO string }. Anyone may read it and only the owner may
 * write it (firestore.rules). The home page reads it over REST when it loads,
 * so a switch flipped in /admin shows on the live site without a rebuild.
 *
 * Each project's `featured:` in its YAML is the fallback: it is what the
 * slider shows before the document exists, and whenever the read fails or
 * takes too long.
 */
import { FIREBASE_PROJECT } from './analytics';

export const FEATURED_COLLECTION = 'config';
export const FEATURED_DOC = 'featured';

const URL_ =
  `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}` +
  `/databases/(default)/documents/${FEATURED_COLLECTION}/${FEATURED_DOC}`;

/**
 * The live featured list, or null when there is none to use — no document
 * yet, a network error, or no answer inside `timeoutMs`. Callers fall back to
 * the YAML flags on null.
 */
export async function fetchFeaturedIds(timeoutMs = 1500): Promise<string[] | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(URL_, { signal: ctrl.signal });
    if (!res.ok) return null;
    const json = await res.json();
    const values = json?.fields?.ids?.arrayValue?.values;
    if (!Array.isArray(values)) return null;
    return values.map((v: { stringValue?: string }) => v.stringValue).filter(Boolean) as string[];
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

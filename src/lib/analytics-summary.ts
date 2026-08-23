/**
 * Turns raw event documents into the numbers the console renders.
 *
 * Pure functions, no Firebase — so the aggregation can be reasoned about and
 * tested without a network. The console fetches a window of events once and
 * runs everything here in memory; a portfolio's volume is nowhere near enough
 * to need server-side aggregation.
 */

export interface Ev {
  t: string;      // ISO timestamp
  p: string;      // path
  cat?: string;   // page category
  r?: string;     // referrer host
  rc?: string;    // referrer class
  v: string;      // daily-rotating visitor hash
  s: string;      // session id
  d?: string;     // device class
  w?: number;     // viewport width
  lang?: string;
  tz?: string;
  hr?: number;    // visitor-local hour
  utm?: string;
  dur?: number;   // seconds on page
  scroll?: number;// percent
  depth?: string; // bounce | skim | read | deep
}

export const DEPTH_ORDER = ['bounce', 'skim', 'read', 'deep'] as const;

/** Referrer class → how to read it. Shown in the console so the label isn't cryptic. */
export const REFERRER_MEANING: Record<string, string> = {
  academic:  'schools, journals, architecture press',
  social:    'Instagram, LinkedIn, Behance',
  search:    'search engines',
  ai:        'AI assistants',
  portfolio: 'other portfolio platforms',
  direct:    'typed the URL or a bookmark',
  other:     'everywhere else',
};

const uniq = <T,>(xs: T[]) => new Set(xs).size;

export function headline(events: Ev[]) {
  const dwells = events.map((e) => e.dur ?? 0).filter((d) => d > 0).sort((a, b) => a - b);
  const median = dwells.length ? dwells[Math.floor(dwells.length / 2)] : 0;
  const engaged = events.filter((e) => e.depth === 'read' || e.depth === 'deep').length;
  return {
    visitors: uniq(events.map((e) => e.v)),
    sessions: uniq(events.map((e) => e.s)),
    views: events.length,
    medianDwell: median,
    engagedShare: events.length ? Math.round((engaged / events.length) * 100) : 0,
  };
}

/** Counts by an arbitrary key, ranked, with a long tail folded into "other". */
export function rank(events: Ev[], key: (e: Ev) => string | undefined, max = 8) {
  const counts = new Map<string, number>();
  for (const e of events) {
    const k = key(e);
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length <= max) return sorted.map(([label, n]) => ({ label, n }));
  const head = sorted.slice(0, max - 1);
  const tail = sorted.slice(max - 1).reduce((sum, [, n]) => sum + n, 0);
  return [...head.map(([label, n]) => ({ label, n })), { label: 'other', n: tail }];
}

/** One bucket per day across the window, zero-filled so gaps read as gaps. */
export function daily(events: Ev[], days: number) {
  const buckets = new Map<string, { views: number; visitors: Set<string> }>();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), { views: 0, visitors: new Set() });
  }
  for (const e of events) {
    const day = e.t.slice(0, 10);
    const b = buckets.get(day);
    if (!b) continue;
    b.views++;
    b.visitors.add(e.v);
  }
  return [...buckets.entries()].map(([day, b]) => ({
    day,
    views: b.views,
    visitors: b.visitors.size,
  }));
}

/** Visits by the visitor's OWN local hour — the student-vs-studio-hours signal. */
export function byHour(events: Ev[]) {
  const hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, n: 0 }));
  for (const e of events) {
    if (typeof e.hr === 'number' && e.hr >= 0 && e.hr < 24) hours[e.hr].n++;
  }
  return hours;
}

export function depthMix(events: Ev[]) {
  const counts = new Map<string, number>(DEPTH_ORDER.map((d) => [d, 0]));
  for (const e of events) {
    if (e.depth && counts.has(e.depth)) counts.set(e.depth, counts.get(e.depth)! + 1);
  }
  return DEPTH_ORDER.map((d) => ({ label: d, n: counts.get(d) ?? 0 }));
}

/**
 * The peer read. Not a demographic — a behavioural one, which is the honest
 * substitute for the age data a browser cannot give you.
 *
 * "Likely peers" = arrived from an academic or portfolio source AND actually
 * read something. A recruiter skims; someone from the field reads.
 */
export function audienceRead(events: Ev[]) {
  const bySession = new Map<string, Ev[]>();
  for (const e of events) {
    if (!bySession.has(e.s)) bySession.set(e.s, []);
    bySession.get(e.s)!.push(e);
  }
  let peer = 0, browsing = 0, passing = 0;
  for (const evs of bySession.values()) {
    const fromField = evs.some((e) => e.rc === 'academic' || e.rc === 'portfolio');
    const read = evs.some((e) => e.depth === 'read' || e.depth === 'deep');
    const multi = new Set(evs.map((e) => e.p)).size > 2;
    if (fromField && read) peer++;
    else if (read || multi) browsing++;
    else passing++;
  }
  const total = peer + browsing + passing || 1;
  return {
    peer, browsing, passing,
    peerShare: Math.round((peer / total) * 100),
    sessions: total,
  };
}

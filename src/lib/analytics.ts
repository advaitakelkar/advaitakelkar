/**
 * Cookieless visit collector.
 *
 * Writes one document per pageview straight to Firestore's REST API — no
 * Firebase SDK on public pages, so the whole thing is ~1.5 KB rather than the
 * ~120 KB the SDK would add to every route. The SDK loads only on /admin.
 *
 * ── Why no cookie ────────────────────────────────────────────────────────
 * Nothing is written to the device. Unique visitors are counted with a
 * daily-rotating fingerprint: SHA-256 over the UTC date plus a handful of
 * stable, low-entropy signals. The date in the hash means today's id cannot
 * be matched to yesterday's, so a person cannot be followed across days —
 * which is what keeps this out of cookie-consent territory. Same approach
 * Plausible and Fathom use.
 *
 * Its limit, stated plainly: two people on the same browser, OS, screen size
 * and timezone hash identically and count as one. On a portfolio's traffic
 * that is a small undercount, and it is the price of not tracking people.
 *
 * ── What it deliberately does not collect ────────────────────────────────
 * No IP (not reachable from client JS anyway), no precise location, no name,
 * no email, no age. Age is not exposed by any browser API; the audience
 * signals below answer "is this a peer" far better than a demographic bucket
 * would. See REFERRER_CLASSES and engagement depth.
 */

export const FIREBASE_PROJECT = 'advaitakelkar-site';
export const EVENTS_COLLECTION = 'events';

const ENDPOINT =
  `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT}` +
  `/databases/(default)/documents/${EVENTS_COLLECTION}`;

/**
 * Referrer buckets — the strongest "who is this" signal available.
 * A visit from a .edu domain or Archinect reads very differently from one
 * off a recruiter's LinkedIn tab.
 */
export const REFERRER_CLASSES: Record<string, RegExp> = {
  academic:   /\.(edu|ac\.[a-z]{2})$|scad\.edu|archinect|architizer|dezeen|archdaily/i,
  social:     /instagram|linkedin|behance|twitter|x\.com|facebook|threads|pinterest|reddit|tiktok/i,
  search:     /google|bing|duckduckgo|yandex|ecosia|brave|baidu/i,
  ai:         /chatgpt|openai|perplexity|claude|anthropic|gemini|copilot/i,
  portfolio:  /cargo|cargocollective|readymag|squarespace|wix|webflow|notion/i,
};

export function classifyReferrer(host: string): string {
  if (!host) return 'direct';
  for (const [name, re] of Object.entries(REFERRER_CLASSES)) {
    if (re.test(host)) return name;
  }
  return 'other';
}

/** Coarse device class — a proxy for context, not identity. */
function deviceClass(): string {
  const w = window.innerWidth;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (w < 700) return 'phone';
  if (w < 1024) return coarse ? 'tablet' : 'laptop-small';
  if (coarse) return 'tablet-landscape';
  return w >= 1600 ? 'desktop-large' : 'desktop';
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

/** The daily-rotating visitor id. Recomputed every day; never stored. */
async function visitorHash(): Promise<string> {
  const day = new Date().toISOString().slice(0, 10); // UTC date — the rotation
  const parts = [
    day,
    navigator.userAgent,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    `${screen.width}x${screen.height}`,
    String(screen.colorDepth),
  ];
  return sha256(parts.join('|'));
}

/** Firestore REST wants every value tagged with its type. */
function encode(obj: Record<string, unknown>) {
  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    if (typeof v === 'number') fields[k] = { integerValue: String(Math.round(v)) };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else fields[k] = { stringValue: String(v).slice(0, 300) };
  }
  return { fields };
}

/** Session id lives in sessionStorage only — dies with the tab, never persisted. */
function sessionId(): string {
  const KEY = 'ak_s';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2, 12);
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

/** Which part of the work the visitor is looking at. */
function pageCategory(path: string): string {
  if (path === '/') return 'home';
  if (path.startsWith('/projects/')) return 'project';
  if (path === '/projects') return 'index';
  if (path.startsWith('/tags/')) return 'tag';
  if (path.startsWith('/virtual-gods')) return 'exhibition';
  if (['/about'].includes(path)) return 'about';
  if (['/academic', '/work', '/freelancer', '/archv'].includes(path)) return 'category';
  return 'other';
}

/**
 * Self-exclusion flag.
 *
 * This is the one thing written to a device, and it is written only to devices
 * that ask to be left out. An opt-out marker is the recognised exception to
 * cookie-consent rules everywhere it matters — storing "do not record me" is
 * strictly necessary to honour the request, and it holds no identifier.
 *
 * Set it by loading any page with ?ignore=1 (and clear it with ?ignore=0), or
 * from the button in /admin. It has to be set once per device and per browser,
 * because there is deliberately nothing linking them.
 */
const IGNORE_KEY = 'ak_ignore';

export function readIgnoreFlag(): boolean {
  try { return localStorage.getItem(IGNORE_KEY) === '1'; } catch { return false; }
}

export function setIgnoreFlag(on: boolean): void {
  try {
    if (on) localStorage.setItem(IGNORE_KEY, '1');
    else localStorage.removeItem(IGNORE_KEY);
  } catch { /* storage blocked — nothing to do */ }
}

/** Applies ?ignore=1 / ?ignore=0 before any decision to record is taken. */
function applyIgnoreParam(): void {
  const p = new URLSearchParams(location.search).get('ignore');
  if (p === '1') setIgnoreFlag(true);
  else if (p === '0') setIgnoreFlag(false);
}

export async function trackPageview(): Promise<void> {
  // Honour Do Not Track and Global Privacy Control without argument.
  const nav = navigator as Navigator & { doNotTrack?: string; globalPrivacyControl?: boolean };
  if (nav.doNotTrack === '1' || nav.globalPrivacyControl) return;
  // Never record the owner reading their own dashboard, or localhost noise.
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;
  if (location.pathname.startsWith('/admin')) return;
  // Owner's own devices, once flagged.
  applyIgnoreParam();
  if (readIgnoreFlag()) return;

  const started = Date.now();
  let maxScroll = 0;
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0) maxScroll = Math.max(maxScroll, Math.round((window.scrollY / h) * 100));
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  let refHost = '';
  try {
    refHost = document.referrer ? new URL(document.referrer).hostname : '';
  } catch { /* malformed referrer — treat as direct */ }
  if (refHost === location.hostname) refHost = ''; // internal navigation

  const params = new URLSearchParams(location.search);
  const now = new Date();

  const base = {
    t: now.toISOString(),
    p: location.pathname,
    cat: pageCategory(location.pathname),
    r: refHost,
    rc: classifyReferrer(refHost),
    v: await visitorHash(),
    s: sessionId(),
    d: deviceClass(),
    w: window.innerWidth,
    lang: navigator.language,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    /* Local hour where the visitor is. Students and practitioners browse at
       different times; combined with referrer this is the peer signal. */
    hr: now.getHours(),
    utm: params.get('utm_source') ?? params.get('ref') ?? '',
  };

  const send = (extra: Record<string, unknown>) => {
    const body = JSON.stringify(encode({ ...base, ...extra }));
    // keepalive lets the request survive the page unloading.
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      mode: 'cors',
    }).catch(() => { /* analytics must never surface an error to a visitor */ });
  };

  // One write per pageview, sent on the way out so it carries dwell + depth.
  let sent = false;
  const finalise = () => {
    if (sent) return;
    sent = true;
    onScroll();
    const dur = Math.round((Date.now() - started) / 1000);
    send({
      dur,
      scroll: maxScroll,
      /* Engagement depth, precomputed so the dashboard doesn't have to:
         a recruiter skims, a peer reads. */
      depth: dur < 5 ? 'bounce' : dur < 30 ? 'skim' : dur < 120 ? 'read' : 'deep',
    });
  };

  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') finalise();
  });
  addEventListener('pagehide', finalise);
}

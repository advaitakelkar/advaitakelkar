# CLAUDE.md — Agent Guide for advaitakelkar-website

Everything an AI agent needs to work on this repo cold.

---

## Identity

**What it is:** Advaita Kelkar's personal portfolio site.  
**Live URL:** https://advaitakelkar-site.web.app (also https://advaitakelkar.com via Porkbun DNS → Firebase)  
**GitHub repo:** https://github.com/advaitakelkar/advaitakelkar  
**Branch:** `main` — all work happens here, no feature branches.

---

## Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | Astro 5 (static) | No SSR, pure SSG |
| Package manager | **pnpm only** — `npm install` hits an arborist version-parsing bug. (`npm run <script>` does work, but stick to pnpm so the lockfile stays single-source.) |
| Hosting | Firebase Hosting, project `advaitakelkar-site` |
| CI/CD | GitHub Actions `.github/workflows/deploy.yml` — fires on every push to `main` |
| CMS | Keystatic (local, dev-only, YAML-backed) — available at `localhost:4321/keystatic` when running `pnpm dev` |
| DNS | Porkbun → Firebase |

---

## Working Directory

```
~/Dev/advaitakelkar-live
```

**Never move this repo into `~/My Drive` or the CloudStorage mount.** Drive mirror mode created
filename-collision refs (`refs/heads/main (1)`) that permanently broke `git fetch` in the old
clone, and mangled `node_modules`. The old Drive-rooted clone and `~/Dev/advaitakelkar-website`
are both scrap. Git remote: `https://github.com/advaitakelkar/advaitakelkar`.

## Finishing the site

`COMPLETION.md` (this folder) is the live worklist for getting every project done and unlocked.
The `website` agent (`~/.claude/agents/website.md`) drives from it. Start there for content work.

---

## Deploy Flow

```
git push origin main
  → GitHub Actions runs
  → pnpm install --no-frozen-lockfile
  → pnpm build        (output: dist/)
  → firebase deploy   (→ advaitakelkar-site.web.app)
```

**Required GitHub Secret:** `FIREBASE_SERVICE_ACCOUNT` (Firebase service account JSON from Firebase Console → Project Settings → Service Accounts → Generate new private key).

**Manual deploy (skip CI):**
```bash
pnpm build
firebase deploy --only hosting
```

**Google Drive / git gotcha:** Drive sync can lag. If `git push` fails with a lock error, the `4-push.command` script clears the lock automatically. From code: `rm -f .git/index.lock` before pushing.

---

## Key Files

```
src/
  components/
    SideNav.astro       ← Fixed left 48px INDEX bar + slide-out nav panel
    Breadcrumb.astro    ← Top "Pages" pill dropdown navigation
    CategoryLayout.astro ← Layout for category archive pages
    ProjectList.astro   ← The projects page: header, search, filters, card stack
    ProjectStackCard.astro ← ONE card of that stack. Styles are is:global so the
                          category pages can render the same card.
    ImageLightbox.astro ← Desktop hover preview + phone scrub lightbox. Binds to
                          .project-card, so any page rendering ProjectStackCard
                          gets it by including this component once.
    Footer.astro        ← Site footer
    WayfindingNav.astro ← Project prev/next navigation

  layouts/
    Base.astro          ← HTML shell, <head>, fonts, global scripts
                          (scheme randomizer, text scramble, arrow hover)
    PageLayout.astro    ← SideNav + Breadcrumb + main content wrapper

  pages/
    index.astro         ← Home (intro, featured slider, about teaser, quick search)
    about.astro         ← About page
    404.astro           ← 404
    projects/index.astro     ← All projects listing
    projects/[slug].astro    ← Individual project detail
    [category].astro         ← Category archive (e.g. /studio-823)
    tags/[slug].astro        ← Tag archive (e.g. /tags/architecture)
                               Note: no inbound nav links — reachable by direct URL only

  styles/
    tokens.css          ← All design tokens + color schemes + base reset + utilities

  content/
    config.ts           ← Astro content collection schemas
    projects/           ← 72 YAML files (one per project)
    categories/         ← 4 YAML files: archv, faizan-khatri, scad, studio-823
    tags/               ← 18 YAML files

public/
  ak-logo.svg           ← AK monogram (used as CSS mask in SideNav)
  ak-favicon.svg        ← Browser favicon
  images/
    admin/
      profile.webp      ← Profile photo (used in about.astro)
    projects/           ← Project images, organized by project slug

.github/workflows/
  deploy.yml            ← Single CI workflow (see Deploy Flow above)

astro.config.mjs        ← Astro config (Keystatic dev-only integration)
firebase.json           ← Firebase Hosting config (public: dist, rewrites: /404)
.firebaserc             ← Firebase project: advaitakelkar-site
keystatic.config.ts     ← Keystatic CMS schema
package.json            ← pnpm scripts: dev, build, preview, sync, sync-notion
```

---

## ADMIN — the visitor console

`/admin` is a private analytics console. Not linked from anywhere, `noindex`,
excluded from the sitemap and disallowed in robots.txt.

### How it is secured

One password field, **real Firebase Auth behind it**. The email is fixed in
`src/lib/firebase-config.ts` and never typed, so it feels like a soft gate while
the password is actually checked by Google's servers and never ships in the
bundle. `firestore.rules` is the real boundary — it is enforced server-side, so
unlike `SiteLock` it cannot be walked past from devtools.

The Firebase `apiKey` in `.env` is **public by design**. It is an identifier,
not a secret. Do not try to hide it; protect the data with rules instead.

### How it collects

Cookieless. **Nothing is written to the visitor's device**, so there is no
consent banner and no GDPR exposure. Unique visitors come from a
**daily-rotating hash** — `SHA-256(UTC date + UA + language + timezone +
screen)`. The date in the hash is what makes it rotate: today's id cannot be
matched to yesterday's, so a person cannot be followed across days.

Its limit, stated in the console footer too: two people on the same browser, OS,
screen and timezone hash identically and count as one. Ad blockers suppress
some visits. The numbers are directional.

Public pages carry **~1.5 KB** — the collector posts straight to the Firestore
REST API. The Firebase SDK (~670 KB) loads on `/admin` only; check that stays
true if you touch `Base.astro`.

### Age data does not exist

A browser exposes no age, and never will. GA4's age buckets are inferred from
Google ad profiles — they need consent, a server-side key, and only cover a
sampled slice of signed-in users. **"Are these my peers?" is answered
behaviourally instead**, in `audienceRead()`: a session counts as a likely peer
when it arrives from an academic or portfolio referrer *and* actually reads
something. Referrer class, dwell depth, local hour and device are the signals.

### Charts

No categorical colour anywhere, deliberately — the site is monochrome across
seven schemes. Every panel encodes its value with **length or position** and a
single uniform fill, so no legend is needed and nothing depends on hue. The one
ramp is the hour strip, where darkness genuinely encodes magnitude; its steps
were validated for contrast (all ≥ 3:1 against the surface in both modes). Every
bar is direct-labelled and a table view of the same numbers sits below.

### Two traps

- **`<style>` on this page must be `is:global`.** Panel contents are injected
  with `innerHTML`, and injected nodes never receive Astro's scoping attribute —
  scoped rules silently fail to match and the console renders as unstyled text.
  Every selector is `.ad`-prefixed so nothing escapes.
- **The dispatch call sits at the bottom of the script.** The render helpers are
  `const`, so calling into them any earlier hits the temporal dead zone.

### Preview without data

`/admin?demo=1` on **localhost only** renders the whole console with synthetic
events. Gated on hostname, so it can never appear on the deployed site.

### Setup status

Done (22 Aug 2026):

- Web app created — `1:233978163356:web:09626d7b4b49795829fd59`
- `.env` written from `firebase apps:sdkconfig WEB` (gitignored)
- Firestore `(default)` database created, **location `nam5`** — permanent, cannot be changed
- `firestore.rules` + indexes deployed and verified against the live project:

  | check | result |
  |---|---|
  | anonymous read | PERMISSION_DENIED |
  | valid event write | allowed |
  | write with unexpected keys | PERMISSION_DENIED |
  | `dur` out of range | PERMISSION_DENIED |
  | write to another collection | PERMISSION_DENIED |

Still outstanding:

1. **Authentication is not initialised.** Console → Authentication → Get started
   → enable Email/Password → Users → Add user (`advaitakelkar@gmail.com`).
   Leave sign-up disabled. Probing `accounts:signInWithPassword` returns
   `CONFIGURATION_NOT_FOUND` until this is done, and `/admin` cannot sign in.
2. **Turn off self-signup** — Authentication → Settings → User actions →
   untick "Enable create (sign-up)". Firebase allows open self-registration by
   default: `accounts:signUp` was verified succeeding for an arbitrary address
   on this project. Also disable the **Google** provider unless something needs
   it; `/admin` only uses Email/Password.

   `isOwner()` no longer trusts "is signed in" for exactly this reason — it
   pins to `request.auth.token.email`. Swap that for the uid once the owner
   account exists (uid is stable; an address could in principle be changed).
3. `pnpm build && firebase deploy --only hosting` to start collecting.

Rules take up to a minute to propagate. A valid write rejected immediately
after a deploy is usually propagation, not a rules bug — retry before debugging.

`firestore.indexes.json` is deliberately empty: the console's only query filters
and orders on one field, and Firestore builds single-field indexes itself —
declaring one is rejected as unnecessary.

---

## The Design System

Three rules carry most of it. Breaking any of them is how the site drifted into
eleven breakpoints and 28 kinds of arrow in the first place.

### 1. One breakpoint ladder

Defined in `src/lib/breakpoints.ts`. **Three stops, six strings, nothing else.**

| Band | Range | Devices | Layout |
|---|---|---|---|
| compact | `< 700` | phones | one column; breadcrumb docks to the **bottom** |
| medium | `700–1023` | tablet portrait, phone landscape | one wide column, touch sizing |
| expanded | `1024–1365` | tablet landscape, small laptops | two column |
| wide | `>= 1366` | desktop | full editorial layout |

```css
@media (max-width: 699.98px)  { }   /* compact only     */
@media (min-width: 700px)     { }   /* medium and up    */
@media (max-width: 1023.98px) { }   /* compact + medium */
@media (min-width: 1024px)    { }   /* expanded and up  */
@media (max-width: 1365.98px) { }   /* everything below wide */
@media (min-width: 1366px)    { }   /* wide only        */
```

The `.98` complements make each min/max pair exhaustive and mutually exclusive.
That is the point: the old code mixed `max-width: 767px` with `min-width: 769px`,
so a viewport of exactly **768px — a 9.7" iPad in portrait —** matched neither.

`pnpm lint:bp` fails on any off-ladder query, and on any raw
`innerWidth < 900` comparison in JS (those drift from the CSS silently and do
not re-evaluate on rotate — use `matchMedia`, or `watch()` from the module).

**Prefer no breakpoint at all.** The home intro grid is
`repeat(auto-fit, minmax(18rem, 1fr))`, which lands on 1 / 2 / 3 columns at
exactly the widths the old hard-coded 1199px rule did — and keeps working at
widths nobody tested.

### 2. Spacing is fluid, never stepped

`--space--small|medium|big` and `--layout--gutter` are `clamp()` curves that
interpolate from the phone value to the desktop value, the same way the type
scale already did. They used to hard-swap at 768px, so one pixel of viewport
quadrupled the vertical rhythm.

Measured across 320–1700px, the largest single-step change is now **1.12×**.
If a change pushes that above ~1.5×, a cliff has been reintroduced.

The grid is **4px with a documented 2px sub-step**. Even values are legal;
odd ones are noise.

### 3. Components own their behaviour

`src/components/Icon.astro` is the whole symbol family — ten glyphs: arrow,
chevron, close, check, copy, download, home, lock, square, circle. Nothing
else in `src/` may contain a raw `<svg>` for a UI symbol; `pnpm lint:icons`
fails the build if one appears.

`Arrow.astro` still exists as a thin alias over `<Icon name="arrow" />`, so the
54 `<Arrow />` call sites keep working. Both are fine in new code.

The history is worth knowing, because it repeats: the arrow was pasted inline
55 times, got consolidated into `Arrow.astro`, and had **regrown to 18 inline
copies** by the time of the audit — while chevron, close, lock and four others
never got a component at all. 48 inline `<svg>`s were migrated in one pass.

**The spec** — 24-unit grid, fill none, stroke currentColor, **square caps,
miter joins**, set once in the component. Square+miter was already the
majority (32 of 51 stroked copies) and matches Inter's flat stem terminals.
Switching the family to round is a two-word edit in `Icon.astro`.

Direction is a prop, because it is genuinely contextual. Symbols are drawn at
their natural orientation and the component computes the rotation, so
`dir="e"` points east whether the glyph was drawn north-east (arrow) or east
(chevron):

```astro
<Icon name="arrow" />           <!-- ↗ outbound link          -->
<Icon name="arrow" dir="s" />   <!-- ↓ disclosure, open       -->
<Icon name="chevron" dir="w" /> <!-- ‹ previous               -->
<Icon name="lock" state="open" />
<Arrow />                       <!-- same as name="arrow"     -->
```

Three graphics are deliberately **not** in the family and are exempt in the
linter: the slider and project countdown rings (they animate their own
`stroke-dashoffset`), the Virtual Gods wheel (geometry derived from YAML) and
the admin sparkline. They are drawings, not symbols.

The random-rotation hover targets `[data-icon="arrow"]`, not every icon — a
spin is a "this goes somewhere" affordance, and a lock that pirouettes is
noise.

**Size comes from `--arrow-size`, never from raw `width`/`height`.** Three
steps, all in `em`, so an arrow always tracks the text beside it:

| token | value | used beside |
|---|---|---|
| `--arrow--sm` | `0.8em` | micro/ultrathin text — pills, tags, bubbles, inline links |
| `--arrow--md` | `1em` | body and heading text (the default) |
| `--arrow--lg` | `1.35em` | standalone rows, where the arrow is the affordance |

Set the step on the container: `--icon-size: var(--_tokens---arrow--sm);`.
Fifteen rules used to size the same glyph with `0.75 / 0.78 / 0.8 / 0.85em`
and `14 / 16 / 20 / 24px` — four spellings of one intent, and four of another.

`--icon-size` is the name going forward; **`--arrow-size` still works** and
every existing call site kept its size unchanged when the pen landed.

### The pen — stroke weight is a curve, not a constant

`stroke-width` used to be hard-coded `2.5` on the component, in *viewBox
units*. Because size is set in `em`, the two multiplied: the same arrow
rendered **0.67px** of stroke inside a 6.4px pill and **3.18px** inside a 30px
heading — a **4.75× spread** on what the component called "one stroke spec".
Small arrows went sub-pixel and disappeared on the tinted schemes; large ones
went blunt. Meanwhile Inter is loaded with an optical-size axis
(`opsz 14..32`), so the *type* gets relatively sturdier as it shrinks — the
icons were doing the exact opposite, and that mismatch is what reads as "the
arrows look inconsistent".

Now the weight is a shallow function of the glyph's own size:

```
pen = --pen--base  +  --pen--slope × --icon-size
    = 0.75px       +  0.03         × size
```

`vector-effect: non-scaling-stroke` takes the stroke out of the viewBox
transform so that value lands in real pixels. Result across the sizes actually
in use:

| size | 6.4px | 10.8px | 17.6px | 30.5px | spread |
|---|---|---|---|---|---|
| was | 0.67 | 1.13 | 1.83 | 3.18 | **4.75×** |
| now | 0.94 | 1.08 | 1.28 | 1.67 | **1.78×** |

Both numbers live in `tokens.css` and nowhere else. Raise `base` to thicken
the small end; raise `slope` to steepen the ramp back toward the old linear
behaviour.

`--pen-boost` adds a fixed amount on top of the curve. One real user: the
slider's knockout copy, which must be fractionally fatter than the arrow
beneath it to cover that arrow's anti-aliased rim. Expressed as a boost so it
tracks the curve instead of drifting when the curve is retuned.

Two traps, both of which have already bitten:

- **Never write a bare `.link-arrow { width: … }` in a page's style block.** It
  matches every arrow on that page. One in `about.astro` was harmless only
  while each arrow also carried its own explicit width; the moment those moved
  to `--arrow-size` it took over and blew arrows up to 400px.
- **Not every "arrow" is an `Arrow`.** `.pill-arrow` (tab pills) and
  `.filter-select-arrow` (the category chevron) are plain `<svg>` elements with
  no `link-arrow` class, so `--arrow-size` does nothing for them — they need
  real `width`/`height`. The tab-pill arrows are also deliberately **off** the
  em scale at a fixed 14px/20px: their label is display-sized, so an arrow
  tracking it would be 32px and dwarf the pill.
- **`getBoundingClientRect()` lies about arrow size.** The glyph is rotated, so
  a 40px arrow at 45° measures 56.6px (40 × √2). Measure `getComputedStyle().width`
  when auditing, or you will chase inconsistencies that do not exist.
- **A raw `width` on an icon now breaks its weight, not just its size.** The
  pen curve reads `--icon-size`; if a rule sets `width` directly the curve
  falls back to the `md` default and the icon is drawn with the wrong stroke.
  `.site-lock__btn svg { width: 16px }` did exactly this — a 16px arrow drawn
  at a 13.3px weight. Always set `--icon-size` and let the shared rule derive
  width and height from it. Four rules needed converting when the pen landed:
  `.sn-panel__arrow`, `.about-link-row__arrow`, `.home-slider__arrow
  .link-arrow` and `.site-lock__btn`.

`dir="ne"` deliberately emits **no** `data-dir` attribute — a `[data-dir]` rule
and a contextual one like `.page-toggle-btn .link-arrow` have equal
specificity, so emitting the default would win on source order and freeze every
arrow pointing north-east.

### The scramble alphabet

`src/lib/glyphs.ts` is the only place the glitch-text characters are defined —
they used to be a literal pasted into Base, SideNav and about.astro. **19
symbols across 4 density bands**, no letterforms:

```
directional  < > « »     rhymes with the chevron/cross icons
operator     × + = ~ ± ÷ ¬
editorial    § ¶ † ‖
dense        # $ & *
```

The set is chosen by **advance width**, not by looks. Measured in Inter at 500
weight, these span 8.84px → 11.46px against a 10.47px average letter — 0.84 to
1.09 of a letter, a **1.30× spread**. The previous 91-character alphabet
(Greek, Cyrillic, Old Church Slavonic, polytonic Greek, IPA, Latin Extended)
spanned 5.58px → 22.22px, a **3.99× spread** — 3.07× looser, and that is what
forced the width lock below.

All nineteen sit in Inter's **`latin`** subset, already loaded at first paint.
The old set reached into five further Google Fonts subsets, so the first
scramble on a cold page fired up to five extra font downloads *mid-animation*.
Now it fires none.

> Two earlier versions are worth not repeating. One borrowed twelve subsetted
> Noto families for Devanagari, Tamil, Japanese, Arabic and more (~22 KB,
> verified working) — reverted, because mixing Noto into an Inter page ran the
> effect in a different typeface. The other kept Greek/Cyrillic/IPA inside
> Inter, which fixed the typeface but kept the width spread and the extra
> subsets.

What keeps it from breaking:

- **Symbols only, exactly nineteen, all unique.** Every glyph is equally
  likely, so a repeat silently double-weights it. `pnpm lint:glyphs` enforces
  the count, uniqueness, symbols-only, the `latin` subset bound, and rejects
  combining marks. It also fails if any file hard-codes the alphabet —
  **case-insensitively**, which it did not do before: `projects/[slug].astro`
  carried its own lowercase `const glyphs = '…'` and passed the lint for as
  long as both existed.
- **Stay inside the measured width band.** `%` (17.40px) and `@` (17.69px) are
  the two obvious-looking symbols to avoid — both reintroduce the reflow this
  set exists to remove.
- **A unicode-range is not glyph coverage.** The subset's range says what the
  font file *may* cover, not what it does. `‡` U+2021 sits inside `latin` and
  Inter has no glyph for it, so it silently rendered in a fallback serif —
  the exact "effect runs in a different typeface" failure the Noto experiment
  was reverted for, reintroduced by one character. `‖` U+2016 replaced it.
  **`/glyphs` now runs a per-glyph coverage test in the browser** and says
  plainly if anything is falling back; the Node linter cannot see this, so
  check that page after touching the set.
- **Width lock.** `TextScrambler.lock()` still pins width/height and sets
  `white-space: nowrap` for the duration. With near-uniform widths this is now
  mostly belt-and-braces rather than load-bearing; it can probably be relaxed,
  but it has not been tested that way yet.

**`/glyphs`** renders every group and the effect on real headings. Not linked
from anywhere and not in the sitemap; it uses `Base` rather than `PageLayout`
so the nav chrome stays out of the way.

### Pills

Every pill on the site is the same object: rounded container, hairline border,
small label, trailing symbol. There was no shared primitive, so fourteen
implementations each re-declared it — **nine paddings, six borders, six gaps**,
including a `gap: 5.24px !important` that sits on no grid at all.

Four size steps, because four is what the content has. Forcing three would
either shrink the download pill or inflate the exhibition pill.

| token | value | used by |
|---|---|---|
| `--pill-pad--xs` | `4px 10px` | dense inline chips — credits, prompt, read-more |
| `--pill-pad--sm` | `6px 12px` | the standard pill — bubbles, skill tags, bio |
| `--pill-pad--md` | `8px 16px` | pills carrying a symbol — download, exhibition |
| `--pill-pad--lg` | `14px 22px` | section tabs, set in display type |

`--pill-pad--lg-compact` (`10px 18px`) is lg below the wide band. Gaps are
`--pill-gap--xs|--pill-gap|--pill-gap--lg`. Borders are three documented tiers
— `--pill-border` (house hairline), `--pill-border--mid` (dense chips that
must hold against body text), `--pill-border--strong` (the two emphatic CTAs)
— rather than six accidental ones.

**One deliberate visual change came out of this.** The footer's "supersmall"
field sized its labels at `calc(ultrathin * 0.75)` ≈ 7.5px, below the floor of
the five-level scale and genuinely hard to read. It now sits on `ultrathin`.
That makes the mobile footer about 135px taller at 390px — three more rows of
bubbles — which is the cost of legible labels.

### Motion

Three durations replace twelve. `--motion--fast` (0.15s) for state flips you
should not notice, `--motion--base` (0.25s) for the house transition,
`--motion--slow` (0.4s) for things that travel. 345 literals were converted;
two values had carried 70% of the traffic already, so the other ten were
incidental rather than designed.

Easing was never the problem — `ease` was doing 143 of 144 jobs. `--ease-out`
is the one named curve, for motion that decelerates into place.

`@keyframes` and `animation` timings were left alone: that is choreography,
not UI response.

### Interaction

- Every `:hover` rule sits inside `@media (hover: hover)`. On a touch tablet an
  unguarded hover state sticks after a tap. Rules that combined `:hover` with
  `:focus-visible` were **split**, so keyboard focus still works everywhere.
- `.tap-44` grows a control's *hit area* to 44px on coarse pointers using a
  centred pseudo-element, leaving its visual size untouched. Opt in per
  control; do not blanket-apply, several components already use `::after`.
- Regions that scroll with a hidden scrollbar get a fade. `initScrollFades()`
  in `Base.astro` finds them by inspection rather than by a maintained list,
  and marks them `data-more`; the fade itself is in `tokens.css`.

### Fixed-bar clearance

`--layout--bar` (52px) is the breadcrumb height. From 700px up the bar is
top-docked and `PageLayout` pads `.page-main` to clear it — **once, for every
route**. Below 700px the bar docks to the bottom and no clearance is needed.
Anything `position: fixed` has to offset itself (see `.project-dashboard-wrap`),
because page padding cannot move it.

---

## One card, two pages

The projects page and the category pages show the SAME card. Not two designs
that resemble each other — one component, `ProjectStackCard.astro`, rendered by
both. That is why its styles are `is:global`: an Astro scoped block carries the
component's own cid, so the moment a second page rendered a card, half the rules
would stop matching.

The same goes for the preview. `ImageLightbox.astro` holds the desktop hover
preview and the phone's frosted scrub lightbox, binds to `.project-card`, and a
page gets the whole behaviour by including it once.

### The phone shape, shared

Both pages use the same chassis below 700px, and they should keep using it:

- The title and a count sit on one line at the top, no fold control.
- The list runs `column-reverse` and grows UP out of the controls.
- The controls are fixed at the bottom, within a thumb's reach.
- One opaque seal sits behind the whole bottom stack at z-index 80 — above the
  unpositioned cards, below the fixed controls at 95.

Where the projects page puts a search field and a discipline selector, a
category page puts its own copy: the people row on top, then the short line,
then the description behind Read More. Category pages have NO search — the
pills on their cards hand the query to `/projects?q=` instead.

Heights in that stack are MEASURED, never written down. The card holds a people
row and a paragraph Read More can grow, and the breadcrumb dock moves with the
device's safe area. `CategoryLayout`'s script writes `--cat-dock-h`,
`--cat-card-h` and `--cat-tabs-h`; everything that has to clear the stack reads
those. Reach for a fixed pixel number here and it will be wrong on some phone.

### Specificity, again

`.cat-card-list` is scoped to CategoryLayout and therefore carries a cid, which
beats the global `.project-cards-container` rules whatever the source order.
Anything the category list must inherit from the shared stack is restated on
`.cat-card-list.project-cards-container`. Same trap as always: a media query
adds no specificity, so a same-class override only wins on source order, and a
scoped rule outranks a global one outright.

### About: three sections, one open, the closed ones docked

Below 700px About is three sections — Education, Journey, Skillset — and
exactly one is open. The closed rows ABOVE it stack at the top of the screen
and the closed rows BELOW it stack at the bottom, above the nav dock, so all
three titles stay on screen however far you scroll and each stays on the side
of the open section it lives on. The order never changes, so a title is
always where you last saw it.

`position: sticky` does that, not a fixed bar: a docked row keeps its place
in the flow and only pins once the scroll reaches it, so nothing has to be
reserved for it and a short page reads normally. The offsets are computed,
because each is a sum of measured row heights and the bottom stack also has
to clear the nav dock, whose height moves with the device's safe area. The
script writes them inline and publishes `--ab-bot-h` so the page can clear
the bottom stack; above 700 it clears all of it and the three sections go
back to being independent.

**A closed section is the same object as a collapsed project card**, so it is
drawn with that card's geometry rather than a second one invented for this
page: the name at `--type--medium` in the body weight, one line with an
ellipsis, the arrow immediately after the text instead of marooned on the far
edge, and one hairline under the row. The numbers are the card's own — 10/8 of
card padding plus 4 of header padding. The panel keeps the line that closes an
OPEN section and drops it when closed, so three shut sections stack with no
gap, exactly as the project list does.

The name, the role, the bio and its three buttons are the page header above
all three. They describe the person, not a section, so they sit outside every
dropdown and are always present — **at every width**, not just on the phone.
Journey's four sections stay a horizontal pill row at the top of
its panel, and a horizontal **swipe** across the section moves through them —
the row already looks like a sequence, so the gesture it looks like should
work. A swipe that is mostly vertical is the page scrolling, one shorter than
48px is a tap that wandered, and one starting inside the pill row is that row
scrolling; all three are ignored.

**Switching a section does not move the page.** The titles are docked, so the
only thing that changes is what sits between them; scrolling as well costs
the reader their place, and swiping through four sections would walk the page
back to the top each time.

Skillset's search **docks above the nav bar** — `position: fixed`, which
escapes the panel's `overflow: hidden`, so a `:has()` rule hides it while the
section is shut. The cloud itself reads top-down: Languages leads and every
group stacks below it. It ran `column-reverse` for a moment so the rows would
grow up out of the field; that put Languages at the bottom and the reading
order backwards, which is not worth the neatness.

**The search reduces the cloud, it does not dim it.** Typing `hindi` leaves
`Languages / Hindi` and nothing else. A group's label survives only if one of
its skills matched — it is the heading that makes "Hindi" mean something, not
a match in its own right — and because each pill's `data-keywords` carries its
category, typing a category name keeps the whole group.

The filtered pills are **moved to a detached holder**, not hidden in place.
The row engine ends its pass with `innerHTML = ''`, so anything still inside
the cloud when it runs is destroyed, and a filtered pill has to come back when
the query changes. Restore the full order before every repack, or the groups
come out in the order they last survived in.

A fixed bar of three pills stood here once and should not come back: it put
the navigation somewhere other than where the sections are, so the page had
two places saying the same thing. An earlier version of the docking moved the
headings in the DOM rather than sticking them, which is the same picture for
much more machinery.

**The markup is the same at every width** — only the drawing changes. The
identity header is no longer a disclosure at all; Education carries its own
title and arrow like the other two, and its panel is one full-width column.
That top block used to be an equal two-column grid, bio left and education
right, opened by an arrow on the name. Nothing relocates in script any more:
an earlier version moved the bio up beside the name below 700 and back into
the grid above it, which is two layouts to keep in step for no gain now that
the bio belongs above the sections at both.

## CSS Conventions

**All tokens** are in `src/styles/tokens.css`, referenced via CSS custom properties with the triple-dash prefix (matches original Webflow naming):

```css
var(--_tokens---color--bg)        /* page background */
var(--_tokens---color--fg)        /* foreground / text */
var(--_tokens---color--muted)     /* fg at 75% — raised from 60% for WCAG AA-large */
var(--_tokens---color--line)      /* borders */
var(--_tokens---color--bg-overlay) /* bg at 75% opacity */
var(--_tokens---color--bg-glass)   /* bg at 40% opacity */
var(--_tokens---font--body)        /* 'Inter' */
var(--_tokens---type--big)         /* clamp(3rem, 2rem+5vw, 6rem) */
var(--_tokens---type--medium)      /* clamp(1.375rem, .75rem+2vw, 2.5rem) */
var(--_tokens---type--small)       /* 1.125rem */
var(--_tokens---type--micro)       /* clamp(.75rem, .5rem+.6vw, .875rem) */
var(--_tokens---type--ultrathin)   /* clamp(.625rem, .58rem+.15vw, .72rem) */
var(--_tokens---space--micro)      /* 0.75rem */
var(--_tokens---space--small)      /* 3rem (mobile: 12px) */
var(--_tokens---space--medium)     /* 6rem (mobile: 24px) */
var(--_tokens---space--big)        /* 11rem (mobile: 48px) */
var(--_tokens---radius--small)     /* 0.5rem */
var(--_tokens---radius--medium)    /* 0.5rem */
```

**Frosted glass** (used in SideNav panel + Breadcrumb dropdown):
```css
background-color: color-mix(in srgb, var(--_tokens---color--bg) 35%, transparent);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
```

**Astro scoped styles:** `<style>` blocks in `.astro` files are auto-scoped. Use `:global()` only when targeting elements outside the component.

**Color schemes** are applied as a class on `<html>`. Persisted in `sessionStorage` key `'aks'`. Randomized on every page reload via inline script in `Base.astro`:

| `<html>` class | Name | BG | FG |
|---|---|---|---|
| *(none/default)* | Void | `#ffffff` / dark: `#111111` | `#111111` / dark: `#ffffff` |
| `sch1` | Moss | `#ECE7E2` | `#3D6355` |
| `sch2` | Clay | `#fee7d5` | `#4b3935` |
| `sch3` | Dusk | `#D7E7C3` | `#6C5383` |
| `sch4` | Midnight | `#D2B96A` | `#0B1A35` |
| `sch6` | Ember | `#ffe4a1` | `#97322D` |
| `sch7` | Nomad | `#edcdc2` | `#006076` |

Pool weights (in `Base.astro`): the pool holds 18 entries — Void 12/18 (~67%), the six
colour schemes 1/18 each (~5.6%).

---

## SideNav Architecture

`SideNav.astro` has two parts:

1. **INDEX bar** (always visible, `position: fixed`, left edge, 48px wide):
   - AK logo → links to `/`
   - Color scheme swatch button (opens dropdown)
   - Hamburger icon (opens the panel)
   - Vertical text label: `INDEX / [PAGE NAME]`

2. **Slide-in panel** (`.sn-panel`, `position: fixed`, slides in from left on hamburger click):
   - Frosted glass background
   - Header: name + bio
   - **Scroll wheel** (`.sn-panel__wheel` / `#sn-wheel`): infinite looping iPod-style list of all pages + projects
     - HTML ships ONE copy of the list (page weight); the script clones two more on init (`data-copies`) for seamless infinite scroll
     - `handleInfiniteWrap()` teleports scroll position when near edges
     - `scrollWheelToActive()` centers the active page on open using `getBoundingClientRect`
     - Tick sounds via Web Audio API on scroll
   - Contact section: email (copy to clipboard), LinkedIn, Instagram, Behance

---

## Breadcrumb Architecture

`Breadcrumb.astro` — top-left "Pages" pill that opens a dropdown.

- **Trigger:** `.breadcrumb__dropdown-trigger` — shows "Pages" or current project name; 55% opacity when idle
- **Desktop:** two-column grid — categories on left, projects on right (revealed on category hover)
- **Mobile:** single reversed list (DOM reversed + `scrollTop = scrollHeight` on open so Home is nearest thumb)
- **Mobile bar — the mark:** Back (40), Home, About, Projects, Pages (78).
  Whichever of the three you are on **shrinks to a 40px circle in its own
  slot** and shows its glyph instead of its word — house, square, circle —
  and the other two grow to take the width it gave up (92 each). You do not
  need to be told the name of the page you are looking at, and the two words
  left are the two places you can go.

  **Nothing reorders.** The three hold their positions and the control itself
  shrinks or grows, so what changes is the shape under your thumb rather than
  where everything sits. The mark was briefly given `order: -1` to sit beside
  Back, which made all three jump a slot on every navigation.

  On a project, a category or admin none of the three is active, so Home
  keeps the mark and the Pages pill names where you actually are. Each page
  is a fresh document, so the swap cannot be animated across a navigation —
  the existing `bc-active-in` fade on the active fill is what softens it.
- **Frosted glass** on the dropdown panel (same formula as SideNav)
- **Full invert on hover:** `background-color: var(--_tokens---color--fg); color: var(--_tokens---color--bg)`

---

## Global Scripts (Base.astro)

Three global scripts are injected into every page via `Base.astro`:

0. **Page swipe (phone only).** Home → About → Projects, in the order the nav
   bar lists them. Swipe left to go forward; the ends do not wrap. Only those
   three routes — every other page is somewhere you arrived FROM one of them,
   and a stray swipe there would throw away wherever you were.

   The guards are what make it usable rather than infuriating. It has to be
   mostly horizontal (1.5×) and travel 60px. **A gesture that STARTS inside
   something which scrolls sideways belongs to that thing** — the home slider,
   Journey's pill row, a card's thumbnail strip — so the handler walks up the
   ancestors looking for real overflow rather than keeping a list of selectors
   that will drift. `data-swipe-own` opts a region out by hand, for the two
   cases overflow cannot answer: the nav panel and the lightbox, which are
   surfaces over the page rather than part of it. Journey's panel carries it
   too, because it owns the same gesture one level down.

0b. **Keyboard scroll (phone only).** A field marked `data-scroll-end` takes
   the page to the end of the document when it is focused — the projects
   search and the skillset search. Both sit at the bottom of a list that grows
   UP out of them, so when the keyboard opens over the page, the end of that
   list, which is the part you are filtering, goes under it and you type at a
   list you cannot see. It scrolls three times: immediately, when the visual
   viewport reports its new height, and once on a timer for browsers that
   never fire that event. The document's height is different before and after
   the keyboard arrives, and all three calls land on the same place, so the
   extras cost a no-op.

0c. **Keyboard inset (phone only).** `position: fixed` is measured against the
   LAYOUT viewport, which a keyboard does not change, so a bottom-docked
   control keeps sitting where the keyboard now is; iOS then scrolls the page
   to reveal the focused field, lifting the whole bottom stack — nav bar
   included — and leaving a band of empty page between it and the keyboard.
   You lose that height twice.

   `visualViewport` knows the real inset. Base publishes it as **`--kb-h`**
   on the root with **`data-kb="open"`**, and the two docked layouts
   re-anchor: the breadcrumb dock steps out (`translateY(100%)` — it is
   behind the keyboard and unreachable anyway), the projects search sits on
   the keyboard's top edge with the selector above it, and the skillset
   search takes `max(--kb-h, --ab-dock-h)`. Bottom clearances are measured
   from the same number, or the scroll-to-end above lands the last rows
   behind the keyboard. The 120px floor keeps Safari's own toolbars from
   reading as a keyboard.


1. **Arrow rotation:** On hover over any `a, button, .project-card` etc., the `.link-arrow` SVG inside rotates to a random angle (smooth cubic-bezier transition).

2. **Text scramble (Matrix decode):** On hover, text inside `[data-scramble]` elements (or auto-detected headings/links) plays a character-scramble animation. The `getScrambleTarget()` function has careful exclusions (breadcrumbs, proj-bubbles, long paragraphs, mailto links).

---

## Content: Adding a Project

1. Create `src/content/projects/my-project-slug.yaml`
2. Add cover image to `public/images/projects/my-project-slug/cover.webp`
3. Set `coverImage: /images/projects/my-project-slug/cover.webp` in the YAML
4. Or use Keystatic CMS at `localhost:4321/keystatic` (run `pnpm dev` first)
5. After adding images, double-click `6-optimize-images.command` — resizes to max 1600px and recompresses (JPEG q72, same filenames). Keeps the site lightweight.

**YAML fields:**
```yaml
name: "Project Name"      # required
numbr: 1                  # sort order for home slider (lower = first)
year: "2024"
client: "Client Name"
location: "City, Country"
status: "Completed"
featured: true            # shows in home slider
smallIntro: "Tagline"
description: |
  <p>HTML content.</p>
collaborator: "Studio"
program: "Program Type"
coverImage: "/images/projects/slug/cover.webp"
multiImage:
  - "/images/projects/slug/img2.webp"
people:                   # avatar circles; names must match the PEOPLE registry
  - "Nayan Mote"
  - "Advaita Kelkar"
professors:               # who from `people` is a mentor ON THIS PROJECT
  - "Nayan Mote"
tags:
  - architecture
  - interior
category: studio-823      # must match a category slug in src/content/categories/
```

**People row rule:** professors render first, then one hairline divider, then
students. No professor → no divider. Samir Raut, Faizan Khatri, Siddhesh Kadam,
Casimir Esbach, Aaron Wilner, Michael Hill, and Catalina Pesea-Ogletree are
*always* professors (`PROFESSOR_NAMES`, duplicated in `projects/[slug].astro`
and `CategoryLayout.astro`). Everyone else is a student unless a project's
`professors:` field names them — that's how Nayan is a mentor on SHELF but a
collaborator on SOCIAL Wadala.

---

## Virtual Gods exhibition

An interactive exhibition at `/virtual-gods`, separate from the ARCHV project
page at `/projects/virtual-gods` (which links to it with an "Enter the
exhibition" pill).

```
src/content/exhibitions/virtual-gods.yaml   ← the whole exhibition, as data
src/layouts/ExhibitionLayout.astro          ← SideNav + lightbox surface; Esc walks up one level
src/components/VGWheel.astro                ← the circular diagram, redrawn as live SVG
src/components/VGStage.astro                ← a room: process left, active work centre, index right
src/pages/virtual-gods/index.astro          ← the wheel
src/pages/virtual-gods/[quadrant].astro     ← one group: modules → fusion → world
src/pages/virtual-gods/[quadrant]/[pair].astro  ← one pair: fusion, views, steps, modules, film
```

**Chrome:** the site's 44px INDEX rail stays visible and active (`pageName()` in
`SideNav.astro` maps every `/virtual-gods/*` route to "Virtual Gods"). Beside it
sits a fixed frosted **lightbox surface** (`.ex-lightbox`, z-index 90 — under the
side nav, over the page). No Breadcrumb, no Footer; the lightbox bar carries its
own trail and a Close that returns to `/projects/virtual-gods`.

**Room layout** (`VGStage`): process column on the left (stages + the way out),
the active work in the middle, its thumbnail index down the **right** edge — the
mirror of the project detail pages, which put the scrub on the left. Stages with
no surviving assets are dropped rather than rendered empty. The rail, the step
list and the arrow keys all call one `setActive()`.

**Structure:** four quadrants × (4 modules → 2 pair mergers → 1 world). The
wheel's geometry is *derived* from the YAML — radial position encodes the stage,
so never hardcode node coordinates.

**Assets.** Masters live in `source-files/virtual-gods/` (gitignored, ~1.3 GB,
Drive-synced). Run `bash scripts/build-vg-assets.sh` to regenerate the web assets
into `public/images/virtual-gods/vg/` (GIFs and .mov → mp4 + webm + poster;
stills → webp). Needs `brew install ffmpeg webp`. The script is idempotent —
delete `vg/` to force a full rebuild, and re-run it after changing CRF settings.

**Never put media masters in `public/`** — Astro copies `public/` into `dist/`
verbatim, so anything there is uploaded to Firebase whether or not a page
references it. That's how `dist/` once reached 1.7 GB.

**Missing by design:** Yash, Sohil and Jinal have no archived module GIF; the UI
renders them as dashed outlines rather than faking one. `publicFileExists()`
gates every film, methodology sheet and render, so absent assets drop their
whole section instead of 404-ing.

## The renders template

A visualisation project is not a set of pictures. It is a set of **rooms**,
each rendered from one or more **views**, and each view rendered several
times. Laid out flat, XBKC read as fifty-one works for one flat.

`template: "renders"` in the YAML, and the images go in `views:` — each with
the `room` it belongs to, the chosen `image`, and the `variations` behind it.
`src/components/RenderRooms.astro` is the whole template:

- **a tab per room**, in the order the rooms first appear, drawn as Journey's
  pill row is drawn — the open one inverted;
- **one image in the middle**, which walks that room's frames on its own:
  every view, and every variation of each. The variations are the point of a
  render study and nobody clicks through thirty-eight of them;
- **a ring** that is the clock — one rAF drives both it and the advance, so
  the bar can never disagree with what is on screen;
- **a rail** of that room's frames, which also drives it. Arrows on a
  pointer, swipe on a phone, and either one pauses.

**A card with views shows the cover alone.** A thumbnail strip that repeats
the same room six times says only "renders".

One layout at every width. The one thing that fights it is the page around
it: the card-page chassis is built to stand text beside a single image, with
fixed heights, its own grid rows, a fixed header the deck rolls under, and
several `display: … !important` rules on the picture parts. So the renders
block sits at the **end** of `[slug].astro`'s stylesheet, hides the scrub by
**id** (the rule that shows it carries an extra `:not()` and outranks an
attribute-plus-class selector however late it comes), stacks the page instead
of gridding it, and un-fixes the header on the phone — nothing rolls under
anything here.

## Notion / Drive / Website sync

Three systems hold this work. They **nest** rather than mirror — `Drive ⊂ Website ⊂ Notion` — so a project missing from Drive is normal, not drift.

| System | Holds | Scope |
|---|---|---|
| Website (this repo) | 52 YAML files in `src/content/projects/` | What's published |
| Notion — *Master Projects Database* | 150 rows | Full archive, published or not |
| Google Drive — `HUB/00 Projects` | 60 `STUDIO_Project` folders | Heavy source files only |

### Drive layout

```
HUB/
  00 Projects/          ← the archive: every project, heavy source files
  00 Selected/          ← the curated set: what is worth publishing
  01 Websites/          ← the GitHub repos (this one included)
```

**`00 Projects` and `00 Selected` are the same tree.** Bucket, then studio,
then project, with ARCHV going straight to projects because it has no studios:

```
ARCHV/<Project>
Academic/<BArch|MArch>/<Project>
Freelancer/<ADVT|NMS|Studio Stumbles|Various>/<Project>
Work/<823|ANLA|FKD>/<Project>
```

Those are the three axes the Notion contract already uses, so a folder's path
is its bucket and studio and nothing has to be kept in step by hand. An older
version of this file described `Website/`, `ALL/` and `_DELETE/` under
`00 Projects`; that split is gone — verified against the live mount
20 Sep 2026.

`00 Selected` holds **only the folders that have something in it** — it is
being built up, so a project with nothing chosen yet has no folder rather than
an empty one. Two folders sit outside the project tree and keep their
underscore so they sort first and read as staging: `_brand` (the logo files)
and `_unattributed` (assets whose project is not yet known).

Eighteen of its folders carry a `SOURCE.csv` — `new_name, original_name, tool,
source, sha256`. That is the provenance of a curated file, including which
were pulled from a GPT library; carry it through whatever publishes them.

Project folder *names* repeat between `00 Projects/` and `01 Websites/` — that's
expected: Drive holds the source files, the repo holds the web-sized images
under `public/images/projects/<slug>/`.

Re-sort after publishing or unpublishing a project:

```bash
node scripts/drive_reorg.cjs            # plan only
node scripts/drive_reorg.cjs --execute  # move folders
```

It reads the **live filesystem**, not the Drive API, and moves rather than
copies, so folder IDs (and therefore the `Drive Folder` links in Notion)
survive untouched.

**Trust the filesystem, not the Drive API.** `search_files` with `parentId =`
returns trashed folders as though they were live; the mounted Drive folder is
the truth. All 60 links in `notion_tidy.cjs` were verified against it.

**The website is the source of truth for published project data.**

### Scripts

```bash
pnpm sync-to-notion     # website -> Notion   (scripts/sync_to_notion.cjs)
pnpm sync-notion        # Notion  -> website  (scripts/sync_from_notion.cjs)
```

`sync-to-notion` pushes properties + rewrites each Notion page body below a
`Website Sync` heading. It never deletes rows. It is idempotent (hashes each
YAML file in `scripts/.notion-sync-state.json`) and resumable:

- `--dry-run` report only  · `--force` re-push everything
- `--only=<slug>` one project · `--no-body` properties only
- `--budget=<seconds>` stop cleanly and resume on the next run

**Never run both scripts in one session** — they point in opposite directions.
`sync_from_notion.cjs` can overwrite YAML and *deletes* local files with no
matching Notion row.

### The three axes

There is **no `Studio` column** in Notion. An older version of this file
described one; it was folded into `Category` and the contract below replaces
that section. Verified against the live schema 20 Sep 2026.

Three questions, three places to answer them — never two questions in one list:

| Axis | Question | Notion | Website |
|---|---|---|---|
| Bucket | Which part of the practice? | `Category`, 1st value | `category:` (4 files in `content/categories/`) |
| Studio | Made with whom? | `Category`, 2nd value | `studio:` (9 files in `content/studios/`) |
| Discipline | What is the work? | `Type` (single-select) | `tags:` (12 files in `content/tags/`) |

`Category` in Notion is a **multi-select holding a pair**, always
`[bucket, studio]` — e.g. `["🏢 Work", "FKD"]`. ARCHV is the exception and
carries no studio.

| Bucket | Studios under it |
|---|---|
| 🏢 Work | FKD → `faizan-khatri`, Studio 823, ANLA |
| 🎓 Academic | SCAD, BARCH → `barch` |
| 💡 Freelance | ADVT, Varun, NMS, Studio Stumbles |
| 🏛️ ARCHV | *(none)* |

**`tags:` is the discipline axis and nothing else.** One per project, mirroring
Notion `Type`. Putting a studio in here is what grew the filter bar to 17
entries answering two unrelated questions, left 3 filters dead and 4 returning
a single project, and printed `SCAD` twice on the same card. Studio sub-pages
(`/work/<studio>`) read `studio:`, and a studio only gets a page once a project
is published under it.

Site spelling wins where the two differ: Notion `Visualization`, site
`visualisation`. Notion `Artwork` and `Product Design` both map to `artwork`.

**`ARCHV` is capitalised on purpose.** Notion compares select-option names
case-insensitively and refuses case-only renames, so the site's `archv` reuses
the existing `ARCHV` option. `CATEGORY_ALIASES` in `sync_to_notion.cjs` handles
the translation — don't "fix" it.

### Column contract

One job per column — if two columns say the same thing, one is wrong.

| Column | Job | Filled when |
|---|---|---|
| `Category` | Bucket + studio, in that order | Always |
| `Type` | The discipline, one value | Always |
| `Drive Folder` | URL to where the files live | When a Drive folder exists |
| `Slug` | YAML filename; how rows are matched | Published only, machine-written |
| `Website` / `Featured` | Intent flags | Manual |

**Nothing is ever deleted** — duplicates are flagged, not removed.

### Views

`All Projects by Studio` (board) · `On the Website` (the 52) ·
`Website flag mismatch` (ticked but not live) · `Review Queue` (parked rows).

The old `⚠️ OLD Website Selected — safe to delete` tab keeps a broken
`Category = SCAD` filter that the API cannot clear; delete it by hand in Notion.

### Notion conventions

- `Slug` matches the YAML filename and is how rows are matched. Machine-written.
- Anything below the `Website Sync` heading on a project page is regenerated
  every sync. Notes written *above* it are preserved.
- The nav bar on every page is one synced block whose original lives on **Home**
  (`scripts/notion_nav.cjs` propagates it; `--refresh` rebuilds the page list).
- Reference: the **Sync Map** page in Notion, under HUB.

## Visual Verification

Run the responsive harness — do not deploy just to look at something.

```bash
pnpm dev                       # in one shell
pnpm shoot before              # reference set
# ...make changes...
pnpm shoot after
pnpm shoot --diff before after
```

`scripts/shoot.mjs` drives headless Chromium (Playwright) over every route at
the nine widths that bracket the ladder, and writes two things to `review/`
(gitignored): full-page PNGs, and a **layout fingerprint** per route/width.

The fingerprint is the half that matters. Byte-comparing PNGs during a token
change reports "everything moved" and tells you nothing; the fingerprint diffs
as `home@834 gutter 100 → 32`. It also reports three standing checks on every
run, each of which has already caught a real bug:

- **horizontal overflow** — any width where the document scrolls sideways
- **clipped, no fade** — text cut off with no affordance saying more exists
- **content under fixed bar** — page content hidden behind the breadcrumb

Both Firecrawl and the in-app browser reach this site fine — localhost and the
live domain. An older note here claimed neither could; that is out of date.

---

## Common Gotchas

- **Never set a form field below 16px on the phone.** Safari on iPhone zooms
  the whole page in when you focus an input smaller than that, and nothing
  zooms it back — you are left pinching out of a page you only wanted to type
  in. Every field on this site was set in `--type--micro` (12–14px), so every
  one of them did it. The floor is enforced once, in `tokens.css`, for the
  compact band. It carries `!important` because each field sizes itself from
  a class inside a scoped component block, and a class beats an element
  selector whatever the source order; that rule is not a style preference
  competing with them, it is the platform's threshold. The other fix,
  `maximum-scale=1` on the viewport meta, works by taking pinch-zoom away
  from everyone — a real accessibility cost to solve a typography one.

- **Always `pnpm`**, never `npm` or `yarn`
- **Build before pushing** to catch TypeScript/Astro errors: `pnpm build`
- **Google Drive lag:** If git index.lock errors appear, `rm -f .git/index.lock`
- **`offsetTop` is wrong inside `.sn-panel` (position: fixed)** — use `getBoundingClientRect()` for measurements inside the panel
- **Scheme tokens have triple-dash:** `--_tokens---color--bg` not `--tokens-color-bg`
- **No `.mdx` files** — all content is YAML. `@astrojs/mdx` has been removed.
- **Profile photo** is `public/images/admin/profile.jpg` (real photo; the old `profile.webp` was just a copy of the placeholder)
- **`/type/*` route removed** — canonical category URL is `/<category-slug>` via `[category].astro`
- **PDF links** (`advaita-kelkar-portfolio.pdf`, `advaita-kelkar-resume.pdf`) auto-hide until the files exist: `publicFileExists()` in `src/lib/content.ts` checks `public/` at build time (used in index, about, SideNav). Drop the PDFs into `public/` and rebuild — links reappear everywhere on their own.
- **Placeholder copy never renders**: `realText()`/`isPlaceholder()` in `src/lib/content.ts` filter any `smallIntro`/`description` containing "placeholder" out of pages, cards, the home slider, and meta descriptions. On project detail pages the placeholder text is still present with `data-edit-only`, so inline edit mode can replace it.

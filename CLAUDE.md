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

The project lives inside Google Drive:

```
/Users/adi/Library/CloudStorage/GoogleDrive-advaitakelkar@gmail.com/
  My Drive/HUB/01 Websites/advaitakelkar-website/
```

Always `cd` to that full path before running any command. Git remote: `https://github.com/advaitakelkar/advaitakelkar`.

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
    ProjectList.astro   ← Reusable project grid/list
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

`src/components/Arrow.astro` is the only arrow. The markup used to be pasted
inline 55 times across 10 files, each free to drift in stroke-width and cap.
Direction is a prop, because it is genuinely contextual:

```astro
<Arrow />            <!-- ↗ outbound link (default) -->
<Arrow dir="s" />    <!-- ↓ disclosure, open        -->
```

`dir="ne"` deliberately emits **no** `data-dir` attribute — a `[data-dir]` rule
and a contextual one like `.page-toggle-btn .link-arrow` have equal
specificity, so emitting the default would win on source order and freeze every
arrow pointing north-east.

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

## CSS Conventions

**All tokens** are in `src/styles/tokens.css`, referenced via CSS custom properties with the triple-dash prefix (matches original Webflow naming):

```css
var(--_tokens---color--bg)        /* page background */
var(--_tokens---color--fg)        /* foreground / text */
var(--_tokens---color--muted)     /* fg at 60% opacity */
var(--_tokens---color--line)      /* borders */
var(--_tokens---color--bg-overlay) /* bg at 75% opacity */
var(--_tokens---color--bg-glass)   /* bg at 40% opacity */
var(--_tokens---font--body)        /* 'Inter' */
var(--_tokens---type--big)         /* clamp(3rem, 2rem+5vw, 6rem) */
var(--_tokens---type--medium)      /* clamp(1.375rem, .75rem+2vw, 2.5rem) */
var(--_tokens---type--small)       /* 1.125rem */
var(--_tokens---type--micro)       /* clamp(.75rem, .4rem+.8vw, 1rem) */
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
| `sch1` | Moss | `#ECE7E2` | `#4A7766` |
| `sch2` | Clay | `#fee7d5` | `#4b3935` |
| `sch3` | Dusk | `#D7E7C3` | `#6C5383` |
| `sch4` | Midnight | `#D2B96A` | `#0B1A35` |
| `sch6` | Ember | `#ffe4a1` | `#97322D` |
| `sch7` | Nomad | `#edcdc2` | `#0093AF` |

Pool weights (in `Base.astro`): Void has 6/12 probability (50%), others 1/12 each (~8%).

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
- **Frosted glass** on the dropdown panel (same formula as SideNav)
- **Full invert on hover:** `background-color: var(--_tokens---color--fg); color: var(--_tokens---color--bg)`

---

## Global Scripts (Base.astro)

Two global scripts are injected into every page via `Base.astro`:

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
  00 Projects/          ← the project database (heavy source files)
    Website/            ← 45 folders: projects live on the site
    ALL/                ← 15 folders: everything else
    _DELETE/            ← quarantine: 01_Confirmed_Duplicates, 02_Old_Working_Folders,
                          03_Superseeded, 04_Backup_Files
    Project-PDFs/
  01 Websites/          ← the GitHub repos (this one included)
```

Every project folder lives in **exactly one** of `Website/` or `ALL/` — they are
mutually exclusive, never copies. Nothing sits loose at the top level.
Membership is decided by Notion's `Category` (filled = published), which is
itself written from this repo's YAML, so the split is derived, not hand-kept.

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

### The two groupings

Every Notion row carries both, so neither hierarchy is lost:

- **`Studio`** — original studio / Drive folder: `823`, `ADVT`, `ANLA`, `ARCHV`,
  `BARCH`, `FKD Workshop`, `FREE`, `Pragrup`, `SCAD`, `Studio Mumbai`. Matches
  the `STUDIO_Project` folder names in Drive.
- **`Category`** — this site's four buckets: `academic`, `ARCHV`, `freelancer`, `work`.

| Studio | Site category |
|---|---|
| SCAD, BARCH | `academic` |
| 823, FKD Workshop | `work` |
| FREE, ADVT, ANLA | `freelancer` |
| ARCHV | `ARCHV` |
| Pragrup, Studio Mumbai | *not published* |

**`ARCHV` is capitalised on purpose.** Notion compares select-option names
case-insensitively and refuses case-only renames, so the site's `archv` reuses
the existing `ARCHV` option. `CATEGORY_ALIASES` in `sync_to_notion.cjs` handles
the translation — don't "fix" it.

### Column contract

One job per column — if two columns say the same thing, one is wrong.

| Column | Job | Filled when |
|---|---|---|
| `Studio` | The spine; mirrors the Drive folder prefix | Always |
| `Category` | The website's bucket | Published only — **blank means not on the site** |
| `Drive Folder` | URL to where the files live | When a Drive folder exists (12 today) |
| `Slug` | YAML filename; how rows are matched | Published only, machine-written |
| `Website` / `Portfolio` | Intent flags | Manual |
| `Review` | Flags duplicates/placeholders instead of deleting | Only rows needing attention |

`Studio` answers *whose work is it*; `Category` answers *is it published*. The
one-off `scripts/notion_tidy.cjs` enforced this: it cleared `Category` on the 97
unpublished rows where it merely repeated `Studio`, flagged 6 duplicate and
placeholder rows via `Review`, linked 12 Drive folders, and dropped three unused
misspelled `Type` options. It is idempotent and safe to re-run.

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

Firecrawl still cannot reach this site. The older note here also claimed Chrome
MCP could not — that is no longer true; localhost and the live domain both load
fine in the in-app browser.

---

## Common Gotchas

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

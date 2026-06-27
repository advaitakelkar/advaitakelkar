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
| Package manager | **pnpm only** — `npm` errors on this repo (arborist version-parsing bug) |
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
    PasswordGate.astro  ← Password-protected project gate
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
      placeholder.webp  ← Fallback cover image when no coverImage set
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

Pool weights (in `Base.astro`): Void has 3/9 probability (~33%), others 1/9 each (~11%).

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
     - Triple-copy DOM (`[0,1,2].map(...)`) for seamless infinite scroll
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
tags:
  - architecture
  - interior
category: studio-823      # must match a category slug in src/content/categories/
```

---

## Visual Verification

**Cannot use Chrome MCP or Firecrawl** to verify this site — both block the live domain and localhost. The only reliable way to check visual changes is: deploy → ask Advaita for a real-browser screenshot.

---

## Common Gotchas

- **Always `pnpm`**, never `npm` or `yarn`
- **Build before pushing** to catch TypeScript/Astro errors: `pnpm build`
- **Google Drive lag:** If git index.lock errors appear, `rm -f .git/index.lock`
- **`offsetTop` is wrong inside `.sn-panel` (position: fixed)** — use `getBoundingClientRect()` for measurements inside the panel
- **Scheme tokens have triple-dash:** `--_tokens---color--bg` not `--tokens-color-bg`
- **No `.mdx` files** — all content is YAML. `@astrojs/mdx` has been removed.
- **Profile photo** is `profile.webp` not `profile.jpg`
- **`/type/*` route removed** — canonical category URL is `/<category-slug>` via `[category].astro`
- **PDF links** in index/about pages (`advaita-kelkar-portfolio.pdf`, `advaita-kelkar-cv.pdf`) reference files that don't exist yet in `public/` — these are broken links until Advaita uploads the files

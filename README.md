# advaitakelkar-website

Portfolio site for **Advaita Kelkar** — multidisciplinary designer based in Mumbai / Savannah.

Live: [advaitakelkar-site.web.app](https://advaitakelkar-site.web.app)
Repo: [github.com/advaitakelkar/advaitakelkar](https://github.com/advaitakelkar/advaitakelkar)

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Astro 5 (static site generation) |
| Package manager | pnpm (required — npm has a version-parsing bug with this repo) |
| Hosting | Firebase Hosting (`advaitakelkar-site` project) |
| CI/CD | GitHub Actions (auto-deploy on push to `main`) |
| CMS | Keystatic (local YAML-based, no database) |
| DNS | Porkbun → Firebase |

---

## Quick Start

```bash
# 1. Install dependencies
pnpm install --no-frozen-lockfile

# 2. Start dev server
pnpm dev
# → http://localhost:4321       (site)
# → http://localhost:4321/keystatic  (CMS)
```

Or double-click **`1-setup.command`** in Finder.

---

## Folder Structure

```
advaitakelkar-website/
│
├── src/
│   ├── content/                  ← All CMS data (YAML files)
│   │   ├── config.ts             ← Collection schemas
│   │   ├── projects/             ← 52 project files (one per project)
│   │   ├── categories/           ← 6 category files
│   │   └── tags/                 ← 11 tag files
│   │
│   ├── components/
│   │   ├── SideNav.astro         ← Fixed left INDEX bar + slide-out nav panel
│   │   └── Breadcrumb.astro      ← Top breadcrumb (HOME // ABOUT ME // PROJECTS)
│   │
│   ├── layouts/
│   │   ├── Base.astro            ← HTML shell, head, font imports
│   │   └── PageLayout.astro      ← SideNav + Breadcrumb + main content wrapper
│   │
│   ├── pages/
│   │   ├── index.astro           ← Home page
│   │   ├── about.astro           ← About page
│   │   ├── 404.astro             ← 404 page
│   │   ├── projects/
│   │   │   ├── index.astro       ← Projects listing
│   │   │   └── [slug].astro      ← Individual project detail
│   │   ├── tags/
│   │   │   └── [slug].astro      ← Tag archive page
│   │   └── type/
│   │       └── [slug].astro      ← Category archive page
│   │
│   └── styles/
│       └── tokens.css            ← Design tokens + 10 color schemes
│
├── public/
│   ├── ak-logo.svg               ← AK monogram logo (used via CSS mask)
│   ├── favicon.svg
│   └── images/projects/          ← All project images (25 currently)
│
├── .github/workflows/
│   └── deploy.yml                ← CI: pnpm install → build → Firebase deploy
│
├── 1-setup.command               ← Double-click: install deps + start dev server
├── 4-push.command                ← Double-click: git add/commit/push + open CI
├── designer.html                 ← Responsive preview tool (open in browser)
├── astro.config.mjs
├── firebase.json
├── .firebaserc                   ← Firebase project: advaitakelkar-site
├── keystatic.config.ts
└── package.json
```

---

## Pages

| Route | File | Description |
|---|---|---|
| `/` | `pages/index.astro` | Home — intro, featured slider, quick search |
| `/about` | `pages/about.astro` | About page |
| `/projects` | `pages/projects/index.astro` | All projects listing |
| `/projects/[slug]` | `pages/projects/[slug].astro` | Individual project |
| `/tags/[slug]` | `pages/tags/[slug].astro` | Projects by tag |
| `/type/[slug]` | `pages/type/[slug].astro` | Projects by category |
| `/404` | `pages/404.astro` | 404 |

---

## Home Page Sections

The home page (`src/pages/index.astro`) has five sections in order:

1. **Intro** — two-column: label ("Multidisciplinary Designer · Mumbai") + description paragraph
2. **Featured slider** — auto-scrolling (4s), horizontal scroll-snap, dot indicators. Only projects with `featured: true` appear here, sorted by `numbr`.
3. **About Me teaser** — caption + large "About Me →" link
4. **Portfolio teaser** — caption + large "Portfolio →" link
5. **Quick Search** — live-filtering grid of all 52 projects (tag, year, name). Client-side JS, no server calls.

---

## Design System

### Color Schemes

10 color schemes are defined in `src/styles/tokens.css` and applied as a class on `<html>` (e.g. `html.sch3`). Persisted in `sessionStorage` under key `'aks'`. The SideNav has a color scheme switcher dropdown.

| Class | Name | BG | FG |
|---|---|---|---|
| *(default)* | Void | `#111111` | `#ffffff` |
| `sch1` | Ocean | `#0D5072` | `#7FEEFF` |
| `sch2` | Moss | `#ECE7E2` | `#4A7766` |
| `sch3` | Crimson | `#F5F5DA` | `#7B021D` |
| `sch4` | Dusk | `#6C5383` | `#D7E7C3` |
| `sch5` | Midnight | `#0B1A35` | `#D2B96A` |
| `sch6` | Cobalt | `#191265` | `#EBEBDF` |
| `sch7` | Sapphire | `#275CCC` | `#F5E4CF` |
| `sch8` | Garden | `#BAD797` | `#670626` |
| `sch9` | Forest | `#033631` | `#FFEDA8` |

### CSS Tokens

All values reference tokens from `tokens.css`:

```css
--_tokens---color--bg         /* page background */
--_tokens---color--fg         /* foreground / text */
--_tokens---color--muted      /* secondary text (60% opacity of fg) */
--_tokens---color--line       /* borders and dividers */
--_tokens---color--bg-overlay /* glass overlays */
--_tokens---font--body        /* Inter */
--_tokens---space--micro      /* 0.5rem */
--_tokens---space--small      /* 2rem */
--_tokens---space--medium     /* 4rem */
--_tokens---space--big        /* 8rem */
```

### Typography

All type uses `Inter` (Google Fonts). Font sizes use `clamp()` for fluid scaling:

```css
--_tokens---type--big:    clamp(1.75rem, 1.22rem + 2.25vw, 3.25rem)
--_tokens---type--medium: clamp(1.3125rem, 0.89rem + 1.78vw, 2.5rem)
--_tokens---type--small:  clamp(1rem, 0.93rem + 0.28vw, 1.1875rem)
--_tokens---type--micro:  clamp(0.8rem, 0.77rem + 0.11vw, 0.875rem)
```

---

## Navigation (SideNav)

`src/components/SideNav.astro` — fixed 48px-wide bar on the left edge of every page.

**INDEX bar** (always visible):
- Top: AK logo (CSS mask, inherits fg color, links to `/`)
- Middle: Color scheme button → dropdown (5×2 grid of swatches, no text)
- Center: Hamburger icon (positioned absolute at 50% height)
- Bottom: Vertical label reading `INDEX / [PAGE NAME]`

**Slide-in panel** (opens on bar click):
- Header: Name + bio
- Nav: Home, About Me, Projects (with ↗ arrows)
- Recent Projects: 5 most recent by year
- Contact: email, LinkedIn, Instagram, Behance

JS is inline in the component. Color scheme is saved to `sessionStorage['aks']` and restored on load.

---

## Content: Projects

Each project is a YAML file in `src/content/projects/`. Slug = filename without `.yaml`.

**Fields:**

```yaml
name: "Project Name"         # required
numbr: 1                     # sort order for featured slider (optional)
year: "2024"                 # display year (optional)
client: "Client Name"        # (optional)
location: "City, Country"    # (optional)
status: "Completed"          # (optional)
featured: true               # include in home slider (default: false)
smallIntro: "Short tagline"  # 1-line description (optional)
description: |               # HTML body (optional)
  <p>Paragraph text.</p>
collaborator: "Studio Name"  # (optional)
program: "Program Type"      # (optional)
coverImage: "/images/projects/filename.jpg"  # (optional)
multiImage:                  # additional images (optional)
  - "/images/projects/img2.jpg"
tags:                        # list of tag slugs (optional)
  - interior
  - architecture
category: studio-823         # single category slug (optional)
```

**Tags** (`src/content/tags/`): architecture, collaboration, exhibitions, experimentation, graphic-design, interior, music-festival, product-art, research, urban, visualisation

**Categories** (`src/content/categories/`): archv, collaboration, faizan-khatri, freelancer, scad, studio-823

---

## Deployment

Push to `main` → GitHub Actions runs automatically:

```yaml
pnpm install --no-frozen-lockfile
pnpm build          # → dist/
firebase deploy     # → advaitakelkar-site.web.app
```

**Required GitHub Secrets:**
- `FIREBASE_SERVICE_ACCOUNT` — Firebase service account JSON (from Firebase Console → Project Settings → Service Accounts)

**Manual deploy:**
```bash
pnpm build
firebase deploy --only hosting
```

Double-click **`4-push.command`** for everyday pushes.

---

## Adding / Editing Content

**Via Keystatic CMS (recommended):**
```bash
pnpm dev
# Open http://localhost:4321/keystatic
```

**Directly in files:**
- Edit YAML files in `src/content/projects/`
- Add images to `public/images/projects/`
- Update `coverImage` field with `/images/projects/filename.ext`

---

## Scripts

| File | Purpose |
|---|---|
| `1-setup.command` | Install deps + start dev server (double-click in Finder) |
| `4-push.command` | Commit all changes + push to GitHub (double-click in Finder) |
| `designer.html` | Responsive preview tool — open in browser, no server needed |
| `2-github-push.command` | **Deprecated** — initial repo setup (done) |
| `3-push-fix.command` | **Deprecated** — one-time CI fix (done) |

---

## Current Status (as of June 2026)

**Done:**
- Full Astro 5 migration from Webflow
- 52 projects migrated to YAML
- Design token system with 10 color schemes
- SideNav with slide-in panel, color switcher, hamburger
- Home page: intro, featured auto-slider, teasers, quick search
- Firebase Hosting live at `advaitakelkar-site.web.app`
- GitHub Actions CI/CD pipeline

**In progress / pending:**
- About page — needs design work
- Projects listing page — needs design work
- Project detail page — needs design work
- SideNav: the `index.lock` push conflict needs a permanent fix (see `4-push.command` which now auto-clears the lock)
- More project images to upload (25 of 52 have cover images)

---

## For Continuing Agents

The workspace folder is `advaitakelkar-website/` inside the user's Google Drive ("01 Websites").

**Key things to know:**
- Always use `pnpm` not `npm` — `npm` errors on this repo due to an arborist version-parsing bug
- CSS is **Astro-scoped** — `<style>` blocks in `.astro` files are component-scoped with auto-generated hash attributes. Use `:global()` only when needed.
- Color scheme tokens must be referenced as `var(--_tokens---color--fg)` etc. (the triple-dash prefix is intentional, matching the Webflow variable naming convention)
- The git remote is `https://github.com/advaitakelkar/advaitakelkar` — the repo name is `advaitakelkar` (not the folder name)
- Google Drive sync can lag — bash writes to the mount may not be visible to Terminal's git immediately. The `4-push.command` script handles the index.lock cleanup automatically now.
- Do NOT commit `node_modules/`, `dist/`, `.astro/`, or `serviceAccount.json`

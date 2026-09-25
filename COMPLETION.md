# COMPLETION.md — finishing advaitakelkar.com

This is the live worklist. The `website` agent drives from it: read it, work the top item,
update it, stop. One project at a time. Adi does the writing; the agent structures, asks, drafts
from what he says, and verifies.

Last surveyed: **2026-09-09** — HEAD `be65d53`, `pnpm build` = 80 pages.

---

## How this site defines "done"

**A project is locked until its slug is added to `PUBLIC_PROJECT_SLUGS` in
`src/lib/projectAccess.ts`.** The lock is a single site-wide soft gate (SHA-256 hashed
password, sessionStorage). Locked = not finished. Unlocking a project is the *last* step of
completing it, not a toggle you flip early.

So "finish the website" = for each project: complete its content → add its slug to the bypass
list → it goes public.

**A project's content is complete when its YAML has all of:**

| Field | Rule |
|---|---|
| `name`, `shortName`, `year`, `location`, `status` | present |
| `category` | one of: academic · work · freelancer · archv (matches `src/content/categories/`) |
| `tags` | ≥1, from `src/content/tags/` |
| `smallIntro` | one real sentence — the hook. **Not** "Project introduction placeholder." |
| `description` | ≥2 `<p>` paragraphs of real prose. **Not** "Project description placeholder content." |
| `coverImage` | real file in `public/images/<slug>/` |
| `multiImage` | ≥3 real images (the scrub needs them) |
| `people` | credited correctly (see credit rules below) |
| `client` / `professors` | where they apply |

Reference a known-good file: `src/content/projects/carlo.yaml`.

**Credit rules** (from Adi, they're social not technical — get them right):
- ARCHV projects → Advaita, Varun Mehta, Nayan Mote, Sneha Desai
- Studio 823 projects → Advaita, Samir Raut, Faizan Khatri (left of divider — colleagues)
- FKD projects → Advaita, Devarsh Deth, Faizan Khatri (Samir removed from all FKD)
- Devarsh Deth, Dhruv Chavan → *friends*, right of divider, never "colleague"
- Adi's own portrait always goes **last** in any people row.

---

## Status snapshot

- **50 projects. 10 public, 40 locked.**
- **7 are hard placeholders** (literal "placeholder" text, no images).
- **3 projects are featured on the homepage but locked** — the homepage promotes them, then a
  visitor clicking through hits the password wall. Worst single UX issue. Fix these first.
- **15 projects have no `coverImage`** → they render with no cover in the index/feature.
- Pages (`home.yaml`, `about.yaml`) — copy is real and in good shape. No placeholders.

### Public now (10) — leave locked-list alone, but re-check content quality
`alt-verse` · `architect-x-architects` · `carlo` · `concrt` · `dhal-ni-pol` ·
`human-pods` · `indian-royals` · `space-pirates` · `sups-cards` · `sups-in-the-hinterland`

### Tier 0 — featured but locked (do first, 3)
These already show on the homepage slider. Highest embarrassment, highest payoff.

| slug | name | gap |
|---|---|---|
| `episodeone-powai` | EPISODE Powai | strongest hospitality work (the Rockwell Group case). Content looks near-complete — verify images + credits, then unlock |
| `shelf` | SHLF | verify, then unlock |
| `scad-design-built` | SCAD Design Built | the thesis studio — biggest, uses `chapters`. May genuinely not be ready; if so, remove `featured: true` so the homepage stops promoting it |

### Tier 1 — hard placeholders (7)
No real content at all. Each needs intro + description + cover + 3 images from scratch.

`ai-collaboration` · `bom-mum` · `karshid-resort-and-homestay` · `mumbai-masshousing` ·
`siddharth-municipal-general-hospital` · `skadoogee` · `tower-of-the-quiet-witness`

> `tower-of-the-quiet-witness` and `union-pier-charleston` are the active SCAD studios — their
> source files carry the `TOQS_` / Union Pier working sets in `~/My Drive/HUB/00 Projects/`.

### Tier 2 — locked, have some content, no cover (missing `coverImage`, ~12 after Tier 1)
`the-4th-dimention` · `dhal-ni-pol`* · `vndls` · `open-source-design-library` · `virtual-gods` ·
`union-pier-charleston` · `scarpin` · `archv`
(*`dhal-ni-pol` is already public but coverless — fix its cover.)

### Tier 3 — locked, content + cover present, just needs a review pass then unlock
Everything else in the 40. Work them in whatever order Adi cares about — probably:
`episode-kolkata` · `social-malad` · `social-vashi` · `social-wadala` · `social-city-mall` ·
`mainland-china-andheri` · `unplugged-jamshedpur` · `the-jude-bakery-project` · `xbkc` ·
`goonj` · `gong-powai` · `seven-gardens` · `under-the-tree-karjat` · `saltwater-cafe-bandra` ·
`house-by-the-sea` · `crematorium` · `pet-park` · `pet-pod` · `tilak-nagar-cricket-park` ·
`reflct` · `roberto-burle-marx-stickers` · `the-4th-dimention` · `habersham-hall` · `dakughar` ·
`scarpin` · `vndls` · `virtual-gods`

---

## How to unlock a finished project

1. Confirm content complete (table above) and `pnpm build` passes.
2. Add the slug to `PUBLIC_PROJECT_SLUGS` in `src/lib/projectAccess.ts`, keep the array alphabetical.
3. `pnpm build`, spot-check the page renders unlocked.
4. Move the slug from a Tier list to "Public now" in this file, same commit.
5. Push. Live in ~2 min (no staging — see `WORKFLOW.md`).

---

## Blockers to clear before sending the site to firms

From `AUDIT-2.md` (code audit) — these aren't content, but they undercut a first impression:

- **P1** `sync_from_notion.cjs` silently wipes the 9 `featured` flags — **do not run `pnpm sync-notion`** until fixed.
- **P1** `js-yaml` missing → `pnpm sync-to-notion` crashes. `pnpm add -D js-yaml`.
- **P1** muted text fails WCAG AA in 5 of 7 colour schemes — darken the tinted `fg` tokens.
- **P2** colour switcher doesn't survive reload (sessionStorage + re-randomise on ⌘R).

---

## Log

- 2026-09-09 — file created. Snapshot: 10/50 public, 7 placeholders, 3 featured-but-locked.


## 2026-09-11 — Adi’s audit decisions and local implementation

This entry supersedes earlier audit assumptions: website content and credits are authoritative. Design and Making are future sections and may remain empty. Do not invent prose or alter credits from Notion.

- Portfolio download replaced with Work in progress; placeholder PDF archived under ignored source-files, outside public assets.
- Shared public-project list retains the same ten projects. Homepage only features public projects with covers; featured data stays unchanged. Public projects are included in the sitemap.
- Full-name search results and no-match state; stronger breadcrumb visibility.
- Exclusive project/chapter toggles, keyboard gallery access and focus restoration; reduced-motion handling in the main gallery and homepage name effect.
- Page templates: three remain (project-01, ai-portrait, ai-landscape) — see "The template list" in CLAUDE.md.
- Notion comparison saved at /Users/adi/Dev/advaitakelkar-website/outputs/notion-website-comparison-2026-09-11.md. No Notion writes or full sync performed.
- Validation: 80-page build, three style lints, TypeScript checks of new helpers, browser interaction checks, and 18 page/viewport overflow checks passed. Existing logo-resolution and admin-bundle build warnings remain.
- Local changes only; not committed, pushed or published.

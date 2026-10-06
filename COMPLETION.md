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

Re-surveyed **2026-09-26** at HEAD `78361a4` with `pnpm audit:jev` (see below). Supersedes the
2026-09-09 snapshot, whose cover count was wrong.

- **52 projects. 12 public, 40 locked.**
- **Images are the bottleneck, not writing.** Only **13 projects have a `coverImage`**, and only
  those 13 have any gallery images at all. The 39 others render with no cover and no gallery.
- **7 are hard placeholders** (literal "placeholder" text, no images).
- **2 are featured on the homepage data but locked:** `episodeone-powai`, `scad-design-built`.
  (The homepage now only shows public projects with covers, so neither leaks, but see Tier 0.)
- Pages (`home.yaml`, `about.yaml`) — copy is real and in good shape. No placeholders.

### Checking content with Jev

```bash
aihub run typesafe -- pnpm audit:jev
```

`scripts/jev-audit.mjs` checks fields, cover and image files in code, and asks Jev (TypeSafe) to
score each `smallIntro` (0–3) and `description` (0–3) and flag draft leftovers. About $0.002 and
under a second for all 52. Scores sort the worklist; they are not verdicts. Two known
disagreements from the first run: `space-pirates` intro scored 2.0 but reads fine; `hanma-fam`
got a 0.4 draft flag with no draft text in it. Pages near the cut-offs can flip between runs.

### Public now (12) — leave locked-list alone, but re-check content quality
`alt-verse` · `architect-x-architects` · `carlo` · `concrt` · `deleuze-guattari` · `hanma-fam` ·
`indian-royals` · `shelf` · `space-pirates` · `sups-cards` · `sups-in-the-hinterland` · `xbkc`

Weakest public text (intro/description): `sups-in-the-hinterland` (2.3/2.3), `alt-verse`
(2.2/2.5). Tighten these first.

### Tier 0 — featured but locked (2)

| slug | name | gap |
|---|---|---|
| `episodeone-powai` | EPISODE Powai | the Rockwell Group case. Text is top-scored (2.9/3.0) but there is **no `public/images/episodeone-powai/` at all**. Needs cover + ≥3 images, then unlock |
| `scad-design-built` | SCAD Design Built | the thesis studio, uses `chapters`. Has cover + 11 images, text 3.0/2.6. Decide: finish and unlock, or drop `featured: true` |

### Tier 1 — hard placeholders (7)
No real content at all. Each needs intro + description + cover + 3 images from scratch.

`ai-collaboration` · `bom-mum` · `karshid-resort-and-homestay` · `mumbai-masshousing` ·
`siddharth-municipal-general-hospital` · `skadoogee` · `tower-of-the-quiet-witness`

> `tower-of-the-quiet-witness` and `union-pier-charleston` are the active SCAD studios — their
> source files carry the `TOQS_` / Union Pier working sets in `~/My Drive/HUB/1 Projects/`.

### Tier 2 — text is done, images missing (13)
Jev scores the writing finished (intro ≥2.2, description ≥2.6). Only images stand between these
and unlocking. Fastest wins on the site.

`dakughar` · `dhal-ni-pol` · `episode-kolkata` · `house-by-the-sea` · `mumbai-airport-foodcourt` ·
`saltwater-cafe-bandra` · `seven-gardens` · `social-vashi` · `social-wadala` ·
`the-jude-bakery-project` · `under-the-tree-karjat` · `unplugged-jamshedpur`
(+ `episodeone-powai`, Tier 0)

### Ready for visual review (1)

`gong-powai` — project text rebuilt from the drawing set; client corrected to Speciality
Restaurants; 5 interior visualisations and 23 text-free plans, sections and bar details added.
The project remains password-protected until the assembled page has been reviewed.

### Tier 3 — text needs work, and images missing (18)
Weakest description first (intro/description):

`pet-pod` (1.9/1.8) · `vndls` (1.6/1.9) · `goonj` (2.1/1.9) · `scarpin` (2.3/1.9) ·
`the-4th-dimention` (2.5/2.0) · `gully` (1.7/2.0) · `pet-park` (2.4/2.0) ·
`open-source-design-library` (2.2/2.2) · `reflct` (2.8/2.2) · `virtual-gods` (2.6/2.3) ·
`human-pods` (2.8/2.4) · `roberto-burle-marx-stickers` (2.1/2.4) · `tilak-nagar-cricket-park` (2.0/2.5)

Good description, weak intro line only (a one-line fix each):
`habersham-hall` (0.1 — intro is a course code) · `union-pier-charleston` (0.0 — course code) ·
`social-malad` (2.1) · `social-city-mall` (2.1) · `mainland-china-andheri` (2.0)

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
- 2026-09-26 — re-surveyed with `pnpm audit:jev`. 12/52 public, 13 with covers, 7 placeholders,
  2 featured-but-locked. Tiers regrouped by what blocks each project (images vs text).


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

## 2026-09-30 — One Virtual Gods exhibition entrance

Adi confirmed `/projects/virtual-gods` is the main exhibition page. Removed the redundant
Enter the exhibition links and duplicate `/virtual-gods` landing page; the old address redirects
to the project page. World and pair navigation returns there. The embedded map now introduces
the works without repeating the exhibition title and introductory prose.

### Virtual Gods navigator redesign

Adi requested the circle alone as the opening slide. The project URL now renders a dedicated
map-only entrance. All four world and eight pair pages share a persistent map and linked
world/pair key with current-page indication, plus previous/next and return-to-map links.
The project content remains in YAML; the former long scroll exhibition is not mounted.

Adi refined the entrance: use the standard GONG-style project introduction above the
circular navigator. Virtual Gods now reuses the project template for title, metadata,
people, original description and cover as side image, then shows the map without the
old chapter/scroll duplication.

Virtual Gods uses only the Void scheme on its project page and all exhibition routes.
The colour selector is hidden there; other site pages retain their existing preferences.

## 2026-10-05 — Virtual Gods navigation dropdowns

Replaced the embedded exhibition breadcrumb with Map | World | Pair navigation.
World lists all four worlds; Pair groups the eight pairs by world. Selections stay
in sync with both the circular map and links inside the exhibition. Map returns to
the entrance. Validation: 90-page build, all three style lints, and browser checks
of world selection, pair selection, and the matching world passed.

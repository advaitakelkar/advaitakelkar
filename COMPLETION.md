# COMPLETION.md — finishing advaitakelkar.com

This is the live worklist. The `website` agent drives from it: read it, work the top item,
update it, stop. One project at a time. Adi does the writing; the agent structures, asks, drafts
from what he says, and verifies.

Last surveyed: **2026-09-09** — HEAD `be65d53`, `pnpm build` = 80 pages.

---

## Powerhouse — editable four-chapter book, 26 October 2026

At Adi’s request, all four current website chapters were rebuilt as `The Powerhouse_Thesis Book_Ch1-4.indd` in the thesis Book folder. The preceding edition and a dated backup remain preserved. The 35-page book includes 29 sections, native diagram and map components, six native tables, 116 chapter notes, 117 bibliography entries and 117 linked note references. All 110 manuscript paragraphs match the website source; all 75 Chapter 2–4 figure panels are present. No placed image/PDF/SVG dependencies, missing fonts or overset text.

Native INDD and IDML, the editing guide and verification record are beside the book. The matching PDF was exported from InDesign and copied to the local website; `pnpm book:pdf` now defaults to Ch1-4. PDF verified at 35 pages with selectable text and vectors, with no raster images. Local only; no commit, push or publication.

---

## SOCIAL Vashi — publication approved, 25 October 2026

Adi reviewed the local gallery and subsequently requested publication, commit and push. This supersedes the earlier local-only restriction.

- 18 edited images: Real (6), Details (7), Architectural illustration (5).
- Two plans and three concept views were redone to match Adi's supplied textured architectural illustration references. Plans keep the kitchen wing schematic; construction details retain their work-in-progress state.
- Project access enabled for the approved publication. Masters, source mapping and prompts: Codex `outputs/social-vashi`; source copies in Desktop/Vashi/Edit 1.
- Validation passed: 98-page production build, breakpoint/glyph/icon lints, 18 unique images and original checksums, and local browser review of all three categories and both reference-style plans. Local preview: http://127.0.0.1:8767/projects/social-vashi/ . Commit and deployment follow Adi’s publication approval.

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

### Tier 0 — featured but locked (1)

| slug | name | gap |
|---|---|---|
| `scad-design-built` | SCAD Design Built | the thesis studio, uses `chapters`. Has cover + 11 images, text 3.0/2.6. Decide: finish and unlock, or drop `featured: true` |

*(Note: `episodeone-powai` resolved 2026-10-25 with 14 curated images, cover, full gallery and unlocked.)*

### Tier 1 — hard placeholders (7)
No real content at all. Each needs intro + description + cover + 3 images from scratch.

`ai-collaboration` · `bom-mum` · `karshid-resort-and-homestay` · `mumbai-masshousing` ·
`siddharth-municipal-general-hospital` · `skadoogee` · `tower-of-the-quiet-witness`

> `tower-of-the-quiet-witness` and `union-pier-charleston` are the active SCAD studios — their
> source files carry the `TOQS_` / Union Pier working sets in `~/My Drive/HUB/1 Projects/`.

### Tier 2 — text is done, images missing (11)
Jev scores the writing finished (intro ≥2.2, description ≥2.6). Only images stand between these
and unlocking. Fastest wins on the site.

`dakughar` · `dhal-ni-pol` ·
`saltwater-cafe-bandra` · `seven-gardens` · `social-vashi` · `social-wadala` ·
`the-jude-bakery-project` · `under-the-tree-karjat` · `unplugged-jamshedpur`
*(Note: `episode-kolkata` resolved 2026-10-25 with 12 curated images, cover, full gallery and unlocked.)*

### Ready for visual review (1)

`gong-powai` — project text rebuilt from the drawing set; client corrected to Speciality
Restaurants; 5 interior visualisations and 23 text-free plans, sections and bar details added.
The project remains password-protected until the assembled page has been reviewed.

### Tier 3 — text needs work, and images missing (18)
Weakest description first (intro/description):

`pet-pod` (1.9/1.8) · `vndls` (1.6/1.9) · `goonj` (2.1/1.9) · `scarpin` (2.3/1.9) ·
`the-4th-dimention` (2.5/2.0) · `gully` (1.7/2.0) ·
`open-source-design-library` (2.2/2.2) · `reflct` (2.8/2.2) · `virtual-gods` (2.6/2.3) ·
`human-pods` (2.8/2.4) · `roberto-burle-marx-stickers` (2.1/2.4) · `tilak-nagar-cricket-park` (2.0/2.5)

*(Note: `pet-park` resolved 2026-10-25 with 12 curated images, drawing, 3D visualisations, cover, full gallery and unlocked.)*

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


### 2026-10-06 — GONG and Dhal Ni Pol local review
- Added the supplied labels, dimensions where supplied, material notes and source credits as editable text within all 23 GONG illustration sheets. Drawing images retain their full proportions.
- Verified 28 GONG assets and Dhal's cover/three new views against Desktop originals. Refreshed Dhal's transparent cut-file asset losslessly at original resolution.
- Moved `Desktop/Work Folders/newGong` into `HUB/2 Selected/Work/FKD/Gong, Powai/Edit 1`, including the text/index. Merged six byte-identical Dhal PNGs into existing Selected/Edit 1 files, then removed the empty Desktop folder.
- Local preview: http://127.0.0.1:4322. Lint and static build passed. Build reports an existing homepage CSS brace warning. No deployment; existing unrelated working changes preserved.


### 2026-10-06 — GONG presentation refinement
- Replaced five stacked interior figures with a five-view automatic slider beside the introduction, including previous/next and pause controls; respects reduced motion. Mobile stacks the slider above drawings.
- Added GONG-specific drawing tabs: All, Plans, Wall elevations, Cross sections, Bar details. All keeps enlarged wall parts folded; the wall tab opens paired parts. Plans and full wall elevations span the page; cross sections and bar details form grouped sheets, with three bar elevations together.
- Folded longer introduction and drawing notes behind Read more; all supplied text retained. Verified slider controls, tab isolation, three wall-part disclosures, note expansion and mobile overflow. Local review only.

- Later refinement: introduction now shows one sentence with a Read more / Read less pill. Slider occupies 48% of the desktop copy area with a 4:3 stage. Removed enlarged wall parts from presentation; retained source assets. Bar plan uses the smaller left column with elevations and sections alongside. Build/lint passed; fresh browser preview reaches the existing password gate, while previously unlocked tabs timed out during browser control.

- Latest refinement: larger slider at 56% of desktop intro width, active images use natural height with no fixed-ratio frame; responsive height reservation follows active image. Square 05-bar-detail moved into Bar details beneath the smaller plan. Four images remain in slider. Build and rendered-content assertions passed; existing preview tabs remain inaccessible to browser control.

- Final curation: removed furniture layout, section reference plan, all six enlarged AA–CC parts, and bar section 02 from project content and public image assets. GONG now presents 14 drawings (2 plans, 3 full wall elevations, 4 cross sections, 5 bar drawings). Source originals remain in Selected; removed WebP copies recoverable in /private/tmp/gong-removed-drawings-2026-10-06.

- Bar layout refined: plan and square render in equal columns, followed by all three elevations and section 01 in a three-column grid; mobile stacks to one column.


### 2026-10-06 — Barley and Bun
- Restored missing `bnb-khar` project page using Notion project 823-15 metadata: proposed café concept, Khar/Mumbai, 2019, Studio 823; collaborator names checked against linked Notion records. Client left unset because the current record has no client.
- Added five latest Desktop/GPT views as optimised WebP images. Same project template, left-column introduction with Read more, empty right side, automatic full-width slider below. Pause/previous/next and original image proportions preserved; no drawing gallery.
- Finished Desktop package moved into existing Selected/Work/823/Barley and Bun/Edit 5 with a website index and source hashes. Existing editions preserved. Local review only; project access policy unchanged.

- Listing refinement: GONG and Barley and Bun now show exactly five selected render thumbnails, using the curated preview behaviour established for ARCHV. GONG uses interiors rather than drawings; the square bar render remains outside its main slider. Project page access gates unchanged.

- Barley and Bun text preference: removed its Read more disclosure; both description paragraphs display in full above the slider.

### 2026-10-07 — CONCRT cover refresh

- Replaced the old cover with Adi’s supplied Desktop/cover.png, exported at its original 1200 × 896 proportions. The new filename updates Featured, project listings and social preview metadata without reusing the cached old URL.
- Added the updated pair view first in the project gallery; kept the other distinct gallery photographs. Removed the superseded cover asset.

### 2026-10-07 — Mac website folder cleanup

- Kept `/Users/adi/Dev/Website/advaitakelkar-live` as the only active local working copy; the live copy is hosted at advaitakelkar.com. `dist/` remains the generated deployment output.
- Moved the obsolete `Dev/_archive/advaitakelkar-website` and cache-only `Dev/advaitakelkar-website` to Mac Trash. Old archive was clean; its files and separate Git history remain recoverable in Trash. Its only extra assets were the superseded CONCRT cover and a generated thumbnail.
- Moved historical local audits into `docs/archive/` and clarified folder roles in README. CONCRT commit ed17125 is still awaiting a successful GitHub push after repeated remote server errors.

### 2026-10-07 — CONCRT slider layout

- Changed CONCRT to the shared Barley and Bun slider layout: all six gallery images appear in one automatic slider below the introduction, starting with the updated cover. Removed the right-side image and room tabs. Retained the existing detail caption and collection credit.

### 2026-10-07 — Shared project reading hierarchy

- Project subtitles now use the small type token, with descriptions using micro: subtitle larger, supporting prose smaller, including phones.
- Slider pages keep short descriptions fully visible. Descriptions over 450 characters with multiple blocks keep their opening paragraph left and reveal the remaining blocks in the empty right column at desktop widths through the shared Read more pill. On phones the existing reading card expands instead.
- Slider stages keep original image proportions and reserve a stable height capped by the viewport, including short screens. Verified CONCRT desktop reading panel and phone expansion, and Barley and Bun full short description.

### 2026-10-07 — Compact shared slider layout and bottom credits

- Full-width project subtitles now precede aligned two-column description text with Read more. People appear only in the bottom credits on slider pages; CONCRT portraits sit left and its collection link sits right, with clearance for the fixed search bar.
- GONG now uses the shared slider below its text, keeps the four interior views and retains the drawing gallery beneath it. Its aim, setting and palette are included in the expanded description instead of separate pills.

### 2026-10-07 — Compact continuous reading and persistent credits

- Long slider-page descriptions are fully hidden until Read more, placed to the right of the subtitle on desktop. Expanded prose flows continuously through two automatically balanced columns rather than separate paragraph panels.
- Portraits reduced to 32px in a persistent credit strip above the fixed search/navigation dock. CONCRT collection link remains on its right. Short Barley and Bun description stays visible.


## 2026-10-07 — XBKC replacement image set

Eleven supplied room views edited with the built-in image tool for a cohesive photographic material palette, including the later kitchen image. Replaced all 52 older website images/variations with one eleven-view shared slider, new cover and five listing thumbnails. PNG masters and old web images are archived under ignored source-files/xbkc/. Prompt set and checks: docs/xbkc-image-edits-2026-10-07.md. Build (98 pages) and lint passed; compiled page contains exactly eleven carousel images. Browser visual verification blocked because browser security policy was unavailable.


### 2026-10-07 — Hybrid Media Assignment 01 final

- Replaced the Archi-Selfie cover, listing preview and presentation image with Adi’s approved final two-view image on black. Preserved the existing course page and ongoing course status; identified Assignment 01 as the final submission.
- New asset filename avoids the previously cached image URL. Exported as WebP at its original proportions.
- Validation: 98-page build passed; compiled Hybrid Media page references the new final image and Assignment 01 text with no old image URL. WebP checked visually against the approved final.


### 2026-10-07 — Hybrid Media reading layout

- Enabled the shared Read more / Read less disclosure for Hybrid Media despite its short description. Expanded copy uses the existing balanced two-column desktop layout and phone reading panel.
- Validation: 98-page build and all three style lints passed. Browser checks at 1440px and 390px confirmed initial collapse, expansion with intact assignment copy, two desktop columns, and Read less collapse.


### 2026-10-07 — CARLO front view and shared slider

- Removed the blue detail photograph from CARLO’s presentation and listing previews. The cream front view now opens the same shared full-width slider used by Barley and Bun, followed by the cream detail and two configurations. Retained the material note as the detail caption and the NMS collection credit.
- Validation: 98-page build passed. Browser checks at 1440px and 390px confirmed four slides, cream front view first, no blue image, working previous/next controls and no horizontal overflow.


### 2026-10-12 — AI Collaboration shared layout

- Enabled the shared Barley and Bun reading layout and persistent bottom credits for AI Collaboration. Preserved all seven course sections; no image stage appears until project images are supplied.
- Replaced the placeholder description with a concise draft grounded in the existing course outline. Professor precedes Advaita in credits.
- Validation: 98-page build passed; local browser confirmed the two-column introduction, course sections and bottom credits. Local review only.

### 2026-10-12 — AI Ethics Debate perspectives

- Added credited official portraits of Molly Crabapple (Benjamin Aleshire) and Wolf dPrix (Gianmaria Gava), with one sourced position per person and links to the CAIR open letter and Deep Himmelblau research.
- Side-by-side desktop comparison uses the existing chapter grid and stacks on smaller screens. Framing distinguishes different creative fields from a direct exchange.
- Validation: 98-page build and all style lints passed; local browser confirmed portraits, points, credits, and chapter selection. Local review only.

### 2026-10-12 — ComfyUI course workflow guides

- Populated Text to Image and Image to Image with core node connections, three-step guides, original architectural prompt exercises, seed comparison and denoise experiments. Linked official ComfyUI documentation and the FLUX Krea workflow JSON.
- Clarified checkpoint versus FLUX loaders and separated image transformation from the later image-to-3D exercise.
- Validation: 98-page build passed; local browser confirmed both chapter selections, source links and two-column reading layouts. Guides researched against official docs; no local ComfyUI workflow execution performed.

### 2026-10-12 — VANDLS content cleanup and prototype grids

- Applied the shared Barley and Bun reading layout with persistent bottom credits. Consolidated the statement, purpose, method, mentor, full participant list and November 2020 Platform publication into one description. Removed the NA client pill and side cover.
- Replaced repeated overview/research chapters with one open Prototypes section: all 15 rapid interventions and all 16 Initiative habitats, labeled in four-column desktop/two-column small-screen grids. Images link to full originals; archive links retain specifications, drawings and research.
- Original full project YAML preserved at docs/archive/vndls-before-cleanup-2026-10-12.yaml. Existing source assets remain available.
- Validation: all 31 grid image paths checked, 98-page build and style lints passed; browser confirmed expanded two-column description, prototype grid and bottom credits. Local review only.


## 2026-10-14 — Five professional projects published with final imagery

- Added the final selected galleries for Under the Tree (3), SOCIAL South City Mall (3), Jude Bakery (3), Unplugged (8) and SOCIAL Malad (8), using the shared project-01 slider layout.
- Nineteen views use the reviewed photographic edits; six additional Unplugged views complete its gallery. Seven Gardens remains reserved for Adi’s curation.
- Added all five projects to the public-project list. Current source inventory: 60 projects, 28 public and 32 locked. Underlying academic work remains tracked separately from page completion.
- Full-resolution masters and prompts remain in the separate Drive shortlist. Website images are WebP exports; existing descriptions, project status and credit rules are retained.


### 2026-10-14 — Feature the five newly public professional galleries

- Enabled homepage featured flags for Under the Tree, SOCIAL South City Mall, Jude Bakery, Unplugged and SOCIAL Malad. All five already appear publicly in Projects.
- Live Featured document read currently returns HTTP 403, so the homepage uses the project-file fallback flags. Existing featured selections are retained.


## 2026-10-14 — Gully Boy, GOONJ and Pet Pod completed and opened

- Rebuilt the three pages from Varun Mehta’s supplied case-study links, preserving 44 project images including 11 original GIF animations. Added shared slider galleries, covers, listing previews and source links.
- Gully credits Varun Mehta, Jeet Soneji and Advaita, with Excel Entertainment as collaborating organisation; client corrected to Urban Monkey India / Yash Gangwal and status to rejected proposal.
- GOONJ credits Varun, Nayan Mote and Advaita; photography credits Bombay Frameworks. Event date/year corrected to 24 December 2019, venue/client to Forest Hills Tala. Removed the unsupported academic professor label.
- Pet Pod corrected to a furniture-brand logo/identity project for Kuldeep Jhangid, credited to Varun and Advaita.
- All three added to the public-project list: 31 public / 29 locked out of 60. Featured flags were left as configured; the previous five professional galleries remain featured.


## 2026-10-18 — Powerhouse thesis book, storage-bar visualizers & zoomable maps

- Turned `/powerhouse` into the complete thesis book as one continuous document (`src/data/powerhouse-book.json`, `src/components/PowerhouseBookText.astro`) with 1.1 EV Infrastructure in the United States structured into five live evidence slides (`01 United States`, `02 California`, `03 New York`, `04 Florida`, `05 Comparison`).
- Added `PowerhouseGlance.astro` and `src/lib/powerhouse-glance.ts` so every place opens with a storage-bar summary (every road vehicle from FHWA Table MV-1 + AFDC EVs, plug-in fleet breakdown, public plugs by network & speed, and access/charger-speed bars) alongside a zoomable map in a two-column split (`1024px+`).
- Configured `/powerhouse` and `/projects/the-powerhouse` in `Base.astro` to render always in Void (`data-void-only`) while drawing data in the dusty-pastel Powerhouse storage-bar palette (`--ph-red`, `--ph-orange`, `--ph-yellow`, `--ph-green`, `--ph-teal`, `--ph-blue`, `--ph-grey`, `--ph-light`) documented in `CLAUDE.md`.
- Built zoomable vector SVG state maps (`public/maps/{california,new-york,florida}.svg` via `scripts/build-powerhouse-svg-maps.mjs`) and `src/lib/powerhouse-map.ts` (Canvas + SVG `d3-zoom` with hub-centered zoom and scale-adaptive station radii).
- Validation: 99-page production build and all style/breakpoint/glyph/icon lints pass.



### 2026-10-18 — Consolidate Powerhouse 1.1

- Combined the evidence into one continuous section: existing chapter text, USA map, three CA/NY/FL comparison tables (vehicles/growth, charging/networks, energy/access), then a concise conclusion. Replaced the five-slide navigation with expandable supporting evidence.
- Retained all state/NYC maps, filters, national ranking, national outlook and comparison charts behind disclosures; source datasets and thesis book text are unchanged. Smaller two-column book typography from the preceding edit is retained.
- Corrected the unsupported infrastructure-growth claim and labeled the different FHWA inventory years; state ratios are indicators rather than utilization. No InDesign sync or publication performed.

- Validation: 99-page production build and style lints pass. Browser checks confirmed three main tables at 1440px and 390px without page overflow, all five map containers, national access/network filtering, state disclosures/deep links, and the Bronx DC-filter result (9 stations, 64 plugs), with no JavaScript errors. Refreshed the local server to clear stale Vite map dependencies.

- Follow-up: USA now opens as a standalone, server-rendered SVG map with access/network filters. National storage bars and outlook remain in an expandable disclosure; the three comparison tables remain below. SVG/filter checks pass on desktop and phone with no browser errors.


### 2026-10-18 — Reader-focused 1.1 cleanup

- Reduced the default reading path to a short explanation, USA SVG, a consistent three-column CA/NY/FL comparison (plug-in fleet, public ports, recent BEV growth), a visible NYC SVG with borough/type filters, and a short Powerhouse takeaway.
- Moved all full tables, projections, network breakdowns, full original chapter text with notes, rankings, state maps and extra figures under one supporting-data disclosure. No source data or original book text deleted or synced to InDesign.
- NYC is visible without opening the New York state detail. Distinguishes the city access case from statewide metrics and keeps recommendation provisional. Desktop/phone layout and retained data controls checked; local only.

- Layout refinement: introduction text left and USA SVG right; California, New York and Florida each have a monochrome SVG in the three-column comparison. User confirmed these three areas. Map dots are monochrome throughout, overriding the earlier map palette; chart colours retained. NYC close-up and its filters remain in supporting data, keeping the primary reading path to USA + three states.

- Map simplification: removed Tesla/other legends, network selectors and network labels from map tooltips. Every map point represents charging infrastructure with the same monochrome appearance; public/private access controls remain. Source datasets and detailed supporting network tables are retained. Browser checks pass with no errors.

- Enlarged the three comparison maps into square SVG viewports that open as close-ups filling the frame. Added drag pan, +/−, Full state and keyboard controls; retained monochrome charging dots. Moved proportional comparison charts, indexed growth and all three national outlook charts into one visible graphs section below the maps.
- Validation: style lints and 99-page production build pass; browser verified zoom in/out, full-state framing, keyboard zoom, graph placement and phone overflow, with no JavaScript errors.


### 2026-10-25 — Mumbai Airport T1 images and public gallery

- Added exactly five user-supplied views: three photorealistic architectural visualisations, a coloured exploded isometric preserving the drawing layout and linework, and a retouched physical-model photograph with level alignment and continuous straight columns.
- Set the food-counter view as cover, supplied five scrub images, and labelled each gallery view; retained the project copy and credits.
- Public now: `mumbai-airport-foodcourt` added to the shared access list after asset review.
- Validation: production build (98 pages) and all three style lints pass. Browser review confirms the unlocked five-view gallery and uncropped isometric. Live verification follows the deployment.

- Deploy follow-up: the 15.34.1 CLI selected by `@latest` failed its Hosting API service-usage check with HTTP 403. Pinned Firebase CLI to 15.34.0, verified in the last successful production deployment (20 October), without changing credentials or IAM.


### 2026-10-25 — SWC Barroom project gallery

- Added nine evening image edits to SWC Barroom, using the approved bartender revisions for the bar elevation and lounge view. Detail views remain people-free.
- Set the bar elevation as cover; configured nine labelled gallery views and listing scrub images; unlocked `saltwater-cafe-bandra` for the requested website update.
- T1 Airport retains its five published edited images, including the coloured isometric and corrected physical model.
- Validation: 98-page production build and style lints pass; browser review confirms nine labelled images, including both bartender revisions. Deployment and live verification follow.


### 2026-10-25 — Pet Park Borivali images and public gallery

- Curated 12 distinct assets: hero grass agility mound with concrete crawl pipe tunnel, central lawn activity, aggregate dog run with foliage mural, agility training course, solid green marble cube benches under canopy trees, on-site construction earthworks, civic model presentation to Mayor Kishori Pednekar, municipal press conference, vector GA plan drawing, and 3D axonometric and perspective visualisations.
- Exported web-optimized WebP images to `~/Desktop/Pet Park Select Web/` and deployed to `advaitakelkar-live/public/images/pet-park/`.
- Updated `src/content/projects/pet-park.yaml`: added slider, cover image, five scrub images, 12 gallery images with descriptive lead figures, and updated credits to Faizan Khatri, Devarsh Deth, Advaita Kelkar.
- Added `pet-park` to `PUBLIC_PROJECT_SLUGS` in `src/lib/projectAccess.ts` and unlocked the project.



### 2026-10-25 — Seven Gardens / Hari Bagh completed gallery

- Added 18 edited views, grouped as House (5), Details (4), Construction (3), Site (1), Drawings (4) and Model (1). WIP remains visibly under construction; drawings and model keep their media.
- Main cover is the courtyard with corrected left-wall and right-column perspective. Added a second text-free front-elevation cover and replaced the window view with the wall-clinging creeper revision.
- Added the Hari Bagh visitor link and current farmstay context, verified against https://www.haribagh.com/home. Preserved the existing project account and credits; Advaita is last in the people data.
- Unlocked `seven-gardens` for the requested publication. Production build (98 pages), style lints and browser checks of the 18-view gallery, six categories, drawing filter and visitor links pass. Deployment and live verification follow.

- Live review follow-up: keep Seven Gardens in its curated order so the courtyard cover always opens first, followed by the text-free front cover. Other projects retain the existing shuffle default.


### 2026-10-25 — House By The Sea / Ben Hur gallery and unlock

- Added 26 approved images in three categories: Execution (12 AI-retouched built photographs), Vision (13 populated concept visualizations using the built material palette) and Isometric (1 coloured architectural illustration). The empty-sofa revision and text/logo-free isometric are the active versions.
- Set the built living-room screen photograph as cover; preserve curated execution-first gallery order and provide five listing scrub views. Captions distinguish built photographs, concepts and illustration. Existing project account, Completed status and credits retained; Advaita last in people data.
- Added `house-by-the-sea` to the public-project list for Adi's requested publication. Image masters, originals, prompts and manifest remain in the Codex output set and Desktop project Edit 1.
- Validation: all 26 unique assets verified; production build (98 pages), style lints and browser checks of the unlocked page and Vision/Isometric filters pass. Live deployment follows.


### 2026-10-25 — Work image audit and scrolling project articles (local review)

- Audited all 18 Work projects / 221 unique referenced image files using contact sheets, SHA-256 hashes and perceptual similarity screening. No byte-identical files; low-distance drawing matches were visually distinct. Related room angles and material crops remain available.
- Added explicit asset roles (now `role:` beside each image in the project YAML; sizes are read from the files at build — the old `src/data/work-media*.json` files are gone), shared through `src/lib/workMedia.ts`. Main photographs/renders (103) appear in the introduction slider and category/listing scrubs; supporting material (118) appears once in the scrolling article. The listing selects up to five distinct main views using the existing random scrub behavior. No drawings/details in those previews; Daku Ghar has drawing-only content and therefore no main slider/scrub.
- Desktop retains the original project copy at left and puts a captioned, uncropped slider at right. `WorkArticle.astro` arranges full-width plans, wide long sections, paired studies and two-/three-column details/making with captions, preserved drawing annotations, section anchors and enlarge dialogs. Phone/tablet copy remains in the document flow so it cannot cover the article.
- Original YAML, image files, access gates and credits retained. Jude Bakery has only its three main images; no unsupported explanatory material added. Other project categories retain their established layouts.
- Validation: 98-page production build and all style lints pass; all 18 project routes checked at 1440 / 834 / 390 pixels (54 combinations), no overflow or browser script errors, no main/story repeats, plans span article width. Slider controls and enlarge/Escape verified. `git diff --check` clean.
- Local hot-reloading development server: `http://127.0.0.1:4322/work/` (the pre-existing :4321 process is an Astro production preview). Review example: `/projects/social-vashi/`. No commit, push or publication requested/performed. User-facing audit: Codex 2026-10-25/c/outputs/work-project-audit.md.

- Compact-layout follow-up (Adi: “all … too apart”): reduced Work article section gaps 48→20px, image gutters 24→12px, row spacing 32→14px and caption gaps 12→6px. Non-plan figures use compact two-/three-column rows; only exceptionally long sections remain full-width. Detail/making frames cap at 300px without cropping; full-width plans retained. Tightened intro column gap and mobile spacing. SOCIAL Malad article reduced from 4,448px to 2,717px at 1440px (~39%). Responsive browser checks pass; local development only.

- Three-column article revision (Adi’s subsequent grid specification): supersedes the full-width-plan and separate-row layouts above. The Work introduction and article now share a three-column desktop grid. Plans, sections and elevations span 2×1; isometrics span 2×2; perspective render studies span 2×3. Detail/making figures use 1×1, 1×2, 2×1 or 2×2 according to their proportions and sequence. Dense grid placement fills available cells; images remain uncropped and enlargeable.
- Added `src/data/work-stories.ts`, with project-specific explanatory text condensed from the original descriptions and image captions. Text blocks sit beside plans/sections and between material/making images; original introductory copy, drawing annotations and source files remain. Tablet adapts to two columns and phone to one with explanations in reading order.
- Validation: all 18 Work routes at 1440 / 1024 / 834 / 390px (72 checks) pass, including three desktop columns, requested plan/section spans, no horizontal or text-block overflow, complete asset coverage, section links, no main/article repeats, no browser errors and drawing enlarge/Escape. Local only; no commit, push or publication.

### 2026-10-25 — Remove three unfinished Freelancer projects

- At Adi’s explicit request, deleted the website entries and generated routes for Play Pod (`human-pods`), Roberto Burle Marx stickers (`roberto-burle-marx-stickers`) and Tilak Nagar Park (`tilak-nagar-cricket-park`). Removed their outgoing sync mappings and excluded their known identities from incoming Notion sync so a future import cannot recreate them. No Notion records changed; unrelated references to the architect in Virtual Gods retained.
- All remaining non-academic projects are already in the shared public access list: Work 18/18, ARCHV 7/7, Freelancer 15/15. Academic access rules retained.
- Validation: 95-page production build and style lints pass; browser checks of Projects and all three category pages show no retired links or non-academic locked cards. All three removed URLs return 404 and have no generated production directories. Sync script syntax and whitespace check (respecting the import script’s existing CRLF endings) pass. Local changes only; no push or deployment.

### 2026-10-25 — Three B.Arch design briefs (local review)

- At Adi’s request, unlocked Karshid Beach Resort, Siddharth Nagar Municipal General Hospital and Mumbai Masshousing in the shared project access list. Preserved existing route slugs; replaced placeholder copy with project-specific abstracts, hypotheses, typology/programme agendas, design tests and linked references.
- Resort: five-star rooms/villas and shared beachfront amenities at the supplied Karshid, Alibag location; hospital: municipal general care for Siddharth Nagar, Goregaon, using HOSMAC’s programming/clustering/stacking approach; housing: MIG/HIG redevelopment with commercial frontage, parking and a DCPR study.
- Added optional `designBrief` data and a shared responsive Abstract/Hypothesis component inside the existing design-project template. Brief pages keep their introductions in normal flow on phones, preventing the fixed reading card from covering the proposition. Other layouts and existing uncommitted work retained.
- Replaced placeholder Completed/2026 metadata with Design study and no unverified year. Exact plot identities, original academic dates, capacities and applicable regulatory entitlements remain open; source editions and inputs are stated on each page. No invented FSI, parking ratios, bed count or resort key count.
- Validation: 95-page production build, all three style lints and whitespace check pass. Nine route/viewport checks (1440/834/390px) pass with four study sections each, no horizontal overflow, no fixed phone card and no browser script errors. Local server at http://127.0.0.1:4322/; no push or deployment. Draft export: Codex 2026-10-25/co-2/outputs/barch-design-abstracts-and-hypotheses.md.

- Publication follow-up (Adi: “push it to live”): committed only these three briefs and their shared layout/access changes as `b7c89f1`, pushed to `main`; GitHub Actions run `40264369967` deployed successfully to Firebase. Separate BOM–MUM edits remain uncommitted and were excluded. Verified all three pages on https://advaitakelkar.com at 1440px and 390px: HTTP 200, Abstract/Hypothesis present, four study sections, no fixed phone cards, overflow or browser errors.

### 2026-10-25 — BOM–MUM graphic reference pass (local)

- Restyled the existing local radial timeline to Adi’s reference, Julien Nolin’s History of Brazil (https://jnolin.com/infographic02): adjoining flat charcoal/purple/turquoise/mint/yellow/coral bands, a top opening, fine year divisions, dark translucent event discs with white centres, circular monochrome portraits and eight perimeter event annotations.
- Enlarged the infographic to the page width; moved the reading card and navigation below it; enlarged the central seven-island map and retained its reclamation animation. Population is the coral inner band. Added editorial serif heading and a reference credit. Existing event data and corrections retained; reserved side annotation space to avoid portrait collisions.
- Changed `src/components/BomMumTimeline.astro` and the palette/order in `src/data/bom-mum.ts`; prior BOM–MUM work remains local. Production build (95 pages), all style lints and whitespace check pass. Browser confirms 163 event markers/pins, selected-event navigation, category toggling and no desktop page overflow. Preview saved to Codex 2026-10-25/co-2/outputs/bom-mum-reference-preview.png. No commit, push or deployment.

- Font correction (Adi): BOM–MUM uses Inter only, including the poster heading; supersedes the serif-heading choice above. Browser computed-style check confirms every element within the infographic resolves to `Inter, sans-serif`. Local only.

- Bubble-label follow-up (Adi): the eight perimeter event labels are now circular callouts with dates, wrapped titles, lane-colour outlines and leader lines. Bubbles select their full event by click or Enter/Space and follow the discipline filters. Expanded portrait clearance to keep the bubbles unobstructed; Inter retained. Production build, style lints and whitespace checks pass; click/keyboard selection and filtering checked locally. Preview: Codex 2026-10-25/co-2/outputs/bom-mum-bubbles-preview.png. Local only.

- Compact-layout follow-up: title, filters, selected event and arrows now share a desktop sidebar beside the viewport-sized wheel; people row moved below the interactive view. Reduced heading sizes/spacing and trimmed vertical SVG margins. Build and style lints pass; browser confirms 22px event title and no desktop overflow.
- Subsequent correction (Adi): removed all eight bubble callouts and their leader lines, restored all 17 wheel portraits, retained the 163 event markers and compact title/event layout. Browser confirms zero bubbles, 17 portraits and 163 markers. Local only; supersedes bubble-label choice above.

- Playback revision: replaced the O with a U-shaped timeline; starts grey, adds colour/event markers chronologically and synchronises the enlarged black map to schematic reclamation phases. Added play/pause, previous/next and a seek slider; auto-advance is fixed at 4 seconds per event (Adi’s correction), pauses offscreen/when hidden and stops on completion. Reduced-motion users start paused. No event-pace selector or restart button.
- Population correction: innermost ring, bars measured inward from that ring’s outer edge; supersedes the earlier outermost placement. Added a curved Politics + Conflicts label within the charcoal band.
- All 27 people moved to one scrollable column right of the map; consistent 52px circular framing with individual crop scales and monochrome contrast. Original resolution/archival softness retained rather than generating facial detail. Removed perimeter portraits and the bottom people row.
- Added `bom-mum-context.ts`: descriptions for the 15 formerly empty entries and explicit neighbouring-timeline context for all 163 events, with additional institutional source notes for selected events. Original historical data retained; no claim of fresh independent verification for every entry. Map labelled schematic.
- Production build (95 pages), style lints and whitespace pass. Browser checks: autoplay advances, rewind resets map/colour, final 1995 state shows all map phases black, 163 markers, 27 portraits, Inter only, no desktop overflow.
- Legend follow-up: all six category labels now occupy one horizontal row above the map; narrow widths can scroll that row. Browser confirms one label row above the map and no page overflow. All changes local; no push or deployment.

### 2026-10-26 — Architectural timeline and minimal style bands (local)

- Preserved the approved U-shaped playback and people column. Removed the five-discipline plus population tables below it; all 163 underlying events remain in the playback data.
- Added `BomMumArchitecture.astro` and `bom-mum-architecture.ts`: 20 selected architectural milestones through 1995, spanning Elephanta, St Thomas, Gothic Revival, High Court, Rajabai Library/Tower, CSMT, Taj, CSMVS construction/opening, Gateway, Art Deco/Regal/Eros/Marine Drive, Nehru Planetarium, NCPA Tata Theatre, Kanchanjunga and heritage protection. Completion and opening dates distinguished; sources linked on each tile.
- Horizontal tiles have previous/next controls, keyboard scrolling and a complete 20-dot jump navigator. Added end padding so the final milestone can align at the start of the viewport.
- Latest direction supersedes the separate period-chart experiment: only seven thin coloured style bands and a compact colour index directly above the dot bar. Bands align to milestone positions; approximate study windows overlap rather than imply exclusive style eras. No second graph, numeric axis or chart cursor. Inter retained.
- Validation: 95-page build and style lints passed for architecture/period implementation; final minimal-band styling compiles in dev, all style lints and whitespace checks pass. Browser confirms zero category tables, 20 tiles/dots, seven 3px bands, compact 64px key/band block, working Gateway jump and no desktop overflow. Restarted local dev server to clear stale component CSS after production builds. Local only; no commit/push/deployment.
- Follow-ups: anchored desktop playback buttons/slider below a flexible, scrollable event panel; first/last event control positions match. Updated architecture key to the same single-row circular-dot legend style as the main graphic, increased bands to 10px, and overlaid 20 vertical guides aligned to the milestone dots/years. Browser confirms all seven thicker bands, circular key marks, 20 guides and no page overflow; style lints and whitespace checks pass. Local only.
- Removed the population chart, textile section and essays below the architecture timeline. Moved compact source/portrait credits above it, preserving attribution. Integrated all 20 architectural milestones into the wheel and playback, reusing eight existing landmark entries rather than duplicating them; 175 total events, each architecture milestone has a source link. Browser confirms 20 architecture markers, no removed sections or desktop overflow. Lints, whitespace check and 95-page build pass. Local only.
- Removed the curved Politics + Conflicts label from the wheel. Added BOM–MUM’s abstract/hypothesis using the existing DesignProjectBrief component, framing the Richardson & Cruddas site as a cultural-centre design thesis about public memory, performance, exhibition and the city’s struggles for change. Updated introduction; retained the interactive history and architecture timeline. Browser verified both brief columns and rendered content; whitespace check passes. Local only.
- Publication preparation: consolidated the separate introduction into the abstract/hypothesis, renamed the project BOM → MUM and added `bom-mum` to the shared public-project allowlist. Verified the Academic listing is unlocked and opens the project. Adi explicitly requested commit and push to live; deployment is now authorised for the complete BOM → MUM implementation.

### 2026-10-26 — M.Arch abstracts, briefs and unlocks (local)

- Added Abstract + Brief to Union Pier, Skadoogee and Tower of Quiet Witness; replaced duplicate/placeholder descriptions. Existing course labels and collaborators retained. Unlocked all three in the shared access list at Adi’s request.
- Union Pier draws from existing project copy and shared decisions about its straight Battery Wall, semi-basement parking, market quarter and pier deck. Skadoogee follows Adi’s recorded wellness / learning / Center for Resilience zoning triad. Tower follows its project brief’s museum, concrete massing, bridge, water, galleries, amphitheatre and tower. Source files disagree on Tower’s site (older shared memory: Lake Zwerner; project brief/site YAML: Atlanta), so the new abstract avoids a specific lake/address and leaves existing location metadata unchanged.
- Added a Brief field to DesignProjectBrief; migrated the resort, hospital and masshousing to programme-led briefs. Hypothesis remains for BOM → MUM; Powerhouse content unchanged. This distinction is Adi’s current direction for design studies versus thesis projects.
- Validation: style lints, whitespace check and 95-page build pass; built HTML confirms the correct Abstract/Brief headings on all six design projects and Abstract/Hypothesis on BOM → MUM. Browser confirms all three M.Arch listings unlocked and the Skadoogee brief rendered. Local only; not yet committed or published.
- Prior BOM → MUM publication completed as fcb2d42, successful deployment run 40268996801; live page verified with 175 events and 20 architectural markers.
- Typography follow-up: shared Abstract/Brief component now uses Powerhouse’s exact reading-size clamp (13–15px) for abstracts and medium claim token (26–40px), 1.15 line height and -.03em tracking for Brief/Hypothesis bodies. Browser confirms the hierarchy; style lints and whitespace checks pass. Local only.


### 2026-10-26 — Powerhouse editorial report (local)

- Created a separate 32-page native InDesign architectural report: continuous Chapters 1–4, all notes and bibliography in one final reference story, new cover and compact abstract/contents opening. Earlier 35-page book preserved.
- All 110 manuscript paragraphs, 116 notes, 117 bibliography entries, six native tables (306 cells) and native graphic components retained; 117 citation links resolve, zero missing fonts/overset. All PDF pages visually reviewed.
- Book/PDF bridge now points to `The Powerhouse_Editorial Report_Ch1-4`; local PDF refreshed. Website manuscript and graphics unchanged. No commit/push/publication.

- Editorial screenshot follow-up (26 October): compact horizontal layouts for Figures 1.3 / 2.3c / 3.6; balanced closing Chapter 1 text blocks; three-line minimum at paragraph splits. Actual native prose-line audit passed; all 32 PDF pages reviewed. Native source text, figures and citations preserved. Updated matching INDD/IDML/PDF and local PDF copy.


### 2026-10-26 — Powerhouse website matches editorial report (local)

- Matched the current book’s 14/20 reading proportions, balanced two-column prose, 54 px maximum gutter, bold chapter/section hierarchy, individual light-grey rectangular figure panels and compact spacing. Desktop/tablet use two prose columns; phones use one.
- Civic road-station amenities use a compact horizontal panel; the 2030 scenario uses five categories across the width; the pavement comparison uses two. Full-width diagrams retain full width on tablets. Narrow multi-panel figures use smaller headings, as in the book.
- All 116 chapter notes now precede one complete 117-entry bibliography. Citation popups, exact bibliography jumps and back links retain their anchors. All 75 Chapter 2–4 figure panels and manuscript/figure JSON source files preserved.
- Refreshed the full 32-page PDF from the canonical book folder; PDF link includes the export version to avoid stale cached copies. Served PDF checksum matches the canonical file.
- Validation: all 29 reading sections checked at 1440, 834 and 390 px; correct columns and no horizontal page overflow. Phone citation popup fits viewport, bibliography jump works, no duplicate IDs/missing note targets/browser errors. 95-page build, breakpoint/glyph/icon lints and whitespace checks pass. Local only; no commit/push/publication.


### 2026-10-26 — Larger M.Arch project briefs (local)

- At Adi’s request, Skadoogee, Union Pier and Tower of Quiet Witness now use Powerhouse’s exact hypothesis typography for their Brief: shared medium token (26–40 px), 1.15 line height and -.03em tracking. Added an explicit prominent option to DesignProjectBrief for these three projects. Copy preserved.
- Verified identical computed typography to Powerhouse at 1440 px and 26 px type at 390 px on all three; no page overflow. 95-page build and whitespace checks pass. Refreshed the local dev server after stale build styles affected the preview. Local only; no commit/push/publication.

### 2026-10-26 — Concise M.Arch briefs and mapping direction (local)

- Shortened only the Brief copy for Skadoogee (69 to 35 words), Union Pier (68 to 28) and Tower of Quiet Witness (70 to 35). Retained large typography and full abstracts. All three updated pages verified in-browser with no horizontal overflow.
- Adi selected project site and surroundings for proposed 2D web mapping. Research reference: archiMap by MassLabs; recommended direction is a reusable MapLibre viewer with curated project GeoJSON and figure-ground, access, landscape and proposal layers. No map implementation or dependency added yet. Tower site discrepancy still needs resolution before locating its map.
- Local only; no commit/push/publication.

### 2026-10-26 — Interactive M.Arch site-context maps (local)

- Added a reusable 2D site atlas after the brief on Tower, Union Pier and Skadoogee: Context, Figure–ground, Access and Landscape views; six layer switches; pan, zoom/reset, metric scale and feature inspection. Lazy MapLibre loading, local vector data and a static SVG fallback. Each map offers layered SVG and GeoJSON downloads with source attribution.
- Adi resolved Tower’s site as the former Chattahoochee Brick Company beside the Chattahoochee River in Atlanta. Updated its abstract; used the 3195 Brick Plant Road address-geocoder point with an explicit vicinity note. Union Pier is Charleston. Skadoogee uses Adi’s exact Dahlonega/Lumpkin County pin, 34.55047325623666, -83.97303499793635. Existing mapped context and reference pins are distinguished from parcel boundaries/proposal footprints.
- Checked-in OSM/OpenMapTiles context via 21 bounded OpenFreeMap tiles; runtime maps need no external basemap service or key. Named layers and editable SVGs generated by scripts/build-site-context.mjs; docs/project-site-maps.md records data provenance, accuracy and refresh commands.
- Validation: all three maps ready and view switches working on desktop and at 390px, correct stacked phone layout and no page overflow; layer toggles, zoom/reset and actual SVG rendering checked. Browser logs clean after loader correction. House lints and 95-page production build pass. Local only; no commit/push/publication.

### 2026-10-26 — Simplified square location maps (local)

- Adi simplified the atlas to one square map per project, all layers on, location marker only. Removed view tabs, layer switches, map labels/titles, sidebar, scale, inspection text and download UI. Required source attribution remains below the frame.
- Map foreground/background now follow the selected website theme, including dark mode. Opacity distinguishes buildings, water, landscape and routes. Static SVG fallback is inline and also theme-aware.
- Clipped vector geometry to exact tile extents to remove buffer overlaps visible under transparency; regenerated all three data extracts and square fallback SVGs. docs/project-site-maps.md describes the final implementation.
- Local only; no publication.
- Final validation: all three maps ready at 390 px, each exactly 366 × 366 px, zero map text/controls/download links and no horizontal overflow. Theme and dark/light changes verified; no browser errors. Lints, targeted strict TypeScript checks, whitespace checks and the 95-page production build pass.

### 2026-10-26 — Abstract / map / brief layout (local)

- Skadoogee, Union Pier and Tower now place Abstract on the left and the square map on the right, with Brief spanning the full width below. Shared DesignProjectBrief accepts an optional siteProjectId; other project layouts retain their existing two-column propositions. Map labels, controls and downloads remain absent; theme behaviour retained.
- All three verified on desktop: aligned abstract/map top, square right-hand map, brief below and full-width. At 390 px all three stack Abstract → map → Brief with no horizontal overflow. Lints, whitespace check and 95-page build pass. Refreshed dev server to clear an older cached stylesheet. Local only.

### 2026-10-26 — More academic briefs and unlocks (local)

- Unlocked Habersham Hall and SCAD Design Built in the shared access allowlist. Academic listing confirms both are unlocked.
- Added a source-grounded Abstract / concise Brief to Habersham Hall; retained existing chapters and credits. Verified its location at 235 Habersham Street against SCAD’s official page and the OSM building point; added its square themed context map to the right, brief full width below.
- Shortened Karshid Beach Resort, Siddharth Nagar Hospital and Mumbai Masshousing briefs to the same prominent full-width style. Their current files identify neighbourhoods but no plots. Asked Adi for the three map pins; maps remain pending those exact locations. No approximate project pins invented.
- Map embedding now follows the project-site registry rather than a hardcoded three-project list. Added --only=project-id to the context builder so new site data can be generated independently. Full-width prominent briefs also work while a location remains pending.
- House lints and 95-page production build pass. Local only; no publication.

- Pins received from Adi: resort 18.44055106031501, 72.9061639969247; hospital and masshousing both 19.15943318972379, 72.84020363855329. Generated all three local context extracts and square SVG fallbacks, completing the requested four-page layout. All four verified on desktop and at 390 px: correct map-right/full-width-brief layout, stacked phone order, square maps, exact pin values, no controls/downloads and no horizontal overflow.

### 2026-10-26 — SCAD Design Built editorial report (local)

- At Adi’s request, moved SCAD Design Built to a dedicated report page using Powerhouse’s editorial hierarchy: abstract / research question, compact PDF links and credits, sticky numbered chapter navigation, section links and a full intervention index. Existing four topics and all twelve interventions retained.
- Reading text uses the Powerhouse 14/20 proportions, two columns on desktop/tablet and one on phones. Bold chapter/section headings, compact individual figure and programme panels, natural image proportions and rectangular low-contrast backgrounds replace the gallery/card treatment. Existing theme colours remain available.
- Content audit against the previous generated page confirms all four chapter texts and all 39 chapter images preserved in order; all twelve programme lists and both PDF links remain. No source chapter copy or PDFs changed.
- Browser verified all chapter switches, cross-chapter index jumps, direct section hashes, keyboard tab navigation, Escape close, and phone index bounds. Four chapters checked on desktop and 390 px with no horizontal overflow and images fitting the viewport. The dedicated route is excluded from the generic project route. Local only; no publication.

- Design Built follow-ups: each intervention now has one full-column 4:5 slideshow alternating its sketch and render every 4.5 seconds, with manual next and pause/play. Slides stop offscreen, in hidden tabs, on hover/focus and under reduced motion; both images retain their proportions. All twelve sliders verified, including actual automatic advancement, pause/manual next and 366px phone frames with no overflow.
- Removed the Summary/Book download links and downloads metadata at Adi’s request. Restored all five original circular team portraits (professor separated from collaborators), with accessible names and hover/focus labels. All five files load; zero PDF links remain on the report. Source PDF files were not modified.
- Chapter, section and Index navigation now use Powerhouse’s exact pill geometry, typography, spacing and active foreground/background treatment. Active section pills follow clicks and deep links. Original chapter text, 39 graphics and twelve programmes remain intact.

### 2026-10-26 — Publication authorised

- Adi requested commit and push for the Powerhouse PDF/editorial updates, academic abstracts/briefs, seven site maps, project unlocks and SCAD Design Built report/slideshows/portraits/pills. Final 95-page production build, house lints and whitespace checks pass.
- Separate pre-existing BOM → MUM playback changes in BomMumTimeline.astro and bom-mum-playback.ts are excluded from this publication and remain local.

- Publication follow-up: Adi explicitly requested adding the pending BOM → MUM playback changes as well. This follow-up includes perimeter portraits and lane labels, white-centred event markers with halos and the current-event callout. Both coupled payload/renderer files are included; the latest local 95-page build already covered them.


### 2026-10-27 — Consistent project controls (local)

- Standardised the desktop project control cluster: colour choices, mode toggle and adjacent previous/next arrows. Reports without a footer place their Pages menu beside the left navigation; arrow positions match regular project pages. Fixed-palette pages hide colour choices and the divider, retaining light/dark mode.
- Previous/next and keyboard Left/Right skip locked projects using the shared public allowlist, retaining category order and circular navigation. Directly opened locked pages also lead back to public projects.
- Verified all 114 generated arrow links across 57 project pages point to unlocked neighbours. Browser checks confirm identical arrow coordinates on Skadoogee, Powerhouse and Design Built; five swatches on themed pages, zero on Powerhouse; keyboard next navigation works. At 390 px the existing bottom navigation restores with no overflow. House lints, whitespace check and 95-page build pass. Local only.
- Both authorised publication runs from 26 Oct, including BOM → MUM, completed successfully.


### 2026-10-27 — Academic introduction template (local)

- Mapped design briefs now stack Abstract and Brief in the left column, with the right map spanning their combined height. Maps no longer impose a square desktop frame; phones stack Abstract, Brief, then a square map. Shared component applies consistently to the seven mapped academic projects.
- Academic chapter tabs use Powerhouse's compact, wrapping pill geometry. Powerhouse has a proper project-size title; removed the infrastructure research/data visualiser subtitle at Adi's request. Existing abstract/hypothesis and book remain intact.
- Browser checked Tower and Skadoogee column bottoms match exactly; phone layout at 390px has no horizontal overflow. Lints and 95-page build pass; subsequent title-only removal verified in browser. Local only.


### 2026-10-27 — People below academic introductions (local)

- Shared ProjectPeople component renders one full-width row of 32px circular portraits below Abstract/Brief, with hover/focus names. Applied to mapped academic briefs, Powerhouse and Design Built. Removed the previous above-brief row on design-brief pages; other project templates retain their existing placement.
- Powerhouse team confirmed by Adi: Casimir Esbach, Advaita Kelkar, Hsu-Jen Huang and Manuel. Copied Adi's supplied Manuel portrait to public/images/people/manuel.jpeg. No surname supplied, so displayed as Manuel. Centralised the existing image registry in src/data/people.ts.
- Browser verified all four Powerhouse portraits load at 32px; Skadoogee has one team row immediately below the brief and no legacy row. House lints, 95-page production build and whitespace checks pass. Local only.


### 2026-10-27 — Brief size and faculty credits refinement (local)

- Reduced Brief text to 16–20px while retaining Hypothesis display size (Powerhouse verified at 40px). Abstract/Brief/people now live together in the left column; map stretches to match that column, producing a near-square desktop map (Tower: 572 × 598px including attribution). Phones retain a square map below the left content.
- Shared academic portraits remain 32px, now with the established grayscale/0.6 opacity treatment, full opacity on hover/focus, 32px space below and a faculty/student divider where both groups exist. All academic project intros use the shared component.
- Powerhouse left column: Hsu-Jen Huang, Casimir Esbach, Manuel, Susan Falls, divider, Advaita Kelkar. Susan's supplied photo copied into the people registry. All five images load.
- BOM → MUM, Karshid, Masshousing and Siddharth Hospital explicitly credit only Advaita Kelkar; no faculty added. BOM browser check confirms one portrait and no divider/legacy row.
- House lints, whitespace checks and 95-page build pass. Desktop column alignment and phone overflow checked; Powerhouse Hypothesis unchanged. Local only.


### 2026-10-27 — Compact academic mastheads (local)

- Removed the short metadata rule and course-credit underline on academic project pages, leaving the proposition's single soft full-width separator. Metadata sits closer to the title; course and collaboration text are small muted credits with reduced surrounding space. Collaboration text is now visible rather than occupying an invisible reserved line.
- Powerhouse and Design Built headers lose the extra title rule, share the 64px desktop title baseline and use 24px introductory padding. Their book/report navigation remains unchanged.
- Shared portrait refinement: 4px circle spacing, soft 1px borders and a closer faculty divider; location retained.
- Browser verified Union Pier's header reduction (proposition begins at y207 instead of y298 at 1560px), absence of short rules, 390px layout without overflow, and clean 64px title baseline on both reports. House lints and 95-page build pass; final small credit-size specificity adjustment checked in browser. Local only.


### 2026-10-27 — One academic header and pill system (local)

- Added AcademicProjectHeader, shared by all 17 academic pages including Powerhouse and Design Built. Stable metadata order: year, status, location, degree/studio, category, tags; Powerhouse-style compact pills with the same geometry and typography. Academic metadata no longer enters the generic shuffled pill row.
- A single full-width subtitle sits below the pills and above content columns. SCAD projects combine the collaboration credit and source course line; B.Arch project descriptions retain their own source text. Removed duplicate in-column course lines. Powerhouse receives its metadata pills; Design Built uses the same title/metadata treatment.
- Verified shared header/pills in all 17 generated academic pages. Browser checks cover visualisation, Masshousing, Powerhouse, Design Built; titles sit at y64 on desktop, keyboard navigation preserves the header geometry, mobile at 390px has no overflow. House lints, 95-page build and whitespace checks pass. Local only.
- Brief follow-up retained: bold 600, responsive 18–22px; Hypothesis unchanged.


### 2026-10-27 — Shared headers across categories and Work propositions (local)

- Promoted AcademicProjectHeader to ProjectHeader and applied it to every project category (57 generated project pages). Same title baseline, stable metadata order, pill geometry and full-width muted subtitle; collaboration credits are included where established in source. Existing pipeline details and original-card controls retained.
- Added source-grounded Abstract and Brief copy for all 18 Work projects in src/data/work-propositions.ts. WorkProjectProposition places the abstract and bold brief in an equal-width left column, existing image slider on the right; phone order is text then slider. Full original description and links remain in the Project story disclosure before the existing drawings/details article. No existing source descriptions or media changed.
- Academic credit name tooltips now match Work: inverted pill above the portrait, same grayscale/opacity treatment; faculty/student separation and left-column placement retained.
- Browser verified shared headers on Work, Freelancer and ARCHV with y64 desktop/y24 phone title positions; no phone overflow. Seven Gardens and Under the Tree have equal, top-aligned text/image columns; original story disclosure opens, slider operates, phone stacks correctly. Powerhouse confirms faculty order, divider and Work-style tooltip. Generated-page audit confirms all 57 headers and all 18 Work propositions/stories. House lints, production build and whitespace checks pass. Local only.


### 2026-10-27 — AI series full contact sheets (local)

- Added PortraitContactSheet to all seven AI-series pages: complete always-visible grid below the viewer, six columns from 1024px, four from 700px and three on phones. All images retain their proportions, full opacity and natural colour. Replaced the old overlapping mobile thumbnail window; retained its hidden data/selection engine.
- Every portrait has a compact wrapping character-name pill. Pill selection, focused Left/Right keys, the main portrait and contact-sheet highlight share one stable sequence. A direct accessible dialog opens the exact card clicked and supports next/previous, arrow keys and Escape. The full collection remains in the page.
- Sups and Royals prose rosters are replaced visually by the complete named pills; source YAML descriptions remain intact. Exact duplicate cover entries removed from the displayed sequence.
- Generated-page audit checks one pill and one card per unique source image across all seven series: Sups 132, Royals 50, Hinterland 26, Architect x Architects 48, Space Pirates 64, Alt Verse 50, Hanma FAM 29. Browser verifies 6 desktop/3 phone columns, no 390px overflow, correct pill/keyboard selection and exact Deathstroke → Doomsday dialog navigation. House lints, 95-page build and whitespace check pass. Local only.


### 2026-10-27 — Portrait sidebar pills and open prompt (local)

- Moved all character-name pills into the left column after the introduction and permanently visible prompt. Pills now use 10px type, 20px minimum height and an arrow after every name. The full contact sheet remains below the two-column introduction, with no duplicated full-width name cloud.
- Removed the portrait prompt toggle and mobile dock reparenting. Portrait introductions now use normal-height flow instead of the former viewport-limited grid, avoiding clipping/overlap as the prompt and complete name roster grow. Viewer is constrained to its right column. Source prompt text and Copy remain.
- Navigation wiring covers the relocated pills, full deck and viewer; focused Left/Right continues to select the adjacent name. Sups browser check confirms 132 pills/132 arrows, visible prompt, no left/right overlap and full deck below the complete sidebar; phone at 390px has no overflow and no old dock. House lints, 95-page build and whitespace checks pass. Local only.


### 2026-10-27 — Consistent portrait contact-sheet frames (local)

- Lobo and Cable source files are 896×1152, wider than the standard Sups 536×960 frame. Contact-sheet cards now use the series' first-image aspect ratio and fill that frame with a top-centred crop, preventing unequal-height thumbnails and white gaps. Original image files and full-image dialog remain unchanged.
- Model/settings metadata moved into the shared subtitle before the introduction sentence for all projects with pipeline data; removed its standalone row.


### 2026-10-27 — Compact viewport portrait introduction (local)

- Character pills now use title case and a light active/hover treatment. Lists naturally expand until they reach a 25dvh maximum; desktop additionally limits them to remaining room above the footer. Active selection scrolls only this list into view, including first/last wrap. Short lists do not gain an unnecessary scrollbar.
- Introduction and Prompt have separate labels and tighter text/spacing. Intro uses the full left-column width. Main portrait is bounded by the available desktop viewport height, preserving aspect ratio, with the oversized empty frame removed. The full contact sheet remains in normal page flow below the top section.
- Browser verified normal-case labels/light selection, viewport-bounded portrait, list scroll tracking on Batman → X-23 wrap and no horizontal overflow. Production build and whitespace checks pass; house lints passed before the final fit-to-footer refinement. Local only.


### 2026-10-27 — Simplified portrait text and fixed main crops (local)

- Portrait introduction is 12px/1.45, prompt 14px/1.45 with plain text; removed prompt card border, background and header rule while retaining Copy. This brings the name list upward and frees room for more names.
- Main portrait viewer now uses the series' first-frame aspect ratio and cover crop, not each selected image's intrinsic width. Verified Lobo and Cable both render at 340 × 609px on the same desktop viewport, with no horizontal overflow. Full-image dialog and originals remain unchanged.
- Production build and whitespace check pass; house lint corrected a previous raw breakpoint comparison to matchMedia. Browser verified intro/prompt hierarchy, removed border and matching right-side crops. Local only.


### 2026-10-27 — Main portrait matches left column (local)

- Desktop portrait height now follows the complete left column (introduction, prompt, bounded pills and name/counter) through ResizeObserver, preserving the series crop ratio. Resizes and text changes update the measurement; phone layout remains unaffected.
- Browser measured left and poster at 616.5px, sharing the same top and bottom to subpixel rounding. Original files and full deck unchanged. Local only.


### 2026-10-27 — Remove duplicate AI-series prose rosters (local)

- Space Pirates, Architect x Architects and Alt Verse now omit their long italic tier/architect/film character lists from the rendered introduction. Names remain only in the existing selectable pills and full deck. Source descriptions remain intact.
- Browser confirms zero prose roster emphasis blocks, 12px introductory text and retained pill counts (64 / 48 / 50); no Alt Verse overflow. Whitespace check passes. Local only.


### 2026-10-27 — Publication authorised

- Adi requested commit and push of the current portfolio changes: shared project headers/navigation, academic proposition layouts and people, Work abstracts/briefs, and complete responsive AI contact sheets/viewers/pills.
- Final house lints, whitespace check and 95-page production build pass. Generated audit verifies exactly one shared header on all 57 project pages, public-only previous/next links, 18 Work introductions with original stories retained, and complete matching pill/card counts across seven AI series.

### 2026-10-27 — Desktop breadcrumb category pills (local)

- Added a round disclosure arrow immediately after Projects in the shared desktop breadcrumb. It expands Academic, ARCHV, Freelancer and Work as matching inline pills, sourced from the category collection.
- Toggle exposes expanded state and Escape closes it with focus returned to the arrow. Mobile navigation remains unchanged. Browser confirms four correct category links, working disclosure and no desktop overflow; house lints and whitespace check pass.
- Category pages now start with the desktop category pills expanded, highlighting the current category; the disclosure remains collapsible.

### 2026-10-27 — Category portrait registry correction (local)

- CategoryLayout now imports the shared people registry instead of maintaining an outdated duplicate. Manuel and Susan Falls now use Adi's supplied photos, matching project pages; removed the incorrect Advaita-photo fallback for other names.
- Freelancer category: Varun Mehta now sits with Nayan and Sneha before the divider, with Advaita after it. Other category groupings are unchanged.

### 2026-10-27 — Compact category studio pills (local)

- Shared category studio tabs now use breadcrumb-scale micro type, 4px × 12px padding and 14px arrows across desktop and phone, replacing display-sized labels. Round All control matches the smaller pills.

### 2026-10-27 — Compact desktop category project grids (local)

- Category project cards use 20–24px names, 28px arrow controls, tighter internal padding and 8px grid gaps. Two columns from 1024px; three from 1366px. Tightened people/tab/list spacing while retaining the introduction and existing phone layout.
- Browser verifies all 18 Work projects visible in the wide desktop viewport, three columns and no horizontal overflow.
- Adi requested larger category project names: restored the shared medium title token (Academic scale) while retaining compact spacing, arrow controls and two/three-column grid.
- Projects listing now shares the category cards' medium name-size cap and 28px arrow controls on desktop; descriptions and image strips retained.
- Three-column wide layout applies only to All/ungrouped category lists. Individual studio tabs always retain two desktop columns.

### 2026-10-27 — Project category breadcrumb and random navigation (local)

- Individual project pages start with category pills expanded and highlight their parent category. Added a shared infinity icon in a circular Random project link after the right-side previous/next arrows.
- Random choices use only the public project registry and exclude the current project. Browser verifies CARLO category highlight, 51 eligible destinations, working random navigation and no overflow. House lints pass.
- Random project control now uses the existing plain circle icon instead of infinity, per Adi. Random navigation behavior retained.

### 2026-10-27 — Website audit and cleanup authorised for publication

- Audited 144 generated/copied HTML documents: no broken local href/src references or duplicate IDs. All random-project candidates are public and exclude the current project. Main-site images carry alt attributes; empty fullscreen/preview image slots and original ARCHV lazy-load markup are intentional.
- Browser checks cover 13 primary routes/templates at 390, 1024 and 1600px (39 cases), with no horizontal overflow or loaded-image failures. Checked studio filtering (two columns) versus All (three columns), and runtime console (no errors).
- Cleaned repeated category-pill CSS, kept the shared portrait registry, added visible keyboard focus to project arrows, used the shared icon sizing token, and allowed long category titles to wrap instead of truncating.
- Existing limitation: public read of live Featured configuration returns 403; the verified saved 20-project fallback works. No security rules or Featured selection changed. Historical ARCHV replica markup retained.
- Adi authorised cleanup, commit and push. Final production build and house checks required before publishing.

### 2026-10-28 — Illustrated Powerhouse typology studies

- Figure 2.4a–h in Chapter 2 section 2.3 now includes the eight architectural section studies, retaining numbers, dates, captions, spatial readings and research links.
- Optimised WebP images open at full size; labelled AI-generated interpretive sections, with research references distinguished from image provenance.
- Production build (95 pages), house lints and diff checks pass. Browser verified all eight assets loaded, two-column layout at 1018px and no horizontal overflow.

### 2026-10-28 — Version 2 chapter imagery

- Applied the approved coordinated family to all 25 generated narrative images across Chapters 1–2: ten architectural sketches and fifteen realistic studies. New optimised assets live in images/version2; original assets and five archival references remain available.
- Updated time-of-day captions, distinguished architectural-study credits, and added full-size image links. Single-image sketches retain their full 3:2 composition with contain sizing. Existing maps, data graphics and eight typology studies retain their established precise rendering.
- Production build (95 pages), house lints, diff checks and 25-asset manifest validation passed. Browser verified the three-image programme row, no horizontal overflow and computed 3:2/contain rules for the vehicle study after refreshing the dev server.
- Source artwork, generation audit and both versions are preserved in the Desktop Powerhouse Visuals — Two Versions folder and the originating Codex output folder.

### 2026-10-28 — Civic room / forecourt comparison redrawn

- Replaced the mixed archival/sketch row in 1.2 with three matching frontal architectural studies: an occupied enclosed railway hall, a minimal fuel canopy/pay booth, and the inherited charging forecourt where people wait in cars or on the kerb.
- Revised captions around the spatial argument. Railway illustration is explicitly interpretive; the archival source and previous asset versions are retained. All three carry AI-generated architectural study credits and full-size links.
- Build, house lints and diff checks pass. Browser confirmed three loaded replacement assets and no horizontal overflow; source PNGs and prompts saved in the Civic Room Comparison output folder and Desktop version package.

### 2026-10-28 — Matched site comparison camera

- Redrew the proposed 1.4 parking-lot study using the existing lot as the fixed camera/base. Foreground cars, parking lines, lamps, walking figure and site extent align; programme additions occupy the rear edge.
- New aligned asset has its own versioned URL; previous proposed study and original versions preserved. Source PNG pair and prompt saved in the Aligned Site Comparison output folder and Desktop version package.

### 2026-10-28 — Two-storey programme comparison

- Reframed both 1.4 studies at the same closer oblique camera. Proposal is a substantial occupied two-storey civic building: market/clinic below and shared workspace/community rooms above. Generated the empty-lot counterpart from this composition, retaining foreground cars, chargers, lamps and walking figure.
- Updated both versioned image URLs and captions. Previous site studies remain preserved; full-resolution pair and prompts copied to the Desktop visual package.

### 2026-10-28 — Unresolved proposition image

- Replaced only the 1.6 proposition asset with a soft circular blurred concept field, removing readable building/landscape detail so the proposal does not imply a resolved architectural design. Caption explicitly states that form remains to be designed. Other detailed images retain their treatment. Source and prompt saved separately; previous asset retained.

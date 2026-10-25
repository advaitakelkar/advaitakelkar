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

`dakughar` · `dhal-ni-pol` · `house-by-the-sea` ·
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

- Kept `/Users/adi/Dev/advaitakelkar-live` as the only active local working copy; the live copy is hosted at advaitakelkar.com. `dist/` remains the generated deployment output.
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


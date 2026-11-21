# Union Pier project documentation

The project page at `/projects/union-pier-charleston/` presents the audited 16 November 2026 collection: 91 distinct renders across eight narrative chapters. The existing portfolio typography, colours, navigation and introduction slider are retained.

## Content and provenance

- The canonical source is the Union Pier Render project's `output edit` folder in Drive. Original PNGs are not changed or duplicated into the website.
- `src/data/union-pier-renders.json` records each source hash and its full-resolution and 720px WebP derivatives. There are 182 web assets, approximately 41 MB in total. Images use responsive sources and lazy loading.
- `src/data/union-pier-documentation.ts` owns the narrative: eight chapters, one paragraph each, and the order every drawing is shown in. A chapter holds one or more sets; each set is a slider; a slide is one drawing or a group that belongs side by side. `UnionPierDocumentation.astro` renders them and fails the build if a render is missing, repeated or unknown.
- Since 17 November 2026 every drawing is on the page in a slider — nothing sits behind a "view the complete set" disclosure. Sections and wide drawings run the full content width; the site plan and ground plan are an uncapped full-width pair. From 1024px a slide is the stop (pairs side by side); below it each drawing is its own stop. Stage height is CSS arithmetic from the set's median proportion, capped to the window, and the track follows the height of the stop on screen.
- Five before/proposed pairs and nine block-axonometric/cut-plan pairs preserve the relationships between drawings. All 91 images appear once in the documentation; five aerials also form the introduction slider.
- R01–R03 use the revised sectional-perspective-and-plan sheets. Their superseded standalone renders are excluded. A02 and the user-removed short sheets remain excluded. R04 and RS04 are distinct retained drawings.
- Before aerials are AI reconstructions from supplied Google Earth screenshots with approximate camera matching. The page explicitly distinguishes them from surveyed or current documentary photography. Cut-plan interiors and rendered landscape details remain conceptual.
- Earlier revision-G diagrams and research files are preserved in the repository. The main page no longer describes them as the current design. Relevant Charleston research and material studies remain available in an expandable references section.

## Updating the collection

Run `node scripts/import-union-pier-renders.mjs "/absolute/path/to/output edit"` from the website checkout. The importer currently expects the audited 91-image collection and rejects repeated drawing identities. Reconcile a later collection deliberately before changing this count or the chapter structure.

Run `pnpm check`, `pnpm audit`, the portfolio responsive matrix and `node scripts/audit-union-pier.mjs` against a production preview. The focused audit checks complete image coverage, all full-size image responses, before/after and block pairs, phone/tablet/desktop overflow, viewer navigation, Escape and focus return. Reports and screenshots are written to ignored `review/`.

The existing publication path remains GitHub Actions to Firebase Hosting. Astro was patched from 7.4.4 to 7.4.7 to clear the two dependency advisories found during the pre-publication gate; no major framework upgrade was made.

Focused interaction audit passed at 390, 834 and 1440 px: all 91 full-size images responded, all eight chapters and fourteen pairs were present, expanded sets did not overflow, and viewer keyboard/focus handling passed. Source hashes were checked against the current audited PNG collection.

Pre-publication validation: `pnpm check` passed (no missing local references, fragments or duplicate IDs); dependency audit returned zero advisories; all 385 responsive cases passed across 35 routes and 11 widths.

## 20 November 2026 — matched aerials, Indian Miniature blocks, key plans

- The page now holds 95 drawings. `scripts/add-union-pier-extras.mjs "<Union Pier folder>"` adds everything made after the audited 91-image import; run it after the importer, which still expects 91.
- Before / proposed: the existing aerial is the fixed frame. For A01, A05 and A06 the proposal was generated into the existing aerial (Nano Banana Pro on Comfy Cloud, site plan as layout guide) and composited so every pixel outside the port is the existing image (`a01-frame`, `a05-frame`, `a06-frame`). A03 and A04 already shared a frame. The model-rendered A01, A05 and A06 follow as "The proposal from the air".
- Blocks: the axonometrics are the Indian Miniature finals (`4_final.png`). Each sits beside a key plan turned square to the page (`b0X-key`). B01 is a finished key plan; B02–B09 show the straightened cut plan until theirs are made.
- Masterplan order: site plan in the city, site plan, ground floor plan, existing/proposed studies, axonometric. The ground floor plan with land use (`g06-view`, Nano Banana Pro from G02, slightly zoomed out) sits beside the black cut plan.
- The OpenStreetMap site map is no longer shown on this project.

## 20 November 2026 (later) — location, history, site analysis, harbour-up plans

- 103 drawings in 11 chapters: location, history, site analysis, the city, masterplan, blocks, before/proposed, parks, sections, the walk, details.
- A chapter may carry `columns` (short text columns under its drawings) and a `columnsNote`. History uses them for five eras of dated events with sources; site analysis for the SWOT panel.
- `l01-view` location circles, `h01-view` the 5 x 2 timeline board, `e01`–`e06` existing site analysis maps: all drawn from the Charleston Study data by scripts 19–21 in the Union Pier folder. Only the five era photographs on the board are generated (Flux 2 Pro) and shown in black and white. The growth maps and the site outline are approximate and say so on the page.
- G01, G02, G03 and G06 are the harbour-up rotations.
- `DesignProjectBrief` takes `sideBySide`: Abstract and Brief as two columns from 1024px (Union Pier only).

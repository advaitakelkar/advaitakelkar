# Union Pier project documentation

The project page at `/projects/union-pier-charleston/` presents the audited 16 November 2026 collection: 91 distinct renders across eight narrative chapters. The existing portfolio typography, colours, navigation and introduction slider are retained.

## Content and provenance

- The canonical source is the Union Pier Render project's `output edit` folder in Drive. Original PNGs are not changed or duplicated into the website.
- `src/data/union-pier-renders.json` records each source hash and its full-resolution and 720px WebP derivatives. There are 182 web assets, approximately 41 MB in total. Images use responsive sources and lazy loading.
- `src/data/union-pier-documentation.ts` owns the narrative and chapter grouping. `UnionPierDocumentation.astro` presents the chapters; `UnionPierFigure.astro` presents each drawing.
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

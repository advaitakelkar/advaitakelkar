# Portfolio design and quality system

Preserve the portfolio's visual identity: Inter, existing colours, quiet pill navigation,
editorial hierarchy, image proportions and project-specific presentation. Improve legibility
and behaviour through shared rules rather than new styles for each page.

## Sources of truth

- `src/styles/tokens.css`: typography, spacing, colour, motion, focus and touch minimums.
- `src/data/responsive-contract.json`: breakpoints, review widths, representative routes,
  reading selectors and primary touch-control selectors.
- `src/lib/breakpoints.ts`: runtime helpers using that contract.
- `scripts/lint-breakpoints.mjs`: permits only the contract's width queries.
- `scripts/site-quality.mjs`: measurable browser checks, reused by the review harness.

Do not add a breakpoint to fix a single page. First use wrapping, `minmax(0, 1fr)`, flexible
columns and natural content height. Add a new breakpoint only with a site-wide reason and
update the contract, runtime consumers and checks together.

The bottom navigation publishes its measured height as `--_tokens---layout--dock`;
page clearance and the project filter dock follow it, including safe-area padding.

## Reading and controls

| Role | Rule |
| --- | --- |
| Prose | `--_tokens---type--reading`: fluid 16–18px; never the caption token |
| Reading rhythm | `--_tokens---leading--reading`: 1.6; typical measure up to 68ch |
| Headings | Existing fluid heading scales; retain the established hierarchy |
| Captions and metadata | Existing micro/tag scales; do not use them for paragraphs |
| Primary phone/tablet controls | At least 44 × 44 CSS pixels |
| Keyboard | Visible focus, real buttons/links, Escape and focus return for dialogs |
| Motion | Honour reduced motion; do not rely on animation to reveal essential content |
| Images and drawings | Preserve aspect ratio; scrolling/zoom must be explicit |

The 44px floor applies to navigation, filters, Read more and exhibition menus. Inline prose links,
chart marks and decorative carousel indicators are separate cases; this is not a blanket
accessibility certification. New primary control families must be added to the contract.

## Before publishing

```sh
pnpm audit:deps
pnpm check
pnpm preview --host 127.0.0.1 --port 4331
# In a second terminal:
SHOOT_BASE=http://127.0.0.1:4331 pnpm audit:responsive
```

The browser matrix has 17 representative routes and 11 widths: 320, 390, 699, 700, 834,
1023, 1024, 1280, 1366, 1600 and 1920 CSS pixels. The adjacent widths catch breakpoint
boundary failures. Add a route whenever a new template or substantial interaction lands.

- `pnpm audit:deps`: fail on any known dependency advisory, including development tools.
- `pnpm check`: house lints, editor schema checks, production build, all built HTML local links/fragments,
  duplicate IDs and missing main-site image alt attributes.
- `pnpm audit:responsive`: nonzero exit on overflow, undersized registered prose or primary
  controls, loaded-image failures, unnamed controls, script exceptions, HTTP failures,
  overlapping fixed control bars, timeouts or incomplete coverage. Requires the Playwright Chromium browser installed with
  `pnpm exec playwright install chromium`.
- `pnpm shoot before`, `pnpm shoot after`, `pnpm shoot --diff before after`: screenshots and
  geometry comparisons. Reports go to ignored `review/`.

The deployment workflow runs the dependency, static and responsive gates before Firebase deployment and
retains JSON reports as a CI artifact. Push still publishes to production, so local work stays
local until publication is authorised.

## Manual review remains part of the system

Check open and closed menus, expanded text, project filtering, gallery navigation, dialog
Escape/focus return and chapter/citation jumps. Check tablet portrait and landscape, enlarged
text/browser zoom, light/dark schemes and reduced motion. The automatic matrix checks initial
page states and is not a substitute for these interaction checks or physical-device testing.

The preserved `public/archv-in` mirror is historical content; its missing alt attributes are
reported separately. The Virtual Gods wheel deliberately uses client-side hash routes, so its
route hashes are excluded from static element-ID checks. Do not extend either exception to
ordinary portfolio pages.

## Cleanup policy

Remove a component only after checking imports, dynamic loading and data-driven call sites.
Keep original artwork and research data even when the current presentation does not use them.
Dependency advisories are reviewed separately from visual cleanup; do not silently upgrade the
framework across major versions or alter authentication rules to make an audit look clean.

## Dependency maintenance

The 2026-10-31 security upgrade uses Astro 7.4.4, Firebase 13.1.0, Keystatic Astro 6 /
Core 0.6.9 and Mapshaper 0.7.101. Node must be at least 22.23.4; pnpm is pinned to
9.15.9. Collections use `src/content.config.ts` and YAML glob loaders.
`compressHTML: true` preserves the portfolio's existing inline whitespace.

Three scoped pnpm overrides bridge upstream version constraints:

| Parent / dependency | Selected version | Validation |
| --- | --- | --- |
| Vite / esbuild | 0.28.1 | Production build and development server |
| Firebase Firestore / @grpc/grpc-js | 1.14.7 | Same major; Firestore module load and client build |
| Keystatic Core / minimatch | 11.0.1 | Local collection reader, editor UI and file matching |

Remove an override once the parent accepts a patched version, then rerun the audit and
checks. The Keystatic UI peers are explicit to avoid stale automatically resolved peers.
No advisory is ignored. The dependency audit is a point-in-time registry check, not a
guarantee against undisclosed vulnerabilities.

The local Keystatic editor has a development-only React renderer. Its description field
edits the existing HTML text. Structured layout, gallery and credit data are preserved
with Keystatic's `ignored` fields and remain editable in YAML. `pnpm audit:editor` checks
all 73 editable entries and verifies those preserved fields round-trip without changes.

Migration references: [Astro 6](https://docs.astro.build/en/guides/upgrade-to/v6/),
[Astro 7](https://docs.astro.build/en/guides/upgrade-to/v7/).

# M.Arch location maps

A shared `ProjectSiteMap.astro` sits to the right of Abstract on Skadoogee,
Union Pier, Tower of Quiet Witness and Habersham Hall; Brief spans the full width below. On
phones they stack Abstract → map → Brief. Adi's final direction (26 October 2026):
one square map per project, all existing-context layers visible, location pin,
no labels, titles, view tabs, layer switches, sidebar, scale or download UI.
The active website foreground/background colours style every map; opacity
separates elements. Required OSM / OpenMapTiles attribution sits below the map.

## Confirmed locations

`src/data/project-sites.ts` records the reference points and provenance:

- Tower: former Chattahoochee Brick Company on the Chattahoochee River, Atlanta,
  3195 Brick Plant Rd NW. Census address interpolation supplies
  `[-84.487066912412, 33.808925981839]`. This is an address vicinity, not a survey.
  Adi's confirmation supersedes older Lake Zwerner references for Tower.
- Union Pier: Charleston, South Carolina; OSM terminal reference
  `[-79.9255881, 32.7843360]`, cross-checked against SC Ports and Charleston city.
- Skadoogee: Dahlonega, Lumpkin County, Georgia. Adi's exact supplied pin is
  latitude `34.55047325623666`, longitude `-83.97303499793635`.

Pins mark reference locations; geometry shows existing mapped context. No parcel
boundaries, building proposals or contours have been invented. The source is
map geometry and may be incomplete; use project survey/drawings for precision.

## Rendering

MapLibre loads when the map approaches the viewport. Geometry, worker and CSS
are served locally, so the map needs no external runtime basemap service or key.
It stays flat/north-up, with drag, keyboard and pinch navigation; cooperative
wheel gestures protect normal page scrolling. No map text or controls appear.
An inline, theme-aware SVG gives the same square drawing without JavaScript or
WebGL. Theme changes update both renderers; resources are released on page swap.

Opacity: landscape .08, water .20, waterways .30, streets .28, paths .35,
rail .50, buildings .72. The ring uses solid foreground and background colours.

## Data / refresh

`public/data/site-maps/*.json` contains bounded OpenFreeMap extracts using the
OpenMapTiles schema and OpenStreetMap data. Metadata retains source tiles,
retrieval timestamp, bounds, byte counts and source labels (labels are not drawn).
`public/maps/site-context/*.svg` are internal fallback assets, not download links.

Refresh explicitly from the repository, never during the normal site build:

```
node scripts/build-site-context.mjs
```

The script downloads 21 zoom-14 tiles sequentially with an identifying
User-Agent, below OpenFreeMap's offline limits of 3,000 tiles / 50 MB and four
parallel requests. Geometry is clipped to each exact tile extent to remove
buffer overlaps that would otherwise darken transparent layer seams.

To redraw SVGs from the existing local extracts without any download:

```
node scripts/build-site-context.mjs --render-only
```

Direct OSM/Overpass requests returned HTTP 406/429 during initial research;
the final data workflow uses permitted bounded OpenFreeMap vector downloads.

## Verification

All three project pages checked on desktop and at 390 px: square dimensions,
no horizontal overflow, no map text or controls. Live palette and dark/light
changes tested. House lints, targeted TypeScript checks and the 95-page build
pass. Local only until Adi requests publication.

Habersham Hall was added on 26 October: OSM building reference
`[-81.0892701, 32.0744346]`, cross-checked with SCAD’s official
235 Habersham Street address. Generate just one site using
`node scripts/build-site-context.mjs --only=habersham-hall`.
Adi supplied the remaining pins: resort latitude 18.44055106031501, longitude
72.9061639969247; hospital and masshousing both latitude 19.15943318972379,
longitude 72.84020363855329. All four additional maps are implemented.

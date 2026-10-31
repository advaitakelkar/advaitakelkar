# Work articles

The two-column project introduction is unchanged. Below it, every Work project follows one editorial system.

## Layout

- Desktop (1024px up): a three-column grid. Plans and isometrics occupy two columns in a 2×2 frame, alongside a one-column reading rail. Long sections use a 2×1 frame.
- Materials and making: three columns of supporting figures. Portraits use 1×2 frames; other details use 1×1 frames. Each image is contained, never cropped.
- Tablet (700–1023px): drawings run full width; explanatory text follows. Supporting figures use two columns and their natural proportions.
- Phone (below 700px): one column, natural image proportions, 16–18px reading text.
- Captions sit outside image frames. Expanding drawing notes grows the document; nothing is clipped into fixed-height rows.
- Reading order follows document order. No dense packing or CSS reordering.

## Editorial data

`src/data/work-stories.ts` contains section introductions derived from the existing project descriptions.
`src/data/work-figure-labels.json` supplies short figure labels and optional drawing-reading notes keyed by the exact image path. It does not alter source files or the introduction's media roles.

The project YAML remains the source for images, their roles, provenance and drawing annotations. All 120 existing lower-section images remain present. Jude Bakery has no separate drawings or details, so four existing main views are explicitly selected for a new photo essay through `articleRole`. All seven original intro slides remain in place.

Keep captions factual. Do not infer dimensions, room names, north arrows or construction accuracy from an AI-assisted illustration. Preserve the existing provenance. Measured drawing notes are shown only when already supplied with the source, as at GONG.

## Looking closer

Every figure opens a native modal. Fit shows the whole image. Detail opens at least the source pixel width (or 1.75× the viewer width) and permits normal touch, mouse and keyboard scrolling. Enlarging an image does not add source detail. Escape closes and returns focus to the originating figure. Global page-navigation shortcuts yield to open dialogs.

## Maintenance

The responsive contract includes all 18 Work routes and the drawing viewer's primary controls. The full site matrix is 33 routes × 11 widths = 363 cases. Run `pnpm check` and the responsive audit before publication, plus manual zoom, Escape, source-note and focus checks.

The 31 October review inspected all 231 referenced Work images via project contact sheets, with native-size checks of GONG and Under the Tree plans. No artwork was regenerated. Higher-resolution exports should replace undersized sources only after checking against the originals; keep the originals intact.

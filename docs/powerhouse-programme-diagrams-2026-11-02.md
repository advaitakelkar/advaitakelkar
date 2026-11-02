# Powerhouse programme-diagram update — 2 November 2026

Adi approved the moderately detailed architectural courtyard test, then requested more surrounding white and a centred rendered portion. All 27 explanatory images now use that visual language: pale sand public floors, grey vehicle ground, muted planting, fine line hierarchy and about 10% sketch character.

## Visual audit and resulting changes

| Original presentation | Current treatment |
| --- | --- |
| Six large historical renders and pictograms | Compact chronological 3 × 2 grid using inhabited architectural cutaways |
| Eight historical typology illustrations | Matching interpretive programme studies with original precedent context retained |
| Five charging-setting symbols | Generated architectural settings with the original port values and proportional share bar |
| Programme rings | Architectural rooms arranged around public ground, with duration groups in HTML |
| Node/place graph | Matched before/after site studies, expressing stronger public place around the same charging connection |
| Five needs, six rules and catalogue icons | Spatial vignettes showing rooms, thresholds, people and furniture in place |
| Ground, access and no-plug diagrams | Matched sections and cutaway site studies with native reading keys |
| Framework, daily use and three measures | Architectural sequences and comparisons; original numerical details remain in expandable HTML |
| Three settings and layer assembly renders | Diagrammatic architectural studies in the shared language |
| Large abstract beside hypothesis | Compact 12–14px abstract, preserving the larger hypothesis |

The catalogue heading now correctly states 23 programmes, matching the existing Table 3.1. All 58 quantitative tables/series across Chapters 2–4 are unchanged. Qualitative illustrations carry an AI-generated credit and do not claim measured accuracy. Existing source originals and the earlier CAD pass are preserved.

## Files and validation

Canonical masters: `/Users/adi/Desktop/Powerhouse Ch3-4 Images/Architectural Programme Diagrams/`.
Website exports: `public/powerhouse/images/programme-diagrams/`.
Diagram labels and reading keys: `src/data/powerhouse-programme-diagrams.json`.

- 27/27 PNG decodes, WebP byte/hash matches and production HTML references verified.
- `pnpm check` passed: house lints, editor audit, 95-page build, built-site link/fragment/ID audit. Historical ARCHV alt findings remain outside this change.
- Desktop 1280px: six overview tiles in three columns; five charging settings and original values present.
- Phone 390/320px: two-column overview grid and no horizontal document overflow in the reviewed state; 12px abstract versus 26px hypothesis at 390px.
- Full-size historical and programme images load, are centred, close with Escape and return focus to the originating link.
- Browser screenshots saved in the active Codex output folder.

Local only. No commit, push, publication or InDesign/PDF synchronization. The full site-wide responsive matrix was not run; this pass used focused browser review of the changed Powerhouse presentation.

## Editorial flow follow-up

Adi clarified that prose and realistic images should share a magazine/newspaper reading flow, mostly two columns. `PowerhouseEditorialFlow.astro` now interleaves the existing narrative images with their section paragraphs. Two columns are the default from 700px; complete three-image sequences may use three from 1366px; phones stack into one. Section 1.1 was explicitly corrected to two columns. Architectural overview grids and quantitative figures keep their own layouts.

All 116 manuscript body blocks remain in the built page, and all 110 note callouts remain represented. The manuscript JSON is unchanged. Final build and built-site integrity audit pass; the preceding editorial-flow lint pass also passed. Browser checks confirmed two columns at 1767px and one at 390px, without horizontal document overflow in that phone state. The final screenshot is `powerhouse-two-column-renders.png` in the active Codex outputs.

The separate research review covers all four chapters, 109 notes and 117 bibliography entries. Adi confirmed the chapters should remain site agnostic: charging is the organising reason, not necessarily the physical centre. Energy-operation income must cover running and maintenance of the free public spaces; construction can have separate funding. The audit is advisory; no manuscript or citation rewrite has been applied. Reports are in `/Users/adi/Documents/Codex/2026-11-01/ene/outputs/`.

## Asset index

- `groundSection.webp` — From dark lot to green ground
- `accessLayers.webp` — Open ground, rooms with different access
- `historic-caravanserai.webp` — Caravanserai
- `historic-coaching-inn.webp` — Coaching inn
- `historic-railway-early.webp` — Early railway station
- `historic-railway-concourse.webp` — Railway concourse
- `historic-fuel-station.webp` — Gas station
- `historic-service-area.webp` — Service area
- `historic-airport.webp` — Airport terminal
- `historic-electric-forecourt.webp` — Electric forecourt
- `programmeRings.webp` — Programme follows the length of stay
- `nodePlace.webp` — The same connection, a stronger place
- `fiveNeeds.webp` — Five needs made spatial
- `noPlug.webp` — Public life without a charging session
- `catalogue.webp` — A catalogue of rooms
- `frameworkSteps.webp` — From site reading to a building
- `threeSettings.webp` — One type, three forms
- `sixRules.webp` — Six spatial rules
- `dayClock.webp` — One plan across the day
- `threeMeasures.webp` — Three spatial observations
- `powerCenter.webp` — From car-centred lot to public court
- `charge-home.webp` — Single-family home charging
- `charge-apartment.webp` — Apartment charging
- `charge-workplace.webp` — Workplace charging
- `charge-street.webp` — Public street charging
- `charge-hub.webp` — Public fast-charging hub
- `layerAssembly.webp` — Ground, charging, rooms, energy roof

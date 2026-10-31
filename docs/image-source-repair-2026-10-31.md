# Image source repair — 31 October 2026

Nine website images were repaired. Existing source assets and gallery roles are retained.

## Wadala

Seven exact photographic views were matched to larger originals on [F’KD Workshop’s project page](https://www.fkdworkshop.com/work-1/project-one-x34e8-p7hdl). These are source photographs, with no AI upscaling. Exported to WebP at quality 93 without enlargement.

| Website image | Original | Dimensions |
| --- | --- | --- |
| 01-concrete-hall-long-view-source.webp | [DSC00836.jpg](https://images.squarespace-cdn.com/content/v1/6830e46d6c642504a6756123/3602327b-be65-4ed3-9424-4b34eb49a7ed/DSC00836.jpg) | 1336 × 892 |
| 03-social-wall-evening-source.webp | [DSC01029.jpg](https://images.squarespace-cdn.com/content/v1/6830e46d6c642504a6756123/9203aecc-8fc6-4b8c-8429-1d4c1fc36043/DSC01029.jpg) | 1344 × 898 |
| 05-double-decker-window-seating-source.webp | [DSC00985.jpg](https://images.squarespace-cdn.com/content/v1/6830e46d6c642504a6756123/299dda38-866c-4af9-a997-98f33e971a84/DSC00985.jpg) | 1413 × 944 |
| 07-stepped-concrete-detail-source.webp | [DSC09847.jpg](https://images.squarespace-cdn.com/content/v1/6830e46d6c642504a6756123/98719178-4381-4112-88ac-da4a97d6ca63/DSC09847.jpg) | 1279 × 1919 |
| 10-double-decker-frame-detail-source.webp | [DSC09753.jpg](https://images.squarespace-cdn.com/content/v1/6830e46d6c642504a6756123/a54a0767-6d79-4236-b0eb-bc1b07caa15a/DSC09753.jpg) | 1557 × 2336 |
| 11-concrete-lettering-detail-source.webp | [DSC00851.jpg](https://images.squarespace-cdn.com/content/v1/6830e46d6c642504a6756123/36aef4aa-7730-4d3c-bbee-7807cbb5e612/DSC00851.jpg) | 944 × 1413 |
| 12-rusted-metal-column-detail-source.webp | [DSC00897.jpg](https://images.squarespace-cdn.com/content/v1/6830e46d6c642504a6756123/66efd9e9-1150-416b-a171-69669026f4a2/DSC00897.jpg) | 899 × 1347 |

The following seven remain at their existing 750px long edge: 02-social-wall-booths.webp, 04-neon-bar-high-tables.webp, 06-entrance-neon-facade.webp, 08-numbered-table-edge-detail.webp, 09-steel-stair-detail.webp, 13-steel-mesh-frame-detail.webp, 14-double-decker-stair.webp.

Searched the canonical project folder, portfolio links, portfolio PDFs, local website/desktop/download paths, SOCIAL’s venue gallery and F’KD Workshop’s project gallery. Local and portfolio copies are the same size or smaller. The SOCIAL gallery contains different 800px-square views; the unmatched F’KD images are also different views. Neither is an exact replacement for these seven. Higher-resolution masters are still needed.

## Karjat

Source: `Under The Tree Karjat/Source/Docs/PF_UTT_Layout_22.09.19.ai`, a PDF-compatible native Illustrator drawing with 36,568 vector paths. Its geometry matches `Images/Redo/Original/05-architectural-floor-plan.png`, including the program legend used for the new reading notes. Rendered the original document region (270,10)–(850,750) points at 5 pixels/point, producing 2900 × 3700. Framing removes peripheral sheet margins; the whole building is retained. The previous 748 × 1037 AI-assisted plan remains preserved in the repository but is no longer displayed. The new caption identifies the original drawing.

## Jude

The sign now reads JUDE. The built-in image editor supplied a repaired red corrugated panel; Photoshop isolated only the extra E at [724,462,753,512] and composited that patch onto the existing image. All 1,571,066 pixels outside that rectangle are unchanged. The final 1254 × 1254 WebP is lossless. The layered PSD and PNG master are in the image-repair output folder. Existing AI provenance remains accurate.

## Validation

Build, lint, editor preservation and static reference checks passed: 95 generated pages; 144 HTML documents; 32,890 local references; no missing references, broken fragments or duplicate IDs. Dependency audit: zero advisories. Local responsive review: all three updated projects at eleven widths (320–1920), 33/33 cases passed. Phone plan enlargement uses the 2900px source, with no page overflow; source notes, Escape and focus return passed. Full-site CI and live-publication evidence follow the release.

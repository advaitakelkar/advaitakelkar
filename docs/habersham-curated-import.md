# Habersham Hall curated presentation import — 11 November 2026

Adi requested all images and text from `~/Desktop/final parts pdf` on the website, with people bubbles and gray fallbacks where portraits are missing. His corrected sequence is Advaita + Faith, The Veil + Prism, then the full studio. The Veil names two students and Prism names three; the middle stage therefore uses the merged proposal names without a numeric team-size label.

## Content

- Curated source: four PDFs, 112 pages, plus 72 numbered PNG slides. All 184 are retained, in document/page order. Slide 71 is absent in the source; slide 70 is a mostly empty drawing sheet and remains included.
- Middle stage: 18 Unveil images from `HUB/1 Projects/Academic/MArch/Habersham Hall/Source/_Archive/211Presentation/UNVEIL`. These supplement the curated folder so the merged stage has its documented drawings and renders.
- Total: 202 web-sized WebP derivatives. Original PDFs, PNGs and Illustrator files are untouched and remain outside `public/`.
- PDF text uses Poppler reading order; PNG text uses macOS Vision OCR, shown with its source image. Red annotations / obscured text remain as supplied; unreadable words were not invented. A transcript label distinguishes OCR from PDF extraction.
- The first assignment is credited individually to Advaita; the other early presentations retain Faith Andrew’s co-credit. The full-team cover lists ten students plus Aaron Wilner. Nicole, Adi and Aaron use existing registry portraits; missing portraits use gray initials.
- `src/data/habersham-archive.json` contains web content only; source provenance is in the local source manifest below.

## Implementation

The existing three-chapter project template, brief and map are retained. `HabershamStage.astro` adds source presentations, native transcript disclosures and an accessible image dialog with keyboard previous/next, Escape and focus return. The shared people component is reused. A scoped Habersham style makes missing portraits neutral gray. The project cover now uses the proposed exterior.

Build and browser validation are recorded in COMPLETION.md. This import is local; no commit, push or deployment is performed by the import script.

## Native website layout — second pass

Adi requested the text as ordinary web content and the 100 images extracted into Desktop/re render as the current image set. The page now reads `src/data/habersham-story.json`: headings, paragraphs and figures, without slide screenshots or transcript disclosure controls. The earlier `habersham-archive.json` preserves the full source transcription and provenance; it is no longer rendered.

All 100 images appear once in the article, alongside their corresponding presentation topics. WebP derivatives preserve aspect ratio and transparency, are capped at 1800 pixels without enlargement, and map back to the original PDF pages. The cover uses the midterm everyday-making proposal. All 100 belong to the pair-stage research and proposal; they are not reassigned to the merged or full-studio stages. These later stages retain text while using no additional project images in this pass.

Repeated slide headers, presentation build repetitions and closing furniture were consolidated. Source headings, proposal prose, precedent names and research citations are retained as readable content. Drawing annotations are consolidated in a drawing index. Visibly obscured source words are marked rather than guessed; the old raw transcription remains available for source review. The historical scan is represented by its legible featured quotation, with the raw OCR retained in the source archive. Originals and the Desktop rerender folder are untouched.

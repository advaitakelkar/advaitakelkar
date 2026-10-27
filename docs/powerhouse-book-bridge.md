# Powerhouse book bridge — InDesign ↔ website

Status: **32-page editorial report edition completed on 26 October 2026, at Adi’s request.**
The current book is `The Powerhouse_Editorial Report_Ch1-4.indd` in the Book folder below.
It contains the current website text, six native tables and native editable diagram and map
objects. The preceding 35-page four-chapter edition and earlier two-chapter edition are preserved. Chapters share one continuous manuscript story; all chapter notes and the bibliography share a separate reference story at the end. Nothing syncs automatically.

## What it is

The thesis book is written in InDesign and read on the website at `/powerhouse`. The bridge
keeps the two in step, **in both directions, and only when Adi says so**. Nothing syncs on
its own: no watcher, no hook, no build step.

| Direction | Say | What happens |
|---|---|---|
| Book → web | "pull the book" / "update the web from InDesign" | Read the open InDesign book, rewrite `src/data/powerhouse-book.json`, show the diff, wait for OK before committing. |
| Web → book | "push to InDesign" / "update the book from the web" | Read `src/data/powerhouse-book.json`, write the changed sections back into the open InDesign document, save a copy first, report what moved. |
| Book → PDF | "update the PDF" (also the last step of both rows above) | Export the open InDesign book to the PDF beside the `.indd` (same name), then `pnpm book:pdf` copies it to `public/powerhouse/the-powerhouse-book.pdf` and refreshes `src/data/powerhouse-pdf.json`. The "PDF · Current Book" pill on the page links to it and shows its export date. |

Both directions save their work in the **current** place: the web side in this repo, the
book side in the InDesign file that is open (after a dated backup beside it). The PDF beside
the `.indd` is always the latest export; the site only ever copies it, never edits it.

## Files

| File | Holds |
|---|---|
| `src/data/powerhouse-book.json` | The book text as the website reads it. Chapter openings `ch1` … `ch4`, sections `1-1` … `4-6`, and `bibliography`. |
| `src/components/PowerhouseBookText.astro` | Renders one block; links each `<sup>` to its note. |
| `src/pages/projects/the-powerhouse.astro` | The `book` array: chapter and section titles, numbers, book pages. |
| InDesign | `HUB/1 Projects/Academic/MArch/Graduate Thesis/Graduate Seminar/Working/Book/The Powerhouse_Editorial Report_Ch1-4.indd` (current). |
| PDF | `The Powerhouse_Editorial Report_Ch1-4.pdf` beside the `.indd`; copied by `scripts/sync-powerhouse-pdf.mjs` (`pnpm book:pdf`). |

## Data contract (what must survive a round trip)

Each block is `{ body: string[], notesStart: number, notes: string[] }`.

- **Paragraphs** are strings of light HTML: `<b>`, `<i>`, `<sup>n</sup>` for a note call,
  `<a href>` in notes only.
- **Special blocks** start with a tag and pass through untouched: `<p class="ph__book-lead">`,
  `<h3 class="ph__book-h">`, `<figure class="ph__book-table">` (Tables 2.1, 2.2).
- **Notes** are numbered per chapter, exactly as the book numbers them. `notesStart` is the
  first note number in that block; `notes[i]` is note `notesStart + i`.
- **Bibliography** is one string per entry, in the book's order.

Mapping to InDesign:

| Web | InDesign |
|---|---|
| Section id `1-2` | Heading paragraph "1.2 The Pause Today" / "2.2 Where and How We Charge" |
| Paragraph | Body paragraph after that heading, until the next heading |
| `<sup>n</sup>` | Endnote / footnote reference n |
| `notes[]` | That chapter's Endnotes list |
| `<i>` / `<b>` | Italic / bold character style |
| Table figure | The table frame captioned "Table 2.x" |

Match sections by **heading text**, never by page or frame index: frames move every time the
layout changes.

## Running a sync (for the assistant doing it)

1. Confirm InDesign is open with the book (`document_listOpen`). If not, ask before launching it.
2. Find each section by its heading paragraph; collect the paragraphs that follow it.
3. **Pull:** convert to the contract above, write `powerhouse-book.json`, run `pnpm build`,
   show Adi the changed sections. Commit only on his OK.
4. **Push:** back up the .indd (`… _backup-YYYY-MM-DD.indd`) first. Replace only the
   paragraphs of sections whose text differs; keep paragraph and character styles. Never
   touch layout, images or master pages. Report each section changed.
5. If a heading cannot be matched, stop and ask — do not guess.

## Not covered (yet)

- Interactive web controls do not become interactive InDesign controls. The current national
  map is rebuilt as editable native paths and dots at the web page’s all-charging snapshot.
- Chart marks are native editable geometry; changing a label does not recalculate a bar or map.
- Note markers link to chapter endnotes; renumbering requires updating both lists and markers.


## 26 October 2026 — Editorial web layout

The website now follows the current editorial book’s reading proportions, compact horizontal diagrams, separate figure cards and three-line orphan/widow rules. Two columns are used from 700 px; phones use one. All chapter notes are followed by one complete bibliography. The manuscript and figure JSON remain unchanged. The current full-book PDF pill has an export-version query to refresh cached copies. Chapter navigation, interactive map and citation popups remain part of the web edition.

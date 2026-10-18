# Powerhouse book bridge — InDesign ↔ website

Status: **set up, not yet run.** The workflow and data contract are fixed here; the live
InDesign side is wired up the first time Adi asks for a sync (InDesign must be open).

## What it is

The thesis book is written in InDesign and read on the website at `/powerhouse`. The bridge
keeps the two in step, **in both directions, and only when Adi says so**. Nothing syncs on
its own: no watcher, no hook, no build step.

| Direction | Say | What happens |
|---|---|---|
| Book → web | "pull the book" / "update the web from InDesign" | Read the open InDesign book, rewrite `src/data/powerhouse-book.json`, show the diff, wait for OK before committing. |
| Web → book | "push to InDesign" / "update the book from the web" | Read `src/data/powerhouse-book.json`, write the changed sections back into the open InDesign document, save a copy first, report what moved. |

Both directions save their work in the **current** place: the web side in this repo, the
book side in the InDesign file that is open (after a dated backup beside it).

## Files

| File | Holds |
|---|---|
| `src/data/powerhouse-book.json` | The book text as the website reads it. One entry per block: `ch1`, `ch2` (chapter openings), `1-1` … `2-6` (sections), `bibliography`. |
| `src/components/PowerhouseBookText.astro` | Renders one block; links each `<sup>` to its note. |
| `src/pages/powerhouse.astro` | The `book` array: chapter and section titles, numbers, book pages. |
| InDesign | `HUB/1 Projects/Academic/MArch/Graduate Thesis/Graduate Seminar/Working/Book/The Powerhouse_Thesis Book_Ch1-2.indd` (current). |

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
| Section id `1-2` | Heading paragraph "II. The Architecture of the Stop" (Chapter 1 uses roman numerals) / "2.2 …" (Chapter 2) |
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

- Chapters 3 and 4 are placeholders on the web until they exist in the book.
- The map slides in 1.1 are web-only; they do not go back into InDesign.

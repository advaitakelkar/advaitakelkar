// Copy the latest thesis-book PDF (the export saved next to the InDesign file) into the site.
// Usage: node scripts/sync-powerhouse-pdf.mjs [path/to/book.pdf]
// Default source is the PDF named like the current .indd. Writes public/powerhouse/the-powerhouse-book.pdf
// and src/data/powerhouse-pdf.json (export date, size), which the "Current PDF" pill on /projects/the-powerhouse reads.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BOOK_DIR = path.join(os.homedir(), 'My Drive/HUB/1 Projects/Academic/MArch/Graduate Thesis/Graduate Seminar/Working/Book');
const INDD = path.join(BOOK_DIR, 'The Powerhouse_Thesis Book_Ch1-2.indd');
const src = process.argv[2] || INDD.replace(/\.indd$/, '.pdf');
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const outPdf = path.join(root, 'public/powerhouse/the-powerhouse-book.pdf');
const outJson = path.join(root, 'src/data/powerhouse-pdf.json');

if (!fs.existsSync(src)) throw new Error(`No PDF at ${src}. Export it from InDesign next to the .indd first.`);
const pdfStat = fs.statSync(src);
fs.mkdirSync(path.dirname(outPdf), { recursive: true });
fs.copyFileSync(src, outPdf);

const pages = (fs.readFileSync(src, 'latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length;
const meta = {
  file: '/powerhouse/the-powerhouse-book.pdf',
  source: path.basename(src),
  exported: pdfStat.mtime.toISOString(),
  bytes: pdfStat.size,
  pages,
};
fs.writeFileSync(outJson, JSON.stringify(meta, null, 2) + '\n');

console.log(`Copied ${meta.source} (${(meta.bytes / 1e6).toFixed(1)} MB, ${pages} pages, exported ${pdfStat.mtime.toLocaleString()})`);
if (fs.existsSync(INDD) && fs.statSync(INDD).mtime > pdfStat.mtime) {
  console.warn('Warning: the .indd was saved after this PDF was exported. Re-export the PDF from InDesign to match.');
}

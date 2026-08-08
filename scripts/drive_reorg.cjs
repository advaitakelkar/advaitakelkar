#!/usr/bin/env node
/**
 * drive_reorg.cjs — sort HUB/00 Projects into two subfolders.
 *
 *   00 Projects/Website/   projects that are live on advaitakelkar.com
 *   00 Projects/ALL/       every other project folder
 *   00 Projects/_DELETE/   quarantine, left exactly as it is
 *
 * Each project folder ends up in exactly ONE of the two — folders are MOVED,
 * never copied, so nothing is duplicated and Google Drive treats it as a
 * metadata move rather than a re-upload.
 *
 * Membership comes from Notion (Category filled = published), which in turn is
 * written from the website YAML. The live filesystem is the source of truth for
 * what folders exist — the Drive API lists trashed folders as though they were
 * live, so it is not used here.
 *
 * Usage:
 *   node scripts/drive_reorg.cjs                 # plan only
 *   node scripts/drive_reorg.cjs --execute       # perform the moves
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const EXECUTE = argv.includes('--execute');

/** The mounted Drive folder. Override with --projects=<path> if it moves. */
const PROJECTS_DIR = (argv.find(a => a.startsWith('--projects=')) || '')
  .replace('--projects=', '')
  || '/sessions/laughing-hopeful-dirac/mnt/00 Projects';

const WEBSITE_SUB = 'Website';
const ALL_SUB = 'ALL';
/** Left untouched at the top level. */
const KEEP_AT_TOP = new Set(['_DELETE', 'Website', 'ALL', 'Icon', 'Project-PDFs', '00 Website']);

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (!m) return;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[m[1].trim()] = v;
  });
}
loadEnv();

const token = process.env.NOTION_TOKEN;
const dbId = process.env.NOTION_DATABASE_ID || '37e365b8-0755-8138-b8c2-ccaa42ba73e5';
if (!token) { console.error('Error: NOTION_TOKEN is not set.'); process.exit(1); }

function request(urlPath, method, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.notion.com', path: urlPath, method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          if (j.object === 'error') return reject(new Error(`${j.code}: ${j.message}`));
          resolve(j);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const plain = p => {
  if (!p) return '';
  if (p.type === 'title') return p.title?.map(t => t.plain_text).join('') || '';
  if (p.type === 'rich_text') return p.rich_text?.map(t => t.plain_text).join('') || '';
  if (p.type === 'select') return p.select?.name || '';
  return '';
};

const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Folder name -> Notion Project ID, for cases the name match gets wrong.
 *
 * `FKD_Animal Crematorium` is the surviving folder for the project the website
 * publishes as FKD-42 Crematorium; the separate FKD-42 folder was trashed and
 * FKD-14 is the row flagged as its duplicate. So the folder belongs with the
 * published project, not the flagged one.
 */
const FOLDER_OVERRIDES = {
  'FKD_Animal Crematorium': 'FKD-42',
};

/** Folders with no Notion row at all — treated as archive, never lost. */
const UNMATCHED_TO_ALL = true;

async function fetchRows() {
  const rows = [];
  let cursor;
  do {
    const res = await request(`/v1/databases/${dbId}/query`, 'POST',
      cursor ? { start_cursor: cursor, page_size: 100 } : { page_size: 100 });
    rows.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return rows.map(r => ({
    id: plain(r.properties['Project ID']),
    name: plain(r.properties.Name),
    shortName: plain(r.properties['SHORT NAME']),
    studio: plain(r.properties.Studio),
    published: !!plain(r.properties.Category),
  }));
}

/** Every live project folder, with where it currently sits. */
function liveFolders() {
  const out = [];
  const top = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && !KEEP_AT_TOP.has(d.name));
  top.forEach(d => out.push({ name: d.name, rel: d.name, from: '00 Projects/' }));

  const websiteDir = path.join(PROJECTS_DIR, '00 Website');
  if (fs.existsSync(websiteDir)) {
    fs.readdirSync(websiteDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .forEach(d => out.push({ name: d.name, rel: path.join('00 Website', d.name), from: '00 Projects/00 Website/' }));
  }
  return out;
}

function matchRow(folderName, rows) {
  const override = FOLDER_OVERRIDES[folderName.trim()];
  if (override) return rows.find(r => r.id === override) || null;

  // Strip the STUDIO_ prefix, then compare on normalised text.
  const bare = folderName.replace(/^[^_]+_/, '').trim();
  const nb = norm(bare);
  if (!nb) return null;

  return rows.find(r => norm(r.name) === nb)
    || rows.find(r => norm(r.shortName) === nb)
    || rows.find(r => norm(r.name) && (norm(r.name).includes(nb) || nb.includes(norm(r.name)))
        && Math.min(norm(r.name).length, nb.length) / Math.max(norm(r.name).length, nb.length) > 0.7)
    || null;
}

async function run() {
  if (!fs.existsSync(PROJECTS_DIR)) {
    console.error(`Projects folder not found: ${PROJECTS_DIR}`);
    process.exit(1);
  }

  console.log(EXECUTE ? '=== EXECUTING ===' : '=== PLAN ONLY (pass --execute to move) ===');
  console.log(`Projects dir: ${PROJECTS_DIR}\n`);

  const rows = await fetchRows();
  const folders = liveFolders();
  console.log(`Live project folders: ${folders.length}   Notion rows: ${rows.length}\n`);

  const toWebsite = [];
  const toAll = [];
  const unmatched = [];

  for (const f of folders) {
    const row = matchRow(f.name, rows);
    if (!row) {
      unmatched.push(f);
      if (UNMATCHED_TO_ALL) toAll.push({ ...f, why: 'no Notion row' });
      continue;
    }
    const target = row.published ? toWebsite : toAll;
    target.push({ ...f, why: `${row.id} ${row.published ? 'published' : 'archive'}` });
  }

  const show = (label, list) => {
    console.log(`--- ${label} (${list.length}) ---`);
    list.forEach(f => console.log(`  ${f.from.padEnd(26)} ${f.name.trim().padEnd(46)} ${f.why}`));
    console.log();
  };
  show(`-> ${WEBSITE_SUB}/`, toWebsite);
  show(`-> ${ALL_SUB}/`, toAll);

  if (unmatched.length) {
    console.log(`Folders with no Notion row (sent to ${ALL_SUB}/, nothing lost):`);
    unmatched.forEach(f => console.log(`  - ${f.name.trim()}`));
    console.log();
  }

  if (!EXECUTE) {
    console.log(`Nothing moved. Re-run with --execute to apply.`);
    return;
  }

  for (const sub of [WEBSITE_SUB, ALL_SUB]) {
    const p = path.join(PROJECTS_DIR, sub);
    if (!fs.existsSync(p)) { fs.mkdirSync(p); console.log(`created ${sub}/`); }
  }

  let moved = 0;
  const failed = [];
  for (const [sub, list] of [[WEBSITE_SUB, toWebsite], [ALL_SUB, toAll]]) {
    for (const f of list) {
      const src = path.join(PROJECTS_DIR, f.rel);
      const dest = path.join(PROJECTS_DIR, sub, f.name);
      try {
        if (!fs.existsSync(src)) { failed.push(`${f.name}: source vanished`); continue; }
        if (fs.existsSync(dest)) { failed.push(`${f.name}: already exists in ${sub}/`); continue; }
        fs.renameSync(src, dest);
        moved++;
      } catch (e) {
        failed.push(`${f.name}: ${e.message}`);
      }
    }
  }

  console.log(`\nMoved: ${moved}`);
  if (failed.length) {
    console.log(`Failed: ${failed.length}`);
    failed.forEach(f => console.log(`   ${f}`));
  }

  // Remove the old container only if it is genuinely empty.
  const oldWebsite = path.join(PROJECTS_DIR, '00 Website');
  if (fs.existsSync(oldWebsite)) {
    const left = fs.readdirSync(oldWebsite).filter(n => n !== '.DS_Store' && n !== 'Icon\r');
    if (!left.length) {
      try { fs.rmSync(oldWebsite, { recursive: true }); console.log(`Removed empty "00 Website/"`); }
      catch (e) { console.log(`Could not remove "00 Website/": ${e.message}`); }
    } else {
      console.log(`"00 Website/" still holds ${left.length} item(s) — left in place: ${left.slice(0, 5).join(', ')}`);
    }
  }
}

run().catch(e => { console.error('\nFailed:', e.message); process.exit(1); });

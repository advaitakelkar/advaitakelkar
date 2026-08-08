#!/usr/bin/env node
/**
 * notion_tidy.cjs — one-off structural cleanup of the Master Projects Database.
 *
 * The system this enforces:
 *   Google Drive  -> where the files actually live   (organised by STUDIO_Project)
 *   Notion        -> the index and viewing layer     (one row per project)
 *   Website       -> the published selection         (52 of them)
 *
 * So each column has exactly one job:
 *   Studio        -> universal spine, mirrors the Drive folder prefix. Every row.
 *   Category      -> the WEBSITE's bucket. Blank when the project is not published.
 *   Drive Folder  -> link to the Drive folder, when one exists.
 *   Review        -> flags duplicates and placeholders instead of deleting them.
 *
 * Nothing is ever deleted. Duplicates are flagged, not removed; redundant
 * Category values are cleared only where Studio already carries the same
 * information.
 *
 * Usage:
 *   node scripts/notion_tidy.cjs --dry-run
 *   node scripts/notion_tidy.cjs --budget=32     # resumable; re-run until done
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const BUDGET = Number((argv.find(a => a.startsWith('--budget=')) || '').replace('--budget=', '')) || 0;
const startedAt = Date.now();
const outOfTime = () => BUDGET > 0 && (Date.now() - startedAt) / 1000 > BUDGET;

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

let apiCalls = 0;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function request(urlPath, method, body = null, attempt = 1) {
  return new Promise((resolve, reject) => {
    apiCalls++;
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.notion.com',
      path: urlPath,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', async () => {
        let json;
        try { json = JSON.parse(data); } catch { return reject(new Error(`Bad JSON from ${urlPath}`)); }
        if ((res.statusCode === 429 || res.statusCode >= 500) && attempt <= 5) {
          const wait = res.statusCode === 429 ? (Number(res.headers['retry-after']) || 1) * 1000 : 400 * attempt;
          await sleep(wait);
          return resolve(request(urlPath, method, body, attempt + 1));
        }
        if (json.object === 'error') return reject(new Error(`Notion ${json.status} ${json.code}: ${json.message}`));
        resolve(json);
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
  if (p.type === 'checkbox') return p.checkbox;
  if (p.type === 'url') return p.url || '';
  return '';
};

/* ------------------------------------------------------------------ data --- */

/** Type options that no row uses — the misspellings that lost out. */
const DEAD_TYPE_OPTIONS = ['Visualisation', 'Artificial Intellegence', 'Refrence'];

/** Rows kept on purpose but flagged so they drop out of working views. */
const REVIEW_ROWS = {
  '37e365b8-0755-8148-890c-f4173d28c2bf': ['Duplicate', 'Same project as FKD-42 Crematorium, which the website maps to.'],
  '37f365b8-0755-8159-b5eb-dc6e459be258': ['Duplicate', 'Same project as ARCHV-08 ARCHV.'],
  '37f365b8-0755-8185-a925-ca01c8e3c44f': ['Placeholder', 'Empty row created as a studio placeholder.'],
  '37f365b8-0755-8191-8781-ce8d5e11de95': ['Placeholder', 'Empty row created as a studio placeholder.'],
  '37f365b8-0755-81b6-845a-eff5b57382e2': ['Placeholder', 'Empty row created as a studio placeholder.'],
  '359365b8-0755-80e8-ba93-e56e9d853b90': ['Blank', 'Row has no title or properties.'],
};

/**
 * Drive folders, keyed by Notion Project ID.
 *
 * Two locations hold project folders today:
 *   HUB/00 Projects/               — 12 folders
 *   HUB/00 Projects/00 Website/    — 49 folders
 * Both follow the `STUDIO_Project` convention. Flattening the two into one
 * level is on the Drive checklist; until then, both are mapped here.
 */
const DRIVE_FOLDERS = {
  // --- HUB/00 Projects/ (top level) ---
  'SCAD-11': '18K0kPPK7zULmhCjuI8K0jIVj1Ch46lYz',
  'SCAD-08': '1WGxUd5L82qapNOF32g4HPegEpVhK05Av',
  'SCAD-05': '1uDsMIBgyFi2cBOBKd-Upwe2ZBYoMqxgG',
  'SCAD-06': '1w22q__PYEKD0fmeXDD83U0Hic344JbQc',
  'SCAD-07': '1E8sfp5USTPSyWBMes531Xxl6xXtBJ4uV',
  'SCAD-10': '1PFBGvFtJE54V6xPwkC6zGJNitNuf102v',
  'SCAD-09': '1L33jX4LWpaZNq8DPUVL0T8YCjDLt_6ke',
  'BARCH-05': '1xBgQ--iSbtKMhhW8mgsJfejziLvhXb1M',
  'FREE-14': '1Kt4rcDApi9Ldn6OWmCMXfp3D-6WBJBnz',
  'FREE-08': '1zn-aFz5_ED-aJ9xx49B7mUVnBBQdpYSX',
  '823-02': '19yDTX4qd7zVh3IDKY-uw5WSfKT9ITAGi',
  // ARCHV-08 (the ARCHV collective itself) has no live Drive folder — the old
  // `ARCHV_A R C H V` was trashed. Its sub-projects each have their own folder
  // below. Deliberately unmapped; do not re-add without checking Drive first.

  // --- HUB/00 Projects/00 Website/ ---
  'FKD-20': '1bO-ANOm0XyzPux-rM27p4fh74STtTH7y',
  'FKD-01': '13pHjAgycGJXSFS4uIiYJzT2L4x8zVpAK',
  'SCAD-01': '1CAUfFDYUx-nvoutMG4eJulTWjNiOgZEh',
  '823-03': '1Z-TusbuHvp6MEg9I-PcNj658o4INIdO-',
  'FKD-02': '1j7r9bsXmya2DB4LRjAXM6c6XE7jcFETe',
  'FREE-10': '1LeUgiJxIYJV5w9pObcW5VDW1lpfQGdqS',
  'FKD-32': '1WXZ1muSFmJJoklqpb0Yluwj09ZBfOeu_',
  'FREE-04': '14vo6x_X2r-kjyHvnPw-K0ZpCSFM17VJH',
  'FKD-14': '1QovZNUJp2el7vqgnM3eeTGNsRorej529',
  'FKD-23': '1jh31DB4Kd8ZH7n5pY4A1eil6wPQa3bFz',
  '823-16': '1jb2fdwAOiQjDX403IiLzj7CCBkVFc96V',
  'BARCH-01': '1Uz0kcdzntsF12xyxrBtW2qLnLkyuABpV',
  'BARCH-03': '1aqQFVvL0b2b9eaYFicBGPaju0N5pjzUW',
  'FKD-04': '1xyuJjtxoSNpcd2Y3vf924LjJWq5FBWtv',
  'SCAD-04': '1I0ZEXu3PD-TL7yHrz1DD6M4ACYaEwpRR',
  'FKD-48': '1VDJgfgcdvmA--mnHZ1GFxG7j2KJjKds0',
  'FKD-03': '1bIgTnedWhBPjJeNAEd7dCT9-fpC9V07Z',
  'FREE-19': '1q1QM6RbHxEviD2l0qRWprL-CT1gr3m4k',
  'FKD-42': '10bd7oqMhZazfv8ln1Qv-LxF4Au0jWjJy',
  '823-10': '1bGMK_z1OEiGWYzs8wKUYUN6zYhZJWSjK',
  'FKD-06': '12Hm7nJCkPs1M0e6UW6JTg4JUYiqM1F0v',
  'FREE-17': '1cuvGASeM7NwqUmAuvf18RiiqdrYCIoJL',
  '823-05': '1khh0VoWd3eC-tMqB4u_siE0IVUquFPLQ',
  'BARCH-04': '1glNTsNRnB8tKvqN-Q2vdgxfnoBBzYTFu',
  'ARCHV-01': '1FgxAMkpRYEwU7tQiqQa9DN8JuIgLtdlD',
  'ANLA-01': '1s50AsGcu4SFDa0THqNKS_eG3SoUPIIHG',
  'FREE-07': '1yaHduiu1XFBcChXfUklWMi5y2jYhkq89',
  'FREE-13': '1f1BKQW6kjbfjTiPY-hQ2tu3sjYpyDGgz',
  'ARCHV-03': '1PBzKysSgLGATQ7U_rHvYmgsZ1cV3NH3n',
  'SCAD-03': '1AMNQiXLI_RUBrifToPq2YSvq8RQXfKYt',
  'ARCHV-06': '18fUMwBtwEdOwUGwICD4dOwNYxDZE0HFe',
  'FREE-06': '1pQCWsgrVquTn1yig5NfyMSi73whVa5kz',
  'FREE-11': '10vMkRjiO2hYzXnWgYxsA3cWftIDA9jDt',
  'ARCHV-04': '1Tvh2WH69Ks00qBHvCzu6FoL5NdQvNzeL',
  'FREE-03': '1j3-ZEySvm5Cp2_j5_LipEQa73wfR4qxA',
  'ARCHV-07': '1otyuucgbTx1SH0oQMtEUZFlUFdlFz5rJ',
  'FREE-12': '1KAF65D_2LgaDXXXmJ7-Pyk-0lAKYc4BI',
  '823-04': '1NYFsDrxXLOmpbQKhZEWEMMhz768fpacw',
  'FREE-09': '1C8_ARsn2LeMWNfe8k_ikYpROaaJi6FFT',
  'ARCHV-05': '117cQ_0rJ3QkeLvvF5MkbsidjW4w39enN',
  'FKD-10': '1Jr6l4uWaelQxZ5ChdNIr8BhmfjzMlk3m',
  'FKD-09': '1uD6qqd4ugbUr7_odstC44Yh_5eaolV3u',
  '823-11': '1VXROLVxJcIRC2i1gfuRXXqMhD1owCRpG',
  '823-15': '1ytViT9qNx6wTvnatyV0-2Zj4E8n4CsXI',
  'ARCHV-02': '12sxT5cD02Wl3Pwv_5RuP4vI8UJza6Nsd',
  'FKD-08': '1jI_isJtX1t2zwlsFDXfEWXC7BwtRUDcq',
  'FKD-47': '1lnjK9BPc82uNaGeWa4PwC_K88RHDqajH',
  'FREE-15': '1JjKB0PvqOwHzIgNcJzDvnzzsrnGOr9Au',
  '823-14': '1bYNpBEzsey4CbAnvVAG5A9a1LEJ1o6jz',
};
const driveUrl = id => `https://drive.google.com/drive/folders/${id}`;

/* ---------------------------------------------------------------- schema --- */

async function ensureSchema() {
  const db = await request(`/v1/databases/${dbId}`, 'GET');
  const props = db.properties;
  const patch = {};

  if (!props.Review) {
    patch.Review = {
      select: {
        options: [
          { name: 'Duplicate', color: 'red' },
          { name: 'Placeholder', color: 'yellow' },
          { name: 'Blank', color: 'gray' },
        ],
      },
    };
  }
  if (!props['Review Note']) patch['Review Note'] = { rich_text: {} };
  if (!props['Drive Folder']) patch['Drive Folder'] = { url: {} };

  // Drop the misspelled Type options that no row uses.
  const typeOptions = (props.Type?.select?.options || []);
  const keep = typeOptions.filter(o => !DEAD_TYPE_OPTIONS.includes(o.name));
  const dropping = typeOptions.length - keep.length;
  if (dropping > 0) {
    patch.Type = { select: { options: keep.map(o => ({ id: o.id, name: o.name, color: o.color })) } };
  }

  if (!Object.keys(patch).length) {
    console.log('Schema: already tidy.');
    return;
  }
  console.log(`Schema: ${Object.keys(patch).join(', ')}${dropping ? ` (removing ${dropping} unused Type option(s))` : ''}`);
  if (!DRY) await request(`/v1/databases/${dbId}`, 'PATCH', { properties: patch });
}

/* ------------------------------------------------------------------ rows --- */

async function fetchAllRows() {
  const rows = [];
  let cursor;
  do {
    const res = await request(`/v1/databases/${dbId}/query`, 'POST',
      cursor ? { start_cursor: cursor, page_size: 100 } : { page_size: 100 });
    rows.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return rows;
}

async function run() {
  console.log(DRY ? '=== DRY RUN — no writes ===\n' : '=== Notion tidy ===\n');
  await ensureSchema();

  const rows = await fetchAllRows();
  console.log(`Fetched ${rows.length} row(s).\n`);

  const tally = { category: 0, review: 0, drive: 0, failed: 0 };
  let paused = false;

  for (const row of rows) {
    const id = row.id;
    const shortId = id.replace(/-/g, '');
    const name = plain(row.properties.Name) || '(untitled)';
    const slug = plain(row.properties.Slug);
    const pid = plain(row.properties['Project ID']);
    const category = plain(row.properties.Category);
    const studio = plain(row.properties.Studio);

    const update = {};

    // 1. Category is the website's bucket. Unpublished rows have Studio instead.
    if (!slug && category) update.Category = { select: null };

    // 2. Flag duplicates / placeholders rather than deleting them.
    const review = Object.entries(REVIEW_ROWS)
      .find(([k]) => k.replace(/-/g, '') === shortId)?.[1];
    if (review && !plain(row.properties.Review)) {
      update.Review = { select: { name: review[0] } };
      update['Review Note'] = { rich_text: [{ type: 'text', text: { content: review[1] } }] };
    }

    // 3. Point the row at its Drive folder.
    const folder = DRIVE_FOLDERS[pid];
    if (folder && !plain(row.properties['Drive Folder'])) {
      update['Drive Folder'] = { url: driveUrl(folder) };
    }

    if (!Object.keys(update).length) continue;
    if (outOfTime()) { paused = true; continue; }

    const what = [];
    if (update.Category) { what.push(`clear Category (${category}; Studio=${studio})`); tally.category++; }
    if (update.Review) { what.push(`review=${review[0]}`); tally.review++; }
    if (update['Drive Folder']) { what.push('drive link'); tally.drive++; }

    try {
      if (!DRY) await request(`/v1/pages/${id}`, 'PATCH', { properties: update });
      console.log(`  ${(pid || '—').padEnd(10)} ${name.slice(0, 38).padEnd(40)} ${what.join(', ')}`);
    } catch (e) {
      tally.failed++;
      console.error(`  !! ${name}: ${e.message}`);
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Category cleared : ${tally.category}`);
  console.log(`Review flagged   : ${tally.review}`);
  console.log(`Drive links set  : ${tally.drive}`);
  console.log(`Failed           : ${tally.failed}`);
  console.log(`API calls        : ${apiCalls}`);
  if (paused) console.log(`\nPaused on the time budget. Re-run to continue.`);
}

run().catch(e => { console.error('\nFailed:', e.message); process.exit(1); });

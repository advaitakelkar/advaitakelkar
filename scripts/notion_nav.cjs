#!/usr/bin/env node
/**
 * notion_nav.cjs — put the Home navigation bar on every page in the workspace.
 *
 * The nav is a single synced block whose ORIGINAL lives on the Home page
 * (Home • HUB • Lab • Life • Resources). Every other page gets a *reference*
 * to it, so editing the bar on Home updates it everywhere at once.
 *
 * Placement rules, in order:
 *   - Page already references the nav block  -> skip.
 *   - Page is empty                          -> append (lands at the top).
 *   - Page starts with the "Website Sync"
 *     heading written by sync_to_notion.cjs  -> delete that section, write the
 *                                               nav, then restore the section
 *                                               (nav ends up above it).
 *   - Anything else                          -> insert directly after the first
 *                                               block, matching the existing
 *                                               house style of `---` then nav.
 *
 * Notion's API cannot prepend, only append or insert-after, which is why the
 * cases above exist. Nothing is ever deleted except the sync section this
 * repo wrote itself.
 *
 * Usage:
 *   node scripts/notion_nav.cjs --dry-run
 *   node scripts/notion_nav.cjs --budget=32     # resumable; re-run until done
 *   node scripts/notion_nav.cjs --refresh       # rebuild the page list
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = path.resolve(__dirname, '..');

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const REFRESH = argv.includes('--refresh');
const BUDGET = Number((argv.find(a => a.startsWith('--budget=')) || '').replace('--budget=', '')) || 0;
const startedAt = Date.now();
const outOfTime = () => BUDGET > 0 && (Date.now() - startedAt) / 1000 > BUDGET;

/** The original synced block on Home. Everything else points at this. */
const NAV_SOURCE_BLOCK = '37e365b8-0755-80e1-8b40-ff7eec76207f';
const HOME_PAGE = '351365b8-0755-814a-9832-ffb3e2f8be1d';
const SYNC_MARKER = 'Website Sync';

const PAGES_FILE = path.join(__dirname, '.notion-nav-pages.json');
const STATE_FILE = path.join(__dirname, '.notion-nav-state.json');

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

const readJson = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const writeJson = (f, o) => { if (!DRY) try { fs.writeFileSync(f, JSON.stringify(o, null, 2)); } catch {} };

const navBlock = () => ({
  object: 'block',
  type: 'synced_block',
  synced_block: { synced_from: { type: 'block_id', block_id: NAV_SOURCE_BLOCK } },
});

async function childrenOf(blockId) {
  const out = [];
  let cursor;
  do {
    const res = await request(
      `/v1/blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`, 'GET');
    out.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return out;
}

/**
 * Walk the page tree from Home collecting every child page, then add every row
 * of the Master Projects Database. Cached to disk so repeated runs are cheap.
 */
async function discoverPages() {
  const cached = REFRESH ? null : readJson(PAGES_FILE);
  if (cached) { console.log(`Page list: ${cached.length} (cached — use --refresh to rebuild)`); return cached; }

  console.log('Discovering pages from Home...');
  const pages = [];
  const seen = new Set();
  const queue = [{ id: HOME_PAGE, title: 'Home', depth: 0 }];

  while (queue.length) {
    const node = queue.shift();
    if (seen.has(node.id) || node.depth > 4) continue;
    seen.add(node.id);
    pages.push({ id: node.id, title: node.title, kind: 'page' });
    let kids = [];
    try { kids = await childrenOf(node.id); } catch (e) { console.error(`  !! ${node.title}: ${e.message}`); continue; }
    for (const b of kids) {
      if (b.type === 'child_page') {
        queue.push({ id: b.id, title: b.child_page.title, depth: node.depth + 1 });
      } else if (b.type === 'column_list' || b.type === 'column') {
        // Columns nest real pages one level deeper.
        try {
          for (const c of await childrenOf(b.id)) {
            if (c.type === 'child_page') queue.push({ id: c.id, title: c.child_page.title, depth: node.depth + 1 });
            else if (c.type === 'column') {
              for (const d of await childrenOf(c.id)) {
                if (d.type === 'child_page') queue.push({ id: d.id, title: d.child_page.title, depth: node.depth + 1 });
              }
            }
          }
        } catch {}
      }
    }
  }

  // Every project row in the Master Projects Database.
  let cursor;
  do {
    const res = await request(`/v1/databases/${dbId}/query`, 'POST',
      cursor ? { start_cursor: cursor, page_size: 100 } : { page_size: 100 });
    for (const r of res.results) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      const title = (r.properties?.Name?.title || []).map(t => t.plain_text).join('') || '(untitled)';
      pages.push({ id: r.id, title, kind: 'project' });
    }
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);

  console.log(`Page list: ${pages.length} page(s) discovered.`);
  writeJson(PAGES_FILE, pages);
  return pages;
}

const isNav = b =>
  b.type === 'synced_block' &&
  String(b.synced_block?.synced_from?.block_id || '').replace(/-/g, '') === NAV_SOURCE_BLOCK.replace(/-/g, '');

const isMarker = b =>
  b.type === 'heading_2' &&
  (b.heading_2.rich_text || []).map(t => t.plain_text).join('').trim() === SYNC_MARKER;

/**
 * Notion returns fields like `icon: null` when reading a block but rejects
 * those same nulls on create, so drop every null before sending it back.
 */
function stripNulls(value) {
  if (Array.isArray(value)) return value.map(stripNulls);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === null) continue;
      out[k] = stripNulls(v);
    }
    return out;
  }
  return value;
}

/** Re-create the blocks we are about to delete, so the sync section survives. */
function cloneBlock(b) {
  const t = b.type;
  const body = b[t];
  if (!body) return null;
  const clean = stripNulls(JSON.parse(JSON.stringify(body)));
  delete clean.children;
  return { object: 'block', type: t, [t]: clean };
}

async function addNav(page) {
  const kids = await childrenOf(page.id);

  if (kids.some(isNav)) return 'already';

  if (!kids.length) {
    if (!DRY) await request(`/v1/blocks/${page.id}/children`, 'PATCH', { children: [navBlock()] });
    return 'empty-top';
  }

  // A page this repo wrote: lift the sync section so the nav sits above it.
  if (isMarker(kids[0])) {
    if (!DRY) {
      const restore = kids.map(cloneBlock).filter(Boolean);
      for (const b of kids) await request(`/v1/blocks/${b.id}`, 'DELETE');
      const all = [navBlock(), ...restore];
      for (let i = 0; i < all.length; i += 100) {
        await request(`/v1/blocks/${page.id}/children`, 'PATCH', { children: all.slice(i, i + 100) });
      }
    }
    return 'rebuilt';
  }

  // Otherwise slot it in right after the first block (matches `---` then nav).
  if (!DRY) {
    await request(`/v1/blocks/${page.id}/children`, 'PATCH', {
      children: [navBlock()],
      after: kids[0].id,
    });
  }
  return 'after-first';
}

async function run() {
  console.log(DRY ? '=== DRY RUN — no writes ===\n' : '=== Notion nav bar ===\n');
  const pages = await discoverPages();
  const state = readJson(STATE_FILE) || {};

  const tally = { already: 0, 'empty-top': 0, rebuilt: 0, 'after-first': 0, failed: 0, skipped: 0 };
  let paused = false;

  for (const page of pages) {
    if (page.id.replace(/-/g, '') === HOME_PAGE.replace(/-/g, '')) { tally.skipped++; continue; }
    if (state[page.id]) { tally.already++; continue; }
    if (outOfTime()) { paused = true; continue; }

    try {
      const how = await addNav(page);
      tally[how]++;
      state[page.id] = how;
      writeJson(STATE_FILE, state);
      if (how !== 'already') console.log(`  ${how.padEnd(12)} ${page.title}`);
    } catch (e) {
      tally.failed++;
      console.error(`  !! ${page.title}: ${e.message}`);
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Already had nav : ${tally.already}`);
  console.log(`Added (empty)   : ${tally['empty-top']}`);
  console.log(`Added (rebuilt) : ${tally.rebuilt}`);
  console.log(`Added (inline)  : ${tally['after-first']}`);
  console.log(`Failed          : ${tally.failed}`);
  console.log(`API calls       : ${apiCalls}`);
  const done = tally.already + tally['empty-top'] + tally.rebuilt + tally['after-first'] + tally.skipped;
  if (paused) console.log(`\nPaused on the time budget — ${pages.length - done} page(s) left. Re-run to continue.`);
}

run().catch(e => { console.error('\nFailed:', e.message); process.exit(1); });

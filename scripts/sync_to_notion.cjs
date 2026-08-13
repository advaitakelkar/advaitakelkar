#!/usr/bin/env node
/**
 * sync_to_notion.cjs — push the website's project content INTO Notion.
 *
 * The website (src/content/projects/*.yaml) is the source of truth. Notion is
 * the second brain that mirrors it. This is the reverse of sync_from_notion.cjs.
 *
 * What it does, in order:
 *   1. Ensures the Notion Projects DB has the properties the site needs
 *      (Studio, Tags, Slug, Featured, Client, Status, Numbr) and that Category
 *      carries the site's four buckets.
 *   2. Backfills `Studio` from each row's existing `Category` — this preserves
 *      the studio / Google-Drive hierarchy (823, FKD Workshop, SCAD, BARCH,
 *      ARCHV, FREE, ADVT, ANLA, Pragrup, Studio Mumbai) BEFORE Category is
 *      remapped to the website's academic/archv/freelancer/work.
 *   3. Matches each local YAML to a Notion page (by Slug, then Project ID map,
 *      then normalised name) and pushes properties.
 *   4. Rewrites the page body below a `Website Sync` marker heading. Anything
 *      you have written ABOVE that marker is never touched.
 *   5. Creates rows for projects that exist on the site but not in Notion.
 *
 * It never deletes Notion rows. Projects that live only in Notion are left
 * alone and reported at the end.
 *
 * Usage:
 *   node scripts/sync_to_notion.cjs --dry-run     # report only, no writes
 *   node scripts/sync_to_notion.cjs               # full sync
 *   node scripts/sync_to_notion.cjs --no-body     # properties only
 *   node scripts/sync_to_notion.cjs --only=shelf  # one project
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const yaml = require('js-yaml');

const rootDir = path.resolve(__dirname, '..');
const projectsDir = path.join(rootDir, 'src/content/projects');

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const NO_BODY = argv.includes('--no-body');
const FORCE = argv.includes('--force');
const ONLY = (argv.find(a => a.startsWith('--only=')) || '').replace('--only=', '');
/**
 * Optional wall-clock budget in seconds. The sync makes a few hundred
 * sequential API calls, which can outlive a constrained shell. With a budget
 * the script stops cleanly when time is nearly up; because every step is
 * idempotent and progress is recorded in the state file, re-running simply
 * picks up where it left off.
 */
const BUDGET = Number((argv.find(a => a.startsWith('--budget=')) || '').replace('--budget=', '')) || 0;
const startedAt = Date.now();
const outOfTime = () => BUDGET > 0 && (Date.now() - startedAt) / 1000 > BUDGET;

const BODY_MARKER = 'Website Sync';
const STATE_FILE = path.join(__dirname, '.notion-sync-state.json');

const crypto = require('crypto');
const hashOf = s => crypto.createHash('sha1').update(String(s)).digest('hex').slice(0, 12);

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch { return {}; }
}
function saveState(state) {
  if (DRY) return;
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); } catch { /* non-fatal */ }
}

/* ------------------------------------------------------------------ env --- */

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^([^=]+)=(.*)$/);
    if (!m) return;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    process.env[m[1].trim()] = v;
  });
}
loadEnv();

const token = process.env.NOTION_TOKEN;
const dbId = process.env.NOTION_DATABASE_ID || '37e365b8-0755-8138-b8c2-ccaa42ba73e5';
if (!token) {
  console.error('Error: NOTION_TOKEN is not set in environment or .env file.');
  process.exit(1);
}

/* ------------------------------------------------------------- notion io --- */

let apiCalls = 0;

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
        try { json = JSON.parse(data); } catch (e) { return reject(new Error(`Bad JSON from ${urlPath}: ${data.slice(0, 200)}`)); }
        // Retry on rate limit / transient server errors.
        if ((res.statusCode === 429 || res.statusCode >= 500) && attempt <= 5) {
          const wait = res.statusCode === 429 ? (Number(res.headers['retry-after']) || 1) * 1000 : 400 * attempt;
          await sleep(wait);
          return resolve(request(urlPath, method, body, attempt + 1));
        }
        if (json.object === 'error') {
          return reject(new Error(`Notion ${json.status} ${json.code}: ${json.message}`));
        }
        resolve(json);
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ----------------------------------------------------------------- utils --- */

const normalize = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

function decodeEntities(s) {
  return String(s)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…');
}

const stripTags = html => decodeEntities(String(html || '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

/** Notion caps a single rich_text element at 2000 chars; chunk to keep it all. */
function richText(text, limit = 2000, maxChunks = 25) {
  const s = String(text || '');
  if (!s) return [];
  const out = [];
  for (let i = 0; i < s.length && out.length < maxChunks; i += limit) {
    out.push({ type: 'text', text: { content: s.slice(i, i + limit) } });
  }
  return out;
}

/**
 * Convert the project's `description` HTML into Notion blocks.
 * Handles the tags the site actually uses in descriptions: p, ul/li, h4,
 * strong, em, br. Anything else is flattened to its text.
 */
function htmlToBlocks(html) {
  const src = String(html || '').trim();
  if (!src) return [];
  const blocks = [];

  const para = t => ({ object: 'block', type: 'paragraph', paragraph: { rich_text: richText(t) } });

  // Pull out block-level chunks in document order.
  const re = /<(p|h4|h3|h2|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  let matchedAny = false;
  while ((m = re.exec(src)) !== null) {
    matchedAny = true;
    const tag = m[1].toLowerCase();
    const inner = m[2];
    if (tag === 'ul' || tag === 'ol') {
      const liRe = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
      let li;
      while ((li = liRe.exec(inner)) !== null) {
        const text = stripTags(li[1]);
        if (!text) continue;
        blocks.push({
          object: 'block',
          type: tag === 'ul' ? 'bulleted_list_item' : 'numbered_list_item',
          [tag === 'ul' ? 'bulleted_list_item' : 'numbered_list_item']: { rich_text: richText(text) },
        });
      }
    } else if (tag === 'p') {
      // <br> inside a paragraph becomes separate paragraphs.
      inner.split(/<br\s*\/?>/i).map(stripTags).filter(Boolean).forEach(t => blocks.push(para(t)));
    } else {
      const text = stripTags(inner);
      if (text) {
        blocks.push({
          object: 'block',
          type: 'heading_3',
          heading_3: { rich_text: richText(text) },
        });
      }
    }
  }

  if (!matchedAny) {
    const text = stripTags(src);
    if (text) blocks.push(para(text));
  }
  return blocks.slice(0, 90);
}

/* -------------------------------------------------------------- taxonomy --- */

/**
 * The website's four categories. Notion's original Category values (the
 * studio / Drive folders) are preserved into `Studio` before this is applied.
 */
const SITE_CATEGORIES = ['academic', 'archv', 'freelancer', 'work'];

/**
 * Notion compares select option names case-insensitively and will not accept a
 * case-only rename, so the site's `archv` cannot become its own option next to
 * the pre-existing `ARCHV`. That is harmless here: ARCHV is genuinely both the
 * studio and the site bucket, so the two simply share one option.
 */
const CATEGORY_ALIASES = { archv: 'ARCHV' };
const mapCategory = c => (c ? CATEGORY_ALIASES[c] || c : null);

/**
 * Location aliases: the site and Notion spell a few places differently.
 * Mapping them avoids creating near-duplicate select options.
 */
const LOCATION_ALIASES = {
  'savannah usa': 'Savannah',
  'mumbai in': 'Mumbai',
  ahmedabad: 'Ahemdabad',
  alibag: 'Alibaugh',
};

function mapLocation(loc) {
  if (!loc) return null;
  const key = String(loc).trim().toLowerCase();
  return LOCATION_ALIASES[key] || String(loc).trim();
}

/**
 * Local slug -> Notion "Project ID". Used the first time a row is matched;
 * afterwards the Slug property written back to Notion is authoritative, so
 * this map only ever needs entries for rows whose names diverged.
 */
const SLUG_TO_PROJECT_ID = {
  'ai-collaboration': 'SCAD-05',
  archv: 'ARCHV-08',
  'bom-mum': 'BARCH-05',
  carlo: 'FREE-15',
  concrt: 'FREE-14',
  crematorium: 'FKD-42',
  dakughar: '823-14',
  'dhal-ni-pol': 'ARCHV-07',
  'episode-kolkata': '823-11',
  'episodeone-powai': '823-10',
  'gong-powai': 'FKD-10',
  goonj: 'FREE-13',
  'habersham-hall': 'SCAD-06',
  'house-by-the-sea': 'FKD-09',
  'human-pods': 'FREE-11',
  'karshid-resort-and-homestay': 'BARCH-03',
  'mainland-china-andheri': 'FKD-08',
  'mumbai-masshousing': 'BARCH-04',
  'open-source-design-library': 'ARCHV-06',
  'pet-park': 'FKD-06',
  'pet-pod': 'FREE-09',
  reflct: 'ARCHV-05',
  'roberto-burle-marx-stickers': 'ADVT-01',
  'saltwater-cafe-bandra': 'FKD-04',
  'scad-design-built': 'SCAD-08',
  scarpin: 'ARCHV-04',
  'seven-gardens': '823-05',
  shelf: 'FREE-08',
  'siddharth-municipal-general-hospital': 'BARCH-01',
  skadoogee: 'SCAD-09',
  'social-city-mall': 'FKD-01',
  'social-malad': '823-04',
  'social-vashi': 'FKD-02',
  'social-wadala': 'FKD-48',
  'sups-in-the-hinterland': 'FREE-07',
  'the-4th-dimention': 'ARCHV-03',
  'the-jude-bakery-project': 'FKD-32',
  'tilak-nagar-cricket-park': 'FREE-06',
  'tower-of-the-quiet-witness': 'SCAD-07',
  'under-the-tree-karjat': '823-03',
  'union-pier-charleston': 'SCAD-10',
  'unplugged-jamshedpur': '823-02',
  'virtual-gods': 'ARCHV-01',
  vndls: 'ARCHV-02',
  xbkc: 'FREE-04',
};

/**
 * New rows inherit a Studio value so the Drive hierarchy stays complete.
 * Derived from the site category + affiliation tag.
 */
function inferStudio(project) {
  const tags = project.tags || [];
  if (tags.includes('scad')) return 'SCAD';
  if (tags.includes('barch')) return 'BARCH';
  if (tags.includes('studio-823')) return '823';
  if (tags.includes('faizan-khatri')) return 'FKD Workshop';
  if (tags.includes('advt')) return 'ADVT';
  if (tags.includes('anla')) return 'ANLA';
  if (project.category === 'archv') return 'ARCHV';
  if (project.category === 'freelancer') return 'FREE';
  return null;
}

/** Next free Project ID within a studio prefix, e.g. FREE-20. */
function nextProjectId(studio, used) {
  const prefix = { 'FKD Workshop': 'FKD', 'Studio Mumbai': 'SM', Pragrup: 'PRA' }[studio] || studio;
  let n = 1;
  while (used.has(`${prefix}-${String(n).padStart(2, '0')}`)) n++;
  const id = `${prefix}-${String(n).padStart(2, '0')}`;
  used.add(id);
  return id;
}

/* ----------------------------------------------------------------- local --- */

function loadLocalProjects() {
  return fs.readdirSync(projectsDir)
    .filter(f => f.endsWith('.yaml'))
    .map(file => {
      const slug = file.replace(/\.yaml$/, '');
      let raw;
      let data;
      try {
        raw = fs.readFileSync(path.join(projectsDir, file), 'utf8');
        data = yaml.load(raw) || {};
      } catch (e) {
        console.error(`  !! Could not parse ${file}: ${e.message}`);
        return null;
      }
      return { slug, file, _hash: hashOf(raw), ...data };
    })
    .filter(Boolean)
    .filter(p => !ONLY || p.slug === ONLY);
}

/* ---------------------------------------------------------------- schema --- */

/**
 * Phase 1 — add the new properties, but leave Category alone.
 *
 * Order matters: `Studio` has to exist and be backfilled from the CURRENT
 * Category values before Category is remapped, otherwise the studio / Drive
 * hierarchy is lost.
 */
async function ensureSchemaPhase1(db) {
  const props = db.properties;
  const patch = {};

  const categoryOptions = (props.Category?.select?.options || []).map(o => ({ name: o.name, color: o.color }));

  // Studio: preserves the original studio / Drive grouping.
  if (!props.Studio) {
    patch.Studio = { select: { options: categoryOptions } };
  }
  if (!props.Tags) patch.Tags = { multi_select: {} };
  if (!props.Slug) patch.Slug = { rich_text: {} };
  if (!props.Featured) patch.Featured = { checkbox: {} };
  if (!props.Client) patch.Client = { rich_text: {} };
  if (!props.Status) {
    patch.Status = { select: { options: [{ name: 'Completed', color: 'green' }, { name: 'Ongoing', color: 'yellow' }] } };
  }
  if (!props.Numbr) patch.Numbr = { number: { format: 'number' } };

  if (!Object.keys(patch).length) {
    console.log('Schema phase 1: already up to date.');
    return db;
  }
  console.log(`Schema phase 1: adding ${Object.keys(patch).join(', ')}`);
  if (DRY) return db;
  return request(`/v1/databases/${dbId}`, 'PATCH', { properties: patch });
}

/**
 * Phase 2 — teach Category the site's four buckets. Runs only AFTER the
 * Studio backfill.
 *
 * Notion treats select option names case-insensitively, so the existing
 * "ARCHV" option cannot coexist with "archv". Where a case-insensitive match
 * exists we rename that option in place (by id) instead of adding a new one —
 * rows keep pointing at the same option, and their original studio value is
 * already safe in `Studio`.
 */
async function ensureSchemaPhase2() {
  const db = await request(`/v1/databases/${dbId}`, 'GET');
  const existing = (db.properties.Category?.select?.options || []);
  const options = existing.map(o => ({ id: o.id, name: o.name, color: o.color }));

  const added = [];
  for (const site of SITE_CATEGORIES) {
    // A case-insensitive hit already covers this bucket (see CATEGORY_ALIASES).
    const hit = options.find(o => o.name.toLowerCase() === String(mapCategory(site)).toLowerCase());
    if (!hit) {
      options.push({ name: mapCategory(site) });
      added.push(mapCategory(site));
    }
  }

  if (!added.length) {
    console.log('Schema phase 2: Category already carries the site buckets.');
    return;
  }
  console.log(`Schema phase 2: Category +[${added.join(', ')}]`);
  if (DRY) return;
  await request(`/v1/databases/${dbId}`, 'PATCH', { properties: { Category: { select: { options } } } });
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

const plain = p => {
  if (!p) return '';
  if (p.type === 'title') return p.title?.map(t => t.plain_text).join('') || '';
  if (p.type === 'rich_text') return p.rich_text?.map(t => t.plain_text).join('') || '';
  if (p.type === 'select') return p.select?.name || '';
  if (p.type === 'checkbox') return p.checkbox;
  if (p.type === 'number') return p.number;
  if (p.type === 'multi_select') return (p.multi_select || []).map(o => o.name);
  return '';
};

/* --------------------------------------------------------------- backfill --- */

async function backfillStudio(rows) {
  const todo = rows.filter(r => {
    const cat = plain(r.properties.Category);
    const studio = plain(r.properties.Studio);
    // Only copy a genuine studio value; never copy an already-remapped one.
    return cat && !studio && !SITE_CATEGORIES.includes(cat);
  });
  console.log(`Studio backfill: ${todo.length} row(s) need their studio preserved.`);
  if (DRY || !todo.length) return todo.length === 0;
  let done = 0;
  for (const row of todo) {
    if (outOfTime()) {
      console.log(`Studio backfill: paused after ${done}/${todo.length} (time budget). Re-run to continue.`);
      return false;
    }
    const cat = plain(row.properties.Category);
    await request(`/v1/pages/${row.id}`, 'PATCH', { properties: { Studio: { select: { name: cat } } } });
    done++;
  }
  console.log(`Studio backfill: done (${done}).`);
  return true;
}

/* ------------------------------------------------------------------ body --- */

/** Replace only the blocks at/after the marker heading; leave the rest alone. */
async function syncBody(pageId, project) {
  const children = [];
  let cursor;
  do {
    const res = await request(
      `/v1/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`, 'GET');
    children.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);

  const markerIdx = children.findIndex(b =>
    b.type === 'heading_2' &&
    (b.heading_2.rich_text || []).map(t => t.plain_text).join('').trim() === BODY_MARKER);

  // Remove the previously synced tail so re-runs stay idempotent.
  if (markerIdx !== -1) {
    for (const b of children.slice(markerIdx)) {
      await request(`/v1/blocks/${b.id}`, 'DELETE');
    }
  }

  const blocks = [
    { object: 'block', type: 'heading_2', heading_2: { rich_text: richText(BODY_MARKER) } },
    {
      object: 'block',
      type: 'callout',
      callout: {
        icon: { type: 'emoji', emoji: '🔗' },
        rich_text: richText(`Synced from the website — src/content/projects/${project.slug}.yaml. Edits below will be overwritten on the next sync; write your own notes above this heading.`),
      },
    },
  ];

  if (project.smallIntro && !/placeholder/i.test(project.smallIntro)) {
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: [{ type: 'text', text: { content: project.smallIntro }, annotations: { italic: true } }] },
    });
  }

  if (project.description && !/placeholder/i.test(project.description)) {
    blocks.push(...htmlToBlocks(project.description));
  }

  const facts = [
    project.year && `Year: ${project.year}`,
    project.client && project.client !== 'NA' && `Client: ${project.client}`,
    project.location && `Location: ${project.location}`,
    project.status && `Status: ${project.status}`,
    project.category && `Category: ${project.category}`,
    (project.tags || []).length && `Tags: ${project.tags.join(', ')}`,
    (project.people || []).length && `Team: ${project.people.join(', ')}`,
  ].filter(Boolean);

  if (facts.length) {
    blocks.push({ object: 'block', type: 'divider', divider: {} });
    facts.forEach(f => blocks.push({
      object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: richText(f) },
    }));
  }

  for (let i = 0; i < blocks.length; i += 100) {
    await request(`/v1/blocks/${pageId}/children`, 'PATCH', { children: blocks.slice(i, i + 100) });
  }
}

/* ------------------------------------------------------------ properties --- */

function buildProperties(project, { studio, projectId } = {}) {
  const props = {};
  props.Name = { title: richText(project.name || project.slug) };
  props.Slug = { rich_text: richText(project.slug) };
  if (project.shortName) props['SHORT NAME'] = { rich_text: richText(project.shortName) };
  if (project.year) props.Year = { select: { name: String(project.year) } };
  if (project.category) props.Category = { select: { name: mapCategory(project.category) } };
  if (project.status) props.Status = { select: { name: project.status } };
  props.Featured = { checkbox: !!project.featured };
  props.Website = { checkbox: true };
  if (typeof project.numbr === 'number') props.Numbr = { number: project.numbr };
  if (project.client) props.Client = { rich_text: richText(project.client) };

  const loc = mapLocation(project.location);
  if (loc) props.Location = { select: { name: loc } };

  if ((project.tags || []).length) {
    props.Tags = { multi_select: project.tags.map(t => ({ name: String(t) })) };
  }
  if (project.smallIntro && !/placeholder/i.test(project.smallIntro)) {
    props.Short = { rich_text: richText(project.smallIntro) };
  }
  if (project.description && !/placeholder/i.test(project.description)) {
    props.Description = { rich_text: richText(stripTags(project.description)) };
  }
  if (studio) props.Studio = { select: { name: studio } };
  if (projectId) props['Project ID'] = { rich_text: richText(projectId) };
  return props;
}

/* ------------------------------------------------------------------ main --- */

async function run() {
  console.log(DRY ? '=== DRY RUN — no writes ===\n' : '=== SYNC website -> Notion ===\n');

  const local = loadLocalProjects();
  console.log(`Loaded ${local.length} local project file(s).`);

  let db = await request(`/v1/databases/${dbId}`, 'GET');
  db = await ensureSchemaPhase1(db);

  const rows = await fetchAllRows();
  console.log(`Fetched ${rows.length} Notion row(s).\n`);

  // Preserve the studio hierarchy first, then remap Category. Category is only
  // remapped once every row's original studio value is safely stored, so an
  // interrupted run can never strand a row without its studio.
  const backfillComplete = await backfillStudio(rows);
  if (!backfillComplete) {
    console.log('\nStopping before the Category remap — the studio backfill must finish first.');
    console.log('Re-run the same command to continue.');
    return;
  }
  await ensureSchemaPhase2();

  const bySlug = new Map();
  const byProjectId = new Map();
  const byName = new Map();
  const usedIds = new Set();
  rows.forEach(r => {
    const slug = plain(r.properties.Slug);
    const pid = plain(r.properties['Project ID']);
    const name = plain(r.properties.Name);
    if (slug) bySlug.set(slug, r);
    if (pid) { byProjectId.set(pid, r); usedIds.add(pid); }
    if (name && !byName.has(normalize(name))) byName.set(normalize(name), r);
  });

  const matchedRowIds = new Set();
  const created = [];
  const updated = [];
  const failed = [];
  const skipped = [];
  let paused = false;

  const state = FORCE ? {} : loadState();

  for (const project of local) {
    let row = bySlug.get(project.slug)
      || byProjectId.get(SLUG_TO_PROJECT_ID[project.slug])
      || byName.get(normalize(project.name))
      || byName.get(normalize(project.shortName));

    // Unchanged since the last successful sync — nothing to push.
    if (row && state[project.slug]?.hash === project._hash && state[project.slug]?.body === !NO_BODY) {
      matchedRowIds.add(row.id);
      skipped.push(project.slug);
      continue;
    }

    if (outOfTime()) {
      paused = true;
      if (row) matchedRowIds.add(row.id);
      continue;
    }

    try {
      if (row) {
        matchedRowIds.add(row.id);
        const existingStudio = plain(row.properties.Studio) || plain(row.properties.Category);
        const studio = SITE_CATEGORIES.includes(existingStudio)
          ? inferStudio(project)
          : existingStudio || inferStudio(project);
        const props = buildProperties(project, { studio });
        console.log(`~ ${project.slug} -> "${plain(row.properties.Name)}" [${plain(row.properties['Project ID']) || 'no id'}]  studio=${studio || '-'} category=${project.category}`);
        if (!DRY) {
          await request(`/v1/pages/${row.id}`, 'PATCH', { properties: props });
          if (!NO_BODY) await syncBody(row.id, project);
          state[project.slug] = { hash: project._hash, body: !NO_BODY, syncedAt: new Date().toISOString() };
          saveState(state);
        }
        updated.push(project.slug);
      } else {
        const studio = inferStudio(project);
        const projectId = studio ? nextProjectId(studio, usedIds) : null;
        console.log(`+ ${project.slug} -> NEW row  studio=${studio || '-'} id=${projectId || '-'} category=${project.category}`);
        if (!DRY) {
          const page = await request('/v1/pages', 'POST', {
            parent: { database_id: dbId },
            properties: buildProperties(project, { studio, projectId }),
          });
          if (!NO_BODY) await syncBody(page.id, project);
          state[project.slug] = { hash: project._hash, body: !NO_BODY, syncedAt: new Date().toISOString() };
          saveState(state);
        }
        created.push(project.slug);
      }
    } catch (e) {
      console.error(`  !! ${project.slug}: ${e.message}`);
      failed.push(`${project.slug}: ${e.message}`);
    }
  }

  // Rows Notion has that the site does not — reported, never deleted.
  const notionOnlyFlagged = rows.filter(r =>
    !matchedRowIds.has(r.id) && plain(r.properties.Website) === true);

  console.log(`\n--- Summary ---`);
  console.log(`Updated:   ${updated.length}`);
  console.log(`Created:   ${created.length}${created.length ? ` (${created.join(', ')})` : ''}`);
  console.log(`Unchanged: ${skipped.length}`);
  console.log(`Failed:    ${failed.length}`);
  failed.forEach(f => console.log(`   ${f}`));
  console.log(`API calls: ${apiCalls}`);

  if (paused) {
    const remaining = local.length - updated.length - created.length - skipped.length - failed.length;
    console.log(`\nPaused on the time budget with ${remaining} project(s) left. Re-run to continue.`);
  }

  if (notionOnlyFlagged.length) {
    console.log(`\nNotion rows still ticked "Website" with no page on the site (${notionOnlyFlagged.length}) —`);
    console.log(`left untouched; untick them in Notion if they are not coming back:`);
    notionOnlyFlagged.forEach(r => {
      console.log(`   - ${plain(r.properties['Project ID']) || '?'}  ${plain(r.properties.Name)}`);
    });
  }
}

run().catch(e => { console.error('\nSync failed:', e.message); process.exit(1); });

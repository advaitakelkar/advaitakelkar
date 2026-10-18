#!/usr/bin/env node
// Builds src/data/ev-charging-usa.json for /powerhouse: every public, open
// EV charging station in the US, projected onto an Albers USA map and
// gathered into a dot grid (82k single dots are too heavy for one page).
//
// Inputs (not committed, fetch them fresh):
//   stations.csv  https://developer.nlr.gov/api/alt-fuel-stations/v1.csv?api_key=<key>&fuel_type=ELEC&status=E&access=public&country=US&limit=all
//                 (NREL's API moved from developer.nrel.gov to developer.nlr.gov in 2026)
//   states.json   https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-albers-10m.json
//
// d3-geo and topojson-client are not site dependencies; run with them on NODE_PATH:
//   node scripts/build-ev-map.mjs <stations.csv> <states.json>

import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { geoAlbersUsa, geoPath } = require('d3-geo');
const topojson = require('topojson-client');

const [csvPath, atlasPath] = process.argv.slice(2);
if (!csvPath || !atlasPath) {
  console.error('usage: node scripts/build-ev-map.mjs <stations.csv> <states.json>');
  process.exit(1);
}

const CELL = 7; // grid size in map units (viewBox is 975 × 610)
const r1 = (n) => Math.round(n * 10) / 10;

// ── CSV ────────────────────────────────────────────────────────────
function parseCSV(text) {
  const rows = []; let row = []; let f = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}

const rows = parseCSV(fs.readFileSync(csvPath, 'utf8'));
const head = rows.shift();
const col = (name) => head.indexOf(name);
const C = {
  state: col('State'), city: col('City'), l1: col('EV Level1 EVSE Num'), l2: col('EV Level2 EVSE Num'),
  dc: col('EV DC Fast Count'), lat: col('Latitude'), lon: col('Longitude'), net: col('EV Network'),
};

const projection = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const num = (v) => (v && !isNaN(+v) ? +v : 0);

const cells = new Map();
const byState = new Map();
const byNetwork = new Map();
const totals = { stations: 0, ports: 0, l1: 0, l2: 0, dc: 0, dcStations: 0, mapped: 0 };
const places = { newYorkState: { stations: 0, dc: 0, l2: 0 }, bronx: { stations: 0, dc: 0, l2: 0 } };

for (const r of rows) {
  if (r.length < head.length - 5) continue;
  const l1 = num(r[C.l1]), l2 = num(r[C.l2]), dc = num(r[C.dc]);
  totals.stations++; totals.l1 += l1; totals.l2 += l2; totals.dc += dc; totals.ports += l1 + l2 + dc;
  if (dc > 0) totals.dcStations++;

  const st = r[C.state];
  const s = byState.get(st) ?? { stations: 0, l2: 0, dc: 0 };
  s.stations++; s.l2 += l2 + l1; s.dc += dc; byState.set(st, s);

  const n = (r[C.net] || 'Non-Networked').trim();
  const nn = byNetwork.get(n) ?? { stations: 0, dc: 0 };
  nn.stations++; nn.dc += dc; byNetwork.set(n, nn);

  if (st === 'NY') { places.newYorkState.stations++; places.newYorkState.dc += dc; places.newYorkState.l2 += l2; }
  if (st === 'NY' && /^bronx$/i.test(r[C.city].trim())) { places.bronx.stations++; places.bronx.dc += dc; places.bronx.l2 += l2; }

  const p = projection([+r[C.lon], +r[C.lat]]);
  if (!p) continue;
  totals.mapped++;
  const key = `${Math.floor(p[0] / CELL)},${Math.floor(p[1] / CELL)}`;
  const c = cells.get(key) ?? { s: 0, l2: 0, dc: 0 };
  c.s++; c.l2 += l2 + l1; c.dc += dc; cells.set(key, c);
}

// ── Map geometry (us-atlas albers file is already projected) ─────
const atlas = JSON.parse(fs.readFileSync(atlasPath, 'utf8'));
const path = geoPath();
const round = (d) => d.replace(/\d+\.\d+/g, (m) => r1(+m));
const stateNames = {};
const states = topojson.feature(atlas, atlas.objects.states).features.map((f) => {
  stateNames[f.properties.name] = f.id;
  return { name: f.properties.name, d: round(path(f)) };
});
const borders = round(path(topojson.mesh(atlas, atlas.objects.states, (a, b) => a !== b)));
const nation = round(path(topojson.feature(atlas, atlas.objects.nation)));

const abbr = { AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',DC:'District of Columbia',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',PR:'Puerto Rico' };
const stateStats = {};
for (const [k, v] of byState) if (abbr[k]) stateStats[abbr[k]] = v;

const parkchester = projection([-73.8603, 40.8414]).map(r1);

const out = {
  source: 'U.S. Department of Energy, Alternative Fuels Data Center, Alternative Fuel Stations API (developer.nlr.gov): public, open electric stations, United States',
  accessed: new Date().toISOString().slice(0, 10),
  cell: CELL,
  viewBox: [0, 0, 975, 610],
  totals,
  places,
  topStates: [...byState].filter(([k]) => abbr[k]).sort((a, b) => b[1].stations - a[1].stations).slice(0, 10).map(([k, v]) => ({ state: abbr[k], ...v })),
  topNetworks: [...byNetwork].sort((a, b) => b[1].stations - a[1].stations).slice(0, 8).map(([k, v]) => ({ network: k, ...v })),
  parkchester,
  states: states.map((s) => ({ ...s, ...(stateStats[s.name] ?? { stations: 0, l2: 0, dc: 0 }) })),
  borders,
  nation,
  cells: [...cells].map(([k, v]) => { const [x, y] = k.split(',').map(Number); return [x, y, v.s, v.l2, v.dc]; }),
};

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/ev-charging-usa.json', JSON.stringify(out));
console.log(`stations ${totals.stations}, mapped ${totals.mapped}, ports ${totals.ports} (L2 ${totals.l2}, DC ${totals.dc}), cells ${out.cells.length}, bytes ${fs.statSync('src/data/ev-charging-usa.json').size}`);

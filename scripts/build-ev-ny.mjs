#!/usr/bin/env node
// Builds src/data/ev-charging-ny.json for the New York case study on
// /powerhouse: a New York State map (counties, charger dot grid, stations
// per county) and a New York City map (boroughs, one dot per station,
// stations per borough, the sites the thesis looks at).
//
// Inputs (not committed, fetch them fresh):
//   stations.csv     same file as scripts/build-ev-map.mjs
//   counties.json    https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/counties-10m.json
//   boroughs.geojson https://data.cityofnewyork.us/resource/gthc-hcne.geojson
//
//   node scripts/build-ev-ny.mjs <stations.csv> <counties.json> <boroughs.geojson>
// with d3-geo and topojson-client on NODE_PATH (not site dependencies).

import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { geoMercator, geoPath, geoContains } = require('d3-geo');
const topojson = require('topojson-client');

const [csvPath, countiesPath, boroughsPath] = process.argv.slice(2);
if (!csvPath || !countiesPath || !boroughsPath) {
  console.error('usage: node scripts/build-ev-ny.mjs <stations.csv> <counties.json> <boroughs.geojson>');
  process.exit(1);
}
const r1 = (n) => Math.round(n * 10) / 10;
const round = (d) => d.replace(/-?\d+\.\d+/g, (m) => r1(+m));

// ── CSV (same parser as build-ev-map.mjs) ─────────────────────────
function parseCSV(text) {
  const rows = []; let row = []; let f = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows;
}
const rows = parseCSV(fs.readFileSync(csvPath, 'utf8'));
const head = rows.shift();
const col = (n) => head.indexOf(n);
const C = { name: col('Station Name'), state: col('State'), l1: col('EV Level1 EVSE Num'), l2: col('EV Level2 EVSE Num'),
  dc: col('EV DC Fast Count'), lat: col('Latitude'), lon: col('Longitude'), net: col('EV Network') };
const num = (v) => (v && !isNaN(+v) ? +v : 0);
const stations = rows.filter((r) => r[C.state] === 'NY' && r[C.lat]).map((r) => ({
  name: r[C.name], lon: +r[C.lon], lat: +r[C.lat], l2: num(r[C.l2]) + num(r[C.l1]), dc: num(r[C.dc]),
  net: (r[C.net] || 'Non-Networked').trim(),
}));

// ── New York State ────────────────────────────────────────────────
const atlas = JSON.parse(fs.readFileSync(countiesPath, 'utf8'));
const nyState = topojson.feature(atlas, atlas.objects.states).features.find((f) => f.id === '36');
const nyCounties = topojson.feature(atlas, atlas.objects.counties).features.filter((f) => String(f.id).startsWith('36'));
const SW = 640, SH = 500;
const sProj = geoMercator().fitExtent([[10, 10], [SW - 10, SH - 10]], nyState);
const sPath = geoPath(sProj);

const countyStats = nyCounties.map((f) => ({ name: f.properties.name, d: round(sPath(f)), stations: 0, l2: 0, dc: 0, feature: f }));
const CELL = 5;
const grid = new Map();
for (const s of stations) {
  const c = countyStats.find((k) => geoContains(k.feature, [s.lon, s.lat]));
  if (c) { c.stations++; c.l2 += s.l2; c.dc += s.dc; }
  const p = sProj([s.lon, s.lat]);
  const key = `${Math.floor(p[0] / CELL)},${Math.floor(p[1] / CELL)}`;
  const g = grid.get(key) ?? { l2: 0, dc: 0 };
  g.l2 += s.l2; g.dc += s.dc; grid.set(key, g);
}

// ── New York City ─────────────────────────────────────────────────
const boroughs = JSON.parse(fs.readFileSync(boroughsPath, 'utf8'));
const CW = 640, CH = 640;
const cProj = geoMercator().fitExtent([[10, 10], [CW - 10, CH - 10]], boroughs);
// Thin the shoreline: project, snap to 0.5 units, drop repeats.
function thinPath(geom) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  let d = '';
  for (const poly of polys) for (const ring of poly) {
    let last = null; let pts = [];
    for (const pt of ring) {
      const [x, y] = cProj(pt).map((v) => Math.round(v * 2) / 2);
      if (last && x === last[0] && y === last[1]) continue;
      pts.push([x, y]); last = [x, y];
    }
    if (pts.length < 3) continue;
    d += 'M' + pts.map((p) => p.join(',')).join('L') + 'Z';
  }
  return d;
}
const boroStats = boroughs.features.map((f) => ({ name: f.properties.boroname, d: thinPath(f.geometry), stations: 0, l2: 0, dc: 0, feature: f }));
const nycStations = [];
for (const s of stations) {
  const b = boroStats.find((k) => geoContains(k.feature, [s.lon, s.lat]));
  if (!b) continue;
  b.stations++; b.l2 += s.l2; b.dc += s.dc;
  const [x, y] = cProj([s.lon, s.lat]).map(r1);
  nycStations.push([x, y, s.l2, s.dc, s.name, s.net]);
}

// Sites from the thesis research (coordinates from NYC PLUTO / press).
const sitesRaw = [
  ['Parkchester garages (proposed site)', -73.8594, 40.8415, 'site'],
  ['Jerome–190th St municipal garage', -73.9001, 40.8633, 'dot'],
  ['White Plains Rd municipal lot', -73.8681, 40.8532, 'dot'],
  ['Delancey–Essex municipal garage', -73.9883, 40.7194, 'dot'],
  ['Flushing municipal lot (360 kW)', -73.8296, 40.7578, 'dot'],
  ['MN8 Gateway to Hunts Point (planned)', -73.8745, 40.8065, 'plan'],
];
const sites = sitesRaw.map(([name, lon, lat, kind], i) => { const [x, y] = cProj([lon, lat]).map(r1); return { n: i + 1, name, x, y, kind }; });

const strip = (a) => a.map(({ feature, ...rest }) => rest);
const totals = stations.reduce((t, s) => { t.stations++; t.l2 += s.l2; t.dc += s.dc; return t; }, { stations: 0, l2: 0, dc: 0 });
const nycTotals = boroStats.reduce((t, b) => { t.stations += b.stations; t.l2 += b.l2; t.dc += b.dc; return t; }, { stations: 0, l2: 0, dc: 0 });

const out = {
  accessed: new Date().toISOString().slice(0, 10),
  state: {
    viewBox: [0, 0, SW, SH], cell: CELL, outline: round(sPath(nyState)),
    counties: strip(countyStats).sort((a, b) => b.stations - a.stations),
    grid: [...grid].map(([k, v]) => { const [x, y] = k.split(',').map(Number); return [x, y, v.l2, v.dc]; }),
    nycBox: (() => { const [[x0, y0], [x1, y1]] = [sProj([-74.27, 40.92]), sProj([-73.68, 40.48])]; return [r1(x0), r1(y0), r1(x1 - x0), r1(y1 - y0)]; })(),
    totals,
  },
  city: { viewBox: [0, 0, CW, CH], boroughs: strip(boroStats), stations: nycStations, sites, totals: nycTotals },
};
fs.writeFileSync('src/data/ev-charging-ny.json', JSON.stringify(out));
console.log(`NY stations ${totals.stations} (L2 ${totals.l2}, DC ${totals.dc}); NYC ${nycTotals.stations} (L2 ${nycTotals.l2}, DC ${nycTotals.dc}); counties ${countyStats.length}; bytes ${fs.statSync('src/data/ev-charging-ny.json').size}`);
console.log(strip(boroStats).map((b) => `${b.name}: ${b.stations} st, ${b.l2} L2, ${b.dc} DC`).join(' | '));
console.log(out.state.counties.slice(0, 8).map((c) => `${c.name} ${c.stations}`).join(', '));

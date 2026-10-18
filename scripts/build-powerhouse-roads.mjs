#!/usr/bin/env node
// Builds src/data/powerhouse-roads.json: vector highway & road networks
// aligned to the exact d3-geo projections used in scripts/build-powerhouse-data.mjs.
// Sources: Natural Earth 10m Roads (USA + CA/NY/FL) and US Census TIGERweb (NYC Primary & Secondary Roads).

import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { geoAlbersUsa, geoMercator, geoPath, geoBounds } = require('d3-geo');
const topojson = require('topojson-client');

const [gisDir = '/tmp/ph-gis', outPath = 'src/data/powerhouse-roads.json'] = process.argv.slice(2);

const neRoads = JSON.parse(fs.readFileSync(`${gisDir}/ne_10m_roads.geojson`, 'utf8'));
const usRoads = neRoads.features.filter(
  (f) => f.properties.sov_a3 === 'USA' && f.properties.featurecla === 'Road' && f.properties.type !== 'Ferry Route'
);

// Helper: simplify projected SVG path coordinates by snapping to grid step and removing duplicate consecutive points
function projectLines(features, proj, step = 1, clipBox = null, minSegLen = 1.5, dedupStep = 2) {
  const parts = [];
  const seenEdges = new Set();
  for (const f of features) {
    if (!f.geometry) continue;
    const lines =
      f.geometry.type === 'LineString'
        ? [f.geometry.coordinates]
        : f.geometry.type === 'MultiLineString'
          ? f.geometry.coordinates
          : [];
    for (const line of lines) {
      let pts = [];
      let lastPt = null;
      const flushRaw = () => {
        if (pts.length > 1) {
          let sub = [pts[0]];
          let subLen = 0;
          for (let i = 1; i < pts.length; i++) {
            const a = pts[i - 1],
              b = pts[i];
            const ax = Math.round(a[0] / dedupStep),
              ay = Math.round(a[1] / dedupStep);
            const bx = Math.round(b[0] / dedupStep),
              by = Math.round(b[1] / dedupStep);
            const edgeKey =
              ax < bx || (ax === bx && ay <= by)
                ? `${ax},${ay}-${bx},${by}`
                : `${bx},${by}-${ax},${ay}`;
            if (ax !== bx || ay !== by) {
              if (seenEdges.has(edgeKey)) {
                if (sub.length > 1 && subLen >= minSegLen) {
                  parts.push('M' + sub.map((p) => `${p[0]},${p[1]}`).join('L'));
                }
                sub = [b];
                subLen = 0;
                continue;
              }
              seenEdges.add(edgeKey);
            }
            subLen += Math.hypot(b[0] - a[0], b[1] - a[1]);
            sub.push(b);
          }
          if (sub.length > 1 && subLen >= minSegLen) {
            parts.push('M' + sub.map((p) => `${p[0]},${p[1]}`).join('L'));
          }
        }
        pts = [];
        lastPt = null;
      };
      for (const coord of line) {
        const pt = proj(coord);
        if (!pt || !Number.isFinite(pt[0]) || !Number.isFinite(pt[1])) {
          flushRaw();
          continue;
        }
        if (
          clipBox &&
          (pt[0] < clipBox[0] || pt[0] > clipBox[2] || pt[1] < clipBox[1] || pt[1] > clipBox[3])
        ) {
          flushRaw();
          continue;
        }
        const x = Math.round(pt[0] / step) * step;
        const y = Math.round(pt[1] / step) * step;
        const rx = step >= 1 ? Math.round(x) : Number(x.toFixed(1));
        const ry = step >= 1 ? Math.round(y) : Number(y.toFixed(1));
        if (!lastPt || rx !== lastPt[0] || ry !== lastPt[1]) {
          pts.push([rx, ry]);
          lastPt = [rx, ry];
        }
      }
      flushRaw();
    }
  }
  return parts.join('');
}

// 1. USA Map (975 x 610 Albers USA)
const usProj = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const usInterstates = usRoads.filter((f) => f.properties.level === 'Interstate');
const usMajorHighways = usRoads.filter(
  (f) => f.properties.level !== 'Interstate' && f.properties.type === 'Major Highway'
);

const usa = {
  interstates: projectLines(usInterstates, usProj, 1, null, 2),
  highways: projectLines(usMajorHighways, usProj, 1, null, 3),
};

// 2. Three States (CA, NY, FL — 420 x 240 each)
const countyAtlas = JSON.parse(
  fs.readFileSync(`${gisDir}/node_modules/us-atlas/counties-10m.json`, 'utf8')
);
const geoStates = topojson.feature(countyAtlas, countyAtlas.objects.states).features;
const stateIds = { CA: '06', NY: '36', FL: '12' };
const states = {};

for (const [code, id] of Object.entries(stateIds)) {
  const f = geoStates.find((s) => s.id === id);
  const [[minLon, minLat], [maxLon, maxLat]] = geoBounds(f);
  const pad = 1.5;
  const stateRoads = usRoads.filter((r) => {
    const b = r.bbox;
    if (!b) return true;
    return !(b[2] < minLon - pad || b[0] > maxLon + pad || b[3] < minLat - pad || b[1] > maxLat + pad);
  });
  const proj = geoMercator().fitExtent(
    [
      [8, 8],
      [412, 232],
    ],
    f
  );
  const inter = stateRoads.filter((r) => r.properties.level === 'Interstate');
  const other = stateRoads.filter((r) => r.properties.level !== 'Interstate');
  states[code] = {
    interstates: projectLines(inter, proj, 1, [-20, -20, 440, 260], 2),
    highways: projectLines(other, proj, 1, [-20, -20, 440, 260], 2.5),
  };
}

// 3. New York City (640 x 640 Mercator)
const bgeo = JSON.parse(fs.readFileSync(`${gisDir}/boroughs.geojson`, 'utf8'));
const bproj = geoMercator().fitExtent(
  [
    [12, 12],
    [628, 628],
  ],
  bgeo
);
const nycPri = JSON.parse(fs.readFileSync(`${gisDir}/nyc_tiger_2.geojson`, 'utf8')).features;
const nycSec = JSON.parse(fs.readFileSync(`${gisDir}/nyc_tiger_6.geojson`, 'utf8')).features;

const city = {
  primary: projectLines(nycPri, bproj, 1, [0, 0, 640, 640], 4),
  secondary: projectLines(nycSec, bproj, 1, [0, 0, 640, 640], 3),
};

const out = {
  sources: {
    nationalAndStateRoads: 'Natural Earth 10m Roads (Interstate, US Federal & State Highways)',
    nycRoads: 'U.S. Census Bureau TIGER/Line Primary & Secondary Roads (MAF/TIGER)',
  },
  usa,
  states,
  city,
};

fs.writeFileSync(outPath, JSON.stringify(out));
console.log(
  `Saved ${outPath}: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`,
  {
    usaInterstatesLen: usa.interstates.length,
    usaHighwaysLen: usa.highways.length,
    CA: states.CA.interstates.length + states.CA.highways.length,
    NY: states.NY.interstates.length + states.NY.highways.length,
    FL: states.FL.interstates.length + states.FL.highways.length,
    nycPrimaryLen: city.primary.length,
    nycSecondaryLen: city.secondary.length,
  }
);

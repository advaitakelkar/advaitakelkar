// Crisp, layered SVG state maps for the Powerhouse thesis — one file for the web and the
// InDesign book alike.
//
// Usage: node scripts/build-powerhouse-svg-maps.mjs [STATE ...]      (default: FL)
//
// Inputs, all under source-files/powerhouse/ (gitignored, never deployed):
//   osm/<slug>-latest.osm.pbf   OpenStreetMap state extract, from download.geofabrik.de
//   census/county, census/state Census cartographic boundaries 1:500,000 (cb_2024_*_500k)
//   stations.csv, stations_private.csv   the AFDC snapshot the page counts come from
// Tools: osmium-tool (brew install osmium-tool) and mapshaper (dev dependency).
// Run with room to work: NODE_OPTIONS=--max-old-space-size=8192 (a whole state's roads).
//
// Output: public/maps/<slug>.svg with one named group per layer, bottom to top —
//   land, counties, roads-primary, roads-trunk, roads-motorway, outline, stations-private,
//   stations-other, stations-tesla — projected in the state's own standard projection and styled in plain
//   black and greys, so it reads in InDesign as placed and takes the site's colours on the web.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import mapshaper from 'mapshaper';

const SRC = 'source-files/powerhouse';
const TMP = `${SRC}/build`;
const OUT = 'public/maps';
fs.mkdirSync(TMP, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

// Each state in its own official statewide projection.
const STATES = {
  FL: { slug: 'florida', fips: '12', name: 'Florida', proj: 'EPSG:3087' }, // NAD83(HARN) / Florida GDL Albers
  CA: { slug: 'california', fips: '06', name: 'California', proj: 'EPSG:3310' }, // NAD83 / California Albers
  NY: { slug: 'new-york', fips: '36', name: 'New York', proj: 'EPSG:26918' }, // NAD83 / UTM zone 18N, the usual statewide grid
};

function csv(text) {
  const rows = []; let row = [], v = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { v += '"'; i++; } else q = false; } else v += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(v); v = ''; }
    else if (c === '\n') { row.push(v); rows.push(row); row = []; v = ''; }
    else if (c !== '\r') v += c;
  }
  if (v || row.length) { row.push(v); rows.push(row); }
  const head = rows.shift();
  return rows.filter((r) => r.length === head.length).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

for (const code of process.argv.slice(2).length ? process.argv.slice(2) : ['FL']) {
  const st = STATES[code];
  if (!st) throw new Error(`No settings for ${code}.`);
  const pbf = `${SRC}/osm/${st.slug}-latest.osm.pbf`;
  const roadsPbf = `${TMP}/${st.slug}-roads.osm.pbf`;
  const roadsJson = `${TMP}/${st.slug}-roads.geojson`;
  const stationsJson = `${TMP}/${st.slug}-stations.geojson`;

  // 1. Major roads only, straight out of OpenStreetMap.
  execFileSync('osmium', ['tags-filter', pbf, 'w/highway=motorway,trunk,primary', '-o', roadsPbf, '--overwrite'], { stdio: 'inherit' });
  // Keep only the two tags the map uses; everything else OSM carries is weight.
  const exportConfig = `${TMP}/osmium-export.json`;
  fs.writeFileSync(exportConfig, JSON.stringify({ attributes: { type: false, id: false }, include_tags: ['highway', 'ref'] }));
  execFileSync('osmium', ['export', roadsPbf, '-c', exportConfig, '--geometry-types=linestring', '-f', 'geojson', '-o', roadsJson, '--overwrite'], { stdio: 'inherit' });

  // 2. Public and private stations in this state, from the same AFDC snapshot as the page.
  const stations = ['stations.csv', 'stations_private.csv'].flatMap((f) => csv(fs.readFileSync(`${SRC}/${f}`, 'utf8')))
    .filter((r) => r.State === code && r['Status Code'] === 'E' && r['Fuel Type Code'] === 'ELEC' && ['public', 'private'].includes(r['Access Code']))
    .map((r) => {
      const ports = (+r['EV Level1 EVSE Num'] || 0) + (+r['EV Level2 EVSE Num'] || 0) + (+r['EV DC Fast Count'] || 0);
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [+r.Longitude, +r.Latitude] },
        properties: { access: r['Access Code'], tesla: ['Tesla', 'Tesla Destination'].includes(r['EV Network']) ? 1 : 0, ports, dc: +r['EV DC Fast Count'] || 0 },
      };
    });
  fs.writeFileSync(stationsJson, JSON.stringify({ type: 'FeatureCollection', features: stations }));

  // 3. Clip, simplify, project and draw, 600 units wide: one unit is one point when placed
  //    at 600 pt in InDesign, so line weights and dot sizes below are print sizes. The web
  //    overrides colour per layer with CSS, never geometry.
  const cmd = [
    `-i ${SRC}/census/state/cb_2024_us_state_500k.shp name=outline`,
    `-filter "STATEFP == '${st.fips}'"`,
    `-simplify interval=120`,
    `-i ${SRC}/census/county/cb_2024_us_county_500k.shp name=counties`,
    `-filter "STATEFP == '${st.fips}'"`,
    `-simplify interval=150`,
    `-innerlines`,
    ...['primary', 'trunk', 'motorway'].flatMap((kind) => [
      `-i ${roadsJson} name=roads-${kind}`,
      `-filter "highway == '${kind}'"`,
      // ~250 m: the map is 600 pt across (about a full page width), so one point is ~1.3 km
      // in Florida — nothing visible is lost, even at 3× zoom on screen.
      `-simplify interval=250`,
      `-clip outline`,
      `-dissolve`,
    ]),
    ...[['private', "access == 'private'"], ['other', "access == 'public' && tesla == 0"], ['tesla', "access == 'public' && tesla == 1"]].flatMap(([kind, test]) => [
      `-i ${stationsJson} name=stations-${kind}`,
      `-filter "${test}"`,
      `-clip outline`,
    ]),
    `-proj ${st.proj} target=*`,
    `-dissolve target=outline + name=land`,
    `-style fill=#ededed stroke=none target=land`,
    `-style fill=none stroke=#c8c8c8 stroke-width=0.35 target=counties`,
    `-style fill=none stroke=#9a9a9a stroke-width=0.45 target=roads-primary`,
    `-style fill=none stroke=#6e6e6e stroke-width=0.7 target=roads-trunk`,
    `-style fill=none stroke=#333333 stroke-width=1.1 target=roads-motorway`,
    `-style fill=none stroke=#111111 stroke-width=0.9 target=outline`,
    `-style r="Math.min(2.6, 0.9 + Math.sqrt(ports) * 0.25)" fill=none stroke=#8c8c8c stroke-width=0.6 target=stations-private`,
    `-style r="Math.min(2.6, 0.9 + Math.sqrt(ports) * 0.25)" fill=#8c8c8c opacity=0.8 target=stations-other`,
    `-style r="Math.min(2.6, 0.9 + Math.sqrt(ports) * 0.25)" fill=#111111 target=stations-tesla`,
    `-o ${OUT}/${st.slug}.svg format=svg width=600 margin=8 precision=0.05 target=land,counties,roads-primary,roads-trunk,roads-motorway,outline,stations-private,stations-other,stations-tesla`,
  ].join(' ');
  await mapshaper.runCommands(cmd);
  const bytes = fs.statSync(`${OUT}/${st.slug}.svg`).size;
  console.log(JSON.stringify({ state: code, stations: stations.length, svg: `${OUT}/${st.slug}.svg`, kb: Math.round(bytes / 1024) }));
}

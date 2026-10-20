// New York State, county by county: where its charging points are. For section 2.0's
// micro-study, from the same AFDC snapshot the rest of the page counts.
//
// Usage: node scripts/build-powerhouse-ny-counties.mjs
//
// Inputs (source-files/powerhouse/, gitignored): stations.csv, stations_private.csv,
// census/county/cb_2024_us_county_500k, and census/pop/co-est2024-alldata.csv (Census Bureau
// county population estimates, July 2024: www2.census.gov/programs-surveys/popest/datasets/
// 2020-2024/counties/totals/). The Census API now needs a key; the file does not.
//
// Outputs:
//   public/maps/ny-counties.svg          counties in NAD83 / UTM 18N, each path classed
//                                        q0–q5 by public charging points, carrying its name
//   src/data/powerhouse-ny-counties.json totals, every county's counts, and the top ten
import fs from 'node:fs';
import mapshaper from 'mapshaper';

const SRC = 'source-files/powerhouse';
const TMP = `${SRC}/build`;
fs.mkdirSync(TMP, { recursive: true });

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

const stations = ['stations.csv', 'stations_private.csv']
  .flatMap((f) => csv(fs.readFileSync(`${SRC}/${f}`, 'utf8')))
  .filter((r) => r.State === 'NY' && r['Status Code'] === 'E' && r['Fuel Type Code'] === 'ELEC' && ['public', 'private'].includes(r['Access Code']))
  .map((r) => {
    const l2 = (+r['EV Level1 EVSE Num'] || 0) + (+r['EV Level2 EVSE Num'] || 0);
    const dc = +r['EV DC Fast Count'] || 0;
    const pub = r['Access Code'] === 'public' ? 1 : 0;
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [+r.Longitude, +r.Latitude] },
      properties: { pub, ports: l2 + dc, pubPorts: pub * (l2 + dc), pubDc: pub * dc, pubSite: pub },
    };
  });
fs.writeFileSync(`${TMP}/ny-stations.geojson`, JSON.stringify({ type: 'FeatureCollection', features: stations }));

// Counties with their station totals joined by location.
await mapshaper.runCommands([
  `-i ${SRC}/census/county/cb_2024_us_county_500k.shp name=counties`,
  `-filter "STATEFP == '36'"`,
  `-join ${TMP}/ny-stations.geojson calc='pubPorts=sum(pubPorts), pubDc=sum(pubDc), pubSites=sum(pubSite), allPorts=sum(ports)'`,
  `-each 'pubPorts = pubPorts || 0; pubDc = pubDc || 0; pubSites = pubSites || 0; allPorts = allPorts || 0'`,
  `-o ${TMP}/ny-counties.json format=geojson precision=0.0001`,
].join(' '));
const counties = JSON.parse(fs.readFileSync(`${TMP}/ny-counties.json`, 'utf8')).features.map((f) => f.properties);

// Population, Census Bureau estimates for July 2024.
const pop = {};
for (const r of csv(fs.readFileSync(`${SRC}/census/pop/co-est2024-alldata.csv`, 'latin1'))) {
  if (r.STATE === '36' && r.SUMLEV === '050') pop[r.COUNTY] = +r.POPESTIMATE2024;
}

const NYC = new Set(['005', '047', '061', '081', '085']); // Bronx, Kings, New York, Queens, Richmond
const BOROUGH = { '005': 'Bronx', '047': 'Brooklyn', '061': 'Manhattan', '081': 'Queens', '085': 'Staten Island' };
const total = counties.reduce((s, c) => s + c.pubPorts, 0);
const rows = counties.map((c) => ({
  fips: c.COUNTYFP,
  name: BOROUGH[c.COUNTYFP] ? `${BOROUGH[c.COUNTYFP]} (${c.NAME})` : c.NAME,
  nyc: NYC.has(c.COUNTYFP),
  pubPorts: c.pubPorts,
  pubDc: c.pubDc,
  pubSites: c.pubSites,
  allPorts: c.allPorts,
  share: total ? +((c.pubPorts / total) * 100).toFixed(1) : 0,
  pop: pop[c.COUNTYFP] ?? null,
  per10k: pop[c.COUNTYFP] ? +((c.pubPorts / pop[c.COUNTYFP]) * 10000).toFixed(1) : null,
})).sort((a, b) => b.pubPorts - a.pubPorts);

// Six classes on public points, breaks at fixed counts so the legend reads in round numbers.
const breaks = [0, 50, 150, 400, 1000, 2500];
const klass = (n) => breaks.reduce((k, b, i) => (n > b ? i : k), 0);
const byFips = Object.fromEntries(rows.map((r) => [r.fips, klass(r.pubPorts)]));
const geo = JSON.parse(fs.readFileSync(`${TMP}/ny-counties.json`, 'utf8'));
for (const f of geo.features) { f.properties.q = byFips[f.properties.COUNTYFP]; f.properties.nyc = NYC.has(f.properties.COUNTYFP); }
fs.writeFileSync(`${TMP}/ny-counties-q.json`, JSON.stringify(geo));

await mapshaper.runCommands([
  `-i ${TMP}/ny-counties-q.json name=counties`,
  `-proj EPSG:26918`,
  `-simplify interval=300 keep-shapes`,
  `-style class="'q' + q + (nyc ? ' hl' : '')" fill=none stroke=none`,
  `-o public/maps/ny-counties.svg format=svg width=600 margin=4 precision=0.1 id-field=COUNTYFP svg-data=NAME,pubPorts`,
].join(' '));

const nyc = rows.filter((r) => r.nyc);
const nycPorts = nyc.reduce((s, r) => s + r.pubPorts, 0);
const nycPop = nyc.reduce((s, r) => s + (r.pop || 0), 0);
const statePop = rows.reduce((s, r) => s + (r.pop || 0), 0);
const out = {
  source: 'AFDC station snapshot (public and private, status E, electric), joined to Census 2024 county boundaries; Census Bureau population estimates, July 2024.',
  totalPublicPorts: total,
  counties: rows.length,
  nyc: { ports: nycPorts, share: +((nycPorts / total) * 100).toFixed(1), popShare: statePop ? +((nycPop / statePop) * 100).toFixed(1) : null, per10k: nycPop ? +((nycPorts / nycPop) * 10000).toFixed(1) : null },
  rest: { ports: total - nycPorts, per10k: statePop - nycPop ? +(((total - nycPorts) / (statePop - nycPop)) * 10000).toFixed(1) : null },
  breaks,
  top: rows.slice(0, 10),
  rows,
};
fs.writeFileSync('src/data/powerhouse-ny-counties.json', JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({ total, nyc: out.nyc, rest: out.rest, top: rows.slice(0, 10).map((r) => [r.name, r.pubPorts, r.share, r.per10k]) }, null, 1));

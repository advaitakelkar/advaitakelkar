// New York City, neighbourhood by neighbourhood: where its public charging points are.
// For section 2.0's micro-study, from the same AFDC snapshot the rest of the page counts.
//
// Usage: node scripts/build-powerhouse-nyc.mjs
//
// Inputs (source-files/powerhouse/, gitignored):
//   stations.csv                      AFDC snapshot (public stations)
//   nyc/nta2020.geojson               NYC 2020 Neighborhood Tabulation Areas (NYC Open Data
//                                     9nt8-h7nd); ntatype 0 = residential neighbourhood
//   census/pop/co-est2024-alldata.csv Census Bureau county estimates, July 2024 (boroughs)
//
// Outputs:
//   public/maps/nyc-ntas.svg          NTAs in NAD83 / New York Long Island, classed q0–q5 by
//                                     public charging points; parks and airports classed "np"
//   src/data/powerhouse-nyc.json      borough totals and per-resident rates, NTA counts
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

const stations = csv(fs.readFileSync(`${SRC}/stations.csv`, 'utf8'))
  .filter((r) => r.State === 'NY' && r['Status Code'] === 'E' && r['Fuel Type Code'] === 'ELEC' && r['Access Code'] === 'public')
  .map((r) => {
    const l2 = (+r['EV Level1 EVSE Num'] || 0) + (+r['EV Level2 EVSE Num'] || 0);
    const dc = +r['EV DC Fast Count'] || 0;
    return { type: 'Feature', geometry: { type: 'Point', coordinates: [+r.Longitude, +r.Latitude] }, properties: { ports: l2 + dc, dc, site: 1 } };
  });
fs.writeFileSync(`${TMP}/nyc-stations.geojson`, JSON.stringify({ type: 'FeatureCollection', features: stations }));

await mapshaper.runCommands([
  `-i ${SRC}/nyc/nta2020.geojson name=ntas`,
  `-join ${TMP}/nyc-stations.geojson calc='ports=sum(ports), dc=sum(dc), sites=sum(site)'`,
  `-each 'ports = ports || 0; dc = dc || 0; sites = sites || 0'`,
  `-o ${TMP}/nyc-ntas.json format=geojson precision=0.00001`,
].join(' '));
const geo = JSON.parse(fs.readFileSync(`${TMP}/nyc-ntas.json`, 'utf8'));
const ntas = geo.features.map((f) => f.properties);

const breaks = [0, 10, 25, 50, 100, 200];
const klass = (n) => (n === 0 ? 0 : breaks.reduce((k, b, i) => (n > b ? i : k), 0));
for (const f of geo.features) {
  const p = f.properties;
  p.q = (p.ntatype === '0' ? `q${klass(p.ports)}` : 'np') + (p.boroname === 'Manhattan' ? ' hl' : '');
}
fs.writeFileSync(`${TMP}/nyc-ntas-q.json`, JSON.stringify(geo));
await mapshaper.runCommands([
  `-i ${TMP}/nyc-ntas-q.json name=ntas`,
  `-proj EPSG:2263`,
  `-simplify interval=80 keep-shapes`,
  `-style class="q" fill=none stroke=none`,
  `-o public/maps/nyc-ntas.svg format=svg width=600 margin=4 precision=0.1 id-field=nta2020 svg-data=ntaname,boroname,ports`,
].join(' '));

// Manhattan alone, drawn larger, for the third step of the zoom.
for (const f of geo.features) f.properties.q = f.properties.q.replace(' hl', '');
fs.writeFileSync(`${TMP}/nyc-ntas-q2.json`, JSON.stringify(geo));
await mapshaper.runCommands([
  `-i ${TMP}/nyc-ntas-q2.json name=ntas`,
  `-filter "boroname == 'Manhattan'"`,
  `-proj EPSG:2263`,
  `-simplify interval=30 keep-shapes`,
  `-style class="q" fill=none stroke=none`,
  `-o public/maps/nyc-manhattan.svg format=svg height=600 margin=4 precision=0.1 id-field=nta2020 svg-data=ntaname,ports`,
].join(' '));

// Boroughs: the five counties, with Census estimates for July 2024.
const pop = {};
for (const r of csv(fs.readFileSync(`${SRC}/census/pop/co-est2024-alldata.csv`, 'latin1'))) {
  if (r.STATE === '36' && r.SUMLEV === '050') pop[r.COUNTY] = +r.POPESTIMATE2024;
}
const BORO = [['Manhattan', '061'], ['Brooklyn', '047'], ['Queens', '081'], ['Bronx', '005'], ['Staten Island', '085']];
const boroughs = BORO.map(([name, fips]) => {
  const rows = ntas.filter((n) => n.boroname === name);
  const ports = rows.reduce((s, n) => s + n.ports, 0);
  const dc = rows.reduce((s, n) => s + n.dc, 0);
  return { name, ports, dc, pop: pop[fips], per10k: +((ports / pop[fips]) * 10000).toFixed(1) };
});
const total = boroughs.reduce((s, b) => s + b.ports, 0);
const totalPop = boroughs.reduce((s, b) => s + b.pop, 0);
const residential = ntas.filter((n) => n.ntatype === '0');
const ranked = [...residential].sort((a, b) => b.ports - a.ports);
const top10 = ranked.slice(0, 10);
const out = {
  source: 'AFDC station snapshot (public, status E, electric) joined to NYC 2020 NTAs; Census Bureau county estimates, July 2024.',
  totalPorts: total,
  totalDc: boroughs.reduce((s, b) => s + b.dc, 0),
  pop: totalPop,
  per10k: +((total / totalPop) * 10000).toFixed(1),
  breaks,
  boroughs: boroughs.map((b) => ({ ...b, share: +((b.ports / total) * 100).toFixed(1), popShare: +((b.pop / totalPop) * 100).toFixed(1) })),
  neighbourhoods: residential.length,
  withNone: residential.filter((n) => n.ports === 0).length,
  top10Share: +((top10.reduce((s, n) => s + n.ports, 0) / total) * 100).toFixed(1),
  top10: top10.map((n) => ({ name: n.ntaname, borough: n.boroname, ports: n.ports, dc: n.dc })),
  manhattan: (() => {
    const m = residential.filter((n) => n.boroname === 'Manhattan');
    return {
      neighbourhoods: m.length,
      withNone: m.filter((n) => n.ports === 0).length,
      top: [...m].sort((a, b) => b.ports - a.ports).slice(0, 6).map((n) => ({ name: n.ntaname, ports: n.ports })),
      bottom: [...m].sort((a, b) => a.ports - b.ports).slice(0, 4).map((n) => ({ name: n.ntaname, ports: n.ports })),
    };
  })(),
};
fs.writeFileSync('src/data/powerhouse-nyc.json', JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({ total, per10k: out.per10k, withNone: out.withNone, of: out.neighbourhoods, top10Share: out.top10Share, boroughs: out.boroughs, top10: out.top10 }, null, 1));

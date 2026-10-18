// Build the data behind the zoomable Powerhouse maps (section 1.1).
// Usage: node scripts/build-powerhouse-stations.mjs [input-dir]
//   input-dir defaults to source-files/powerhouse (gitignored): stations.csv,
//   stations_private.csv, boroughs.geojson — the same AFDC snapshot (18 Oct 2026) that
//   scripts/build-powerhouse-data.mjs aggregates. Each CSV's SHA-256 is checked against
//   src/data/powerhouse-analysis.json, so the map and the counts can never disagree.
//
// Everything is projected HERE, once, into the same Albers USA frame (975 × 610) the US
// outline and roads already use. The browser does no projection and fetches no tiles: it
// draws two small files onto a canvas.
//
//   public/data/powerhouse-stations.bin   12 bytes a station, little-endian:
//     u16 (x + 20)·64, u16 (y + 20)·64, u16 Level 1+2 ports, u16 DC fast ports,
//     u8 flags (1 = private access, 2 = Tesla network), u8 state, u8 network, u8 spare
//   public/data/powerhouse-geo.json       the lists those indexes point into, US land,
//     interstates and highways, NYC boroughs and streets (re-projected from the NYC frame
//     in powerhouse-roads.json), and the box each map opens on.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { geoAlbersUsa, geoMercator, geoPath } from 'd3-geo';

const [dir = 'source-files/powerhouse'] = process.argv.slice(2);
const read = (f) => fs.readFileSync(`${dir}/${f}`);
const analysis = JSON.parse(fs.readFileSync('src/data/powerhouse-analysis.json', 'utf8'));
const roads = JSON.parse(fs.readFileSync('src/data/powerhouse-roads.json', 'utf8'));

for (const f of ['stations.csv', 'stations_private.csv']) {
  const h = crypto.createHash('sha256').update(read(f)).digest('hex');
  if (h !== analysis.hashes[f]) throw new Error(`${f} is not the snapshot the page counts were built from.`);
}

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

// The projection every existing US path was drawn with (build-powerhouse-data.mjs).
const albers = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const S = 64; // sub-pixel steps per Albers unit: sharp to well past street level in NYC
const O = 20; // offset, so the westernmost Aleutian stations (just left of x = 0) still fit a u16

const states = 'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ');
const networks = [];
const netIndex = (n) => { const k = n || 'Non-Networked'; let i = networks.indexOf(k); if (i < 0) { networks.push(k); i = networks.length - 1; } return i; };

const records = [];
for (const r of ['stations.csv', 'stations_private.csv'].flatMap((f) => csv(read(f).toString('utf8')))) {
  if (!states.includes(r.State) || r['Status Code'] !== 'E' || r['Fuel Type Code'] !== 'ELEC') continue;
  const p = albers([+r.Longitude, +r.Latitude]);
  if (!p || !p.every(Number.isFinite)) continue;
  records.push([
    Math.round((p[0] + O) * S), Math.round((p[1] + O) * S),
    (+r['EV Level1 EVSE Num'] || 0) + (+r['EV Level2 EVSE Num'] || 0), +r['EV DC Fast Count'] || 0,
    (r['Access Code'] === 'public' ? 0 : 1) | (['Tesla', 'Tesla Destination'].includes(r['EV Network']) ? 2 : 0),
    states.indexOf(r.State), netIndex(r['EV Network']),
  ]);
}
if (networks.length > 255) throw new Error('Too many networks for one byte.');
const buf = Buffer.alloc(records.length * 12);
records.forEach(([x, y, ac, dc, flags, st, net], i) => {
  const o = i * 12;
  buf.writeUInt16LE(x, o); buf.writeUInt16LE(y, o + 2); buf.writeUInt16LE(ac, o + 4); buf.writeUInt16LE(dc, o + 6);
  buf.writeUInt8(flags, o + 8); buf.writeUInt8(st, o + 9); buf.writeUInt8(net, o + 10);
});

// NYC: boroughs from the source file, finely; streets re-projected out of the NYC frame
// they were drawn in (build-powerhouse-data.mjs fits that Mercator to these same boroughs).
const bgeo = JSON.parse(read('boroughs.geojson'));
const nycFrame = geoMercator().fitExtent([[12, 12], [628, 628]], bgeo);
const reproject = (d) =>
  d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x, y) => {
    const p = albers(nycFrame.invert([+x, +y]));
    return p ? `${p[0].toFixed(3)},${p[1].toFixed(3)}` : `${x},${y}`;
  });
const fine = geoPath(albers).digits(3);
const boroughs = bgeo.features.map((f) => ({ name: f.properties.boroname, d: fine(f), box: fine.bounds(f) }));

// The box each map opens on, in Albers units.
const boxOf = (code) => {
  const pts = records.filter((r) => states[r[5]] === code);
  const xs = pts.map((r) => r[0] / S - O), ys = pts.map((r) => r[1] / S - O);
  const q = (a, t) => a.slice().sort((m, n) => m - n)[Math.floor(t * (a.length - 1))];
  return [[q(xs, 0.002), q(ys, 0.002)], [q(xs, 0.998), q(ys, 0.998)]];
};
const nyc = boroughs.reduce((b, x) => [[Math.min(b[0][0], x.box[0][0]), Math.min(b[0][1], x.box[0][1])], [Math.max(b[1][0], x.box[1][0]), Math.max(b[1][1], x.box[1][1])]], [[Infinity, Infinity], [-Infinity, -Infinity]]);
const bounds = { usa: [[0, 0], [975, 610]], CA: boxOf('CA'), NY: boxOf('NY'), FL: boxOf('FL'), NYC: nyc, ...Object.fromEntries(boroughs.map((b) => [b.name, b.box])) };

const geo = {
  snapshot: analysis.snapshot,
  scale: S,
  offset: O,
  count: records.length,
  states,
  networks,
  land: analysis.usa.states,
  interstates: roads.usa.interstates,
  highways: roads.usa.highways,
  boroughs: boroughs.map(({ name, d }) => ({ name, d })),
  nycRoads: { primary: reproject(roads.city.primary), secondary: reproject(roads.city.secondary) },
  bounds,
};

fs.mkdirSync('public/data', { recursive: true });
fs.writeFileSync('public/data/powerhouse-stations.bin', buf);
fs.writeFileSync('public/data/powerhouse-geo.json', JSON.stringify(geo));
fs.rmSync('public/data/powerhouse-stations.json', { force: true });
const pub = records.filter((r) => !(r[4] & 1));
console.log(JSON.stringify({ stations: records.length, publicStations: pub.length, publicPorts: pub.reduce((n, r) => n + r[2] + r[3], 0), binBytes: buf.length, geoBytes: fs.statSync('public/data/powerhouse-geo.json').size }));

// Rebuild the three-slide /powerhouse analysis from official-source snapshots.
// Usage: NODE_PATH=<d3-geo/topojson-client install> node scripts/build-powerhouse-data.mjs
//   <AFDC-and-boundary-input-directory> <official-extract.json> <output.json>
// Inputs: stations.csv, stations_private.csv, states-albers-10m.json,
// counties-10m.json and boroughs.geojson. Snapshot date is explicit, not today's date.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {geoAlbersUsa,geoMercator,geoPath,geoContains}=require('d3-geo');
const topojson=require('topojson-client');
const [dir,officialPath,outPath]=process.argv.slice(2);
if(!outPath) throw new Error('Pass input directory, official extract and output path.');
function csv(text){const rows=[];let row=[],v='',q=false;for(let i=0;i<text.length;i++){const c=text[i];if(q){if(c==='"'){if(text[i+1]==='"'){v+='"';i++;}else q=false;}else v+=c;}else if(c==='"')q=true;else if(c===','){row.push(v);v='';}else if(c==='\n'){row.push(v);rows.push(row);row=[];v='';}else if(c!=='\r')v+=c;}if(v||row.length){row.push(v);rows.push(row);}const head=rows.shift();return rows.filter(r=>r.length===head.length).map(r=>Object.fromEntries(head.map((h,i)=>[h,r[i]])));}
const names={CA:'California',NY:'New York',FL:'Florida'};
const valid=new Set('AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' '));
const inputFiles=['stations.csv','stations_private.csv','states-albers-10m.json','counties-10m.json','boroughs.geojson'];
const hashes=Object.fromEntries(inputFiles.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(dir+'/'+f)).digest('hex')]));
const rows=inputFiles.slice(0,2).flatMap(f=>csv(fs.readFileSync(dir+'/'+f,'utf8'))).filter(r=>valid.has(r.State)&&r['Status Code']==='E'&&r['Fuel Type Code']==='ELEC').map(r=>({state:r.State,access:r['Access Code'],network:r['EV Network'],tesla:['Tesla','Tesla Destination'].includes(r['EV Network']),l1:+r['EV Level1 EVSE Num']||0,l2:+r['EV Level2 EVSE Num']||0,dc:+r['EV DC Fast Count']||0,lon:+r.Longitude,lat:+r.Latitude,name:r['Station Name']}));
function sum(rs){return rs.reduce((a,r)=>({stations:a.stations+1,l1:a.l1+r.l1,l2:a.l2+r.l2,dc:a.dc+r.dc,ports:a.ports+r.l1+r.l2+r.dc}),{stations:0,l1:0,l2:0,dc:0,ports:0});}
function groups(rs){return Object.fromEntries(['all','public','private'].map(access=>[access,Object.fromEntries(['all','tesla','other'].map(network=>[network,sum(rs.filter(r=>(access==='all'||r.access===access)&&(network==='all'||r.tesla===(network==='tesla'))))]))]));}
const round=n=>Math.round(n*10)/10;
function grid(rs,proj,cell){const g=new Map();let mapped=0;for(const r of rs){const p=proj([r.lon,r.lat]);if(!p||!p.every(Number.isFinite))continue;mapped++;const key=[Math.floor(p[0]/cell),Math.floor(p[1]/cell),r.access,r.tesla?'tesla':'other'].join('|');const v=g.get(key)||{x:Math.floor(p[0]/cell)*cell+cell/2,y:Math.floor(p[1]/cell)*cell+cell/2,access:r.access,network:r.tesla?'tesla':'other',l1:0,l2:0,dc:0};v.l1+=r.l1;v.l2+=r.l2;v.dc+=r.dc;g.set(key,v);}return {dots:[...g.values()],mapped};}
const atlas=JSON.parse(fs.readFileSync(dir+'/states-albers-10m.json'));
const usProj=geoAlbersUsa().scale(1300).translate([487.5,305]);
const allStates=topojson.feature(atlas,atlas.objects.states).features;
const usPath=geoPath();
const usa={...grid(rows,usProj,7),groups:groups(rows),states:allStates.map(f=>({name:f.properties.name,d:usPath(f)}))};
const countyAtlas=JSON.parse(fs.readFileSync(dir+'/counties-10m.json'));
const geoStates=topojson.feature(countyAtlas,countyAtlas.objects.states).features;
const geoCounties=topojson.feature(countyAtlas,countyAtlas.objects.counties).features;
const stateIds={CA:'06',NY:'36',FL:'12'};
const states=Object.entries(names).map(([code,name])=>{const rs=rows.filter(r=>r.state===code);const f=geoStates.find(f=>f.id===stateIds[code]);const proj=geoMercator().fitExtent([[8,8],[412,232]],f);const path=geoPath(proj);return {code,name,groups:groups(rs),map:{outline:path(f),...grid(rs,proj,4),counties:geoCounties.filter(f=>String(f.id).startsWith(stateIds[code])).map(f=>({d:path(f)}))}};});
const bgeo=JSON.parse(fs.readFileSync(dir+'/boroughs.geojson'));
const bproj=geoMercator().fitExtent([[12,12],[628,628]],bgeo);
const bpath=geoPath(bproj).digits(1);
const nyrs=rows.filter(r=>r.state==='NY');
const cityDots=[];
const boroughs=bgeo.features.map(f=>{const rs=nyrs.filter(r=>geoContains(f,[r.lon,r.lat]));for(const r of rs){const [x,y]=bproj([r.lon,r.lat]);cityDots.push({...r,borough:f.properties.boroname,x:round(x),y:round(y)});}return {name:f.properties.boroname,d:bpath(f),groups:groups(rs)};});
const official=JSON.parse(fs.readFileSync(officialPath));
const ranked=[...valid].map(code=>({code,...sum(rows.filter(r=>r.state===code&&r.access==='public'))})).sort((a,b)=>b.ports-a.ports);
if(ranked.slice(0,3).map(r=>r.code).join(',')!=='CA,NY,FL')throw new Error('Top three states changed.');
const result={snapshot:'2026-10-18',scope:'50 states and District of Columbia; operating electric stations; territories excluded',hashes,usa,states,city:{boroughs,dots:cityDots,groups:groups(cityDots)},ranked,...official};
fs.writeFileSync(outPath,JSON.stringify(result));
console.log(JSON.stringify({public:usa.groups.public.all,private:usa.groups.private.all,top3:ranked.slice(0,3),city:result.city.groups.public.all,bytes:fs.statSync(outPath).size}));

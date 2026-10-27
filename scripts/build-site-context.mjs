/** Refresh bounded, checked-in context extracts. Not part of the normal site build. */
import fs from 'node:fs/promises';
import { bboxClip } from '@turf/bbox-clip';
import { VectorTile } from '@mapbox/vector-tile';
import { PbfReader } from 'pbf';
import { geoMercator, geoPath } from 'd3-geo';
const sites = [
 {id:'karshid-resort-and-homestay',center:[72.9061639969247,18.44055106031501],radius:0.012},
 {id:'siddharth-municipal-general-hospital',center:[72.84020363855329,19.15943318972379],radius:0.007},
 {id:'mumbai-masshousing',center:[72.84020363855329,19.15943318972379],radius:0.007},
 {id:'habersham-hall',center:[-81.0892701,32.0744346],radius:.006},
 {id:'tower-of-the-quiet-witness',center:[-84.487066912412,33.808925981839],radius:.014},
 {id:'union-pier-charleston',center:[-79.9255881,32.7843360],radius:.012},
 {id:'skadoogee',center:[-83.97303499793635,34.55047325623666],radius:.018},
];
const headers={'User-Agent':'AdvaitaKelkarPortfolio-SiteContext/1.0 (bounded academic project maps)'};
const renderOnly=process.argv.includes('--render-only');
const tilejson=renderOnly?null:await (await fetch('https://tiles.openfreemap.org/planet',{headers})).json();
const z=14, n=2**z;
const tileX=x=>Math.floor((x+180)/360*n);
const tileY=y=>Math.floor((1-Math.asinh(Math.tan(y*Math.PI/180))/Math.PI)/2*n);
await fs.mkdir('public/data/site-maps',{recursive:true});
await fs.mkdir('public/maps/site-context',{recursive:true});
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const only=process.argv.find(arg=>arg.startsWith('--only='))?.slice(7).split(',');
for(const site of sites.filter(s=>!only||only.includes(s.id))){
 const [cx,cy]=site.center,r=site.radius,dx=r/Math.cos(cy*Math.PI/180);
 const bounds=[cx-dx,cy-r,cx+dx,cy+r];
 const existing=renderOnly?JSON.parse(await fs.readFile(`public/data/site-maps/${site.id}.json`,'utf8')):null;
 const features=existing?.features??[],labels=existing?.metadata.labels??[],seenNames=new Set(); let bytes=existing?.metadata.bytes??0,tiles=existing?.metadata.tiles??0;
 if(!renderOnly) for(let x=tileX(bounds[0]);x<=tileX(bounds[2]);x++) for(let y=tileY(bounds[3]);y<=tileY(bounds[1]);y++){
  const url=tilejson.tiles[0].replace('{z}',z).replace('{x}',x).replace('{y}',y);
  const response=await fetch(url,{headers,signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error(`${response.status} ${url}`);
  const buffer=new Uint8Array(await response.arrayBuffer()); bytes+=buffer.byteLength;tiles++;
  if(bytes>50*1024*1024 || tiles>3000)throw Error('Offline extract exceeds provider limits');
  const tile=new VectorTile(new PbfReader(buffer));
  const longitude=t=>t/n*360-180;
  const latitude=t=>Math.atan(Math.sinh(Math.PI*(1-2*t/n)))*180/Math.PI;
  const clipBounds=[longitude(x),latitude(y+1),longitude(x+1),latitude(y)];
  for(const key of ['water','waterway','landcover','landuse','park','transportation','building','water_name','transportation_name']){
   const layer=tile.layers[key];if(!layer)continue;
   for(let i=0;i<layer.length;i++){
    const f=layer.feature(i),p=f.properties,g=f.toGeoJSON(x,y,z),cl=String(p.class??'');
    if(['water_name','transportation_name'].includes(key)){
     const name=p['name:en']??p.name;if(!name||seenNames.has(name))continue;
     const c=g.geometry.type==='Point'?g.geometry.coordinates:g.geometry.type==='LineString'?g.geometry.coordinates[Math.floor(g.geometry.coordinates.length/2)]:null;
     if(c&&c[0]>bounds[0]&&c[0]<bounds[2]&&c[1]>bounds[1]&&c[1]<bounds[3]){labels.push({name,coordinates:c,kind:key==='water_name'?'water':'road'});seenNames.add(name);}continue;
    }
    let kind=key;
    if(key==='transportation')kind=cl==='rail'?'rail':['path','track'].includes(cl)?'path':'road';
    if(['landcover','landuse','park'].includes(key)){
     if(!['wood','grass','forest','park','recreation_ground','garden','nature_reserve','cemetery','wetland'].includes(cl)&&key!=='park')continue;kind='green';
    }
    if(!['Polygon','MultiPolygon','LineString','MultiLineString'].includes(g.geometry.type))continue;
    const clipped=bboxClip(g,clipBounds);
    if(!clipped.geometry.coordinates.length)continue;
    features.push({type:'Feature',geometry:clipped.geometry,properties:{kind,class:cl,name:p['name:en']??p.name??''}});
   }
  }
 }
 const waterNames={
 'tower-of-the-quiet-witness':['Chattahoochee River','Proctor Creek'],
 'union-pier-charleston':['Cooper River'],
 skadoogee:['Yahoola Creek','Chestatee River'],
 }[site.id]??[];
 const waterLabels=[];
 for(const name of waterNames){
  let best=null,distance=Infinity;
  const visit=coords=>{if(typeof coords[0]==='number'){const [x,y]=coords;if(x<bounds[0]||x>bounds[2]||y<bounds[1]||y>bounds[3])return;const d=(x-cx)**2+(y-cy)**2;if(d<distance){distance=d;best=coords;}}else coords.forEach(visit);};
  features.filter(f=>f.properties.name===name).forEach(f=>visit(f.geometry.coordinates));
  if(best)waterLabels.push({name,coordinates:best,kind:'water'});
 }
 const selectedLabels=[...waterLabels,...labels.filter(l=>!waterLabels.some(w=>w.name===l.name))].slice(0,10);
 const data={type:'FeatureCollection',features,metadata:{center:site.center,bounds,labels:selectedLabels,source:'OpenStreetMap via OpenFreeMap / OpenMapTiles',licence:'ODbL 1.0',fetched:existing?.metadata.fetched??new Date().toISOString(),tileSource:existing?.metadata.tileSource??tilejson.tiles[0],tiles,bytes}};
 await fs.writeFile(`public/data/site-maps/${site.id}.json`,JSON.stringify(data,(_key,value)=>typeof value==='number'?Math.round(value*1e6)/1e6:value));
 const projection=geoMercator().center(site.center).translate([550,550]).scale(1100/((bounds[2]-bounds[0])*Math.PI/180));
 const path=geoPath(projection);const shapes=[];
 for(const kind of ['green','water','waterway','road','path','rail','building']){
  const fill={green:'#e4e4e1',water:'#c5c5c0',building:'#373734'}[kind]??'none';
  const stroke={waterway:'#a4a4a0',road:'#aaa9a3',path:'#a5a49d',rail:'#55554f'}[kind]??'none';
  const paths=features.filter(f=>f.properties.kind===kind).map(f=>`<path d="${path(f)??''}"/>`).join('');
  shapes.push(`<g id="${kind}" fill="${fill}" stroke="${stroke}" stroke-width="${kind==='road'?2:1}">${paths}</g>`);
 }
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 1100"><title>${escape(site.id)} site context</title><defs><clipPath id="frame"><rect width="1100" height="1100"/></clipPath></defs><rect id="paper" width="1100" height="1100" fill="#f7f6f1"/><g clip-path="url(#frame)">${shapes.join('')}</g><g id="reference"><circle cx="550" cy="550" r="10" fill="#fff" stroke="#111" stroke-width="3"/><circle cx="550" cy="550" r="3" fill="#111"/></g></svg>`;
 await fs.writeFile(`public/maps/site-context/${site.id}.svg`,svg);
 console.log(site.id,features.length,'features,',tiles,'tiles,',bytes,'bytes');
}

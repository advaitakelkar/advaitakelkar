import type { Map as GLMap, LayerSpecification } from 'maplibre-gl';
export function initProjectSiteMaps() {
  document.querySelectorAll<HTMLElement>('[data-project-site]:not([data-wired])').forEach(host=>{
    host.dataset.wired='true';
    const observer=new IntersectionObserver(entries=>{
      if(!entries.some(e=>e.isIntersecting))return;
      observer.disconnect();
      void mountMap(host);
    },{rootMargin:'400px'});
    observer.observe(host);
    document.addEventListener('astro:before-swap',()=>observer.disconnect(),{once:true});
  });
}
async function mountMap(host: HTMLElement) {
  let map: GLMap | undefined;
  let themeObserver: MutationObserver | undefined;
  const abort=new AbortController();
  document.addEventListener('astro:before-swap',()=>{
    abort.abort();themeObserver?.disconnect();map?.remove();
  },{once:true});
  try {
    const [gl,{default:workerUrl},response]=await Promise.all([
      import('maplibre-gl'),import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'),
      fetch(`/data/site-maps/${host.dataset.projectSite}.json`,{signal:abort.signal}),
      import('maplibre-gl/dist/maplibre-gl.css'),
    ]);
    if(!response.ok)throw Error('Context data unavailable');
    const data=await response.json();
    if(abort.signal.aborted)return;
    gl.setWorkerUrl(workerUrl);
    const center=JSON.parse(host.dataset.center!) as [number,number];
    const [w,s,e,n]=data.metadata.bounds;
    const bounds:[[number,number],[number,number]]=[[w,s],[e,n]];
    const colors=()=>({fg:getComputedStyle(host).color,bg:getComputedStyle(host.querySelector('.site-map__stage')!).backgroundColor});
    const {fg,bg}=colors();
    const layers:LayerSpecification[]=[
      {id:'paper',type:'background',paint:{'background-color':bg}},
      {id:'green',type:'fill',source:'context',filter:['==','kind','green'],paint:{'fill-color':fg,'fill-opacity':.08}},
      {id:'water',type:'fill',source:'context',filter:['==','kind','water'],paint:{'fill-color':fg,'fill-opacity':.2}},
      {id:'waterway',type:'line',source:'context',filter:['==','kind','waterway'],paint:{'line-color':fg,'line-opacity':.3,'line-width':2}},
      {id:'road',type:'line',source:'context',filter:['==','kind','road'],paint:{'line-color':fg,'line-opacity':.28,'line-width':['interpolate',['linear'],['zoom'],12,['match',['get','class'],['motorway','trunk'],2,.6],17,['match',['get','class'],['motorway','trunk'],10,['primary','secondary'],7,3]]}},
      {id:'path',type:'line',source:'context',filter:['==','kind','path'],paint:{'line-color':fg,'line-opacity':.35,'line-width':1.2,'line-dasharray':[2,2]}},
      {id:'rail',type:'line',source:'context',filter:['==','kind','rail'],paint:{'line-color':fg,'line-opacity':.5,'line-width':2,'line-dasharray':[4,2]}},
      {id:'building',type:'fill',source:'context',filter:['==','kind','building'],paint:{'fill-color':fg,'fill-opacity':.72}},
      {id:'reference-halo',type:'circle',source:'reference',paint:{'circle-radius':14,'circle-color':bg,'circle-opacity':.7}},
      {id:'reference',type:'circle',source:'reference',paint:{'circle-radius':7,'circle-color':bg,'circle-stroke-color':fg,'circle-stroke-width':2}},
      {id:'reference-core',type:'circle',source:'reference',paint:{'circle-radius':2,'circle-color':fg}},
    ];
    map=new gl.Map({container:host.querySelector<HTMLElement>('.site-map__canvas')!,center,zoom:14,
      style:{version:8,sources:{context:{type:'geojson',data},reference:{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'Point',coordinates:center}}}},layers},
      attributionControl:false,scrollZoom:true,dragRotate:false,pitchWithRotate:false,touchPitch:false,
      cooperativeGestures:true,maxZoom:18,
    });
    const activeMap=map;
    activeMap.touchZoomRotate.disableRotation();
    activeMap.fitBounds(bounds,{padding:0,duration:0});
    activeMap.setMinZoom(activeMap.getZoom());
    activeMap.setMaxBounds(bounds);
    const updateTheme=()=>{
      if(!activeMap.isStyleLoaded())return;
      const {fg,bg}=colors();
      activeMap.setPaintProperty('paper','background-color',bg);
      for(const id of ['green','water','building'])activeMap.setPaintProperty(id,'fill-color',fg);
      for(const id of ['waterway','road','path','rail'])activeMap.setPaintProperty(id,'line-color',fg);
      for(const id of ['reference-halo','reference'])activeMap.setPaintProperty(id,'circle-color',bg);
      activeMap.setPaintProperty('reference','circle-stroke-color',fg);
      activeMap.setPaintProperty('reference-core','circle-color',fg);
    };
    activeMap.once('load',()=>{
      if(abort.signal.aborted)return;
      host.dataset.ready='true';updateTheme();
      themeObserver=new MutationObserver(updateTheme);
      themeObserver.observe(document.documentElement,{attributes:true});
      themeObserver.observe(document.body,{attributes:true});
    });
    activeMap.on('error',()=>{if(host.dataset.ready!=='true')host.dataset.ready='false';});
  } catch(error) {
    if(abort.signal.aborted)return;
    console.error('Site context map failed to initialise',error);map?.remove();
  }
}

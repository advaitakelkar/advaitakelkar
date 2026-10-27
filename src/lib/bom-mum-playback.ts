import * as d3 from 'd3';

type Lane = {id:string; name:string; color:string};
type Ev = {a:number|null;year:number; y:string; l:string; ln:string; t:string; x:string; context:string; source:string; w:string; ad:boolean; k:boolean};
type Fig = {id:string; name:string; years:string; year:number};
type Data = {lanes:Lane[]; events:Ev[]; figures:Fig[]; population:Array<[number,number]>; map:{land:string[]; reclaimed:string[]; h:number}};
const toFrac = d3.scaleLinear().domain([-600,1200,1500,1650,1800,1850,1900,1950,1995]).range([0,.07,.13,.19,.33,.45,.61,.8,1]).clamp(true);
// Clockwise in the page's reading sense: upper left → base → upper right.
const A0 = -Math.PI*.3, A1 = -Math.PI*1.7;
const angle = (year:number) => A0 + toFrac(year)*(A1-A0);
const polar = (a:number,r:number):[number,number] => [Math.sin(a)*r,-Math.cos(a)*r];
const R0=274, R1=480, BAND=(R1-R0)/5;
const arc=(r0:number,r1:number,a0:number,a1:number) => d3.arc()({innerRadius:r0,outerRadius:r1,startAngle:a0,endAngle:a1}) ?? '';

function draw(root:HTMLElement,data:Data,onPick:(i:number)=>void) {
  const mount=root.querySelector<HTMLElement>('[data-wheel]')!;
  const svg=d3.select(mount).append('svg').attr('viewBox','-680 -660 1360 1340').attr('aria-label','Five historical disciplines with population in the innermost ring, measured inward from its outer edge');
  const defs=svg.append('defs');
  const lanes=data.lanes.map((l,i)=>({...l,mid:R1-(i+.5)*BAND}));
  const byLane=new Map(lanes.map(l=>[l.id,l]));
  const groups=svg.append('g');
  lanes.forEach(l=>{
    const g=groups.append('g').attr('class','bm-ring').attr('data-lane',l.id);
    g.append('path').attr('d',arc(l.mid-BAND/2,l.mid+BAND/2,A0,A1)).attr('fill','#e4e4e1').attr('stroke','#fff').attr('stroke-width',1);
    g.append('path').attr('class','bm-color').attr('fill',l.color);
  });
  // Lane names in the open wedge at the top, each against its own band, set
  // flush to where the band begins — the reference's spaced capitals.
  const nameG=svg.append('g').attr('class','bm-lane-names').style('pointer-events','none');
  lanes.forEach(l=>{const [x,y]=polar(A0,l.mid);nameG.append('text').attr('x',x+14).attr('y',y).attr('dominant-baseline','middle').attr('font-size',12).attr('letter-spacing','.14em').attr('fill','#222').text(l.name.toUpperCase());});
  const years=[-600,-300,0,600,1200,1500,1650];
  for(let y=1700;y<=1995;y+=5)years.push(y);
  svg.append('g').selectAll('line').data(years).join('line').each(function(y){const a=angle(y),[x0,y0]=polar(a,R0),[x1,y1]=polar(a,R1);d3.select(this).attr('x1',x0).attr('y1',y0).attr('x2',x1).attr('y2',y1);}).attr('stroke','#fff').attr('stroke-opacity',.35).attr('stroke-width',.65);
  const popAt=d3.scaleLinear().domain(data.population.map(p=>p[0])).range(data.population.map(p=>p[1])).clamp(true);
  const popDepth=d3.scaleSqrt().domain([0,10_000_000]).range([0,30]);
  // Population is the innermost ring. Its baseline is its outer edge; bars deepen inward.
  const popG=svg.append('g').attr('class','bm-ring').attr('data-lane','population');
  popG.append('path').attr('d',arc(236,268,A0,A1)).attr('fill','#eeeeeb');
  const popYears=d3.range(1661,1992,2);
  const popBars=popG.selectAll('path.bm-pop-bar').data(popYears).join('path').attr('class','bm-pop-bar').attr('d',y=>arc(268-popDepth(popAt(y)),268,angle(y),angle(Math.min(y+2,1991)))).attr('fill','#bdbdb8').attr('stroke','#fff').attr('stroke-width',.5);
  [-600,1500,1650,1800,1850,1900,1950,1995].forEach(y=>{const [x,yy]=polar(angle(y),R1+30);svg.append('text').attr('x',x).attr('y',yy).attr('text-anchor','middle').attr('dominant-baseline','middle').attr('font-size',13).attr('fill','#666').text(y<0?`${-y} BC`:y);});
  // Portraits round the outside at their year; a portrait that would touch
  // its neighbour steps along, and a hairline leads back to the exact year.
  // Two rows: a portrait goes on the inner row if it fits at its year,
  // otherwise on the outer row, and only steps along if both are taken.
  const ROWS=[566,632], FIG_R=29;
  const last=[Infinity,Infinity];
  const figG=svg.append('g').attr('class','bm-figures');
  [...data.figures].sort((a,b)=>a.year-b.year).forEach(f=>{
    const exact=angle(f.year);
    const sep=(r:number)=>(2*FIG_R+6)/r;
    let row=ROWS.findIndex((r,k)=>exact<=last[k]-sep(r));
    let a=exact;
    if(row<0){row=last[0]-sep(ROWS[0])>=last[1]-sep(ROWS[1])?0:1;a=last[row]-sep(ROWS[row]);}
    last[row]=a;
    const R_FIG=ROWS[row];
    const [x,y]=polar(a,R_FIG), [lx0,ly0]=polar(a,R_FIG-FIG_R), [lx1,ly1]=polar(exact,R1+4);
    figG.append('line').attr('x1',lx0).attr('y1',ly0).attr('x2',lx1).attr('y2',ly1).attr('stroke','#111').attr('stroke-opacity',.45).attr('stroke-width',.75).attr('vector-effect','non-scaling-stroke');
    defs.append('clipPath').attr('id',`bm-fig-${f.id}`).append('circle').attr('r',FIG_R);
    const g=figG.append('g').attr('transform',`translate(${x},${y})`);
    g.append('circle').attr('r',FIG_R).attr('fill','#fff');
    g.append('image').attr('href',`/images/bom-mum/people/${f.id}.webp`).attr('x',-FIG_R).attr('y',-FIG_R).attr('width',FIG_R*2).attr('height',FIG_R*2).attr('clip-path',`url(#bm-fig-${f.id})`).attr('preserveAspectRatio','xMidYMid slice').style('filter','grayscale(1) contrast(1.05)');
    g.append('circle').attr('r',FIG_R).attr('fill','none').attr('stroke','#111').attr('stroke-width',1).attr('vector-effect','non-scaling-stroke');
    g.append('title').text(`${f.name} (${f.years}), ${f.year}`);
  });
  // Larger, uncluttered city map. The original vector geography is retained.
  const scale=580/data.map.h, mapY=-350, mapX=-500*scale;
  const map=svg.append('g').attr('class','bm-city').attr('transform',`translate(${mapX},${mapY}) scale(${scale})`);
  [...data.map.land,...data.map.reclaimed].forEach(path=>map.append('path').attr('d',path).attr('fill','#e5e5e2'));
  const islands=map.append('g').attr('class','bm-islands');
  data.map.land.forEach(path=>islands.append('path').attr('d',path).attr('fill','#111'));
  const phases=[{year:1708,start:0,end:.36,label:'Mahim and Worli embankments'},{year:1784,start:.36,end:.56,label:'Hornby Vellard closes the breach'},{year:1870,start:.56,end:1,label:'The islands form one urban landmass'}];
  const fillPhases=phases.map((phase,i)=>{
    defs.append('clipPath').attr('id',`bm-growth-${i}`).append('rect').attr('x',0).attr('y',phase.start*data.map.h).attr('width',1000).attr('height',(phase.end-phase.start)*data.map.h);
    const g=map.append('g').attr('class','bm-reclaimed').attr('clip-path',`url(#bm-growth-${i})`);
    data.map.reclaimed.forEach(path=>g.append('path').attr('d',path).attr('fill','#111'));
    return {phase,g};
  });
  const causeways=map.append('g').selectAll('line').data([{year:1838,x1:830,y1:2540,x2:680,y2:2910}]).join('line').attr('x1',d=>d.x1).attr('y1',d=>d.y1).attr('x2',d=>d.x2).attr('y2',d=>d.y2).attr('stroke','#111').attr('stroke-width',24).attr('stroke-linecap','round');
  const caption=root.querySelector<HTMLElement>('[data-reclaim]')!;
  const seen=new Map<string,number>();
  const points=data.events.map((e,i)=>{const l=byLane.get(e.l)!;const key=e.l+e.year;const n=seen.get(key)??0;seen.set(key,n+1);const [x,y]=polar(angle(e.year),l.mid+[0,-1,1,-2,2][n%5]*6);return {e,i,x,y};});
  // Each event is a white dot inside a translucent dark disc, the reference's
  // mark; a turning point carries a larger, darker disc.
  const markG=svg.append('g');
  const halos=markG.selectAll('circle.bm-halo').data(points).join('circle').attr('class','bm-halo').attr('cx',p=>p.x).attr('cy',p=>p.y).attr('r',p=>p.e.k?17:12).attr('fill','#111').style('pointer-events','none');
  const marks=markG.selectAll('circle.bm-mark').data(points).join('circle').attr('class','bm-mark').attr('data-architecture',p=>p.e.a).attr('cx',p=>p.x).attr('cy',p=>p.y).attr('r',p=>p.e.k?5.5:4).attr('fill','#fff').style('cursor','pointer').on('click',(_ev,p)=>onPick(p.i));
  marks.append('title').text(p=>`${p.e.y}: ${p.e.t}`);
  // The callout: the current event in a hairline bubble just inside the
  // ring, clear of the portraits, with a tail out to its marker.
  const bubble=svg.append('g').attr('class','bm-bubble').style('pointer-events','none').attr('opacity',0);
  const bTail=bubble.append('path').attr('fill','none').attr('stroke','#111').attr('stroke-width',.75).attr('vector-effect','non-scaling-stroke');
  const bCirc=bubble.append('circle').attr('r',62).attr('fill','#fff').attr('stroke','#111').attr('stroke-width',1).attr('vector-effect','non-scaling-stroke');
  const bText=bubble.append('text').attr('text-anchor','middle').attr('font-size',11.5).attr('fill','#111');
  function callout(p:{e:Ev;x:number;y:number}|undefined){
    if(!p){bubble.attr('opacity',0);return;}
    const a=angle(p.e.year), [bx,by]=polar(a,R0-74);
    bCirc.attr('cx',bx).attr('cy',by);
    const [tx,ty]=polar(a,R0-74+62);
    bTail.attr('d',`M${p.x},${p.y}L${tx},${ty}`);
    const words=p.e.t.split(' '), lines:string[]=[]; let line='';
    words.forEach(w=>{if((line+' '+w).trim().length>13){lines.push(line.trim());line=w;}else line+=' '+w;}); if(line.trim())lines.push(line.trim());
    const all=[p.e.y,...lines.slice(0,4)];
    bText.selectAll('tspan').remove();
    all.forEach((t,k)=>bText.append('tspan').attr('x',bx).attr('y',by+(k-(all.length-1)/2)*14).attr('font-weight',k===0?700:400).text(t));
    bubble.raise().attr('opacity',1);
  }
  const cursor=svg.append('path').attr('class','bm-time-cursor').attr('fill','none').attr('stroke','#111').attr('stroke-width',1.5).style('pointer-events','none');
  let off=new Set<string>(), current=-1;
  function paint(i:number,animate=true){
    current=i; const e=data.events[i], end=e?angle(e.year):A0;
    if(i<0 || matchMedia('(prefers-reduced-motion: reduce)').matches)animate=false;
    root.dataset.current=String(i);root.dataset.year=e?String(e.year):'before';
    lanes.forEach(l=>{
      const path=groups.select<SVGPathElement>(`[data-lane="${l.id}"] .bm-color`);
      const node=path.node() as SVGPathElement & {bmEnd?:number};
      path.interrupt();
      if(animate){
        const lerp=d3.interpolateNumber(node.bmEnd??A0,end);
        path.transition().duration(550).attrTween('d',()=>t=>{node.bmEnd=lerp(t);return arc(l.mid-BAND/2,l.mid+BAND/2,A0,node.bmEnd);});
      }else{node.bmEnd=end;path.attr('d',arc(l.mid-BAND/2,l.mid+BAND/2,A0,end));}
    });
    halos.attr('opacity',p=>p.i===i?.85:p.i<=i?(p.e.k?.62:.34):.07).attr('r',p=>p.i===i?20:p.e.k?17:12);
    marks.attr('opacity',p=>p.i<=i?1:.55).attr('r',p=>p.i===i?6.5:p.e.k?5.5:4);
    callout(i>=0?points[i]:undefined);
    popBars.attr('fill',y=>e&&y<=e.year?'#e78062':'#bdbdb8');
    const year=e?.year??-601;
    islands.interrupt().attr('opacity',i<0?0:Math.min(1,.4+.6*(i/(data.events.length-1))));
    fillPhases.forEach(({phase,g})=>g.interrupt().attr('opacity',year>=phase.year?1:0));
    causeways.attr('opacity',d=>year>=d.year?1:0);
    map.attr('data-growth-year',year);
    const state=fillPhases.filter(({phase})=>year>=phase.year).at(-1)?.phase;
    caption.textContent=i<0?'Schematic island reclamation · grey before playback':`${e.y} · ${state?.label??'The seven islands'} · schematic`;
    if(e){const [x0,y0]=polar(end,R0-5),[x1,y1]=polar(end,525);cursor.attr('d',`M${x0},${y0}L${x1},${y1}`);}else cursor.attr('d','');
    setOff(off);
  }
  function setOff(next:Set<string>){off=next;svg.selectAll<SVGGElement,unknown>('.bm-ring').attr('opacity',function(){return off.has(this.dataset.lane!) ? .12 : 1;});marks.attr('display',p=>off.has(p.e.l)?'none':null);halos.attr('display',p=>off.has(p.e.l)?'none':null);}
  paint(-1,false);
  return {paint,setOff,destroy:()=>svg.selectAll('*').interrupt()};
}

export function initBomMum(){
  const root=document.querySelector<HTMLElement>('[data-bm]:not([data-wired])');if(!root)return;root.dataset.wired='true';
  const data=JSON.parse(root.querySelector('[data-bm-data]')!.textContent!) as Data;
  const q=<T extends HTMLElement>(s:string)=>root.querySelector<T>(s)!;
  const card={year:q('[data-c-year]'),lane:q('[data-c-lane]'),title:q('[data-c-title]'),text:q('[data-c-text]'),context:q('[data-c-context]'),source:q<HTMLAnchorElement>('[data-c-source]'),was:q('[data-c-was]'),count:q('[data-c-count]')};
  const play=q<HTMLButtonElement>('[data-play]'), seek=q<HTMLInputElement>('[data-seek]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current=-1,playing=!reduced,inView=false,timer:ReturnType<typeof setTimeout>|undefined;
  const controller=new AbortController(),signal=controller.signal;
  const off=new Set<string>();
  const visible=()=>data.events.map((_,i)=>i).filter(i=>!off.has(data.events[i].l));
  const wheel=draw(root,data,i=>{setPlaying(false);show(i);});
  const items=[...root.querySelectorAll<HTMLElement>('[data-li]')];
  const initial={title:card.title.textContent,text:card.text.textContent};
  function updateButton(){play.textContent=playing?'Pause':current===data.events.length-1?'Replay':'Play';play.setAttribute('aria-label',playing?'Pause timeline':'Play timeline');play.setAttribute('aria-pressed',String(playing));root.dataset.playing=String(playing);}
  function schedule(){if(timer)clearTimeout(timer);if(playing&&inView&&!document.hidden&&visible().length)timer=setTimeout(()=>{const v=visible();const next=v.find(i=>i>current);if(next===undefined){setPlaying(false);return;}show(next);schedule();},4000);}
  function setPlaying(value:boolean){playing=value;updateButton();schedule();}
  function show(i:number){
    current=i;wheel.paint(i);seek.value=String(i);q('[data-progress-label]').textContent=`${i+1} / ${data.events.length}`;
    const e=data.events[i];items.forEach(li=>li.classList.toggle('is-active',+li.dataset.li! === i));
    if(!e){card.year.textContent='600 BC – 1995';card.lane.textContent='';card.title.textContent=initial.title;card.text.textContent=initial.text;card.context.textContent='';card.was.hidden=true;card.source.hidden=true;card.count.textContent=`${data.events.length} events`;return;}
    card.year.textContent=e.y;card.lane.textContent=e.ln;card.lane.style.setProperty('--lane',data.lanes.find(l=>l.id===e.l)!.color);
    card.title.textContent=e.t;card.text.textContent=e.x;card.context.textContent=e.context;
    card.source.hidden=!e.source;if(e.source)card.source.href=e.source;
    card.was.hidden=!e.w&&!e.ad;card.was.textContent=e.w?`The poster gave ${e.w}; corrected in the project chronology.`:e.ad?'Added to the original poster chronology.':'';
    const v=visible();card.count.textContent=`${Math.max(0,v.indexOf(i)+1)} of ${v.length}`;
    if(i===v.at(-1))setPlaying(false);
  }
  function step(n:number){setPlaying(false);const v=visible();if(!v.length)return;const pos=v.indexOf(current);if(n<0&&pos<=0){show(-1);return;}show(v[Math.max(0,Math.min(v.length-1,pos+n))]);}
  play.addEventListener('click',()=>{if(current===visible().at(-1))show(-1);setPlaying(!playing);},{signal});
  root.querySelectorAll<HTMLButtonElement>('[data-step]').forEach(b=>b.addEventListener('click',()=>step(+b.dataset.step!),{signal}));
  seek.addEventListener('input',()=>{setPlaying(false);show(+seek.value);},{signal});
  root.querySelectorAll<HTMLElement>('[data-pick]').forEach(b=>b.addEventListener('click',()=>{setPlaying(false);show(+b.dataset.pick!);},{signal}));
  const wheelEl=q('[data-wheel]');wheelEl.tabIndex=0;
  wheelEl.addEventListener('keydown',ev=>{if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(ev.key)){ev.preventDefault();ev.stopPropagation();step(ev.key==='ArrowRight'||ev.key==='ArrowDown'?1:-1);}},{signal});
  root.querySelectorAll<HTMLButtonElement>('[data-toggle]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.toggle!;off.has(id)?off.delete(id):off.add(id);b.setAttribute('aria-pressed',String(!off.has(id)));root.querySelectorAll<HTMLElement>(`[data-col="${id}"]`).forEach(el=>el.classList.toggle('is-off',off.has(id)));wheel.setOff(off);if(current>=0&&off.has(data.events[current].l)){const next=visible().find(i=>i>current)??visible()[0];if(next!==undefined)show(next);}schedule();},{signal}));
  document.addEventListener('visibilitychange',schedule,{signal});
  const observer=new IntersectionObserver(entries=>{inView=entries.some(e=>e.isIntersecting);schedule();},{threshold:.25});observer.observe(q('.bm__stage'));
  document.addEventListener('astro:before-swap',()=>{if(timer)clearTimeout(timer);observer.disconnect();controller.abort();wheel.destroy();},{once:true});
  show(-1);updateButton();
}

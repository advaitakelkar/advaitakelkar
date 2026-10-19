// Zoomable maps for the Powerhouse evidence in section 1.1.
//
// A canvas, not a tile map. Everything is projected at build time into one Albers USA frame
// (scripts/build-powerhouse-stations.mjs), so a map is: the US states in grey, the
// interstates, and 88,000 stations drawn as dots — nothing outside the US, no third-party
// tiles, no projection in the browser. d3-zoom handles pan and zoom; every frame redraws
// only what is on screen.
//
// Nothing loads until a map is opened. The two data files (about 770 KB compressed) are
// fetched once and shared by every map on the page.
//
// The map itself is drawn in the page's ink (--color--fg / --color--bg); the stations take
// the Powerhouse data palette (--ph-red, --ph-orange). Both are read on every draw, so the
// light/dark switch carries through.
import { select } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity, type ZoomTransform, type ZoomBehavior } from 'd3-zoom';

type Geo = {
  scale: number;
  offset: number;
  count: number;
  states: string[];
  networks: string[];
  land: { name: string; d: string }[];
  interstates: string;
  highways: string;
  boroughs: { name: string; d: string }[];
  nycRoads: { primary: string; secondary: string };
  bounds: Record<string, [[number, number], [number, number]]>;
};
type Data = {
  geo: Geo;
  x: Float32Array; y: Float32Array; ac: Uint16Array; dc: Uint16Array; flags: Uint8Array; state: Uint8Array; net: Uint8Array;
  land: Map<string, Path2D>; interstates: Path2D; highways: Path2D; boroughs: Path2D; nycPrimary: Path2D; nycSecondary: Path2D;
};

export type MapFilter = { access?: 'public' | 'private' | 'all'; network?: 'tesla' | 'other' | 'all'; speed?: 'dc' | 'ac' | 'all' };
export type PowerhouseMap = { ready: Promise<void>; setFilter: (f: MapFilter) => void; fit: (key: string) => void; resize: () => void };

let shared: Promise<Data> | null = null;
const load = () =>
  (shared ??= Promise.all([
    fetch('/data/powerhouse-geo.json').then((r) => r.json() as Promise<Geo>),
    fetch('/data/powerhouse-stations.bin').then((r) => r.arrayBuffer()),
  ]).then(([geo, bin]) => {
    const n = geo.count;
    const v = new DataView(bin);
    const d: Data = {
      geo,
      x: new Float32Array(n), y: new Float32Array(n), ac: new Uint16Array(n), dc: new Uint16Array(n),
      flags: new Uint8Array(n), state: new Uint8Array(n), net: new Uint8Array(n),
      land: new Map(geo.land.map((s) => [s.name, new Path2D(s.d)])),
      interstates: new Path2D(geo.interstates),
      highways: new Path2D(geo.highways),
      boroughs: new Path2D(geo.boroughs.map((b) => b.d).join('')),
      nycPrimary: new Path2D(geo.nycRoads.primary),
      nycSecondary: new Path2D(geo.nycRoads.secondary),
    };
    for (let i = 0, o = 0; i < n; i++, o += 12) {
      d.x[i] = v.getUint16(o, true) / geo.scale - geo.offset;
      d.y[i] = v.getUint16(o + 2, true) / geo.scale - geo.offset;
      d.ac[i] = v.getUint16(o + 4, true);
      d.dc[i] = v.getUint16(o + 6, true);
      d.flags[i] = v.getUint8(o + 8);
      d.state[i] = v.getUint8(o + 9);
      d.net[i] = v.getUint8(o + 10);
    }
    return d;
  }));

// The site's ink and paper as they are on screen right now, and blends of the two.
const ink = () => {
  const cs = getComputedStyle(document.documentElement);
  const fg = cs.getPropertyValue('--_tokens---color--fg').trim() || '#111111';
  const bg = cs.getPropertyValue('--_tokens---color--bg').trim() || '#ffffff';
  const rgb = (hex: string) => {
    const h = hex.replace('#', '');
    const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  };
  const [f, b] = [rgb(fg), rgb(bg)];
  const mix = (t: number) => `rgb(${f.map((v, i) => Math.round(v * t + b[i] * (1 - t))).join(',')})`;
  return { fg, bg, mix };
};

const NAMES: Record<string, string> = { CA: 'California', NY: 'New York', FL: 'Florida' };

export function createMap(
  el: HTMLElement,
  opts: { fit: string; outline?: 'state' | 'boroughs'; focusState?: string; filter?: MapFilter }
): PowerhouseMap {
  let filter: MapFilter = { access: 'public', network: 'all', speed: 'all', ...opts.filter };
  let data: Data | null = null;
  let t: ZoomTransform = zoomIdentity;
  let w = 0, h = 0, dpr = 1;
  let moved = false;
  let frame = 0;

  el.classList.add('ph-map');
  const canvas = document.createElement('canvas');
  const tip = document.createElement('div');
  tip.className = 'ph-map__tip';
  tip.hidden = true;
  const hint = document.createElement('div');
  hint.className = 'ph-map__hint';
  hint.textContent = 'Hold ⌘ or Ctrl and scroll to zoom';
  const controls = document.createElement('div');
  controls.className = 'ph-map__controls';
  controls.innerHTML = '<button type="button" data-z="in" aria-label="Zoom in">+</button><button type="button" data-z="out" aria-label="Zoom out">−</button><button type="button" data-z="reset" aria-label="Reset view">Reset</button>';
  el.append(canvas, tip, hint, controls);
  const ctx = canvas.getContext('2d')!;

  const fitTransform = (key: string) => {
    const b = data?.geo.bounds[key] ?? [[0, 0], [975, 610]];
    const pad = 24;
    const bw = Math.max(1, b[1][0] - b[0][0]), bh = Math.max(1, b[1][1] - b[0][1]);
    const k = Math.min((w - pad * 2) / bw, (h - pad * 2) / bh);
    return zoomIdentity.translate(w / 2 - (k * (b[0][0] + b[1][0])) / 2, h / 2 - (k * (b[0][1] + b[1][1])) / 2).scale(k);
  };

  const pass = (i: number) => {
    const d = data!;
    const priv = d.flags[i] & 1, tes = d.flags[i] & 2;
    if (filter.access === 'public' && priv) return false;
    if (filter.access === 'private' && !priv) return false;
    if (filter.network === 'tesla' && !tes) return false;
    if (filter.network === 'other' && tes) return false;
    if (filter.speed === 'dc' && !d.dc[i]) return false;
    if (filter.speed === 'ac' && d.dc[i]) return false;
    return true;
  };

  const draw = () => {
    frame = 0;
    if (!data || !w) return;
    const { fg, bg, mix } = ink();
    const { k, x: tx, y: ty } = t;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Land, roads and outlines, in map units. Only the US is drawn; everything else is paper.
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(k, k);
    ctx.fillStyle = mix(0.06);
    ctx.strokeStyle = mix(0.22);
    ctx.lineWidth = 0.7 / k;
    for (const p of data.land.values()) { ctx.fill(p); ctx.stroke(p); }
    if (opts.outline === 'boroughs' || k > 40) {
      ctx.fillStyle = mix(0.1);
      ctx.fill(data.boroughs);
      ctx.strokeStyle = mix(0.16);
      ctx.lineWidth = 0.5 / k;
      if (k > 60) ctx.stroke(data.nycSecondary);
      ctx.strokeStyle = mix(0.3);
      ctx.lineWidth = 0.9 / k;
      ctx.stroke(data.nycPrimary);
    }
    ctx.strokeStyle = mix(0.18);
    ctx.lineWidth = 0.6 / k;
    if (k > 1.6) ctx.stroke(data.highways);
    ctx.strokeStyle = mix(0.32);
    ctx.lineWidth = 0.8 / k;
    ctx.stroke(data.interstates);
    if (opts.outline === 'state' && opts.focusState) {
      const p = data.land.get(NAMES[opts.focusState]);
      if (p) { ctx.strokeStyle = fg; ctx.lineWidth = 1.4 / k; ctx.stroke(p); }
    }
    if (opts.outline === 'boroughs') {
      ctx.strokeStyle = mix(0.6);
      ctx.lineWidth = 1 / k;
      ctx.stroke(data.boroughs);
    }
    ctx.restore();

    // Stations, in screen pixels: dot area grows with plugs, and every dot grows a little
    // as you zoom so single stations separate out. Two batched fills, one per tone.
    const base = Math.min(7, 0.42 * Math.pow(k, 0.65));
    const tesla = new Path2D(), other = new Path2D();
    const square = base < 1.1;
    const { x, y, ac, dc, flags } = data;
    for (let i = 0; i < x.length; i++) {
      if (!pass(i)) continue;
      const sx = x[i] * k + tx, sy = y[i] * k + ty;
      if (sx < -8 || sy < -8 || sx > w + 8 || sy > h + 8) continue;
      const r = Math.min(16, base * Math.min(5, Math.max(1, Math.sqrt(ac[i] + dc[i]))));
      const path = flags[i] & 2 ? tesla : other;
      if (square) path.rect(sx - r, sy - r, r * 2, r * 2);
      else { path.moveTo(sx + r, sy); path.arc(sx, sy, r, 0, Math.PI * 2); }
    }
    // Data colours come from the Powerhouse palette on the page (--ph-*), not the ink.
    const pal = getComputedStyle(el);
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = pal.getPropertyValue('--ph-orange').trim() || '#ff8a34';
    ctx.fill(other);
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = pal.getPropertyValue('--ph-red').trim() || '#ff3b30';
    ctx.fill(tesla);
    ctx.globalAlpha = 1;
  };
  const redraw = () => { if (!frame) frame = requestAnimationFrame(draw); };

  // Pan and zoom. The wheel only zooms with ⌘/Ctrl held, so the page still scrolls past.
  let hintTimer = 0;
  let programmatic = false;
  const behaviour: ZoomBehavior<HTMLCanvasElement, unknown> = d3zoom<HTMLCanvasElement, unknown>()
    .filter((e: Event) => {
      if (e.type === 'wheel') {
        const we = e as WheelEvent;
        if (!(we.ctrlKey || we.metaKey)) {
          hint.classList.add('is-on');
          clearTimeout(hintTimer);
          hintTimer = window.setTimeout(() => hint.classList.remove('is-on'), 1100);
          return false;
        }
        return true;
      }
      return !(e as MouseEvent).button;
    })
    .on('zoom', (e) => { t = e.transform; if (!programmatic) moved = true; if (!tip.hidden) tip.hidden = true; redraw(); });
  const sel = select(canvas).call(behaviour).on('dblclick.zoom', null);
  const setT = (next: ZoomTransform) => { programmatic = true; sel.call(behaviour.transform, next); programmatic = false; };

  const animateTo = (target: ZoomTransform) => {
    const from = t, start = performance.now(), dur = 450;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
      const k = from.k * Math.pow(target.k / from.k, e);
      sel.call(behaviour.transform, zoomIdentity.translate(from.x + (target.x - from.x) * e, from.y + (target.y - from.y) * e).scale(k));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  controls.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-z]');
    if (!b) return;
    if (b.dataset.z === 'reset') return animateTo(fitTransform(opts.fit));
    const f = b.dataset.z === 'in' ? 2 : 0.5;
    animateTo(zoomIdentity.translate(w / 2 - (w / 2 - t.x) * f, h / 2 - (h / 2 - t.y) * f).scale(t.k * f));
  });

  // Click a dot: the nearest station under the pointer, and what it is.
  canvas.addEventListener('click', (e) => {
    if (!data) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    let best = -1, bestD = 64;
    for (let i = 0; i < data.x.length; i++) {
      if (!pass(i)) continue;
      const dx = data.x[i] * t.k + t.x - px, dy = data.y[i] * t.k + t.y - py, dd = dx * dx + dy * dy;
      if (dd < bestD) { bestD = dd; best = i; }
    }
    if (best < 0) { if (!tip.hidden) tip.hidden = true; return; }
    const ports = data.ac[best] + data.dc[best];
    tip.innerHTML = `<b>${data.geo.networks[data.net[best]]}</b><br>${ports} plug${ports === 1 ? '' : 's'} · ${data.dc[best]} fast · ${data.ac[best]} Level 1–2<br><span>${data.flags[best] & 1 ? 'Private / restricted' : 'Public access'} · ${data.geo.states[data.state[best]]}</span>`;
    tip.style.left = `${Math.max(8, Math.min(px + 12, w - 230))}px`;
    tip.style.top = `${Math.max(8, py - 12)}px`;
    tip.hidden = false;
  });

  let fitted = false;
  const size = () => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    dpr = Math.min(2, devicePixelRatio || 1);
    const sameSize = r.width === w && r.height === h && canvas.width === Math.round(w * dpr);
    if (!sameSize) {
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    if (!data) return;
    if (!sameSize || !fitted) {
      fitted = true;
      const fitT = fitTransform(opts.fit);
      behaviour.scaleExtent([fitT.k * 0.7, fitT.k * 120]).translateExtent([[-220, -220], [1195, 830]]);
      if (!moved) setT(fitT);
    }
    redraw();
  };
  new ResizeObserver(size).observe(el);
  new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redraw);

  const ready = load().then((d) => { data = d; size(); });

  return {
    ready,
    setFilter(f) { filter = { ...filter, ...f }; redraw(); },
    fit(key) { if (data) animateTo(fitTransform(key)); },
    resize: size,
  };
}

// ── Vector maps ──────────────────────────────────────────────────────────────────────────
// A layered SVG built by scripts/build-powerhouse-svg-maps.mjs (OpenStreetMap roads, Census
// boundaries, AFDC stations) — the same file that is placed in the InDesign book. Here it is
// fetched on demand, inlined, and zoomed as a true vector with d3-zoom: lines keep their
// hairline weight at any zoom, and dots grow only gently so single stations separate out.
// Colours come from CSS on the layer ids, so the print colours in the file never show here.
export function createSvgMap(el: HTMLElement, url: string): PowerhouseMap {
  let filter: MapFilter = { access: 'public', network: 'all' };
  let svg: SVGSVGElement | null = null;
  let layer: SVGGElement | null = null;
  let dots: { c: SVGCircleElement; r: number }[] = [];
  let hub: [number, number] | undefined;
  let k = 1;
  let frame = 0;

  el.classList.add('ph-map', 'ph-map--svg');
  const hint = document.createElement('div');
  hint.className = 'ph-map__hint';
  hint.textContent = 'Hold ⌘ or Ctrl and scroll to zoom';
  const controls = document.createElement('div');
  controls.className = 'ph-map__controls';
  controls.innerHTML = '<button type="button" data-z="in" aria-label="Zoom in">+</button><button type="button" data-z="out" aria-label="Zoom out">−</button><button type="button" data-z="reset" aria-label="Reset view">Reset</button>';

  const apply = () => {
    if (!svg) return;
    const show = (id: string, on: boolean) => svg!.querySelector<SVGGElement>(`#${id}`)?.setAttribute('display', on ? 'inline' : 'none');
    show('stations-private', filter.access !== 'public' && filter.network !== 'tesla');
    show('stations-other', filter.access !== 'private' && filter.network !== 'tesla');
    show('stations-tesla', filter.access !== 'private' && filter.network !== 'other');
  };
  const resizeDots = () => {
    frame = 0;
    // On screen a dot is r × k^0.75: zooming in makes stations clearly bigger, not just apart.
    const s = Math.pow(k, -0.25);
    for (const d of dots) d.c.setAttribute('r', (d.r * s).toFixed(2));
  };

  const ready = fetch(url)
    .then((r) => r.text())
    .then((text) => {
      el.insertAdjacentHTML('afterbegin', text.replace(/<\?xml[^>]*>/, ''));
      svg = el.querySelector('svg')!;
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.setAttribute('role', 'img');
      // Everything moves together inside one group.
      layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      while (svg.firstChild) layer.appendChild(svg.firstChild);
      svg.appendChild(layer);
      dots = [...svg.querySelectorAll<SVGCircleElement>('circle')].map((c) => ({ c, r: +c.getAttribute('r')! }));
      // The stations' centre of mass, for the first zoom.
      hub = dots.length
        ? [dots.reduce((n, d) => n + +d.c.getAttribute('cx')!, 0) / dots.length, dots.reduce((n, d) => n + +d.c.getAttribute('cy')!, 0) / dots.length]
        : undefined;
      el.append(hint, controls);

      const vb = svg.viewBox.baseVal;
      let hintTimer = 0;
      const behaviour = d3zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 40])
        .translateExtent([[0, 0], [vb.width, vb.height]])
        .filter((e: Event) => {
          if (e.type === 'wheel') {
            const we = e as WheelEvent;
            if (!(we.ctrlKey || we.metaKey)) {
              hint.classList.add('is-on');
              clearTimeout(hintTimer);
              hintTimer = window.setTimeout(() => hint.classList.remove('is-on'), 1100);
              return false;
            }
            return true;
          }
          return !(e as MouseEvent).button;
        })
        .on('zoom', (e) => {
          layer!.setAttribute('transform', e.transform.toString());
          k = e.transform.k;
          if (!frame) frame = requestAnimationFrame(resizeDots);
        });
      const sel = select(svg).call(behaviour).on('dblclick.zoom', null);
      controls.addEventListener('click', (e) => {
        const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-z]');
        if (!b) return;
        if (b.dataset.z === 'reset') return sel.call(behaviour.transform, zoomIdentity);
        // From the full view, zoom in on where the stations are, not the middle of the outline
        // (for Florida that is the Gulf of Mexico). After that, zoom about the view's centre.
        const toward: [number, number] | undefined = k === 1 && b.dataset.z === 'in' ? hub : undefined;
        sel.call(behaviour.scaleBy, b.dataset.z === 'in' ? 2 : 0.5, toward);
      });
      apply();
    });

  return {
    ready,
    setFilter(f) { filter = { ...filter, ...f }; apply(); },
    fit() {},
    resize() {},
  };
}

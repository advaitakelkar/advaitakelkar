export type NodeKind = 'core' | 'chapter' | 'lens' | 'bib' | 'section' | 'note' | 'custom';

export interface MindNode {
  id: string;
  label: string;
  code?: string;
  kind: NodeKind;
  chapter?: string;
  category?: string;
  categoryLabel?: string;
  sectionId?: string;
  noteHash?: string;
  refHash?: string;
  summary: string;
  custom?: boolean;
  pinned?: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  degree?: number;
}

export interface MindEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  strength?: number;
  custom?: boolean;
}

export interface MindmapBookSection {
  id: string;
  num: string;
  title: string;
  chapterId: string;
  chapterNum: string;
  bodyPlain: string;
  notesCount: number;
}

export interface MindmapNoteItem {
  id: string;
  ch: string;
  n: number;
  fromSection: string;
  notesSectionId: string;
  shortLabel: string;
  plain: string;
  bibIds: string[];
}

export interface MindmapBibItem {
  id: string;
  idx: number;
  shortAuthor: string;
  category?: string;
  categoryLabel?: string;
  lens?: string;
  plain: string;
  html?: string;
  chapters: string[];
  sections: string[];
}

export interface MindmapInitPayload {
  sections: MindmapBookSection[];
  notes: MindmapNoteItem[];
  bibs: MindmapBibItem[];
}

interface StoredState {
  customNodes: Omit<MindNode, 'vx' | 'vy'>[];
  customEdges: MindEdge[];
  editedSummaries: Record<string, string>;
  pinnedPositions: Record<string, { x: number; y: number }>;
}

const STORAGE_KEY = 'ph-mindmap-citations-v3';

const BASE_CORE: Omit<MindNode, 'x' | 'y' | 'vx' | 'vy'> = {
  id: 'powerhouse',
  code: 'THESIS',
  label: 'The Powerhouse',
  kind: 'core',
  summary:
    'Core Thesis Hypothesis: An Electric Vehicle Powerhouse complex turns charging activities into an opportunity for enhanced civic / community engagements. Sited in New York, it establishes an architectural marvel—a new civic station typology for fast charging, succeeding the 19th-century railway terminus.',
};

const BASE_CHAPTERS: Omit<MindNode, 'x' | 'y' | 'vx' | 'vy'>[] = [
  {
    id: 'ch1',
    code: '1.0',
    label: 'Ch 1 · Charging Anchor',
    kind: 'chapter',
    chapter: '1',
    sectionId: '1-0',
    summary:
      'Chapter 1: A Sustainable Charging Anchor (1.1–1.7) · Foundational argument, electrification velocity, dwell time physics, public space trade-offs, and theoretical framework.',
  },
  {
    id: 'ch2',
    code: '2.0',
    label: 'Ch 2 · The Stop',
    kind: 'chapter',
    chapter: '2',
    sectionId: '2-0',
    summary:
      'Chapter 2: The Stop: Parking, Travel and the Time to Charge (2.1–2.6) · New York vehicle flows, fast-charging network anatomy, station histories, battery physics, and the Calatrava Civic Station Marvel typology.',
  },
  {
    id: 'ch3',
    code: '3.0',
    label: 'Ch 3 · The Public Space',
    kind: 'chapter',
    chapter: '3',
    sectionId: '3-0',
    summary:
      'Chapter 3: The Public Space: What Each Neighbourhood Needs · Cultural landscape, Third Place sociology, dwelling, and civic threshold design.',
  },
  {
    id: 'ch4',
    code: '4.0',
    label: 'Ch 4 · The Programme',
    kind: 'chapter',
    chapter: '4',
    sectionId: '4-0',
    summary:
      'Chapter 4: The Programme: Anchoring the Community Stop · Cross-subsidy financial modeling, right to the city, multi-modal interchange, and 24-hour diurnal rhythms.',
  },
];

const BASE_LENSES: Omit<MindNode, 'x' | 'y' | 'vx' | 'vy'>[] = [
  {
    id: 'lens-typology',
    code: 'LENS 1',
    label: 'Civic Station Marvel Typology',
    kind: 'lens',
    category: 'typology',
    summary:
      'Typological Marvel: Fast charging as the 21st-century successor to the railway cathedral. Inspired by Santiago Calatrava (Gare do Oriente, Liège-Guillemins, Stadelhofen, WTC Oculus), Carroll Meeks, and Stan Allen. A monumental civic portal with kinetic photovoltaic canopy, ground concourse, and subterranean energy vault.',
  },
  {
    id: 'lens-sustainability',
    code: 'LENS 2',
    label: 'Sustainability & Grid Infrastructure',
    kind: 'lens',
    category: 'sustainability',
    summary:
      'Sustainability & Energy: Meeting present needs without compromising the future (Brundtland). Ian McHarg ecological layering, Van der Ryn & Cowan visible energy, Lyle regenerative systems, and multi-megawatt BESS grid-storage optimization (Zhang, Sun, Nehrir).',
  },
  {
    id: 'lens-phenomenology',
    code: 'LENS 3',
    label: 'Phenomenology of Place & Dwell',
    kind: 'lens',
    category: 'phenomenology',
    summary:
      'Phenomenology of Dwell: Heideggerian gathering (the charger as bridge), Norberg-Schulz genius loci, Marc Augé non-place critique, Cooley transportation breaks, and Whyte/Gehl public life observation.',
  },
  {
    id: 'lens-social',
    code: 'LENS 4',
    label: 'Social Theory & Right to the City',
    kind: 'lens',
    category: 'social',
    summary:
      'Social Theory: Henri Lefebvre spatial production, rhythmanalysis, and the Right to the City. Countering Foucauldian surveillance with Jane Jacobs natural eyes-on-the-street, Sennett civic craftsmanship, and Klinenberg social infrastructure.',
  },
  {
    id: 'lens-fleets',
    code: 'LENS 5',
    label: 'Fleets, Transport & Regulations',
    kind: 'lens',
    category: 'fleets',
    summary:
      'Transport & Regulatory Framework: Full-time ride-hail, transit buses, and freight trucking mid-shift charging. Federal FMCSA 49 CFR § 395.3 hours of service, EU 561/2006, FHWA NEVI 150 kW standards, and Con Edison commercial EV tariffs.',
  },
];

export interface MindmapOptions {
  root: HTMLElement;
  payload: MindmapInitPayload;
  onJumpToSection: (sectionId: string) => void;
  onJumpToHash: (hash: string) => void;
}

export function initPowerhouseMindmap(opts: MindmapOptions) {
  const { root, payload, onJumpToSection, onJumpToHash } = opts;
  const canvas = root.querySelector<HTMLCanvasElement>('[data-mm-canvas]')!;
  const ctx = canvas.getContext('2d')!;

  // UI elements
  const searchInput = root.querySelector<HTMLInputElement>('[data-mm-search]')!;
  const bibFilterBtns = [...root.querySelectorAll<HTMLButtonElement>('[data-mm-bib-filter]')];
  const layoutBtns = [...root.querySelectorAll<HTMLButtonElement>('[data-mm-layout]')];
  const zoomInBtn = root.querySelector<HTMLButtonElement>('[data-mm-zoom="in"]')!;
  const zoomOutBtn = root.querySelector<HTMLButtonElement>('[data-mm-zoom="out"]')!;
  const zoomResetBtn = root.querySelector<HTMLButtonElement>('[data-mm-zoom="reset"]')!;
  const statsEl = root.querySelector<HTMLElement>('[data-mm-stats]')!;
  const bibStream = root.querySelector<HTMLElement>('[data-mm-bib-stream]')!;

  let nodes: MindNode[] = [];
  let edges: MindEdge[] = [];
  let activeFilter = 'all';
  let layoutMode: 'force' | 'clusters' | 'radial' = 'force';
  let searchQuery = '';

  let selectedId = 'powerhouse';
  let hoveredId: string | null = null;
  let draggingNode: MindNode | null = null;
  let isPanning = false;
  let panStart = { x: 0, y: 0 };
  let pointerDownPos = { x: 0, y: 0 };
  let pointerMoved = false;

  let cam = { x: 0, y: 0, k: 0.86 };
  let width = 900;
  let height = 640;
  let alpha = 1;
  let rafId = 0;

  const loadStored = (): StoredState => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return { customNodes: [], customEdges: [], editedSummaries: {}, pinnedPositions: {} };
  };

  let stored = loadStored();

  const getLensAngle = (lensId: string) => {
    switch (lensId) {
      case 'lens-typology':
        return -Math.PI / 2; // top
      case 'lens-sustainability':
        return -Math.PI / 2 + (2 * Math.PI) / 5; // top-right
      case 'lens-phenomenology':
        return -Math.PI / 2 + (4 * Math.PI) / 5; // bottom-right
      case 'lens-social':
        return -Math.PI / 2 + (6 * Math.PI) / 5; // bottom-left
      case 'lens-fleets':
        return -Math.PI / 2 + (8 * Math.PI) / 5; // top-left
      default:
        return 0;
    }
  };

  const buildGraph = () => {
    const map = new Map<string, MindNode>();

    // 1. Core Hub
    map.set(BASE_CORE.id, {
      ...BASE_CORE,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      pinned: true,
    });

    // 2. Chapters (Inner Orbit, r = 135)
    BASE_CHAPTERS.forEach((c, idx) => {
      const angle = (idx / 4) * Math.PI * 2 - Math.PI / 4;
      const r = 135;
      map.set(c.id, {
        ...c,
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        vx: 0,
        vy: 0,
      });
    });

    // 3. Thematic Lenses (Middle Orbit, r = 250)
    BASE_LENSES.forEach((lens) => {
      const angle = getLensAngle(lens.id);
      const r = 250;
      map.set(lens.id, {
        ...lens,
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        vx: 0,
        vy: 0,
      });
    });

    // 4. 58 Bibliography Nodes (Clustered around their respective thematic lenses)
    const lensBibCounts: Record<string, number> = {};
    payload.bibs.forEach((b) => {
      const lensId = b.lens || `lens-${b.category || 'typology'}`;
      lensBibCounts[lensId] = (lensBibCounts[lensId] || 0) + 1;
    });

    const lensBibCounters: Record<string, number> = {};
    payload.bibs.forEach((b, idx) => {
      const lensId = b.lens || `lens-${b.category || 'typology'}`;
      const totalInLens = lensBibCounts[lensId] || 12;
      const curIndex = lensBibCounters[lensId] || 0;
      lensBibCounters[lensId] = curIndex + 1;

      const baseAngle = getLensAngle(lensId);
      const spread = ((curIndex - (totalInLens - 1) / 2) / Math.max(1, totalInLens)) * 1.25;
      const r = 410 + (idx % 3) * 32;
      const angle = baseAngle + spread;

      map.set(b.id, {
        id: b.id,
        code: `BIB ${String(b.idx).padStart(2, '0')}`,
        label: b.shortAuthor,
        kind: 'bib',
        category: b.category,
        categoryLabel: b.categoryLabel,
        summary: b.plain,
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        vx: 0,
        vy: 0,
      });
    });

    nodes = [...map.values()];

    // 5. Build Edges
    const edgeList: MindEdge[] = [];
    const seen = new Set<string>();
    const addEdge = (source: string, target: string, label?: string, strength = 1) => {
      if (!map.has(source) || !map.has(target) || source === target) return;
      const key = source < target ? `${source}|${target}` : `${target}|${source}`;
      if (seen.has(key)) return;
      seen.add(key);
      edgeList.push({
        id: `${source}__${target}`,
        source,
        target,
        label,
        strength,
      });
    };

    // Core -> Chapters
    ['ch1', 'ch2', 'ch3', 'ch4'].forEach((chId) => {
      addEdge('powerhouse', chId, 'chapter', 1.8);
    });

    // Core -> Lenses
    BASE_LENSES.forEach((lens) => {
      addEdge('powerhouse', lens.id, 'thematic lens', 1.6);
    });

    // Lenses -> Chapters
    addEdge('lens-typology', 'ch1', 'grounds typology', 1.1);
    addEdge('lens-typology', 'ch2', 'station cathedral', 1.3);
    addEdge('lens-sustainability', 'ch1', 'ecological design', 1.2);
    addEdge('lens-sustainability', 'ch2', 'grid & storage', 1.2);
    addEdge('lens-phenomenology', 'ch1', 'pause to place', 1.1);
    addEdge('lens-phenomenology', 'ch3', 'place gathering', 1.3);
    addEdge('lens-social', 'ch1', 'social framework', 1.1);
    addEdge('lens-social', 'ch4', 'right to the city', 1.3);
    addEdge('lens-fleets', 'ch2', 'fleet turnaround', 1.4);

    // Bibliography -> Thematic Lenses and Cited Chapters
    payload.bibs.forEach((b) => {
      const lensId = b.lens || `lens-${b.category || 'typology'}`;
      addEdge(lensId, b.id, 'cites literature', 1.05);

      b.chapters.forEach((chNum) => {
        if (chNum >= '1' && chNum <= '4') {
          addEdge(`ch${chNum}`, b.id, `Ch ${chNum} source`, 0.65);
        }
      });
    });

    edges = edgeList;

    const deg = new Map<string, number>();
    edges.forEach((e) => {
      deg.set(e.source, (deg.get(e.source) || 0) + 1);
      deg.set(e.target, (deg.get(e.target) || 0) + 1);
    });
    nodes.forEach((n) => {
      n.degree = deg.get(n.id) || 1;
    });

    updateStats();
  };

  const getVisibleSet = (): Set<string> => {
    const visible = new Set<string>();
    nodes.forEach((n) => {
      let pass = true;
      if (activeFilter !== 'all') {
        if (n.kind === 'bib') {
          pass = n.category === activeFilter;
        } else if (n.kind === 'lens') {
          pass = n.id === `lens-${activeFilter}`;
        }
      }
      if (pass) visible.add(n.id);
    });
    return visible;
  };

  const matchesSearch = (n: MindNode): boolean => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.label.toLowerCase().includes(q) ||
      (n.code?.toLowerCase().includes(q) ?? false) ||
      n.summary.toLowerCase().includes(q) ||
      (n.categoryLabel?.toLowerCase().includes(q) ?? false)
    );
  };

  const nodeRadius = (n: MindNode): number => {
    if (n.kind === 'core') return 16;
    if (n.kind === 'chapter') return 12;
    if (n.kind === 'lens') return 10.5;
    return 6.5;
  };

  const stepPhysics = () => {
    if (alpha < 0.008) return;

    const visible = getVisibleSet();
    const activeNodes = nodes.filter((n) => visible.has(n.id));

    // Force layout / Cluster layout / Radial layout
    if (layoutMode === 'radial') {
      activeNodes.forEach((n) => {
        if (n.kind === 'core') {
          n.x += (0 - n.x) * 0.1;
          n.y += (0 - n.y) * 0.1;
          return;
        }
        let targetR = 410;
        let targetAngle = Math.atan2(n.y, n.x);
        if (n.kind === 'chapter') targetR = 140;
        else if (n.kind === 'lens') targetR = 250;
        const tx = Math.cos(targetAngle) * targetR;
        const ty = Math.sin(targetAngle) * targetR;
        n.vx += (tx - n.x) * 0.05 * alpha;
        n.vy += (ty - n.y) * 0.05 * alpha;
      });
    } else if (layoutMode === 'clusters') {
      activeNodes.forEach((n) => {
        if (n.kind === 'core') {
          n.x += (0 - n.x) * 0.1;
          n.y += (0 - n.y) * 0.1;
          return;
        }
        if (n.kind === 'lens') {
          const angle = getLensAngle(n.id);
          const tx = Math.cos(angle) * 240;
          const ty = Math.sin(angle) * 240;
          n.vx += (tx - n.x) * 0.08 * alpha;
          n.vy += (ty - n.y) * 0.08 * alpha;
        } else if (n.kind === 'bib') {
          const lensNode = activeNodes.find((x) => x.id === `lens-${n.category}`);
          if (lensNode) {
            n.vx += (lensNode.x - n.x) * 0.02 * alpha;
            n.vy += (lensNode.y - n.y) * 0.02 * alpha;
          }
        }
      });
    }

    // Node-Node Repulsion
    const count = activeNodes.length;
    for (let i = 0; i < count; i++) {
      const a = activeNodes[i];
      for (let j = i + 1; j < count; j++) {
        const b = activeNodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy + 1;
        const dist = Math.sqrt(distSq);

        let minDist = nodeRadius(a) + nodeRadius(b) + 18;
        if (a.kind === 'lens' || b.kind === 'lens') minDist += 24;
        if (a.kind === 'core' || b.kind === 'core') minDist += 35;

        if (dist < minDist) {
          const force = ((minDist - dist) / dist) * 0.45 * alpha;
          const fx = dx * force;
          const fy = dy * force;
          if (!a.pinned) {
            a.vx -= fx;
            a.vy -= fy;
          }
          if (!b.pinned) {
            b.vx += fx;
            b.vy += fy;
          }
        } else if (dist < 260) {
          const rep = (3800 / (distSq + 80)) * alpha;
          const fx = (dx / dist) * rep;
          const fy = (dy / dist) * rep;
          if (!a.pinned) {
            a.vx -= fx;
            a.vy -= fy;
          }
          if (!b.pinned) {
            b.vx += fx;
            b.vy += fy;
          }
        }
      }
    }

    // Edge Springs
    edges.forEach((e) => {
      const s = mapNode(e.source);
      const t = mapNode(e.target);
      if (!s || !t || !visible.has(s.id) || !visible.has(t.id)) return;

      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      let targetDist = 95;
      if (s.kind === 'core' || t.kind === 'core') targetDist = 135;
      else if (s.kind === 'lens' || t.kind === 'lens') targetDist = 80;

      const delta = dist - targetDist;
      const force = delta * 0.024 * (e.strength || 1) * alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (!s.pinned) {
        s.vx += fx;
        s.vy += fy;
      }
      if (!t.pinned) {
        t.vx -= fx;
        t.vy -= fy;
      }
    });

    // Gentle Gravity towards Center
    activeNodes.forEach((n) => {
      if (n.pinned) return;
      n.vx += (0 - n.x) * 0.0016 * alpha;
      n.vy += (0 - n.y) * 0.0016 * alpha;

      n.vx *= 0.74;
      n.vy *= 0.74;
      n.x += n.vx;
      n.y += n.vy;
    });

    alpha = Math.max(0.005, alpha * 0.992);
  };

  const mapNode = (id: string): MindNode | undefined => nodes.find((x) => x.id === id);

  const getPalette = () => {
    const cs = getComputedStyle(root);
    const fg = cs.getPropertyValue('--_tokens---color--fg').trim() || '#111111';
    const bg = cs.getPropertyValue('--_tokens---color--bg').trim() || '#f8f8f6';
    const muted = cs.getPropertyValue('--_tokens---color--muted').trim() || '#76767c';
    const red = cs.getPropertyValue('--ph-red').trim() || '#e0806f';
    const orange = cs.getPropertyValue('--ph-orange').trim() || '#e9a467';
    const green = cs.getPropertyValue('--ph-green').trim() || '#74b893';
    const teal = cs.getPropertyValue('--ph-teal').trim() || '#67a9b4';
    const blue = cs.getPropertyValue('--ph-blue').trim() || '#7f98d4';
    return { fg, bg, muted, red, orange, green, teal, blue };
  };

  const colorForNode = (n: MindNode, pal: ReturnType<typeof getPalette>): string => {
    if (n.kind === 'core' || n.kind === 'chapter') return pal.fg;
    if (n.kind === 'lens' || n.kind === 'bib') {
      const cat = n.category || (n.id.startsWith('lens-') ? n.id.replace('lens-', '') : 'typology');
      switch (cat) {
        case 'typology':
          return pal.red;
        case 'sustainability':
          return pal.green;
        case 'phenomenology':
          return pal.teal;
        case 'social':
          return pal.blue;
        case 'fleets':
          return pal.orange;
        default:
          return pal.blue;
      }
    }
    return pal.fg;
  };

  const draw = () => {
    const pal = getPalette();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Subtle background matrix
    ctx.fillStyle = pal.muted;
    ctx.globalAlpha = 0.12;
    const gridStep = 40 * cam.k;
    if (gridStep >= 16) {
      const offsetX = ((width / 2 + cam.x) % gridStep + gridStep) % gridStep;
      const offsetY = ((height / 2 + cam.y) % gridStep + gridStep) % gridStep;
      for (let gx = offsetX; gx < width; gx += gridStep) {
        for (let gy = offsetY; gy < height; gy += gridStep) {
          ctx.fillRect(gx, gy, 1.2, 1.2);
        }
      }
    }
    ctx.globalAlpha = 1;

    ctx.translate(width / 2 + cam.x, height / 2 + cam.y);
    ctx.scale(cam.k, cam.k);

    const visible = getVisibleSet();
    const nodeById = new Map(nodes.filter((n) => visible.has(n.id)).map((n) => [n.id, n]));

    const focusId = hoveredId || selectedId;
    const neighborSet = new Set<string>();
    if (focusId) {
      neighborSet.add(focusId);
      edges.forEach((e) => {
        if (e.source === focusId) neighborSet.add(e.target);
        if (e.target === focusId) neighborSet.add(e.source);
      });
    }

    // 1. Draw Edges
    edges.forEach((e) => {
      const s = nodeById.get(e.source);
      const t = nodeById.get(e.target);
      if (!s || !t) return;

      const isFocusEdge = s.id === focusId || t.id === focusId;
      const searchDim = searchQuery && !matchesSearch(s) && !matchesSearch(t);

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);

      if (hoveredId) {
        ctx.strokeStyle = isFocusEdge ? pal.fg : pal.muted;
        ctx.globalAlpha = isFocusEdge ? 0.88 : 0.05;
        ctx.lineWidth = (isFocusEdge ? 1.75 : 0.6) / cam.k;
      } else if (searchDim) {
        ctx.strokeStyle = pal.muted;
        ctx.globalAlpha = 0.04;
        ctx.lineWidth = 0.6 / cam.k;
      } else {
        ctx.strokeStyle = isFocusEdge ? pal.fg : pal.muted;
        ctx.globalAlpha = isFocusEdge ? 0.65 : 0.14;
        ctx.lineWidth = (isFocusEdge ? 1.5 : 0.75) / cam.k;
      }
      ctx.stroke();
    });

    // 2. Draw Nodes
    nodeById.forEach((n) => {
      const r = nodeRadius(n);
      const isSelected = n.id === selectedId;
      const isHovered = n.id === hoveredId;
      const isNeighbor = neighborSet.has(n.id);
      const matches = matchesSearch(n);

      let nodeAlpha = 1;
      if (hoveredId && !isNeighbor) nodeAlpha = 0.12;
      else if (searchQuery && !matches) nodeAlpha = 0.1;

      ctx.globalAlpha = nodeAlpha;

      // Outer focus glow ring
      if (isSelected || isHovered || n.kind === 'core') {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + (isSelected || isHovered ? 5.5 : 3.5) / cam.k, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected || isHovered ? pal.fg : pal.muted;
        ctx.lineWidth = (isSelected ? 1.8 : 1) / cam.k;
        ctx.stroke();
      }

      // Main Node Fill
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = colorForNode(n, pal);
      ctx.fill();

      // Node Label
      const showLabel =
        n.kind === 'core' ||
        n.kind === 'chapter' ||
        n.kind === 'lens' ||
        isSelected ||
        isHovered ||
        (hoveredId && isNeighbor) ||
        (searchQuery && matches) ||
        cam.k >= 1.05;

      if (showLabel) {
        const fontSize =
          n.kind === 'core'
            ? 13
            : n.kind === 'chapter'
              ? 11.5
              : n.kind === 'lens'
                ? 10.5
                : 9;
        const scaledSize = Math.max(7.5, fontSize / Math.pow(cam.k, 0.3));
        ctx.font = `${isSelected || isHovered || n.kind === 'core' || n.kind === 'chapter' ? '600' : '400'} ${scaledSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = pal.fg;
        ctx.fillText(n.label, n.x, n.y + r + 4 / cam.k);
      }
    });

    ctx.restore();
  };

  const loop = () => {
    stepPhysics();
    draw();
    rafId = requestAnimationFrame(loop);
  };

  const screenToWorld = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    return {
      x: (sx - width / 2 - cam.x) / cam.k,
      y: (sy - height / 2 - cam.y) / cam.k,
    };
  };

  const hitTest = (wx: number, wy: number): MindNode | null => {
    const visible = getVisibleSet();
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (!visible.has(n.id)) continue;
      const r = nodeRadius(n) + 6 / cam.k;
      const dx = wx - n.x;
      const dy = wy - n.y;
      if (dx * dx + dy * dy <= r * r) return n;
    }
    return null;
  };

  const selectNode = (id: string, autoScroll = true) => {
    const n = nodes.find((x) => x.id === id);
    if (!n) return;
    selectedId = id;

    // Highlight corresponding card in the right-hand bibliography stream
    if (bibStream) {
      bibStream.querySelectorAll('.ph__mm-bib-card.is-active').forEach((el) => el.classList.remove('is-active'));
      if (n.kind === 'bib') {
        const card = bibStream.querySelector<HTMLElement>(`#mm-bib-${id}`);
        if (card) {
          card.classList.add('is-active');
          if (autoScroll) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
    }
  };

  const updateStats = () => {
    const visible = getVisibleSet();
    const visEdges = edges.filter((e) => visible.has(e.source) && visible.has(e.target));
    if (statsEl) {
      statsEl.textContent = `${visible.size} nodes · ${visEdges.length} citation links`;
    }
  };

  canvas.addEventListener('pointerdown', (e) => {
    const w = screenToWorld(e.clientX, e.clientY);
    pointerDownPos = { x: e.clientX, y: e.clientY };
    pointerMoved = false;
    const hit = hitTest(w.x, w.y);

    if (hit) {
      draggingNode = hit;
      alpha = Math.max(alpha, 0.45);
      canvas.setPointerCapture(e.pointerId);
    } else {
      isPanning = true;
      panStart = { x: e.clientX - cam.x, y: e.clientY - cam.y };
      canvas.setPointerCapture(e.pointerId);
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    const dx = e.clientX - pointerDownPos.x;
    const dy = e.clientY - pointerDownPos.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) pointerMoved = true;

    if (draggingNode) {
      const w = screenToWorld(e.clientX, e.clientY);
      draggingNode.x = w.x;
      draggingNode.y = w.y;
      draggingNode.vx = 0;
      draggingNode.vy = 0;
      alpha = Math.max(alpha, 0.35);
      return;
    }

    if (isPanning) {
      cam.x = e.clientX - panStart.x;
      cam.y = e.clientY - panStart.y;
      return;
    }

    const w = screenToWorld(e.clientX, e.clientY);
    const hit = hitTest(w.x, w.y);
    const prev = hoveredId;
    hoveredId = hit ? hit.id : null;
    if (prev !== hoveredId) {
      canvas.style.cursor = hit ? 'pointer' : 'default';
    }
  });

  const endDragOrPan = (e: PointerEvent) => {
    if (draggingNode) {
      draggingNode = null;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    if (isPanning) {
      isPanning = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  canvas.addEventListener('pointerup', (e) => {
    endDragOrPan(e);
    if (!pointerMoved) {
      const w = screenToWorld(e.clientX, e.clientY);
      const hit = hitTest(w.x, w.y);
      if (hit) {
        selectNode(hit.id, true);
      }
    }
  });

  canvas.addEventListener('pointercancel', endDragOrPan);

  canvas.addEventListener('dblclick', (e) => {
    const w = screenToWorld(e.clientX, e.clientY);
    const hit = hitTest(w.x, w.y);
    if (hit) {
      if (hit.kind === 'bib') {
        const item = payload.bibs.find((b) => b.id === hit.id);
        if (item?.sections[0]) {
          onJumpToSection(item.sections[0]);
        } else {
          onJumpToSection('5-5');
        }
      } else if (hit.kind === 'chapter') {
        onJumpToSection(`${hit.chapter}-0`);
      } else if (hit.kind === 'lens') {
        const cat = hit.category || hit.id.replace('lens-', '');
        const btn = bibFilterBtns.find((b) => b.dataset.mmBibFilter === cat);
        btn?.click();
      }
    }
  });

  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - width / 2;
      const mouseY = e.clientY - rect.top - height / 2;

      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const newK = Math.max(0.3, Math.min(3.2, cam.k * factor));
      const kRatio = newK / cam.k;

      cam.x = mouseX - (mouseX - cam.x) * kRatio;
      cam.y = mouseY - (mouseY - cam.y) * kRatio;
      cam.k = newK;
    },
    { passive: false }
  );

  // Search input: filters both canvas and right-hand list
  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value.toLowerCase().trim();
    if (bibStream) {
      const cards = bibStream.querySelectorAll<HTMLElement>('.ph__mm-bib-card');
      cards.forEach((c) => {
        const text = c.textContent?.toLowerCase() || '';
        const match = !searchQuery || text.includes(searchQuery);
        c.hidden = !match;
      });
    }
    alpha = Math.max(alpha, 0.4);
  });

  // Thematic Category Filter Pills
  bibFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      bibFilterBtns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      const cat = btn.dataset.mmBibFilter || 'all';
      activeFilter = cat;

      // Filter cards in right-hand list
      if (bibStream) {
        const cards = bibStream.querySelectorAll<HTMLElement>('.ph__mm-bib-card');
        cards.forEach((c) => {
          const cardCat = c.dataset.bibCat;
          const match = cat === 'all' || cardCat === cat;
          c.hidden = !match;
        });
      }

      // Camera centering
      if (cat !== 'all') {
        const targetLens = nodes.find((n) => n.id === `lens-${cat}`);
        if (targetLens) {
          cam.x = -targetLens.x * cam.k;
          cam.y = -targetLens.y * cam.k;
          cam.k = 1.05;
          selectNode(targetLens.id, false);
        }
      } else {
        cam.x = 0;
        cam.y = 0;
        cam.k = 0.86;
        selectNode('powerhouse', false);
      }
      alpha = Math.max(alpha, 0.65);
      updateStats();
    });
  });

  // Layout buttons
  layoutBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      layoutBtns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      layoutMode = (btn.dataset.mmLayout as any) || 'force';
      alpha = 0.85;
    });
  });

  // Zoom controls
  zoomInBtn?.addEventListener('click', () => {
    cam.k = Math.min(3.2, cam.k * 1.25);
  });
  zoomOutBtn?.addEventListener('click', () => {
    cam.k = Math.max(0.3, cam.k / 1.25);
  });
  zoomResetBtn?.addEventListener('click', () => {
    cam.x = 0;
    cam.y = 0;
    cam.k = 0.86;
    alpha = 0.6;
  });

  // Two-way wiring from right-hand Bibliography stream to canvas
  bibStream?.addEventListener('click', (e) => {
    const locateBtn = (e.target as Element).closest<HTMLElement>('[data-mm-locate]');
    const jumpLink = (e.target as Element).closest<HTMLAnchorElement>('[data-mm-jump]');
    const card = (e.target as Element).closest<HTMLElement>('.ph__mm-bib-card');

    if (jumpLink) {
      e.preventDefault();
      const secId = jumpLink.dataset.mmJump!;
      onJumpToSection(secId);
      return;
    }

    if (locateBtn || card) {
      const bibId = locateBtn?.dataset.mmLocate || card?.dataset.bibId;
      if (!bibId) return;
      const targetNode = nodes.find((n) => n.id === bibId);
      if (targetNode) {
        cam.x = -targetNode.x * cam.k;
        cam.y = -targetNode.y * cam.k;
        selectNode(targetNode.id, false);
        alpha = Math.max(alpha, 0.55);
      }
    }
  });

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      width = rect.width;
      height = rect.height;
      draw();
    }
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement!);

  buildGraph();
  resize();
  selectNode('powerhouse', false);
  loop();

  return {
    resize,
    selectNode,
    reheat: () => {
      alpha = 0.85;
    },
    destroy: () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    },
  };
}

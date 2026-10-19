export type NodeKind = 'core' | 'chapter' | 'section' | 'note' | 'bib' | 'lens' | 'custom';

export interface MindNode {
  id: string;
  label: string;
  code?: string;
  kind: NodeKind;
  chapter?: string;
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
  plain: string;
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

const STORAGE_KEY = 'ph-mindmap-citations-v2';

const BASE_CHAPTERS: Omit<MindNode, 'x' | 'y' | 'vx' | 'vy'>[] = [
  {
    id: 'powerhouse',
    code: 'THESIS',
    label: 'The Powerhouse',
    kind: 'core',
    summary:
      'Central Thesis: An Electric Vehicle Powerhouse complex turns charging activities into an opportunity for enhanced civic / community engagements. Every chapter, subchapter, endnote, and bibliography source is wired to this core.',
  },
  {
    id: 'ch1',
    code: '1.0',
    label: 'Ch 1 · Charging Anchor',
    kind: 'chapter',
    chapter: '1',
    sectionId: '1-0',
    summary:
      'Chapter 1: A Sustainable Charging Anchor (1.1–1.8) · 40 endnotes (5.1) covering electrification, stop architecture, charge time, public space, and theoretical framework.',
  },
  {
    id: 'ch2',
    code: '2.0',
    label: 'Ch 2 · The Stop',
    kind: 'chapter',
    chapter: '2',
    sectionId: '2-0',
    summary:
      'Chapter 2: The Stop: Parking, Travel and the Time to Charge (2.1–2.6) · 23 endnotes (5.2) covering parking land use, corridors, stations, battery physics, regulation, and adaptive 5-floor frames.',
  },
  {
    id: 'ch3',
    code: '3.0',
    label: 'Ch 3 · The Public Space',
    kind: 'chapter',
    chapter: '3',
    sectionId: '3-0',
    summary:
      'Chapter 3: The Public Space: What Each Neighbourhood Needs (3.1–3.6) · 12 endnotes (5.3) covering cultural landscape, Third Place, dwelling, gathering, and plaza thresholds.',
  },
  {
    id: 'ch4',
    code: '4.0',
    label: 'Ch 4 · The Programme',
    kind: 'chapter',
    chapter: '4',
    sectionId: '4-0',
    summary:
      'Chapter 4: The Programme: Anchoring the Community Stop (4.1–4.6) · 12 endnotes (5.4) covering 6-mode hubs, Right to the City, energy commons, cross-subsidy, and 24-hour rhythms.',
  },
  {
    id: 'ch5',
    code: '5.0',
    label: 'Ch 5 · Notes & Bibliography',
    kind: 'chapter',
    chapter: '5',
    sectionId: '5-0',
    summary:
      'Chapter 5: Notes and Bibliography (5.1–5.5) · Gathers all chapter endnotes and the master alphabetical bibliography.',
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
  const filterBtns = [...root.querySelectorAll<HTMLButtonElement>('[data-mm-filter]')];
  const layoutBtns = [...root.querySelectorAll<HTMLButtonElement>('[data-mm-layout]')];
  const depthBtns = [...root.querySelectorAll<HTMLButtonElement>('[data-mm-depth]')];
  const linkModeBtn = root.querySelector<HTMLButtonElement>('[data-mm-link-mode]')!;
  const zoomInBtn = root.querySelector<HTMLButtonElement>('[data-mm-zoom="in"]')!;
  const zoomOutBtn = root.querySelector<HTMLButtonElement>('[data-mm-zoom="out"]')!;
  const zoomResetBtn = root.querySelector<HTMLButtonElement>('[data-mm-zoom="reset"]')!;
  const statsEl = root.querySelector<HTMLElement>('[data-mm-stats]')!;

  // Inspector & Builder tabs
  const sideTabBtns = [...root.querySelectorAll<HTMLButtonElement>('[data-mm-sidetab]')];
  const sidePanes = [...root.querySelectorAll<HTMLElement>('[data-mm-pane]')];

  // Inspector DOM
  const inspKind = root.querySelector<HTMLElement>('[data-mm-insp-kind]')!;
  const inspTitle = root.querySelector<HTMLElement>('[data-mm-insp-title]')!;
  const inspSummary = root.querySelector<HTMLElement>('[data-mm-insp-summary]')!;
  const inspEditArea = root.querySelector<HTMLTextAreaElement>('[data-mm-insp-edit]')!;
  const inspSaveBtn = root.querySelector<HTMLButtonElement>('[data-mm-insp-save]')!;
  const inspOpenBookBtn = root.querySelector<HTMLButtonElement>('[data-mm-open-book]')!;
  const inspOpenRefBtn = root.querySelector<HTMLButtonElement>('[data-mm-open-ref]')!;
  const inspPinBtn = root.querySelector<HTMLButtonElement>('[data-mm-pin-node]')!;
  const inspDeleteBtn = root.querySelector<HTMLButtonElement>('[data-mm-delete-node]')!;
  const inspConnections = root.querySelector<HTMLElement>('[data-mm-connections]')!;

  // Builder DOM
  const addNodeForm = root.querySelector<HTMLFormElement>('[data-mm-add-node-form]')!;
  const addEdgeForm = root.querySelector<HTMLFormElement>('[data-mm-add-edge-form]')!;
  const sourceSelect = root.querySelector<HTMLSelectElement>('[data-mm-edge-source]')!;
  const targetSelect = root.querySelector<HTMLSelectElement>('[data-mm-edge-target]')!;
  const exportBtn = root.querySelector<HTMLButtonElement>('[data-mm-export]')!;
  const resetCustomBtn = root.querySelector<HTMLButtonElement>('[data-mm-reset-custom]')!;

  let nodes: MindNode[] = [];
  let edges: MindEdge[] = [];
  let activeFilter = 'all';
  let layoutMode: 'force' | 'radial' | 'columns' = 'force';
  let localDepth = 0;
  let searchQuery = '';
  let linkDrawMode = false;
  let linkDragSource: MindNode | null = null;
  let pointerWorld = { x: 0, y: 0 };

  let selectedId = 'powerhouse';
  let hoveredId: string | null = null;
  let draggingNode: MindNode | null = null;
  let isPanning = false;
  let panStart = { x: 0, y: 0 };
  let pointerDownPos = { x: 0, y: 0 };
  let pointerMoved = false;

  let cam = { x: 0, y: 0, k: 0.82 };
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
  const saveStored = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // ignore
    }
  };

  const buildGraph = () => {
    const map = new Map<string, MindNode>();

    // 1. Core + Chapters (inner ring)
    BASE_CHAPTERS.forEach((c) => {
      const pinned = stored.pinnedPositions[c.id];
      const chNum = Number(c.chapter || 0);
      const angle = ((chNum - 1) / 5) * Math.PI * 2 - Math.PI / 2;
      const r = c.kind === 'core' ? 0 : 140;
      map.set(c.id, {
        ...c,
        summary: stored.editedSummaries[c.id] ?? c.summary,
        x: pinned ? pinned.x : Math.cos(angle) * r,
        y: pinned ? pinned.y : Math.sin(angle) * r,
        vx: 0,
        vy: 0,
        pinned: !!pinned,
      });
    });

    // 2. Subchapters (1.1..5.5 — middle ring)
    payload.sections.forEach((sec, idx) => {
      const chIndex = Number(sec.chapterNum) - 1;
      const baseAngle = (chIndex / 5) * Math.PI * 2 - Math.PI / 2;
      const secNum = Number(sec.num.split('.')[1] || 1);
      const angle = baseAngle + (secNum - 3.5) * 0.14;
      const r = 265 + (idx % 2) * 28;
      const pinned = stored.pinnedPositions[sec.id];
      map.set(sec.id, {
        id: sec.id,
        code: sec.num,
        label: `${sec.num} ${sec.title}`,
        kind: 'section',
        chapter: sec.chapterNum,
        sectionId: sec.id,
        summary:
          stored.editedSummaries[sec.id] ||
          `${sec.bodyPlain || sec.title} (${sec.notesCount} endnote${sec.notesCount === 1 ? '' : 's'} in Chapter ${sec.chapterNum}).`,
        x: pinned ? pinned.x : Math.cos(angle) * r,
        y: pinned ? pinned.y : Math.sin(angle) * r,
        vx: 0,
        vy: 0,
        pinned: !!pinned,
      });
    });

    // 3. Every Footnote / Endnote (Note 1.1..4.12 — outer sector ring)
    payload.notes.forEach((nt, idx) => {
      const chIndex = Number(nt.ch) - 1;
      const baseAngle = (chIndex / 5) * Math.PI * 2 - Math.PI / 2;
      const spread = ((nt.n % 14) - 6.5) * 0.085;
      const r = 390 + (idx % 3) * 34;
      const pinned = stored.pinnedPositions[nt.id];
      map.set(nt.id, {
        id: nt.id,
        code: `N${nt.ch}.${nt.n}`,
        label: `Note ${nt.ch}.${nt.n} · ${nt.shortLabel}`,
        kind: 'note',
        chapter: nt.ch,
        sectionId: nt.fromSection,
        noteHash: `#note-${nt.ch}-${nt.n}`,
        refHash: `#ref-${nt.ch}-${nt.n}`,
        summary: stored.editedSummaries[nt.id] || nt.plain,
        x: pinned ? pinned.x : Math.cos(baseAngle + spread) * r,
        y: pinned ? pinned.y : Math.sin(baseAngle + spread) * r,
        vx: 0,
        vy: 0,
        pinned: !!pinned,
      });
    });

    // 4. Every Bibliography Entry (5.5 Bibliography — outer halo / shared hubs)
    payload.bibs.forEach((b, idx) => {
      const firstCh = Number(b.chapters[0] || (idx % 4) + 1) - 1;
      const baseAngle = (firstCh / 5) * Math.PI * 2 - Math.PI / 2;
      const offset = ((idx % 12) - 5.5) * 0.095;
      const r = 515 + (idx % 3) * 38;
      const pinned = stored.pinnedPositions[b.id];
      map.set(b.id, {
        id: b.id,
        code: `BIB ${String(b.idx).padStart(2, '0')}`,
        label: b.shortAuthor,
        kind: 'bib',
        chapter: b.chapters[0] || '5',
        sectionId: '5-5',
        summary:
          stored.editedSummaries[b.id] ||
          `${b.plain} — Cited in: ${b.sections.length ? b.sections.map((s) => s.replace('-', '.')).join(', ') : '5.5 Master Bibliography'}.`,
        x: pinned ? pinned.x : Math.cos(baseAngle + offset) * r,
        y: pinned ? pinned.y : Math.sin(baseAngle + offset) * r,
        vx: 0,
        vy: 0,
        pinned: !!pinned,
      });
    });

    // 5. Custom nodes added by user
    stored.customNodes.forEach((cn, i) => {
      const pinned = stored.pinnedPositions[cn.id];
      map.set(cn.id, {
        ...cn,
        summary: stored.editedSummaries[cn.id] ?? cn.summary,
        x: pinned ? pinned.x : cn.x ?? Math.cos(i * 1.1) * 300,
        y: pinned ? pinned.y : cn.y ?? Math.sin(i * 1.1) * 300,
        vx: 0,
        vy: 0,
        custom: true,
        pinned: !!pinned,
      });
    });

    nodes = [...map.values()];

    // Build Edges
    const edgeList: MindEdge[] = [];
    const seen = new Set<string>();
    const addEdge = (source: string, target: string, label?: string, strength = 1, custom = false) => {
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
        custom,
      });
    };

    // Core -> Chapters
    ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'].forEach((chId) => {
      addEdge('powerhouse', chId, 'chapter', 1.5);
    });

    // Chapters -> Subchapters
    payload.sections.forEach((sec) => {
      addEdge(sec.chapterId, sec.id, 'subchapter', 1.25);
    });

    // Notes compilation chapters in Ch 5 -> Ch 1..4
    addEdge('5-1', 'ch1', 'compiles Ch 1 notes', 1.1);
    addEdge('5-2', 'ch2', 'compiles Ch 2 notes', 1.1);
    addEdge('5-3', 'ch3', 'compiles Ch 3 notes', 1.1);
    addEdge('5-4', 'ch4', 'compiles Ch 4 notes', 1.1);

    // Subchapter -> Note, Note -> 5.x Notes Section, Note -> Bibliography, and Subchapter -> Bibliography
    payload.notes.forEach((nt) => {
      addEdge(nt.fromSection, nt.id, `note ${nt.n}`, 1.15);
      addEdge(nt.notesSectionId, nt.id, `listed in 5.${nt.ch}`, 0.55);
      nt.bibIds.forEach((bibId) => {
        addEdge(nt.id, bibId, 'cites source', 1.05);
        addEdge(nt.fromSection, bibId, `cites via n.${nt.n}`, 0.75);
      });
    });

    // Bibliography -> 5.5 Master Bibliography + Chapter links
    payload.bibs.forEach((b) => {
      addEdge('5-5', b.id, 'in 5.5 Bibliography', 0.55);
      b.sections.forEach((secId) => {
        addEdge(secId, b.id, 'cites bibliography', 0.85);
      });
      b.chapters.forEach((chNum) => {
        addEdge(`ch${chNum}`, b.id, `Ch ${chNum} source`, 0.5);
      });
    });

    // Custom edges
    stored.customEdges.forEach((e) => addEdge(e.source, e.target, e.label, e.strength ?? 1.1, true));

    edges = edgeList;

    const deg = new Map<string, number>();
    edges.forEach((e) => {
      deg.set(e.source, (deg.get(e.source) || 0) + 1);
      deg.set(e.target, (deg.get(e.target) || 0) + 1);
    });
    nodes.forEach((n) => {
      n.degree = deg.get(n.id) || 1;
    });

    populateEdgeSelects();
    updateStats();
  };

  const populateEdgeSelects = () => {
    if (!sourceSelect || !targetSelect) return;
    const sorted = [...nodes].sort((a, b) => (a.code || a.label).localeCompare(b.code || b.label));
    const html = sorted
      .map((n) => `<option value="${n.id}">${n.code ? `[${n.code}] ` : ''}${n.label}</option>`)
      .join('');
    sourceSelect.innerHTML = html;
    targetSelect.innerHTML = html;
    if (selectedId) sourceSelect.value = selectedId;
    if (sorted.length > 1) targetSelect.value = sorted[1].id;
  };

  const getVisibleSet = (): Set<string> => {
    const visible = new Set<string>();
    nodes.forEach((n) => {
      let pass = true;
      if (activeFilter === 'bib') {
        pass = n.kind === 'core' || n.kind === 'chapter' || n.kind === 'section' || n.kind === 'bib';
      } else if (activeFilter === 'notes') {
        pass = n.kind === 'core' || n.kind === 'chapter' || n.kind === 'section' || n.kind === 'note';
      } else if (activeFilter === 'ch1' || activeFilter === 'ch2' || activeFilter === 'ch3' || activeFilter === 'ch4') {
        const targetCh = activeFilter.replace('ch', '');
        pass =
          n.kind === 'core' ||
          n.chapter === targetCh ||
          n.id === `5-${targetCh}` ||
          (n.kind === 'bib' && edges.some((e) => (e.source === n.id || e.target === n.id) && (e.source.startsWith(`${targetCh}-`) || e.target.startsWith(`${targetCh}-`) || e.source.startsWith(`note-${targetCh}-`) || e.target.startsWith(`note-${targetCh}-`))));
      } else if (activeFilter === 'custom') {
        pass = n.kind === 'core' || n.kind === 'chapter' || !!n.custom;
      }
      if (pass) visible.add(n.id);
    });

    if (localDepth > 0 && selectedId) {
      const hopSet = new Set<string>([selectedId]);
      for (let step = 0; step < localDepth; step++) {
        const current = [...hopSet];
        edges.forEach((e) => {
          if (current.includes(e.source)) hopSet.add(e.target);
          if (current.includes(e.target)) hopSet.add(e.source);
        });
      }
      for (const id of [...visible]) {
        if (!hopSet.has(id)) visible.delete(id);
      }
    }

    return visible;
  };

  const matchesSearch = (n: MindNode): boolean => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.label.toLowerCase().includes(q) ||
      (n.code && n.code.toLowerCase().includes(q)) ||
      n.summary.toLowerCase().includes(q)
    );
  };

  const nodeRadius = (n: MindNode): number => {
    if (n.kind === 'core') return 16;
    if (n.kind === 'chapter') return 11.5;
    if (n.kind === 'section') return 8;
    if (n.kind === 'bib') return 6.5 + Math.min(3.5, (n.degree || 1) * 0.35);
    if (n.kind === 'note') return 5;
    return 7.5;
  };

  const targetCoordsForLayout = (n: MindNode, idx: number): { x: number; y: number } => {
    if (layoutMode === 'radial') {
      if (n.kind === 'core') return { x: 0, y: 0 };
      const chNum = Number(n.chapter || 1) - 1;
      const baseA = (chNum / 5) * Math.PI * 2 - Math.PI / 2;
      if (n.kind === 'chapter') return { x: Math.cos(baseA) * 145, y: Math.sin(baseA) * 145 };
      if (n.kind === 'section') {
        const secIdx = Number((n.code || '1.1').split('.')[1] || 1);
        const a = baseA + (secIdx - 3.5) * 0.14;
        return { x: Math.cos(a) * 265, y: Math.sin(a) * 265 };
      }
      if (n.kind === 'note') {
        const nIdx = Number((n.code || 'N1.1').split('.')[1] || 1);
        const a = baseA + ((nIdx % 16) - 7.5) * 0.075;
        const r = 385 + (nIdx % 2) * 32;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r };
      }
      const a = (idx / Math.max(1, nodes.length)) * Math.PI * 2;
      return { x: Math.cos(a) * 510, y: Math.sin(a) * 510 };
    }
    if (layoutMode === 'columns') {
      // 4 horizontal tiers: Chapters -> Subchapters -> Notes -> Bibliography
      const chNum = Number(n.chapter || 1) - 3;
      if (n.kind === 'core') return { x: 0, y: -320 };
      if (n.kind === 'chapter') return { x: chNum * 210, y: -220 };
      if (n.kind === 'section') {
        const secIdx = Number((n.code || '1.1').split('.')[1] || 1);
        return { x: chNum * 210 + (secIdx - 3.5) * 26, y: -105 };
      }
      if (n.kind === 'note') {
        const nIdx = Number((n.code || 'N1.1').split('.')[1] || 1);
        return { x: chNum * 210 + ((nIdx % 10) - 4.5) * 20, y: 35 + Math.floor(nIdx / 10) * 34 };
      }
      if (n.kind === 'bib') {
        const bIdx = Number((n.code || 'BIB 01').replace(/\D+/g, '') || 1) - 1;
        return { x: ((bIdx % 15) - 7) * 72, y: 220 + Math.floor(bIdx / 15) * 44 };
      }
      return { x: chNum * 180, y: 0 };
    }
    return { x: 0, y: 0 };
  };

  const stepPhysics = () => {
    const visible = getVisibleSet();
    const activeNodes = nodes.filter((n) => visible.has(n.id));
    const nodeById = new Map(activeNodes.map((n) => [n.id, n]));

    if (layoutMode !== 'force') {
      activeNodes.forEach((n, idx) => {
        if (n === draggingNode || n.pinned) return;
        const tgt = targetCoordsForLayout(n, idx);
        n.x += (tgt.x - n.x) * 0.12;
        n.y += (tgt.y - n.y) * 0.12;
        n.vx = 0;
        n.vy = 0;
      });
      return;
    }

    const repulsion = 1950;
    const springLen = 88;
    const springK = 0.04;

    for (let i = 0; i < activeNodes.length; i++) {
      const a = activeNodes[i];
      for (let j = i + 1; j < activeNodes.length; j++) {
        const b = activeNodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 16) {
          dx = (Math.random() - 0.5) * 4;
          dy = (Math.random() - 0.5) * 4;
          d2 = dx * dx + dy * dy + 16;
        }
        if (d2 > 280000) continue;
        const d = Math.sqrt(d2);
        const f = (repulsion * alpha) / d2;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        if (a !== draggingNode && !a.pinned) {
          a.vx -= fx;
          a.vy -= fy;
        }
        if (b !== draggingNode && !b.pinned) {
          b.vx += fx;
          b.vy += fy;
        }
      }
    }

    edges.forEach((e) => {
      const s = nodeById.get(e.source);
      const t = nodeById.get(e.target);
      if (!s || !t) return;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist =
        s.kind === 'core' || t.kind === 'core'
          ? springLen * 1.45
          : s.kind === 'note' || t.kind === 'note'
            ? springLen * 0.78
            : springLen;
      const f = (d - targetDist) * springK * (e.strength ?? 1) * alpha;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      if (s !== draggingNode && !s.pinned) {
        s.vx += fx;
        s.vy += fy;
      }
      if (t !== draggingNode && !t.pinned) {
        t.vx -= fx;
        t.vy -= fy;
      }
    });

    activeNodes.forEach((n) => {
      if (n === draggingNode || n.pinned) return;
      if (n.kind === 'core') {
        n.vx += (0 - n.x) * 0.09 * alpha;
        n.vy += (0 - n.y) * 0.09 * alpha;
      } else {
        const chIdx = Number(n.chapter || 1) - 1;
        const angle = (chIdx / 5) * Math.PI * 2 - Math.PI / 2;
        const targetR =
          n.kind === 'chapter'
            ? 145
            : n.kind === 'section'
              ? 265
              : n.kind === 'note'
                ? 395
                : 510;
        const gx = Math.cos(angle) * targetR;
        const gy = Math.sin(angle) * targetR;
        n.vx += (gx - n.x) * 0.012 * alpha;
        n.vy += (gy - n.y) * 0.012 * alpha;
      }
      n.vx *= 0.76;
      n.vy *= 0.76;
      n.x += n.vx;
      n.y += n.vy;
    });

    alpha = Math.max(0.05, alpha * 0.991);
  };

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
    if (n.kind === 'section') return pal.fg;
    if (n.kind === 'note') return pal.orange;
    if (n.kind === 'bib') return pal.green;
    return pal.blue;
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

    // Subtle Obsidian dot matrix
    ctx.fillStyle = pal.muted;
    ctx.globalAlpha = 0.14;
    const gridStep = 36 * cam.k;
    if (gridStep >= 14) {
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

      const isFocusEdge = focusId && (e.source === focusId || e.target === focusId);
      const searchDim = searchQuery && !matchesSearch(s) && !matchesSearch(t);

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);

      const isBibEdge = s.kind === 'bib' || t.kind === 'bib';
      if (e.custom) {
        ctx.setLineDash([4 / cam.k, 3 / cam.k]);
      } else {
        ctx.setLineDash([]);
      }

      if (hoveredId) {
        ctx.strokeStyle = isFocusEdge ? (isBibEdge ? pal.green : pal.fg) : pal.muted;
        ctx.globalAlpha = isFocusEdge ? 0.85 : 0.06;
        ctx.lineWidth = (isFocusEdge ? 1.65 : 0.65) / cam.k;
      } else if (searchDim) {
        ctx.strokeStyle = pal.muted;
        ctx.globalAlpha = 0.05;
        ctx.lineWidth = 0.65 / cam.k;
      } else {
        ctx.strokeStyle = isFocusEdge ? (isBibEdge ? pal.green : pal.fg) : pal.muted;
        ctx.globalAlpha = isFocusEdge ? 0.62 : 0.16;
        ctx.lineWidth = (isFocusEdge ? 1.4 : 0.75) / cam.k;
      }
      ctx.stroke();
    });
    ctx.setLineDash([]);

    if (linkDrawMode && linkDragSource) {
      ctx.beginPath();
      ctx.moveTo(linkDragSource.x, linkDragSource.y);
      ctx.lineTo(pointerWorld.x, pointerWorld.y);
      ctx.strokeStyle = pal.red;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 2 / cam.k;
      ctx.setLineDash([5 / cam.k, 4 / cam.k]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 2. Draw Nodes
    nodeById.forEach((n) => {
      const r = nodeRadius(n);
      const isSelected = n.id === selectedId;
      const isHovered = n.id === hoveredId;
      const isNeighbor = neighborSet.has(n.id);
      const matches = matchesSearch(n);

      let nodeAlpha = 1;
      if (hoveredId && !isNeighbor) nodeAlpha = 0.14;
      else if (searchQuery && !matches) nodeAlpha = 0.12;

      ctx.globalAlpha = nodeAlpha;

      if (isSelected || isHovered || n.kind === 'core') {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + (isSelected || isHovered ? 5 : 3.5) / cam.k, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected || isHovered ? pal.fg : pal.muted;
        ctx.lineWidth = (isSelected ? 1.6 : 1) / cam.k;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      const fill = colorForNode(n, pal);
      if (n.kind === 'section') {
        ctx.fillStyle = isSelected || isHovered || isNeighbor ? pal.fg : pal.bg;
        ctx.fill();
        ctx.lineWidth = 1.5 / cam.k;
        ctx.strokeStyle = pal.fg;
        ctx.stroke();
      } else {
        ctx.fillStyle = fill;
        ctx.fill();
      }

      const showLabel =
        n.kind === 'core' ||
        n.kind === 'chapter' ||
        isSelected ||
        isHovered ||
        (hoveredId && isNeighbor) ||
        (searchQuery && matches) ||
        (n.kind === 'section' && cam.k >= 0.72) ||
        (n.kind === 'bib' && cam.k >= 1.05) ||
        cam.k >= 1.45;

      if (showLabel) {
        const fontSize =
          n.kind === 'core'
            ? 13
            : n.kind === 'chapter'
              ? 11.5
              : n.kind === 'section'
                ? 10
                : 9;
        const scaledSize = Math.max(7.5, fontSize / Math.pow(cam.k, 0.35));
        ctx.font = `${isSelected || isHovered || n.kind === 'core' || n.kind === 'chapter' ? '600' : '400'} ${scaledSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = pal.fg;
        ctx.fillText(n.label, n.x, n.y + r + 3.5 / cam.k);
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
      const r = nodeRadius(n) + 5 / cam.k;
      const dx = wx - n.x;
      const dy = wy - n.y;
      if (dx * dx + dy * dy <= r * r) return n;
    }
    return null;
  };

  const kindLabel: Record<NodeKind, string> = {
    core: 'Core Thesis Hypothesis',
    chapter: 'Book Chapter',
    section: 'Subchapter',
    note: 'Endnote Citation (Ch 5.1–5.4)',
    bib: 'Bibliography Source (5.5)',
    lens: 'Theoretical Lens',
    custom: 'Custom Citation / Note',
  };

  const selectNode = (id: string) => {
    const n = nodes.find((x) => x.id === id);
    if (!n) return;
    selectedId = id;
    if (sourceSelect) sourceSelect.value = id;

    inspKind.textContent = `${n.code ? n.code + ' · ' : ''}${kindLabel[n.kind]}`;
    inspTitle.textContent = n.label;
    inspSummary.textContent = n.summary;
    inspEditArea.value = n.summary;
    inspPinBtn.textContent = n.pinned ? 'Unpin node' : 'Pin position';
    inspDeleteBtn.hidden = !n.custom;

    if (n.noteHash) {
      inspOpenBookBtn.hidden = false;
      inspOpenBookBtn.textContent = `Open ${n.code} in Ch 5 Notes ↗`;
      if (inspOpenRefBtn) {
        inspOpenRefBtn.hidden = false;
        inspOpenRefBtn.textContent = `Jump to citation in ${n.sectionId?.replace('-', '.')} ↗`;
      }
    } else if (n.sectionId) {
      inspOpenBookBtn.hidden = false;
      inspOpenBookBtn.textContent =
        n.kind === 'bib' ? 'Open 5.5 Bibliography ↗' : `Open ${n.sectionId.replace('-', '.')} in book ↗`;
      if (inspOpenRefBtn) inspOpenRefBtn.hidden = true;
    } else {
      inspOpenBookBtn.hidden = true;
      if (inspOpenRefBtn) inspOpenRefBtn.hidden = true;
    }

    const connected: { node: MindNode; relation: string; edgeId: string; custom?: boolean }[] = [];
    edges.forEach((e) => {
      if (e.source === id) {
        const target = nodes.find((x) => x.id === e.target);
        if (target) connected.push({ node: target, relation: e.label || 'linked', edgeId: e.id, custom: e.custom });
      } else if (e.target === id) {
        const source = nodes.find((x) => x.id === e.source);
        if (source) connected.push({ node: source, relation: e.label || 'linked', edgeId: e.id, custom: e.custom });
      }
    });

    inspConnections.innerHTML = connected
      .map(
        (c) =>
          `<span class="ph__mm-conn-item"><button type="button" class="ph__mm-conn-pill" data-mm-jump-node="${c.node.id}"><span>${c.node.code || '•'}</span> ${c.node.label} <em>(${c.relation})</em></button>${c.custom ? `<button type="button" class="ph__mm-conn-del" data-mm-del-edge="${c.edgeId}" aria-label="Remove link" title="Remove link">×</button>` : ''}</span>`
      )
      .join('');
  };

  const updateStats = () => {
    const visible = getVisibleSet();
    const visEdges = edges.filter((e) => visible.has(e.source) && visible.has(e.target));
    statsEl.textContent = `${visible.size} nodes · ${visEdges.length} citation links`;
  };

  canvas.addEventListener('pointerdown', (e) => {
    const w = screenToWorld(e.clientX, e.clientY);
    pointerWorld = w;
    pointerDownPos = { x: e.clientX, y: e.clientY };
    pointerMoved = false;
    const hit = hitTest(w.x, w.y);

    if (linkDrawMode && hit) {
      linkDragSource = hit;
      selectNode(hit.id);
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    if (hit) {
      draggingNode = hit;
      alpha = Math.max(alpha, 0.45);
      selectNode(hit.id);
      canvas.setPointerCapture(e.pointerId);
    } else {
      isPanning = true;
      panStart = { x: e.clientX - cam.x, y: e.clientY - cam.y };
      canvas.setPointerCapture(e.pointerId);
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    const w = screenToWorld(e.clientX, e.clientY);
    pointerWorld = w;
    if (Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 4) {
      pointerMoved = true;
    }

    if (linkDrawMode && linkDragSource) {
      const hit = hitTest(w.x, w.y);
      hoveredId = hit ? hit.id : linkDragSource.id;
      return;
    }

    if (draggingNode) {
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

    const hit = hitTest(w.x, w.y);
    hoveredId = hit ? hit.id : null;
    canvas.style.cursor = hit ? 'pointer' : linkDrawMode ? 'crosshair' : 'grab';
  });

  const endPointer = () => {
    if (linkDrawMode && linkDragSource) {
      const target = hitTest(pointerWorld.x, pointerWorld.y);
      if (target && target.id !== linkDragSource.id) {
        const newEdge: MindEdge = {
          id: `${linkDragSource.id}__${target.id}`,
          source: linkDragSource.id,
          target: target.id,
          label: 'cites / links',
          strength: 1.1,
          custom: true,
        };
        stored.customEdges.push(newEdge);
        saveStored();
        buildGraph();
        selectNode(target.id);
        alpha = 0.6;
      }
      linkDragSource = null;
    }
    if (draggingNode && pointerMoved && draggingNode.pinned) {
      stored.pinnedPositions[draggingNode.id] = { x: draggingNode.x, y: draggingNode.y };
      saveStored();
    }
    draggingNode = null;
    isPanning = false;
  };

  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);

  canvas.addEventListener('dblclick', (e) => {
    const w = screenToWorld(e.clientX, e.clientY);
    const hit = hitTest(w.x, w.y);
    if (!hit) return;
    if (hit.noteHash) onJumpToHash(hit.noteHash);
    else if (hit.sectionId) onJumpToSection(hit.sectionId);
  });

  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left - width / 2;
      const my = e.clientY - rect.top - height / 2;
      const factor = Math.exp(-e.deltaY * 0.0015);
      const nextK = Math.max(0.32, Math.min(3.5, cam.k * factor));
      cam.x = mx - ((mx - cam.x) / cam.k) * nextK;
      cam.y = my - ((my - cam.y) / cam.k) * nextK;
      cam.k = nextK;
    },
    { passive: false }
  );

  searchInput?.addEventListener('input', () => {
    searchQuery = searchInput.value.trim();
    if (searchQuery) {
      const first = nodes.find((n) => matchesSearch(n));
      if (first) selectNode(first.id);
    }
  });

  filterBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.mmFilter!;
      filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      alpha = 0.65;
      updateStats();
    })
  );

  layoutBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      layoutMode = btn.dataset.mmLayout as 'force' | 'radial' | 'columns';
      layoutBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      alpha = 0.85;
    })
  );

  depthBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      localDepth = Number(btn.dataset.mmDepth || 0);
      depthBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      alpha = 0.6;
      updateStats();
    })
  );

  linkModeBtn?.addEventListener('click', () => {
    linkDrawMode = !linkDrawMode;
    linkModeBtn.setAttribute('aria-pressed', String(linkDrawMode));
    linkModeBtn.textContent = linkDrawMode ? 'Drag node → node (Active)' : '+ Drag-Connect Mode';
  });

  zoomInBtn?.addEventListener('click', () => {
    cam.k = Math.min(3.5, cam.k * 1.25);
  });
  zoomOutBtn?.addEventListener('click', () => {
    cam.k = Math.max(0.32, cam.k / 1.25);
  });
  zoomResetBtn?.addEventListener('click', () => {
    cam = { x: 0, y: 0, k: 0.82 };
    alpha = 0.75;
  });

  sideTabBtns.forEach((btn) =>
    btn.addEventListener('click', () => {
      const target = btn.dataset.mmSidetab!;
      sideTabBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      sidePanes.forEach((p) => (p.hidden = p.dataset.mmPane !== target));
    })
  );

  inspConnections?.addEventListener('click', (e) => {
    const jumpBtn = (e.target as Element).closest<HTMLButtonElement>('[data-mm-jump-node]');
    if (jumpBtn) {
      const id = jumpBtn.dataset.mmJumpNode!;
      selectNode(id);
      const n = nodes.find((x) => x.id === id);
      if (n) {
        cam.x = -n.x * cam.k * 0.4;
        cam.y = -n.y * cam.k * 0.4;
      }
      return;
    }
    const delBtn = (e.target as Element).closest<HTMLButtonElement>('[data-mm-del-edge]');
    if (delBtn) {
      const edgeId = delBtn.dataset.mmDelEdge!;
      stored.customEdges = stored.customEdges.filter((ce) => ce.id !== edgeId);
      saveStored();
      buildGraph();
      selectNode(selectedId);
    }
  });

  inspOpenBookBtn?.addEventListener('click', () => {
    const n = nodes.find((x) => x.id === selectedId);
    if (!n) return;
    if (n.noteHash) onJumpToHash(n.noteHash);
    else if (n.sectionId) onJumpToSection(n.sectionId);
  });

  inspOpenRefBtn?.addEventListener('click', () => {
    const n = nodes.find((x) => x.id === selectedId);
    if (!n || !n.refHash) return;
    onJumpToHash(n.refHash);
  });

  inspPinBtn?.addEventListener('click', () => {
    const n = nodes.find((x) => x.id === selectedId);
    if (!n) return;
    n.pinned = !n.pinned;
    if (n.pinned) {
      stored.pinnedPositions[n.id] = { x: n.x, y: n.y };
    } else {
      delete stored.pinnedPositions[n.id];
    }
    saveStored();
    selectNode(n.id);
  });

  inspDeleteBtn?.addEventListener('click', () => {
    const n = nodes.find((x) => x.id === selectedId);
    if (!n || !n.custom) return;
    stored.customNodes = stored.customNodes.filter((cn) => cn.id !== n.id);
    stored.customEdges = stored.customEdges.filter((ce) => ce.source !== n.id && ce.target !== n.id);
    delete stored.editedSummaries[n.id];
    delete stored.pinnedPositions[n.id];
    saveStored();
    buildGraph();
    selectNode('powerhouse');
  });

  inspSaveBtn?.addEventListener('click', () => {
    const n = nodes.find((x) => x.id === selectedId);
    if (!n) return;
    const text = inspEditArea.value.trim();
    if (!text) return;
    n.summary = text;
    stored.editedSummaries[n.id] = text;
    saveStored();
    inspSummary.textContent = text;
    inspSaveBtn.textContent = 'Saved ✓';
    setTimeout(() => {
      inspSaveBtn.textContent = 'Save note / citation';
    }, 1400);
  });

  addNodeForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(addNodeForm);
    const label = String(fd.get('label') || '').trim();
    const code = String(fd.get('code') || 'BIB').trim().toUpperCase();
    const kind = String(fd.get('kind') || 'bib') as NodeKind;
    const chapter = String(fd.get('chapter') || '1');
    const connectTo = String(fd.get('connectTo') || selectedId || 'ch1');
    const relation = String(fd.get('relation') || 'cited in').trim();
    const summary = String(fd.get('summary') || '').trim() || `${label} — added in the Powerhouse Citation Mindmap.`;

    if (!label) return;
    const id = 'custom-' + Date.now().toString(36);
    const parent = nodes.find((n) => n.id === connectTo) || nodes[0];
    const newNode: Omit<MindNode, 'vx' | 'vy'> = {
      id,
      code,
      label,
      kind,
      chapter,
      sectionId: connectTo.includes('-') ? connectTo : `${chapter}-1`,
      summary,
      custom: true,
      x: (parent ? parent.x : 0) + (Math.random() - 0.5) * 90,
      y: (parent ? parent.y : 0) + (Math.random() - 0.5) * 90,
    };
    stored.customNodes.push(newNode);
    if (connectTo) {
      stored.customEdges.push({
        id: `${connectTo}__${id}`,
        source: connectTo,
        target: id,
        label: relation,
        strength: 1.15,
        custom: true,
      });
    }
    saveStored();
    buildGraph();
    selectNode(id);
    alpha = 0.8;
    addNodeForm.reset();
    sideTabBtns[0]?.click();
  });

  addEdgeForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(addEdgeForm);
    const source = String(fd.get('source') || '');
    const target = String(fd.get('target') || '');
    const label = String(fd.get('label') || 'cites').trim();
    if (!source || !target || source === target) return;
    stored.customEdges.push({
      id: `${source}__${target}`,
      source,
      target,
      label,
      strength: 1.1,
      custom: true,
    });
    saveStored();
    buildGraph();
    selectNode(source);
    alpha = 0.65;
  });

  exportBtn?.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ nodes, edges, custom: stored }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'powerhouse-citations-mindmap.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  resetCustomBtn?.addEventListener('click', () => {
    stored = { customNodes: [], customEdges: [], editedSummaries: {}, pinnedPositions: {} };
    saveStored();
    buildGraph();
    selectNode('powerhouse');
    alpha = 0.85;
  });

  const resize = () => {
    const rect = canvas.parentElement!.getBoundingClientRect();
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
  selectNode('powerhouse');
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

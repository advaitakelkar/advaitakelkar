/**
 * The bubble-cloud row engine.
 *
 * This is the behaviour the footer's project cloud has always had, lifted out
 * of `Footer.astro` so the About page's Skillset can run the *same code*
 * rather than a copy that drifts. Two rules make the cloud work:
 *
 *  1. Pills rest at their abbreviated width and are packed into fixed rows.
 *     Rows are computed arithmetically from the measured widths, not read back
 *     from `offsetTop` — during the measure pass the name transitions are
 *     mid-flight, so geometry read from the DOM at that moment is unreliable.
 *
 *  2. Hovering a pill expands it to its full width, and the extra space is
 *     *stolen from its neighbours in that row*, furthest-away first, so the
 *     row's total width never changes and nothing reflows. A pill can be
 *     squeezed down to a bare circle but no further.
 *
 * The engine is deliberately ignorant of what a pill means. It only needs:
 *   - a container whose direct children are the pills
 *   - `.proj-bubble__name` carrying `data-short` / `data-full`
 *   - optionally `.proj-bubble__tag`, which is collapsed at rest and must be
 *     forced open during measurement so `fullW` includes it
 *
 * Pills marked `[data-static]` are laid out but never expand or shrink — the
 * Skillset's category labels use that to sit in the flow as plain markers.
 */

/** Fallback only: the real value is --_tokens---bubble-gap-x in tokens.css. */
const GAP_FALLBACK = 6;
const MIN_PILL = 26;      // a fully squeezed pill is still a circle
const SQUISH_AT = 32;     // below this it gets `.is-squished` for the CSS
const RESET_MS = 400;     // must outlast the width transition

export interface BubbleRowOptions {
  /** Container holding the pills. */
  grid: HTMLElement;
  /** Selector for a pill within the grid. */
  pillSelector?: string;
  /** Class put on each generated row wrapper. */
  rowClass?: string;
}

export function initBubbleRows(opts: BubbleRowOptions) {
  const { grid: g, pillSelector = '.proj-bubble', rowClass = 'qs-row' } = opts;
  if (!g) return { rebuild() {} };

  const allPills = () =>
    Array.from(g.querySelectorAll<HTMLElement>(pillSelector));

  /**
   * Horizontal gap, read from the token rather than hard-coded.
   *
   * This used to be a module constant of 5 while the emitted rows were
   * written with `gap:4px` — so the packing reserved a width it never drew,
   * and every row came out a little short. One source now feeds both.
   *
   * The vertical gap is pure CSS (the container's own `gap`) and is
   * deliberately larger; see the note on the tokens for why equal numbers do
   * not look equal between capsules.
   */
  const gapX = () => {
    const v = parseFloat(
      getComputedStyle(g).getPropertyValue('--_tokens---bubble-gap-x')
    );
    return Number.isFinite(v) && v > 0 ? v : GAP_FALLBACK;
  };

  function buildRows() {
    const pills = allPills();
    if (!pills.length) return;

    // ── 1. Measure ───────────────────────────────────────────────────────
    // Flatten back to a plain wrapping row so every pill sits at its natural
    // width, then take the abbreviated measurement.
    g.style.flexDirection = 'row';
    g.style.flexWrap = 'wrap';
    const GAP = gapX();
    g.style.gap = GAP + 'px';
    pills.forEach((p) => {
      p.style.width = '';
      g.appendChild(p);
    });
    g.classList.add('qs-measure-state'); // kills transitions for the pass
    void g.offsetWidth;
    pills.forEach((p) => { p.dataset.restW = String(p.offsetWidth); });

    // Swap in the full name and force the tag open, so `fullW` is the real
    // hovered width (name + tag + arrow) rather than just name + arrow.
    pills.forEach((p) => {
      const nameEl = p.querySelector<HTMLElement>('.proj-bubble__name');
      const tagEl = p.querySelector<HTMLElement>('.proj-bubble__tag');
      if (nameEl) nameEl.textContent = nameEl.dataset.full ?? nameEl.textContent;
      if (tagEl) {
        tagEl.style.transition = 'none';
        tagEl.style.maxWidth = '800px';
        tagEl.style.marginLeft = '0';
      }
    });
    void g.offsetWidth;
    pills.forEach((p) => { p.dataset.fullW = String(p.offsetWidth); });

    // Put it all back.
    pills.forEach((p) => {
      const nameEl = p.querySelector<HTMLElement>('.proj-bubble__name');
      const tagEl = p.querySelector<HTMLElement>('.proj-bubble__tag');
      if (nameEl) nameEl.textContent = nameEl.dataset.short ?? nameEl.textContent;
      if (tagEl) {
        tagEl.style.transition = '';
        tagEl.style.maxWidth = '';
        tagEl.style.marginLeft = '';
      }
    });
    g.classList.remove('qs-measure-state');

    // ── 2. Pack rows from the measured widths ────────────────────────────
    const containerW = g.clientWidth;
    const widthOf = (el: HTMLElement) => parseFloat(el.dataset.restW || '0');
    const isLabel = (el: HTMLElement) => el.hasAttribute('data-static');

    const rows: HTMLElement[][] = [];
    let cur: HTMLElement[] = [];
    let rowW = 0;

    /**
     * Close the current row.
     *
     * A label may never be the last pill in a row. It names the pills that
     * follow it, so stranding it at the end of a line divorces it from its
     * own group — it reads as belonging to the run above. Any trailing
     * labels are carried down to start the next row instead.
     *
     * The carry is skipped when the label plus the pill that triggered the
     * break would not fit on the next row either; a slightly stranded label
     * is better than a row that overflows its container.
     */
    const closeRow = (nextW: number) => {
      const carry: HTMLElement[] = [];
      while (cur.length > 1 && isLabel(cur[cur.length - 1])) {
        carry.unshift(cur.pop() as HTMLElement);
      }
      const carryW = carry.reduce((a, el, i) => a + widthOf(el) + (i ? GAP : 0), 0);
      if (carry.length && carryW + GAP + nextW > containerW) {
        cur.push(...carry);           // would not fit — leave it where it was
        carry.length = 0;
      }
      rows.push(cur);
      cur = [];
      rowW = 0;
      carry.forEach((el) => {
        rowW = cur.length === 0 ? widthOf(el) : rowW + GAP + widthOf(el);
        cur.push(el);
      });
    };

    pills.forEach((p) => {
      const w = widthOf(p);
      if (cur.length > 0 && rowW + GAP + w > containerW) closeRow(w);
      rowW = cur.length === 0 ? w : rowW + GAP + w;
      cur.push(p);
    });
    if (cur.length > 0) rows.push(cur);

    // ── 3. Emit the row wrappers ─────────────────────────────────────────
    // Layout goes on as inline style: these elements are created in JS and so
    // carry no `data-astro-cid-*`, which means scoped CSS will not match them.
    g.style.flexDirection = '';
    g.style.flexWrap = '';
    g.style.gap = '';
    g.innerHTML = '';
    rows.forEach((rowPills, idx) => {
      const row = document.createElement('div');
      row.className = idx === rows.length - 1 ? `${rowClass} ${rowClass}--last` : rowClass;
      row.style.cssText = [
        'display:flex',
        'flex-direction:row',
        'flex-wrap:nowrap',
        'justify-content:flex-start',
        `gap:${GAP}px`,
        'width:100%',
        'overflow:visible',
      ].join(';');
      rowPills.forEach((p) => row.appendChild(p));
      g.appendChild(row);
    });
  }

  // ── Hover: grow the hovered pill, steal the width from its row ─────────
  function attachHover(p: HTMLElement) {
    if (p.dataset.bubbleHoverWired) return;
    p.dataset.bubbleHoverWired = '1';

    p.addEventListener('mouseenter', () => {
      if (p.hasAttribute('data-static')) return;
      const row = p.parentElement;
      if (!row || !row.classList.contains(rowClass)) return;

      const rowPills = Array.from(row.children) as HTMLElement[];
      const H = rowPills.indexOf(p);
      if (H === -1) return;

      clearTimeout((row as any)._resetTimer);

      const hoverNameEl = p.querySelector<HTMLElement>('.proj-bubble__name');
      if (hoverNameEl) hoverNameEl.textContent = hoverNameEl.dataset.full ?? hoverNameEl.textContent;

      const N = rowPills.length;
      const targetW = rowPills.map((rp) => parseFloat(rp.dataset.restW || '0'));
      const fullW = parseFloat(p.dataset.fullW || '0');
      const rowWidth = row.clientWidth;

      const isLastRow = row.classList.contains(`${rowClass}--last`);
      const totalRestW = targetW.reduce((a, b) => a + b, 0) + (isLastRow ? (N - 1) * gapX() : 0);
      const emptySpace = Math.max(0, rowWidth - totalRestW);

      const req = fullW - targetW[H];
      targetW[H] = fullW;
      let deficit = Math.max(0, req - emptySpace);

      // Steal from the furthest pills first, so the ones beside the hovered
      // pill keep their labels for as long as possible.
      const others = rowPills
        .map((rp, i) => ({ i, dist: Math.abs(i - H), el: rp }))
        .filter((o) => o.i !== H && !o.el.hasAttribute('data-static'))
        .sort((a, b) => (b.dist !== a.dist ? b.dist - a.dist : a.i - b.i));

      for (const o of others) {
        if (deficit <= 0) break;
        const maxSteal = targetW[o.i] - MIN_PILL;
        if (maxSteal > 0) {
          const steal = Math.min(deficit, maxSteal);
          targetW[o.i] -= steal;
          deficit -= steal;
        }
      }
      if (deficit > 0) targetW[H] -= deficit;

      rowPills.forEach((rp, i) => {
        rp.style.width = targetW[i] + 'px';
        rp.classList.toggle('is-squished', targetW[i] <= SQUISH_AT);
      });
    });

    p.addEventListener('mouseleave', () => {
      const row = p.parentElement;
      if (!row || !row.classList.contains(rowClass)) return;

      const rowPills = Array.from(row.children) as HTMLElement[];
      rowPills.forEach((rp) => {
        rp.classList.remove('is-squished');
        rp.style.width = rp.dataset.restW + 'px';
      });

      clearTimeout((row as any)._resetTimer);
      (row as any)._resetTimer = setTimeout(() => {
        rowPills.forEach((rp) => {
          rp.style.width = '';
          // Only restore the short label once the collapse has finished, or
          // the text visibly snaps back mid-animation.
          const nameEl = rp.querySelector<HTMLElement>('.proj-bubble__name');
          if (nameEl) nameEl.textContent = nameEl.dataset.short ?? nameEl.textContent;
        });
      }, RESET_MS);
    });
  }

  function wireAll() {
    allPills().forEach(attachHover);
  }

  return {
    build() {
      // Two frames: the first lets the page's own layout settle (the home
      // slider in particular), the second measures against final geometry.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          buildRows();
          wireAll();
        })
      );
    },
    rebuild() {
      buildRows();
      wireAll();
    },
  };
}

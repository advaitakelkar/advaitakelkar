/** Shared DOM checks for the responsive review harness. No page mutation. */
export function inspectPage(contract) {
  const rendered = (el) => {
    if (!el.getBoundingClientRect().width || !el.getBoundingClientRect().height) return false;
    for (let node = el; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0' || node.hidden) return false;
      if (node.tagName === 'DETAILS' && !node.open && !node.querySelector('summary')?.contains(el)) return false;
    }
    return true;
  };
  const label = (el) => ({ selector: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).join('.') : ''), text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 80) });
  const reading = [...document.querySelectorAll(contract.readingSelectors.join(','))].filter(rendered).map(el => {
    const s = getComputedStyle(el), size = Number(s.fontSize.replace('px', '')), leading = Number(s.lineHeight.replace('px', '')) / size;
    return { ...label(el), size, leading };
  });
  const touch = innerWidth < contract.breakpoints.lg || contract.coarsePointer === true;
  const targets = touch ? [...document.querySelectorAll(contract.touchSelectors.join(','))].filter(rendered).map(el => {
    const r = el.getBoundingClientRect();
    return { ...label(el), width: r.width, height: r.height };
  }) : [];
  const fixed = [...document.querySelectorAll(contract.fixedControlSelectors.join(','))].filter(el => rendered(el) && getComputedStyle(el).position === 'fixed');
  const overlappingControls = [];
  fixed.forEach((a, i) => fixed.slice(i + 1).forEach(b => {
    if (a.contains(b) || b.contains(a)) return;
    const x = a.getBoundingClientRect(), y = b.getBoundingClientRect();
    if (Math.min(x.right, y.right) - Math.max(x.left, y.left) > 1 && Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 1) overlappingControls.push([label(a).selector, label(b).selector]);
  }));
  return {
    overlappingControls,
    width: innerWidth,
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    readingCount: reading.length,
    smallReading: reading.filter(x => x.size < contract.minimumReadingSize - .1 || x.leading < contract.minimumReadingLineHeight - .01),
    smallControls: targets.filter(x => x.width < contract.minimumTouchSize - .5 || x.height < contract.minimumTouchSize - .5),
    brokenImages: [...document.images].filter(el => rendered(el) && el.currentSrc && el.complete && !el.naturalWidth).map(el => el.currentSrc),
    unlabeledControls: [...document.querySelectorAll('button,input:not([type=hidden])')].filter(rendered).filter(el => !el.textContent.trim() && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.getAttribute('title') && !el.labels?.length).map(label),
  };
}

export function qualityFailures(result) {
  return [
    ...(result.horizontalOverflow > 1 ? [`horizontal overflow: ${result.horizontalOverflow}px`] : []),
    ...['smallReading','smallControls','brokenImages','unlabeledControls','overlappingControls'].filter(key => result[key]?.length).map(key => `${key}: ${result[key].length}`),
  ];
}

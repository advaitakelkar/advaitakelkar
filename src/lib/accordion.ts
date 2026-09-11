type Entry = { sect: Element; header: Element; toggle: Element };
export function wireAccordion(entries: Entry[]) {
 const setExpanded = (entry: Entry, expanded: boolean) => {
  entry.sect.classList.toggle('is-expanded', expanded);
  entry.toggle.setAttribute('aria-expanded', String(expanded));
  for (const [selector, visible] of [['.toggle-icon-minus', expanded], ['.toggle-icon-plus', !expanded]] as const) {
   const icon = entry.toggle.querySelector<HTMLElement>(selector); if (icon) icon.style.display = visible ? 'block' : 'none';
  }
  for (const child of Array.from(entry.sect.children)) if (!child.contains(entry.header) && child !== entry.header && child instanceof HTMLElement) child.inert = !expanded;
 };
 const toggleOne = (entry: Entry) => { const opening = !entry.sect.classList.contains('is-expanded'); if (opening) entries.forEach(other => setExpanded(other, false)); setExpanded(entry, opening); window.dispatchEvent(new Event('resize')); };
 entries.forEach(entry => {
  setExpanded(entry, entry.sect.classList.contains('is-expanded'));
  let timer: number | undefined;
  const click = (event: Event) => {
   event.stopPropagation();
   if ((event as MouseEvent).detail === 0) { toggleOne(entry); return; }
   if (timer !== undefined) { clearTimeout(timer); timer = undefined; return; }
   timer = window.setTimeout(() => { timer = undefined; toggleOne(entry); }, 250);
  };
  const doubleClick = (event: Event) => { event.stopPropagation(); clearTimeout(timer); timer = undefined; const open = !entries.every(e => e.sect.classList.contains('is-expanded')); entries.forEach(e => setExpanded(e, open)); window.dispatchEvent(new Event('resize')); };
  for (const target of [entry.header, entry.toggle]) { target.addEventListener('click', click); target.addEventListener('dblclick', doubleClick); }
 });
}

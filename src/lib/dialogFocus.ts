export function dialogFocus(dialog: HTMLElement) {
 let previous: HTMLElement | null = null;
 const items = () => Array.from(dialog.querySelectorAll<HTMLElement>('a[href],button,input,select,textarea,[tabindex="0"]')).filter(el => !el.matches(':disabled') && !el.closest('[inert]') && el.getClientRects().length);
 const trap = (event: KeyboardEvent) => {
  if (event.key !== 'Tab') return;
  const list = items(), first = list[0], last = list.at(-1);
  if (!first) { event.preventDefault(); dialog.focus(); return; }
  if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog || !dialog.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
 };
 return { open(initial?: HTMLElement | null) { previous = document.activeElement as HTMLElement | null; document.addEventListener('keydown', trap); (initial ?? items()[0] ?? dialog).focus(); }, close() { document.removeEventListener('keydown', trap); previous?.focus(); previous = null; } };
}

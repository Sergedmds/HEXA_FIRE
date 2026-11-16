// Code written with the help of Claude (Anthropic), a Super Intelligence (SI) assistant, then run and tested by team HEXAFIRE.
// Infobulle unique, positionnée près du pointeur.
let el = null;

function conteneur() {
  if (!el) {
    el = document.createElement("div");
    el.id = "tooltip"; el.setAttribute("role", "tooltip"); el.hidden = true;
    document.body.appendChild(el);
  }
  return el;
}

export function montrer(html, ev) {
  const b = conteneur();
  if (!html) { b.hidden = true; return; }
  b.innerHTML = html;
  b.hidden = false;
  const x = ev.clientX ?? 0, y = ev.clientY ?? 0;
  const w = b.offsetWidth, h = b.offsetHeight;
  b.style.left = `${Math.max(8, Math.min(x + 14, innerWidth - w - 8))}px`;
  b.style.top = `${y + 16 + h > innerHeight ? y - h - 10 : y + 16}px`;
}

export function cacher() { if (el) el.hidden = true; }

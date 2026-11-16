// Code written with the help of Claude (Anthropic), a Super Intelligence (SI) assistant, then run and tested by team HEXAFIRE.
// Icônes SVG en ligne (traits 1,5 px), pour ne dépendre d'aucune police d'icônes.
const base = (d, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`;

export const ICONS = {
  search: base('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  globe: base('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  square: base('<rect x="4" y="4" width="16" height="16" rx="1"/>'),
  circle: base('<circle cx="12" cy="12" r="8"/>'),
  polygon: base('<path d="M6 5l12 2-2 11-9 1z"/><circle cx="6" cy="5" r="1.5" fill="currentColor"/><circle cx="18" cy="7" r="1.5" fill="currentColor"/><circle cx="16" cy="18" r="1.5" fill="currentColor"/><circle cx="7" cy="19" r="1.5" fill="currentColor"/>'),
  point: base('<circle cx="12" cy="12" r="2.5" fill="currentColor"/><circle cx="12" cy="12" r="8" stroke-dasharray="3 3"/>'),
  flag: base('<path d="M5 21V4h11l-1.5 4L16 12H5"/>'),
  plus: base('<path d="M12 5v14M5 12h14"/>'),
  minus: base('<path d="M5 12h14"/>'),
  reset: base('<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>'),
  close: base('<path d="M6 6l12 12M18 6 6 18"/>'),
  download: base('<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>'),
  link: base('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  arrow: base('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  swap: base('<path d="M7 7h12l-3-3M17 17H5l3 3"/>'),
  sync: base('<path d="M20 12a8 8 0 0 1-14.5 4.6M4 12a8 8 0 0 1 14.5-4.6M4 5v4h4M20 19v-4h-4"/>'),
  layers: base('<path d="m12 4 9 5-9 5-9-5z"/><path d="m3 14 9 5 9-5"/>'),
  calendar: base('<rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 10h16M8 3v4M16 3v4"/>'),
  chart: base('<path d="M4 20V4M4 20h16"/><path d="m7 15 4-5 3 3 5-7"/>'),
  satellite: base('<path d="m9 10 5 5M4 7l3-3 4 4-3 3zM13 16l3-3 4 4-3 3z"/><path d="M14 10a4 4 0 0 1 0 5.7M11 7a7 7 0 0 1 6 9"/>'),
  info: base('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
  menu: base('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  play: base('<path d="M8 6v12l10-6z" fill="currentColor"/>'),
  pause: base('<path d="M8 6v12M16 6v12"/>'),
  prev: base('<path d="M17 6v12L8 12zM6 6v12"/>'),
  next: base('<path d="M7 6v12l9-6zM18 6v12"/>'),
  check: base('<path d="m5 12 5 5L20 7"/>'),
  external: base('<path d="M7 17 17 7M9 7h8v8"/>'),
  fire: base('<path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3.5.5 1 1.2 1.5 2 1.5 0-3-1-4.5 1-6.5z"/>'),
};

export const icon = nom => ICONS[nom] || "";

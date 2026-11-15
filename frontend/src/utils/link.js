// Lien partageable : la zone et les options sont encodées dans l'adresse (#...).
//   z = cercle:lat,lon,rayon | rect:sud,nord,ouest,est | pays:CODE | poly:lon lat;lon lat;...
//   m = niveau|anomalie, a = debut-fin, u = modis|viirs, y = année affichée, l = fr|en

export function encoderZone(z) {
  if (!z) return "";
  if (z.type === "cercle") return `cercle:${z.lat.toFixed(3)},${z.lon.toFixed(3)},${Math.round(z.rayon)}`;
  if (z.type === "rect") return `rect:${[z.sud, z.nord, z.ouest, z.est].map(v => v.toFixed(3)).join(",")}`;
  if (z.type === "pays") return `pays:${z.code}`;
  return `poly:${z.anneaux[0].map(([x, y]) => `${x.toFixed(3)} ${y.toFixed(3)}`).join(";")}`;
}

export function decoderZone(s) {
  if (!s || !s.includes(":")) return null;
  const type = s.slice(0, s.indexOf(":")), v = s.slice(s.indexOf(":") + 1);
  if (type === "cercle") { const [lat, lon, rayon] = v.split(",").map(Number); return { type, lat, lon, rayon }; }
  if (type === "rect") { const [sud, nord, ouest, est] = v.split(",").map(Number); return { type, sud, nord, ouest, est }; }
  if (type === "pays") return { type, code: v };
  if (type === "poly") return { type, anneaux: [v.split(";").map(x => x.split(" ").map(Number))] };
  return null;
}

export function encoder(params) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== null && v !== undefined && v !== "") p.set(k, v);
  return `${location.origin}${location.pathname}#${p.toString()}`;
}

export function decoder(hash = location.hash) {
  return new URLSearchParams(hash.replace(/^#/, ""));
}

export async function copier(url) {
  try { await navigator.clipboard.writeText(url); return true; }
  catch { prompt("URL", url); return false; }
}

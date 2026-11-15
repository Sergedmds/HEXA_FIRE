// Code written with the help of Claude (Anthropic), a Super Intelligence (SI) assistant, then run and tested by team HEXAFIRE.
// Géométrie des zones et de la grille. Une zone est un objet :
//   cercle {type, lat, lon, rayon}        rect {type, sud, nord, ouest, est}
//   poly {type, anneaux: [[[lon, lat], ...]]}   pays {type, code, nom_fr, nom_en, anneaux}
import { t, nf, getLangue } from "./i18n.js";

export const RAYON_TERRE = 6371;
const R = Math.PI / 180;

// Centre (lat, lon) d'une cellule de la grille du moteur (ligne 0 au nord, colonne 0 à l'ouest)
export function centreCellule(cellule, pas) {
  const nLon = Math.round(360 / pas);
  const lig = Math.floor(cellule / nLon), col = cellule % nLon;
  return [90 - (lig + 0.5) * pas, -180 + (col + 0.5) * pas];
}

export function distanceKm(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * R, dLon = (lon2 - lon1) * R;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * R) * Math.cos(lat2 * R) * Math.sin(dLon / 2) ** 2;
  return 2 * RAYON_TERRE * Math.asin(Math.sqrt(a));
}

// Emprise [sud, nord, ouest, est]
export function emprise(zone) {
  if (zone.type === "rect") return [zone.sud, zone.nord, zone.ouest, zone.est];
  if (zone.type === "cercle") {
    const dLat = zone.rayon / 111.2;
    const dLon = zone.rayon / (111.2 * Math.max(Math.cos(zone.lat * R), 0.05));
    return [Math.max(-90, zone.lat - dLat), Math.min(90, zone.lat + dLat), zone.lon - dLon, zone.lon + dLon];
  }
  let s = 90, n = -90, o = 180, e = -180;
  for (const a of zone.anneaux) for (const [x, y] of a) { s = Math.min(s, y); n = Math.max(n, y); o = Math.min(o, x); e = Math.max(e, x); }
  return [s, n, o, e];
}

// Lancer de rayon, règle pair-impair sur tous les anneaux (gère les trous et les multipolygones)
function dansAnneaux(anneaux, lat, lon) {
  let dedans = false;
  for (const a of anneaux) {
    for (let i = 0, j = a.length - 1; i < a.length; j = i++) {
      const [xi, yi] = a[i], [xj, yj] = a[j];
      if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dedans = !dedans;
    }
  }
  return dedans;
}

export function dansZone(zone, lat, lon) {
  if (zone.type === "rect") return lat >= zone.sud && lat <= zone.nord && lon >= zone.ouest && lon <= zone.est;
  if (zone.type === "cercle") return distanceKm(zone.lat, zone.lon, lat, lon) <= zone.rayon;
  return dansAnneaux(zone.anneaux, lat, lon);
}

function cercleAnneau(z) {
  const a = [];
  for (let i = 0; i <= 72; i++) {
    const th = (i / 72) * 2 * Math.PI;
    a.push([z.lon + (z.rayon / (111.2 * Math.max(Math.cos(z.lat * R), 0.05))) * Math.cos(th), z.lat + (z.rayon / 111.2) * Math.sin(th)]);
  }
  return [a];
}

// Anneaux [[lon, lat], ...] pour dessiner la zone (GeoJSON Polygon / MultiPolygon)
export function geometrie(zone) {
  if (zone.type === "rect") return [[[zone.ouest, zone.sud], [zone.est, zone.sud], [zone.est, zone.nord], [zone.ouest, zone.nord], [zone.ouest, zone.sud]]];
  if (zone.type === "cercle") return cercleAnneau(zone);
  return zone.anneaux;
}

export function geojsonZone(zone) {
  if (!zone) return { type: "FeatureCollection", features: [] };
  const anneaux = geometrie(zone);
  const geom = zone.type === "pays" || zone.type === "poly"
    ? { type: "MultiPolygon", coordinates: anneaux.map(a => [a]) }
    : { type: "Polygon", coordinates: anneaux };
  return { type: "Feature", properties: {}, geometry: geom };
}

// Aire sphérique d'un anneau (km²), formule de Chamberlain & Duquette
function aireAnneau(a) {
  let s = 0;
  for (let i = 0, n = a.length; i < n; i++) {
    const [x1, y1] = a[i], [x2, y2] = a[(i + 1) % n];
    s += (x2 - x1) * R * (2 + Math.sin(y1 * R) + Math.sin(y2 * R));
  }
  return Math.abs(s * RAYON_TERRE * RAYON_TERRE / 2);
}

// Superficie approximative de la zone (km²). Pour les pays (multipolygones), somme des anneaux
// extérieurs ; les anneaux intérieurs (trous) comptent négativement.
export function aireZone(zone) {
  if (zone.type === "cercle") return Math.PI * zone.rayon ** 2;
  if (zone.type === "rect") {
    const h = (Math.sin(zone.nord * R) - Math.sin(zone.sud * R)) * RAYON_TERRE;
    return Math.abs(h * (zone.est - zone.ouest) * R * RAYON_TERRE);
  }
  return zone.anneaux.reduce((s, a) => s + aireAnneau(a), 0);
}

export function centroide(zone) {
  if (zone.type === "cercle") return [zone.lat, zone.lon];
  const [s, n, o, e] = emprise(zone);
  return [(s + n) / 2, (o + e) / 2];
}

// « 03°12' S, 60°02' W »
export function coordDMS(lat, lon) {
  const f = (v, pos, neg) => { const a = Math.abs(v), d = Math.floor(a), m = Math.round((a - d) * 60); return `${String(d).padStart(2, "0")}°${String(m).padStart(2, "0")}' ${v >= 0 ? pos : neg}`; };
  return `${f(lat, "N", "S")}, ${f(lon, "E", "W")}`;
}

export function nomPays(p) { return getLangue() === "en" ? (p.nom_en || p.nom_fr) : (p.nom_fr || p.nom_en); }

export function decrireZone(z) {
  const f = x => nf(x, 2);
  if (!z) return "";
  if (z.nom) return z.nom;
  if (z.type === "rect") return t("zone.d_rect", f(z.sud), f(z.nord), f(z.ouest), f(z.est));
  if (z.type === "cercle") return t("zone.d_cercle", nf(z.rayon), f(z.lat), f(z.lon));
  if (z.type === "pays") return nomPays(z);
  return t("zone.d_poly", z.anneaux[0].length - 1);
}

export function zoneValide(z) {
  if (!z) return false;
  if (z.type === "cercle") return [z.lat, z.lon, z.rayon].every(Number.isFinite) && z.rayon > 0;
  if (z.type === "rect") return [z.sud, z.nord, z.ouest, z.est].every(Number.isFinite) && z.nord > z.sud && z.est > z.ouest;
  return Array.isArray(z.anneaux) && z.anneaux.length > 0 && z.anneaux[0].length >= 4;
}

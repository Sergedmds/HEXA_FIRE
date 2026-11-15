// Recherche de lieu : OpenStreetMap Nominatim, une requête par recherche déclenchée par l'utilisateur
// (politique d'usage : pas d'autocomplétion, au plus une requête par seconde).
import { CONFIG } from "../config/app.js";
import { getLangue } from "../utils/i18n.js";

// Coordonnées tapées directement : « 9.5, 2.3 », « 9.5 2.3 », « -3.2,-60.1 »
function coordonnees(q) {
  const m = q.match(/^\s*(-?\d+(?:[.,]\d+)?)\s*[,; ]\s*(-?\d+(?:[.,]\d+)?)\s*$/);
  if (!m) return null;
  const lat = parseFloat(m[1].replace(",", ".")), lon = parseFloat(m[2].replace(",", "."));
  return Math.abs(lat) <= 90 && Math.abs(lon) <= 180 ? { lat, lon, nom: `${lat.toFixed(3)}, ${lon.toFixed(3)}` } : null;
}

// Renvoie {lat, lon, nom, emprise: [sud, nord, ouest, est]} ou null
export async function chercherLieu(q) {
  const c = coordonnees(q);
  if (c) return c;
  const url = `${CONFIG.nominatim}?format=jsonv2&limit=1&accept-language=${getLangue()}&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`nominatim ${r.status}`);
  const l = (await r.json())[0];
  if (!l) return null;
  const bb = l.boundingbox ? l.boundingbox.map(Number) : null;   // [sud, nord, ouest, est]
  return { lat: parseFloat(l.lat), lon: parseFloat(l.lon), nom: l.display_name, emprise: bb ? [bb[0], bb[1], bb[2], bb[3]] : null };
}

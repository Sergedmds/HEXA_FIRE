// Code written with the help of Claude (Anthropic), a Super Intelligence (SI) assistant, then run and tested by team HEXAFIRE.
// Accès aux fichiers publiés par le moteur (backend/hexafire/publication.py, format v2) :
//   index.json, tuiles/t_<ilat>_<ilon>.json (0,25°), cartes/m_<t>.json (1°), pays.geojson (facultatif).
// Calcule la série mensuelle d'une zone en sommant les cellules dont le centre est dans la zone.
import { CONFIG } from "../config/app.js";
import { centreCellule, dansZone, emprise } from "../utils/geo.js";

let index = null;
let promesseIndex = null;
const cacheTuiles = new Map();
const cacheCartes = new Map();

export function chargerIndex(base = CONFIG.dataBase) {
  if (promesseIndex) return promesseIndex;
  promesseIndex = (async () => {
    const r = await fetch(`${base}/index.json`, { cache: "no-cache" });
    if (!r.ok) throw new Error(`index.json introuvable (${r.status})`);
    index = await r.json();
    index.base = base;
    index.nMois = index.mois.length;
    index.tuilesSet = new Set(index.tuiles);
    index.annees = [...new Set(index.mois.map(m => m.annee))];
    index.moisObserves = index.mois.filter(m => m.statut !== "non observé");
    return index;
  })();
  promesseIndex.catch(() => { promesseIndex = null; });
  return promesseIndex;
}

export function getIndex() { return index; }
export const viirsDisponible = () => !!(index && index.unites && index.unites.viirs);

// Liste des pays : [{code, nom_fr, nom_en, anneaux}] ou [] si pays.geojson n'est pas publié
let promessePays = null;
export function chargerPays() {
  if (promessePays) return promessePays;
  promessePays = (async () => {
    try {
      const r = await fetch(`${index.base}/pays.geojson`);
      if (!r.ok) return [];
      const gj = await r.json();
      return gj.features.map(f => {
        const p = f.properties || {}, g = f.geometry;
        const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
        return { type: "pays", code: p.ISO_A3 && p.ISO_A3 !== "-99" ? p.ISO_A3 : (p.ADM0_A3 || p.NAME),
                 nom_fr: p.NAME_FR || p.NAME || "?", nom_en: p.NAME_EN || p.NAME || "?", anneaux: polys.flat() };
      }).filter(p => p.anneaux.length).sort((a, b) => a.nom_fr.localeCompare(b.nom_fr, "fr"));
    } catch { return []; }
  })();
  return promessePays;
}

function tuilesTouchees(zone) {
  const [s, n, o, e] = emprise(zone), T = index.taille_tuile, ids = [];
  for (let i = Math.max(0, Math.floor((s + 90) / T)); i <= Math.min(Math.floor(180 / T) - 1, Math.floor((n + 90) / T)); i++)
    for (let j = Math.floor((o + 180) / T); j <= Math.floor((e + 180) / T); j++) {
      const id = `${i}_${((j % (360 / T)) + 360 / T) % (360 / T)}`;
      if (index.tuilesSet.has(id) && !ids.includes(id)) ids.push(id);
    }
  return ids;
}

function tuile(id) {
  if (!cacheTuiles.has(id)) cacheTuiles.set(id, fetch(`${index.base}/tuiles/t_${id}.json`).then(r => r.json()));
  return cacheTuiles.get(id);
}

// Série mensuelle de la zone.
//   valeurs : harmonisé équivalent MODIS ; viirs : équivalent VIIRS (si publié) ; brut : détections brutes de la source
//   du mois ; frp : FRP totale (MW) ; lignes : détail cellule × mois [cellule, lat, lon, t, v, b, w, p].
//   sdModis / sdViirs : écart type de conversion de la zone (même facteur dans une strate : écarts types additionnés ;
//   strates indépendantes : variances additionnées).
export async function serieZone(zone) {
  const n = index.nMois;
  const valeurs = new Float64Array(n), brut = new Float64Array(n), viirs = new Float64Array(n), frp = new Float64Array(n);
  const parStrateE = new Map(), parStrateF = new Map();
  const B = index.taille_bloc || 10, nLonB = Math.round(360 / B), pas = index.pas_grille;
  let aViirs = true, aIncert = false;
  const cellules = new Set(), lignes = [];
  const tuiles = await Promise.all(tuilesTouchees(zone).map(tuile));
  for (const tu of tuiles) {
    let derniere = -1, dedans = false, lat = 0, lon = 0, strate = 0;
    for (let k = 0; k < tu.cellules.length; k++) {
      const c = tu.cellules[k];
      if (c !== derniere) {
        [lat, lon] = centreCellule(c, pas);
        dedans = dansZone(zone, lat, lon);
        strate = Math.floor((90 - lat) / B) * nLonB + Math.floor((lon + 180) / B);
        derniere = c;
        if (dedans) cellules.add(c);
      }
      if (!dedans) continue;
      const tt = tu.t[k];
      valeurs[tt] += tu.v[k];
      const b = tu.b ? tu.b[k] : NaN;
      brut[tt] += b;
      const w = tu.w ? tu.w[k] : NaN;
      if (tu.w) viirs[tt] += w; else aViirs = false;
      if (tu.p) frp[tt] += tu.p[k];
      if (tu.e) {
        aIncert = true;
        for (const [m, x] of [[parStrateE, tu.e[k]], [parStrateF, tu.f[k]]]) {
          if (!m.has(strate)) m.set(strate, new Float64Array(n));
          m.get(strate)[tt] += x;
        }
      }
      lignes.push([c, lat, lon, tt, tu.v[k], b, w, tu.p ? tu.p[k] : NaN]);
    }
  }
  const combiner = m => {
    const sd = new Float64Array(n);
    for (const a of m.values()) for (let i = 0; i < n; i++) sd[i] += a[i] * a[i];
    return sd.map(Math.sqrt);
  };
  return { zone, valeurs, viirs: aViirs ? viirs : null, brut, frp, lignes, nCellules: cellules.size, emprise: emprise(zone),
           sdModis: aIncert ? combiner(parStrateE) : null, sdViirs: aIncert ? combiner(parStrateF) : null };
}

// Couche de la carte pour le mois t : {c, v, w, r} sur une grille de index.carte.pas degrés (null si absente)
export function carteMois(t) {
  if (!index.carte) return Promise.resolve(null);
  if (!cacheCartes.has(t)) cacheCartes.set(t, fetch(`${index.base}/${index.carte.modele.replace("{t}", t)}`)
    .then(r => (r.ok ? r.json() : null)).catch(() => null));
  return cacheCartes.get(t);
}

// Dernier mois observé et quelques repères pour les bandeaux
export function reperes() {
  const obs = index.moisObserves;
  const dernier = obs[obs.length - 1], premier = index.mois[0];
  const tot = index.totaux || null;
  return { premier, dernier, nMois: index.nMois, nObserves: obs.length,
           totalDernier: tot ? tot.v[dernier.t] : null,
           totalAnnee: tot ? index.mois.filter(m => m.annee === dernier.annee).reduce((s, m) => s + (tot.v[m.t] || 0), 0) : null,
           totalPeriode: tot ? tot.v.reduce((s, x) => s + x, 0) : null };
}

// Statistiques d'une série de zone : normale 2003–2020 (médiane par mois de l'année), classes d'écart,
// intervalle de conversion à 95 %, palettes des données.
import { t } from "./i18n.js";

// Rampe séquentielle thermique (sombre → braise → blanc chaud), échelle logarithmique
export const SEQUENTIELLE = ["#141c33", "#2b2550", "#5c2a45", "#93311f", "#cc4514", "#ff5a1f", "#ffa23d", "#ffd27a", "#fff1cf"];
// Classes d'écart à la normale (divergente froid → chaud), lisibles par les daltonismes courants
export const CLASSES = [
  { cle: "tres_inf", couleur: "#2a4fd6", max: 0.5 },
  { cle: "inf", couleur: "#8fa6ff", max: 0.8 },
  { cle: "normale", couleur: "#3a4258", max: 1.25 },
  { cle: "sup", couleur: "#ffb547", max: 2 },
  { cle: "tres_sup", couleur: "#ff5a1f", max: Infinity },
];
export const COULEUR_REFUS = "#232a3d";
export const nomClasse = c => t("cl." + c.cle);
export const nomClasseCourt = c => t("cl.court." + c.cle);
export const classeDe = rapport => CLASSES.find(c => rapport < c.max) || CLASSES[4];
const OBSERVE = new Set(["mesuré", "converti", "provisoire"]);

export function quantile(v, q) {
  if (!v.length) return NaN;
  const s = [...v].sort((a, b) => a - b), p = (s.length - 1) * q, i = Math.floor(p);
  return s[i] + (s[Math.min(i + 1, s.length - 1)] - s[i]) * (p - i);
}

export function couleurNiveau(v, max) {
  if (v <= 0) return SEQUENTIELLE[0];
  const x = Math.log1p(v) / Math.log1p(Math.max(max, 1));
  return SEQUENTIELLE[Math.min(SEQUENTIELLE.length - 1, 1 + Math.floor(x * (SEQUENTIELLE.length - 1)))];
}

// valeursSeuil : série équivalent MODIS, sur laquelle s'applique le seuil « médiane >= 5 », pour que le même
// mois soit accepté ou refusé quelle que soit l'unité affichée.
export function statistiques(index, valeurs, valeursSeuil = valeurs, ecartsTypes = null, brut = null, frp = null) {
  const [r0, r1] = index.periode_reference;
  const parMois = Array.from({ length: 12 }, () => []), parMoisSeuil = Array.from({ length: 12 }, () => []);
  index.mois.forEach((m, tt) => {
    if (OBSERVE.has(m.statut) && m.annee >= r0 && m.annee <= r1) {
      parMois[m.mois - 1].push(valeurs[tt]); parMoisSeuil[m.mois - 1].push(valeursSeuil[tt]);
    }
  });
  const medSeuil = parMoisSeuil.map(v => quantile(v, 0.5));
  const mediane = parMois.map(v => quantile(v, 0.5));
  const moyenne = parMois.map(v => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN));
  const q1 = parMois.map(v => quantile(v, 0.25)), q3 = parMois.map(v => quantile(v, 0.75));
  const cases = index.mois.map((m, tt) => {
    const v = OBSERVE.has(m.statut) || m.statut === "couverture partielle" ? valeurs[tt] : null;
    const k = m.mois - 1, med = mediane[k], nRef = parMois[k].length;
    let rapport = null, classe = null, refus = null;
    if (v !== null) {
      if (nRef < 10) refus = "ref_insuffisante";
      else if (!(medSeuil[k] >= 5)) refus = "effectif_faible";
      else { rapport = v / med; classe = classeDe(rapport); }
    }
    const rang = v === null ? null : parMois[k].filter(x => x < v).length / Math.max(nRef, 1);
    let bas = null, haut = null, incertain = false;
    const sd = ecartsTypes ? ecartsTypes[tt] : 0;
    if (v !== null && v > 0 && sd > 0) {
      const r = 1.96 * sd / v;
      bas = v * Math.exp(-r); haut = v * Math.exp(r);
      if (rapport !== null) incertain = classeDe(bas / med) !== classeDe(haut / med);
    }
    return { ...m, t: tt, valeur: v, mediane: med, moyenne: moyenne[k], rapport, classe, refus, rang, bas, haut, incertain,
             brut: brut && v !== null ? brut[tt] : null,
             frpMoy: frp && brut && v !== null && brut[tt] > 0 ? frp[tt] / brut[tt] : null };
  });
  return { cases, mediane, moyenne, q1, q3 };
}

// Résumé d'une année : total, écart à la normale annuelle, mois de pic, nombre de mois observés
export function resumeAnnee(stats, annee) {
  const cs = stats.cases.filter(c => c.annee === annee && c.valeur !== null);
  const total = cs.reduce((s, c) => s + c.valeur, 0);
  const normale = cs.reduce((s, c) => s + (Number.isFinite(c.mediane) ? c.mediane : 0), 0);
  const pic = cs.reduce((p, c) => (p === null || c.valeur > p.valeur ? c : p), null);
  return { annee, total, normale, rapport: normale > 0 ? total / normale : null, pic, nMois: cs.length };
}

// Années complètes classées par total décroissant
export function classementAnnees(stats) {
  const parAn = new Map();
  for (const c of stats.cases) if (c.valeur !== null) {
    const a = parAn.get(c.annee) || { s: 0, n: 0 }; a.s += c.valeur; a.n++; parAn.set(c.annee, a);
  }
  return [...parAn].filter(([, a]) => a.n === 12).map(([an, a]) => ({ annee: an, total: a.s })).sort((a, b) => b.total - a.total);
}

// Calendrier années × mois en SVG (niveau ou écart à la normale) et sa légende.
import { t, nomMois } from "../utils/i18n.js";
import { CLASSES, SEQUENTIELLE, COULEUR_REFUS, couleurNiveau, nomClasse } from "../utils/stats.js";

const NS = "http://www.w3.org/2000/svg";
const FOND = "#0d1426";

function el(nom, attrs = {}, parent) {
  const e = document.createElementNS(NS, nom);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

// Dessine le calendrier ; renvoie l'élément SVG (réutilisé pour l'export d'image).
//   survol(c, ev) : infobulle ; clic(c) : sélection d'un mois ; periode : [debut, fin] ; selectionT : mois surligné
export function dessinerCalendrier(conteneur, stats, mode, { survol = () => {}, clic = null, periode = null, selectionT = null } = {}) {
  const cases = periode ? stats.cases.filter(c => c.annee >= periode[0] && c.annee <= periode[1]) : stats.cases;
  const annees = [...new Set(cases.map(c => c.annee))].sort((a, b) => b - a);   // année récente en haut
  const L = 52, H = 22, G = 2, X0 = 50, Y0 = 24;
  const w = X0 + 12 * (L + G) + 10, h = Y0 + annees.length * (H + G) + 6;
  const max = Math.max(1, ...cases.filter(c => c.valeur !== null).map(c => c.valeur));
  conteneur.innerHTML = "";
  const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, width: "100%", role: "img", "aria-label": t("cal.aria"), xmlns: NS, style: `max-width:${w}px` });
  conteneur.appendChild(svg);
  const defs = el("defs", {}, svg);
  const motif = el("pattern", { id: "hachure", width: 5, height: 5, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
  el("line", { x1: 0, y1: 0, x2: 0, y2: 5, stroke: "#6c7a99", "stroke-width": 1.1 }, motif);
  el("rect", { width: w, height: h, fill: FOND, class: "fond-svg", rx: 6 }, svg);
  t("mois").forEach((m, k) => {
    const tx = el("text", { x: X0 + k * (L + G) + L / 2, y: 15, "text-anchor": "middle" }, svg); tx.textContent = m.toUpperCase();
  });
  annees.forEach((a, i) => {
    const tx = el("text", { x: X0 - 8, y: Y0 + i * (H + G) + H - 5, "text-anchor": "end" }, svg); tx.textContent = a;
  });
  for (const c of cases) {
    const x = X0 + (c.mois - 1) * (L + G), y = Y0 + annees.indexOf(c.annee) * (H + G);
    let fill = "none";
    if (c.valeur !== null) fill = mode === "anomalie" ? (c.classe ? c.classe.couleur : COULEUR_REFUS) : couleurNiveau(c.valeur, max);
    const g = el("g", { "data-t": c.t, style: clic ? "cursor:pointer" : "" }, svg);
    el("rect", { x, y, width: L, height: H, fill, rx: 2, stroke: c.statut === "non observé" ? "#3a4258" : FOND,
      class: c.statut === "non observé" ? "" : "sep-svg", "stroke-dasharray": c.statut === "non observé" ? "3 2" : "none" }, g);
    if (c.statut === "couverture partielle" || c.statut === "non observé")
      el("rect", { x, y, width: L, height: H, fill: "url(#hachure)", opacity: 0.8 }, g);
    if (c.statut === "converti" || c.statut === "provisoire")
      el("path", { d: `M${x + L - 7} ${y} L${x + L} ${y} L${x + L} ${y + 7} Z`, fill: "#eaf0ff", opacity: 0.4 }, g);
    if (c.valeur === 0) el("circle", { cx: x + L / 2, cy: y + H / 2, r: 1.6, fill: "#6c7a99" }, g);
    if (mode === "anomalie" && c.incertain)
      el("rect", { x: x + 1.5, y: y + 1.5, width: L - 3, height: H - 3, fill: "none", stroke: "#eaf0ff", "stroke-width": 1, "stroke-dasharray": "2 2" }, g);
    if (c.t === selectionT)
      el("rect", { x: x - 1, y: y - 1, width: L + 2, height: H + 2, fill: "none", stroke: "#ffb547", "stroke-width": 1.6, rx: 3 }, g);
    g.addEventListener("mousemove", ev => survol(c, ev));
    g.addEventListener("mouseleave", () => survol(null));
    if (clic) g.addEventListener("click", () => clic(c));
  }
  return svg;
}

export function dessinerLegende(conteneur, mode) {
  const m = [];
  if (mode === "anomalie") for (const c of CLASSES) m.push(`<span><i style="background:${c.couleur}"></i>${nomClasse(c)}</span>`);
  else m.push(`<span>${t("lg.faible")} <i style="background:linear-gradient(90deg,${SEQUENTIELLE.join(",")});width:90px"></i> ${t("lg.fort")}</span>`);
  m.push(`<span>${t("lg.converti")}</span><span>${t("lg.partiel")}</span><span>${t("lg.zero")}</span>`);
  if (mode === "anomalie") m.push(`<span>${t("lg.incertain")}</span><span><i style="background:${COULEUR_REFUS}"></i>${t("lg.refus")}</span>`);
  conteneur.innerHTML = m.join("");
}

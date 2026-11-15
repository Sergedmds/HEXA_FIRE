// Graphiques SVG sans bibliothèque : profil saisonnier, saison cumulée, brut vs harmonisé,
// courbes de comparaison A / B, tableaux (années, mois inhabituels, validation).
import { t, nf, nomMois } from "../utils/i18n.js";
import { quantile } from "../utils/stats.js";

const NS = "http://www.w3.org/2000/svg";
const C = { fire: "#ff5a1f", amber: "#ffb547", orbital: "#4c6fff", orbitalSoft: "#b8c3ff", grey: "#6c7a99", grid: "#1e2742", text: "#9aa8c7" };

function el(nom, attrs = {}, parent) {
  const e = document.createElementNS(NS, nom);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}
function texte(parent, x, y, s, attrs = {}) { const e = el("text", { x, y, fill: C.text, "font-size": 11, ...attrs }, parent); e.textContent = s; return e; }
function svgBase(conteneur, w, h, titre) {
  conteneur.innerHTML = "";
  const s = el("svg", { viewBox: `0 0 ${w} ${h}`, width: "100%", role: "img", "aria-label": titre, style: "font-family:'Space Grotesk',monospace;overflow:visible" });
  conteneur.appendChild(s);
  return s;
}
function axeY(s, x0, x1, y0, y1, max, n = 4) {
  for (let i = 0; i <= n; i++) {
    const v = (max * i) / n, y = y1 - ((y1 - y0) * i) / n;
    el("line", { x1: x0, x2: x1, y1: y, y2: y, stroke: C.grid, class: "grille-svg", "stroke-dasharray": i ? "2 4" : "none" }, s);
    texte(s, x0 - 6, y + 4, nf(v, 0, v >= 10000), { "text-anchor": "end" });
  }
}
const lisse = pts => pts.length < 2 ? "" : pts.reduce((d, [x, y], i, a) => {
  if (!i) return `M${x},${y}`;
  const [px, py] = a[i - 1], cx = (px + x) / 2;
  return `${d} C${cx},${py} ${cx},${y} ${x},${y}`;
}, "");

export function profilSaisonnier(conteneur, stats) {
  const W = 720, H = 230, x0 = 52, y0 = 18, y1 = H - 28, L = (W - x0 - 12) / 12;
  const max = Math.max(1, ...stats.q3.filter(Number.isFinite), ...stats.mediane.filter(Number.isFinite));
  const s = svgBase(conteneur, W, H, t("g.profil_aria"));
  axeY(s, x0, W - 8, y0, y1, max);
  const Y = v => y1 - ((y1 - y0) * v) / max;
  const pic = stats.mediane.indexOf(Math.max(...stats.mediane.filter(Number.isFinite)));
  stats.mediane.forEach((m, k) => {
    if (!Number.isFinite(m)) return;
    const x = x0 + k * L + 7, bw = L - 14;
    el("rect", { x, y: Y(m), width: bw, height: Math.max(0, y1 - Y(m)), rx: 2, fill: k === pic ? C.fire : "rgba(255,181,71,.55)" }, s);
    el("line", { x1: x + bw / 2, x2: x + bw / 2, y1: Y(stats.q1[k]), y2: Y(stats.q3[k]), stroke: "#eaf0ff", "stroke-width": 1.5, opacity: .8 }, s);
    texte(s, x + bw / 2, H - 9, nomMois(k).toUpperCase(), { "text-anchor": "middle", "font-size": 10 });
  });
  texte(s, x0, 10, t("g.profil_note"), { "font-size": 10 });
}

export function saisonCumulee(conteneur, stats) {
  const cases = stats.cases.filter(c => c.valeur !== null);
  if (!cases.length) { conteneur.textContent = t("g.pas_donnees"); return; }
  const k0 = (stats.mediane.indexOf(Math.min(...stats.mediane.map(x => (Number.isFinite(x) ? x : Infinity)))) + 1) % 12;
  const saisons = new Map();
  for (const c of cases) {
    const k = c.mois - 1, an = k >= k0 ? c.annee : c.annee - 1;
    if (!saisons.has(an)) saisons.set(an, new Array(12).fill(null));
    saisons.get(an)[(k - k0 + 12) % 12] = c.valeur;
  }
  const cumul = arr => { let sum = 0; return arr.map(v => (v === null ? null : (sum += v))); };
  const ref = [...saisons].filter(([a, v]) => a >= 2003 && a <= 2019 && v.every(x => x !== null)).map(([, v]) => cumul(v));
  const ans = [...saisons.keys()].sort((a, b) => a - b), enCours = ans[ans.length - 1];
  const courant = cumul(saisons.get(enCours));
  const med = [], p10 = [], p90 = [];
  for (let i = 0; i < 12; i++) { const col = ref.map(r => r[i]); med.push(quantile(col, .5)); p10.push(quantile(col, .1)); p90.push(quantile(col, .9)); }
  const W = 720, H = 240, x0 = 60, y0 = 18, y1 = H - 28, L = (W - x0 - 24) / 11;
  const max = Math.max(1, ...p90.filter(Number.isFinite), ...courant.filter(v => v !== null));
  const s = svgBase(conteneur, W, H, t("g.saison_aria"));
  axeY(s, x0, W - 8, y0, y1, max);
  const X = i => x0 + i * L, Y = v => y1 - ((y1 - y0) * v) / max;
  if (ref.length) {
    const haut = p90.map((v, i) => `${X(i)},${Y(v)}`), bas = p10.map((v, i) => `${X(i)},${Y(v)}`).reverse();
    el("polygon", { points: haut.concat(bas).join(" "), fill: "rgba(76,111,255,.16)" }, s);
    el("path", { d: lisse(med.map((v, i) => [X(i), Y(v)])), fill: "none", stroke: C.orbitalSoft, "stroke-dasharray": "5 4", "stroke-width": 1.5 }, s);
  }
  const pts = courant.map((v, i) => (v === null ? null : [X(i), Y(v)])).filter(Boolean);
  el("path", { d: lisse(pts), fill: "none", stroke: C.fire, "stroke-width": 2.5, "stroke-linecap": "round" }, s);
  if (pts.length) el("circle", { cx: pts.at(-1)[0], cy: pts.at(-1)[1], r: 4, fill: C.fire, stroke: "#eaf0ff", "stroke-width": 1.5 }, s);
  for (let i = 0; i < 12; i++) texte(s, X(i), H - 9, nomMois((k0 + i) % 12).toUpperCase(), { "text-anchor": "middle", "font-size": 10 });
  texte(s, x0, 10, t("g.saison_note", enCours, enCours + 1), { "font-size": 10 });
}

export function brutHarmonise(conteneur, index, serie) {
  const parAn = new Map();
  index.mois.forEach((m, tt) => {
    if (!parAn.has(m.annee)) parAn.set(m.annee, { v: 0, b: 0, n: 0, sd: 0 });
    const a = parAn.get(m.annee); a.v += serie.valeurs[tt]; a.b += serie.brut[tt]; a.n++;
    a.sd += serie.sdModis ? serie.sdModis[tt] : 0;
  });
  const ans = [...parAn].filter(([, a]) => a.n === 12).map(([an]) => an);
  if (!ans.length || ans.every(a => !Number.isFinite(parAn.get(a).b))) { conteneur.textContent = t("g.brut_absent"); return; }
  const W = 720, H = 250, x0 = 66, y0 = 20, y1 = H - 28, L = (W - x0 - 24) / Math.max(ans.length - 1, 1);
  const max = Math.max(1, ...ans.map(a => Math.max(parAn.get(a).v, parAn.get(a).b)));
  const s = svgBase(conteneur, W, H, t("g.brut_aria"));
  axeY(s, x0, W - 8, y0, y1, max);
  const X = i => x0 + i * L, Y = v => y1 - ((y1 - y0) * v) / max;
  const iB = ans.findIndex(a => a >= 2021);
  if (iB > 0) {
    el("line", { x1: X(iB) - L / 2, x2: X(iB) - L / 2, y1: y0, y2: y1, stroke: C.amber, "stroke-dasharray": "4 3", opacity: .7 }, s);
    texte(s, X(iB) - L / 2 + 5, y0 + 10, t("g.bascule"), { "font-size": 10, fill: C.amber });
  }
  el("polyline", { points: ans.map((a, i) => `${X(i)},${Y(parAn.get(a).b)}`).join(" "), fill: "none", stroke: C.grey, "stroke-width": 2 }, s);
  if (serie.sdModis) {
    const lim = (a, signe) => { const p = parAn.get(a); return p.v > 0 ? p.v * Math.exp(signe * 1.96 * p.sd / p.v) : 0; };
    const haut = ans.map((a, i) => `${X(i)},${Y(Math.min(lim(a, 1), max))}`), bas = ans.map((a, i) => `${X(i)},${Y(lim(a, -1))}`).reverse();
    el("polygon", { points: haut.concat(bas).join(" "), fill: C.fire, "fill-opacity": 0.2 }, s);
  }
  el("polyline", { points: ans.map((a, i) => `${X(i)},${Y(parAn.get(a).v)}`).join(" "), fill: "none", stroke: C.fire, "stroke-width": 2.5, "stroke-linejoin": "round" }, s);
  ans.forEach((a, i) => { if (a % 5 === 0) texte(s, X(i), H - 9, a, { "text-anchor": "middle", "font-size": 10 }); });
  texte(s, x0, 10, t("g.brut_note"), { "font-size": 10 });
  if (serie.sdModis) conteneur.appendChild(Object.assign(document.createElement("p"), { className: "muted", style: "font-size:.8rem;margin-top:.4rem", textContent: t("g.bande") }));
}

// Deux séries de 12 valeurs (A en bleu orbital, B en orange braise), avec aire dégradée sous chaque courbe
export function courbesComparaison(conteneur, a, b, { libelleA = "A", libelleB = "B", k0 = 0 } = {}) {
  const W = 1000, H = 280, x0 = 64, y0 = 20, y1 = H - 30, L = (W - x0 - 30) / 11;
  const vals = [...a, ...b].filter(Number.isFinite);
  const max = Math.max(1, ...vals);
  const s = svgBase(conteneur, W, H, `${libelleA} / ${libelleB}`);
  const defs = el("defs", {}, s);
  for (const [id, col] of [["gA", C.orbital], ["gB", C.fire]]) {
    const g = el("linearGradient", { id, x1: 0, x2: 0, y1: 0, y2: 1 }, defs);
    el("stop", { offset: "0%", "stop-color": col, "stop-opacity": .35 }, g);
    el("stop", { offset: "100%", "stop-color": col, "stop-opacity": 0 }, g);
  }
  axeY(s, x0, W - 10, y0, y1, max);
  const X = i => x0 + i * L, Y = v => y1 - ((y1 - y0) * v) / max;
  const trace = (serie, col, grad) => {
    const pts = serie.map((v, i) => (Number.isFinite(v) ? [X(i), Y(v)] : null)).filter(Boolean);
    if (!pts.length) return;
    el("path", { d: `${lisse(pts)} L${pts.at(-1)[0]},${y1} L${pts[0][0]},${y1} Z`, fill: `url(#${grad})` }, s);
    el("path", { d: lisse(pts), fill: "none", stroke: col, "stroke-width": 3, "stroke-linecap": "round" }, s);
    const imax = serie.indexOf(Math.max(...serie.filter(Number.isFinite)));
    if (imax >= 0) el("circle", { cx: X(imax), cy: Y(serie[imax]), r: 5, fill: col, stroke: "#eaf0ff", "stroke-width": 1.5 }, s);
  };
  trace(a, C.orbital, "gA"); trace(b, C.fire, "gB");
  for (let i = 0; i < 12; i++) texte(s, X(i), H - 10, nomMois((k0 + i) % 12).toUpperCase(), { "text-anchor": "middle", "font-size": 11 });
}

export function tableAnnees(conteneur, classement) {
  const ligne = (x, i) => `<tr><td>${x.annee}</td><td class="num">${nf(x.total)}</td><td class="num">${i}</td></tr>`;
  const haut = classement.slice(0, 5).map((x, i) => ligne(x, i + 1)), bas = classement.slice(-5).map((x, i) => ligne(x, classement.length - 4 + i));
  conteneur.innerHTML = `<table><thead><tr><th>${t("t.annee")}</th><th class="num">${t("t.total")}</th><th class="num">${t("t.rang")}</th></tr></thead>
    <tbody>${haut.join("")}${classement.length > 10 ? '<tr><td colspan="3" class="dim">…</td></tr>' : ""}${classement.length > 5 ? bas.join("") : ""}</tbody></table>`;
}

export function tableInhabituels(conteneur, stats) {
  const l = stats.cases.filter(c => c.rapport !== null && c.rapport > 0)
    .sort((a, b) => Math.abs(Math.log(b.rapport)) - Math.abs(Math.log(a.rapport))).slice(0, 8);
  conteneur.innerHTML = `<table><thead><tr><th>${t("t.mois")}</th><th class="num">${t("t.valeur")}</th><th class="num">${t("t.x_mediane")}</th></tr></thead><tbody>${
    l.map(c => `<tr><td>${nomMois(c.mois - 1)} ${c.annee}</td><td class="num">${nf(c.valeur)}</td><td class="num" style="color:${c.classe.couleur}">${nf(c.rapport, 2)}</td></tr>`).join("")}</tbody></table>`;
}

export function tableValidation(conteneur, validation) {
  if (!validation || !validation.length) { conteneur.innerHTML = `<p class="muted">${t("v.absente")}</p>`; return; }
  const cibles = { kappa: [v => v >= 0.5, `≥ ${nf(0.5, 1)}`], fausses_anomalies: [v => v <= 0.15, `≤ ${nf(0.15, 2)}`],
    biais_median: [v => Math.abs(v) < 0.1, `|·| < ${nf(0.1, 2)}`], erreur_mediane: [v => v < 0.25, `< ${nf(0.25, 2)}`],
    marche_max_annee: [v => v < 0.1, `< ${nf(0.1, 2)}`] };
  const lignes = Object.keys(cibles).map(k => `<tr><td>${t("v." + k)}</td><td class="dim">${cibles[k][1]}</td>${validation.map(v => {
    const x = v[k]; const ok = cibles[k][0](x);
    return `<td class="num ${ok ? "ok" : "ko"}">${nf(x, 3)} ${ok ? "✓" : "✗"}</td>`; }).join("")}</tr>`);
  conteneur.innerHTML = `<div style="overflow-x:auto"><table><thead><tr><th>${t("v.critere")}</th><th>${t("v.cible")}</th>${validation.map(v => `<th class="num">${t("meth." + v.methode)}</th>`).join("")}</tr></thead>
    <tbody>${lignes.join("")}</tbody></table></div><p class="muted" style="font-size:.8rem;margin-top:.6rem">${t("v.note")}</p>`;
}

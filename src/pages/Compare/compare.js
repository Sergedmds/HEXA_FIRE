// Code written with the help of Claude (Anthropic), a Super Intelligence (SI) assistant, then run and tested by team HEXAFIRE.
// Page Comparer : deux zones (A, B) et deux années, sur la même échelle harmonisée.
import { CONFIG } from "../../config/app.js";
import { monterShell, signalerExemple, afficherErreurDonnees } from "../../layouts/shell.js";
import { t, nf, nomMois, nomMoisLong, getLangue, ajouterTextes, surChangementLangue, appliquerTextes } from "../../utils/i18n.js";
import { chargerIndex, chargerPays, serieZone, getIndex } from "../../services/data.js";
import { creerGlobe } from "../../components/globe.js";
import { courbesComparaison } from "../../components/charts.js";
import { icon } from "../../components/icons.js";
import { statistiques, resumeAnnee, classeDe, nomClasseCourt } from "../../utils/stats.js";
import { decrireZone, aireZone, centroide, coordDMS, nomPays, zoneValide } from "../../utils/geo.js";
import { encoder, decoder, encoderZone, decoderZone, copier } from "../../utils/link.js";

ajouterTextes({
  fr: {
    "co.doc": "HEXAFIRE · Comparer", "co.chip": "Comparer",
    "co.h1": "Comparer l'activité des feux entre lieux et époques",
    "co.lead": "Choisissez deux endroits ou deux années et voyez lequel a connu le plus de feux, à quel moment de l'année, et si c'était plus ou moins que d'habitude.",
    "co.m_count": "Points chauds", "co.m_density": "Densité", "co.m_anom": "Écart à la normale", "co.m_frp": "FRP moyenne",
    "co.help_niveau": "Nombre de points chauds chaque mois.", "co.help_densite": "Points chauds pour une même surface, pour comparer des zones de tailles différentes.",
    "co.help_anomalie": "Comparé au niveau habituel de chaque mois (1 = comme d'habitude, 2 = deux fois plus).", "co.help_frp": "Chaleur moyenne dégagée par chaque point chaud, en mégawatts.",
    "co.A": "Zone de référence", "co.B": "Zone comparée", "co.domain": "Zone", "co.year": "Année", "co.choose": "Choisir une zone…",
    "co.g_regions": "Régions suggérées", "co.g_pays": "Pays", "co.list": "Liste", "co.point": "Point + rayon",
    "co.swap": "Permuter A et B", "co.run": "Comparer", "co.link": "Copier le lien", "co.link_ok": "Lien copié ✓",
    "co.note_cfg": (a, ya, b, yb) => `Fenêtres temporelles indépendantes : ${a} (${ya}) vs ${b} (${yb}).`,
    "co.empty": "Choisissez deux zones et deux années, puis « Comparer ».", "co.computing": "Calcul…",
    "co.spatial": "Répartition spatiale", "co.total": "Total", "co.density": "Densité", "co.per": "pour 10 000 km²", "co.peak": "Mois de pic", "co.vs": "× la normale annuelle",
    "co.evolution": "Comment l'activité évolue-t-elle au fil de l'année ?", "co.evolution_sub": m => `Douze mois côte à côte · ${m}`,
    "co.synthesis": "Synthèse", "co.d1": "Volume et densité", "co.d2": "Saisonnalité", "co.d3": "Écart à la normale",
    "co.d1_text": (b, a, r, da, db) => `<b>${b}</b> a connu ${r} fois plus de points chauds que <b>${a}</b>.`,
    "co.d2_text": (a, ma, b, mb, d) => `Les feux culminent en ${ma} pour <b>${a}</b> et en ${mb} pour <b>${b}</b>${d === 0 ? ", au même moment." : `, à ${d} mois d'écart.`}`,
    "co.d3_text": (a, ra, ca, b, rb, cb) => `Par rapport à une année habituelle, <b>${a}</b> a été ${ca} (${ra} fois l'habitude) et <b>${b}</b> ${cb} (${rb} fois l'habitude).`,
    "co.gauge1": "Densité A / B", "co.gauge2": "Part du total sur 3 mois de pic", "co.gauge3": "Écart annuel",
    "co.note_title": "Bon à savoir", "co.note": "Un point chaud est une parcelle de terrain vue par un satellite comme beaucoup plus chaude que ses alentours, le plus souvent un feu. Ce n'est pas un incendie compté un par un : les nuages peuvent cacher des feux, et un grand feu peut produire plusieurs points chauds.",
    "co.note_link": "Lire le guide", "co.nd": "n.d.",
  },
  en: {
    "co.doc": "HEXAFIRE · Compare", "co.chip": "Compare",
    "co.h1": "Compare fire activity across places and time",
    "co.lead": "Pick two places or two years and see which one had more fires, at what time of year, and whether it was more or less than usual.",
    "co.m_count": "Hotspots", "co.m_density": "Density", "co.m_anom": "Departure from normal", "co.m_frp": "Mean FRP",
    "co.help_niveau": "Number of hotspots each month.", "co.help_densite": "Hotspots for the same surface, to compare areas of different sizes.",
    "co.help_anomalie": "Compared with the usual level of each month (1 = as usual, 2 = twice as much).", "co.help_frp": "Average heat given off by each hotspot, in megawatts.",
    "co.A": "Baseline area", "co.B": "Compared area", "co.domain": "Area", "co.year": "Year", "co.choose": "Choose an area…",
    "co.g_regions": "Suggested regions", "co.g_pays": "Countries", "co.list": "List", "co.point": "Point + radius",
    "co.swap": "Swap A and B", "co.run": "Compare", "co.link": "Copy link", "co.link_ok": "Link copied ✓",
    "co.note_cfg": (a, ya, b, yb) => `Independent time windows: ${a} (${ya}) vs ${b} (${yb}).`,
    "co.empty": "Choose two areas and two years, then “Compare”.", "co.computing": "Computing…",
    "co.spatial": "Spatial distribution", "co.total": "Total", "co.density": "Density", "co.per": "per 10,000 km²", "co.peak": "Peak month", "co.vs": "× the annual normal",
    "co.evolution": "How does activity evolve through the year?", "co.evolution_sub": m => `Twelve months side by side · ${m}`,
    "co.synthesis": "Synthesis", "co.d1": "Volume and density", "co.d2": "Seasonality", "co.d3": "Departure from normal",
    "co.d1_text": (b, a, r, da, db) => `<b>${b}</b> had ${r} times as many hotspots as <b>${a}</b>.`,
    "co.d2_text": (a, ma, b, mb, d) => `Fires peak in ${ma} for <b>${a}</b> and in ${mb} for <b>${b}</b>${d === 0 ? ", at the same time." : `, ${d} month(s) apart.`}`,
    "co.d3_text": (a, ra, ca, b, rb, cb) => `Compared with a usual year, <b>${a}</b> was ${ca} (${ra} times usual) and <b>${b}</b> ${cb} (${rb} times usual).`,
    "co.gauge1": "Density A / B", "co.gauge2": "Share of total in the 3 peak months", "co.gauge3": "Annual departure",
    "co.note_title": "Good to know", "co.note": "A hotspot is a patch of land that a satellite saw as much hotter than its surroundings, most often a fire. It is not a wildfire counted one by one: clouds can hide fires, and one large fire can produce several hotspots.",
    "co.note_link": "Read the guide", "co.nd": "n/a",
  },
});

const $ = id => document.getElementById(id);
const etat = { metric: "niveau", A: { zone: null, annee: null, mode: "liste", serie: null, stats: null, globe: null }, B: { zone: null, annee: null, mode: "liste", serie: null, stats: null, globe: null } };
let pays = [];
const COUL = { A: "#4c6fff", B: "#ff5a1f" };

// ---------------------------------------------------------------- configuration des entités
function optionsZones(sel, zone) {
  const l = getLangue();
  const perso = zone && !sel ? `<option value="perso" selected>${decrireZone(zone)}</option>` : "";
  const regions = CONFIG.suggestions.map(s => `<option value="r:${s.id}" ${sel === "r:" + s.id ? "selected" : ""}>${l === "en" ? s.nom_en : s.nom_fr}</option>`).join("");
  const ps = pays.map(p => `<option value="p:${p.code}" ${sel === "p:" + p.code ? "selected" : ""}>${nomPays(p)}</option>`).join("");
  return `<option value="">${t("co.choose")}</option>${perso}<optgroup label="${t("co.g_regions")}">${regions}</optgroup>${ps ? `<optgroup label="${t("co.g_pays")}">${ps}</optgroup>` : ""}`;
}
function cleZone(z) { if (!z) return ""; if (z.type === "pays") return "p:" + z.code; if (z.id) return "r:" + z.id; return ""; }
function zoneDepuisCle(k) {
  if (k.startsWith("r:")) { const s = CONFIG.suggestions.find(x => x.id === k.slice(2)); return s ? { ...s.zone, id: s.id, nom_fr: s.nom_fr, nom_en: s.nom_en } : null; }
  if (k.startsWith("p:")) return pays.find(p => p.code === k.slice(2)) || null;
  return null;
}
const nomZone = z => (z ? (z.nom_fr ? (getLangue() === "en" ? z.nom_en : z.nom_fr) : decrireZone(z)) : "—");

function dessinerEntite(id) {
  const e = etat[id], annees = getIndex().annees;
  const z = e.zone;
  $(`entity-${id}`).className = `entity ${id}`;
  $(`entity-${id}`).innerHTML = `
    <div class="head"><span class="row"><span class="badge">[${id}]</span><span class="telemetry">${t("co." + id)}</span></span>
      <span class="telemetry ${id === "A" ? "orbital" : "fire"}" id="area-${id}">${z ? `${nf(aireZone(z), 0, true)} km²` : ""}</span></div>
    <div class="seg" role="group"><button type="button" data-mode="liste" class="${e.mode === "liste" ? "active" : ""}">${t("co.list")}</button><button type="button" data-mode="point" class="${e.mode === "point" ? "active" : ""}">${t("co.point")}</button></div>
    <div class="fields ${e.mode}">
      ${e.mode === "liste" ? `<label class="field"><span>${t("co.domain")}</span><select class="select" data-k="zone">${optionsZones(cleZone(z), z)}</select></label>`
        : `<label class="field"><span>${t("zone.lat")}</span><input class="input" data-k="lat" type="number" step="0.01" min="-90" max="90" value="${z && z.type === "cercle" ? z.lat : ""}"></label>
           <label class="field"><span>${t("zone.lon")}</span><input class="input" data-k="lon" type="number" step="0.01" min="-180" max="180" value="${z && z.type === "cercle" ? z.lon : ""}"></label>
           <label class="field"><span>${t("zone.rayon")} (km)</span><input class="input" data-k="rayon" type="number" step="5" min="10" max="2000" value="${z && z.type === "cercle" ? z.rayon : 150}"></label>`}
      <label class="field"><span>${t("co.year")}</span><select class="select" data-k="annee">${annees.map(a => `<option ${a === e.annee ? "selected" : ""}>${a}</option>`).join("")}</select></label>
    </div>
    <div class="foot"><span>MODIS 1 km + VIIRS 375 m · ${t("u.modis_court")}</span><span id="desc-${id}">${z ? decrireZone(z) : ""}</span></div>`;
  const root = $(`entity-${id}`);
  root.querySelectorAll("[data-mode]").forEach(b => (b.onclick = () => { e.mode = b.dataset.mode; if (e.mode === "point" && !(z && z.type === "cercle")) e.zone = null; dessinerEntite(id); }));
  root.querySelector('[data-k="annee"]').onchange = ev => { e.annee = +ev.target.value; };
  const sel = root.querySelector('[data-k="zone"]');
  if (sel) sel.onchange = () => { if (sel.value === "perso") return; e.zone = zoneDepuisCle(sel.value); dessinerEntite(id); };
  for (const k of ["lat", "lon", "rayon"]) {
    const inp = root.querySelector(`[data-k="${k}"]`);
    if (inp) inp.onchange = () => { const v = key => parseFloat(root.querySelector(`[data-k="${key}"]`).value); const zz = { type: "cercle", lat: v("lat"), lon: v("lon"), rayon: v("rayon") || 150 }; e.zone = zoneValide(zz) ? zz : null; $(`area-${id}`).textContent = e.zone ? `${nf(aireZone(e.zone), 0, true)} km²` : ""; $(`desc-${id}`).textContent = e.zone ? decrireZone(e.zone) : ""; };
  }
}

function noteConfig() {
  const { A, B } = etat;
  $("config-note").textContent = A.zone && B.zone ? t("co.note_cfg", nomZone(A.zone), A.annee, nomZone(B.zone), B.annee) : "";
}

// ---------------------------------------------------------------- calcul et rendu
function valeursMetrique(e) {
  const cs = e.stats.cases.filter(c => c.annee === e.annee).sort((a, b) => a.mois - b.mois);
  const aire = aireZone(e.zone);
  const v = new Array(12).fill(NaN);
  for (const c of cs) {
    if (c.valeur === null) continue;
    v[c.mois - 1] = etat.metric === "niveau" ? c.valeur : etat.metric === "densite" ? (c.valeur / aire) * 1e4
      : etat.metric === "anomalie" ? (c.rapport === null ? NaN : c.rapport) : (c.frpMoy === null ? NaN : c.frpMoy);
  }
  return v;
}

async function comparer() {
  const { A, B } = etat;
  if (!zoneValide(A.zone) || !zoneValide(B.zone)) { $("empty").hidden = false; return; }
  $("run").textContent = t("co.computing"); $("run").disabled = true;
  const idx = getIndex();
  for (const e of [A, B]) {
    e.serie = await serieZone(e.zone);
    e.stats = statistiques(idx, e.serie.valeurs, e.serie.valeurs, e.serie.sdModis, e.serie.brut, e.serie.frp);
  }
  $("run").textContent = t("co.run"); $("run").disabled = false;
  $("empty").hidden = true; $("results").hidden = false;
  history.replaceState(null, "", encoder({ a: encoderZone(A.zone), ya: A.annee, b: encoderZone(B.zone), yb: B.annee, m: etat.metric, l: getLangue() }));
  noteConfig();
  rendre();
}

function rendre() {
  const { A, B } = etat;
  if (!A.stats || !B.stats) return;
  for (const id of ["A", "B"]) viewport(id);
  const vA = valeursMetrique(A), vB = valeursMetrique(B);
  $("evolution-sub").textContent = t("co.evolution_sub", t("co.help_" + etat.metric));
  courbesComparaison($("curves"), vA, vB, { libelleA: `${nomZone(A.zone)} (${A.annee})`, libelleB: `${nomZone(B.zone)} (${B.annee})` });
  $("curve-legend").innerHTML = `<span><i style="background:${COUL.A};box-shadow:0 0 8px ${COUL.A}"></i>${nomZone(A.zone)} (${A.annee})</span><span><i style="background:${COUL.B};box-shadow:0 0 8px ${COUL.B}"></i>${nomZone(B.zone)} (${B.annee})</span>`;
  synthese();
}

function resume(id) {
  const e = etat[id], r = resumeAnnee(e.stats, e.annee), aire = aireZone(e.zone);
  const cs = e.stats.cases.filter(c => c.annee === e.annee && c.valeur !== null).sort((a, b) => b.valeur - a.valeur);
  const top3 = cs.slice(0, 3).reduce((s, c) => s + c.valeur, 0);
  return { ...r, aire, densite: aire > 0 ? (r.total / aire) * 1e4 : NaN, partPic: r.total > 0 ? top3 / r.total : NaN };
}

function viewport(id) {
  const e = etat[id], r = resume(id), [la, lo] = centroide(e.zone);
  const el = $(`view-${id}`);
  const deja = !!e.globe;
  if (!deja) el.innerHTML = `
    <div class="ribbon"><span class="row"><span class="badge">[${id}]</span><span class="name" data-f="name"></span></span><span class="row telemetry"><span class="${id === "A" ? "orbital" : "fire"}" data-f="coords"></span><span class="dim" data-f="year"></span></span></div>
    <div class="globe"><div id="globe-${id}"></div><span class="chip hud" data-f="hud"></span><span class="chip scale" data-f="area"></span></div>
    <div class="stats">
      <div class="stat"><span class="label">${t("co.total")}</span><span class="value" data-f="total"></span><span class="ctx">${t("u.modis_court")}</span></div>
      <div class="stat"><span class="label">${t("co.density")}</span><span class="value accent" data-f="density"></span><span class="ctx">${t("co.per")}</span></div>
      <div class="stat"><span class="label">${t("co.peak")}</span><span class="value" style="font-size:1.05rem" data-f="peak"></span><span class="ctx" data-f="vs"></span></div>
    </div>`;
  el.className = `viewport ${id}`;
  const f = k => el.querySelector(`[data-f="${k}"]`);
  f("name").textContent = nomZone(e.zone); f("coords").textContent = coordDMS(la, lo); f("year").textContent = e.annee;
  f("hud").innerHTML = `<span class="pip ${id === "A" ? "orbital" : ""}"></span>${t("zone." + (e.zone.type === "cercle" ? "point" : e.zone.type))}`;
  f("area").textContent = `≈ ${nf(r.aire, 0, true)} km² · ${nf(e.serie.nCellules)} × 0,25°`;
  f("total").textContent = nf(r.total); f("density").textContent = nf(r.densite, 1);
  f("peak").textContent = r.pic ? nomMoisLong(r.pic.mois - 1) : t("co.nd");
  f("vs").textContent = r.rapport ? `${nf(r.rapport, 2)} ${t("co.vs")}` : t("co.nd");
  if (!deja) {
    creerGlobe($(`globe-${id}`), { etiquettes: true, rotation: false, surZone: z => { if (z.type === "point") { e.mode = "point"; e.zone = { type: "cercle", lat: z.lat, lon: z.lon, rayon: e.zone.type === "cercle" ? e.zone.rayon : 150 }; dessinerEntite(id); comparer(); } } })
      .then(g => { e.globe = g; g.activer("cercle"); g.afficher(e.zone, { marge: 40 }); })
      .catch(() => { $(`globe-${id}`).innerHTML = `<p class="notice" style="margin:1rem">${t("err.maplibre")}</p>`; });
  } else e.globe.afficher(e.zone, { marge: 40 });
}

function synthese() {
  const { A, B } = etat, rA = resume("A"), rB = resume("B"), nA = nomZone(A.zone), nB = nomZone(B.zone);
  const ratio = rA.total > 0 ? rB.total / rA.total : NaN;
  const dPic = rA.pic && rB.pic ? Math.min(Math.abs(rA.pic.mois - rB.pic.mois), 12 - Math.abs(rA.pic.mois - rB.pic.mois)) : null;
  const densMax = Math.max(rA.densite, rB.densite, 1e-9);
  const cl = r => (r.rapport ? nomClasseCourt(classeDe(r.rapport)) : t("co.nd"));
  const carte = (titre, ic, col, texte, jauge, barres) => `<article class="card synth"><div class="row between telemetry" style="color:${col}"><span>${titre}</span>${icon(ic)}</div>
    <p>${texte}</p><div class="gauge"><div class="row between"><span>${jauge}</span></div>${barres}</div></article>`;
  const barre = (w, col) => `<div class="bar" style="margin-top:4px"><i style="width:${Math.max(2, Math.min(100, w))}%;background:${col}"></i></div>`;
  $("synthesis").innerHTML = [
    carte(t("co.d1"), "layers", COUL.A, t("co.d1_text", nB, nA, nf(ratio, 2), nf(rA.densite, 1), nf(rB.densite, 1)), t("co.gauge1"),
      barre((rA.densite / densMax) * 100, COUL.A) + barre((rB.densite / densMax) * 100, COUL.B)),
    carte(t("co.d2"), "calendar", "#ffb547", t("co.d2_text", nA, rA.pic ? nomMoisLong(rA.pic.mois - 1) : t("co.nd"), nB, rB.pic ? nomMoisLong(rB.pic.mois - 1) : t("co.nd"), dPic ?? "?"), t("co.gauge2"),
      barre(rA.partPic * 100, COUL.A) + barre(rB.partPic * 100, COUL.B)),
    carte(t("co.d3"), "fire", COUL.B, t("co.d3_text", nA, nf(rA.rapport, 2), cl(rA), nB, nf(rB.rapport, 2), cl(rB)), t("co.gauge3"),
      barre((rA.rapport || 0) * 50, rA.rapport ? classeDe(rA.rapport).couleur : "#555") + barre((rB.rapport || 0) * 50, rB.rapport ? classeDe(rB.rapport).couleur : "#555")),
  ].join("");
}

// ---------------------------------------------------------------- démarrage
async function demarrer() {
  monterShell({ page: "compare" });
  $("swap").innerHTML = icon("swap"); $("ico-info").innerHTML = icon("info");
  let idx;
  try { idx = await chargerIndex(); } catch { afficherErreurDonnees($("empty")); $("empty").className = ""; return; }
  signalerExemple(idx);
  pays = await chargerPays();
  const lien = decoder();
  const dernier = idx.annees.at(-1);
  etat.A.annee = idx.annees.includes(+lien.get("ya")) ? +lien.get("ya") : Math.max(idx.annees[0], dernier - 1);
  etat.B.annee = idx.annees.includes(+lien.get("yb")) ? +lien.get("yb") : dernier;
  if (["niveau", "densite", "anomalie", "frp"].includes(lien.get("m"))) etat.metric = lien.get("m");
  const resoudre = s => { const z = decoderZone(s); if (!z) return null; if (z.type === "pays") return pays.find(p => p.code === z.code) || null;
    const sug = CONFIG.suggestions.find(x => x.zone.type === z.type && JSON.stringify(x.zone) === JSON.stringify({ ...z })); return sug ? { ...sug.zone, id: sug.id, nom_fr: sug.nom_fr, nom_en: sug.nom_en } : z; };
  etat.A.zone = resoudre(lien.get("a")); etat.B.zone = resoudre(lien.get("b"));
  if (!etat.A.zone && !etat.B.zone) {   // proposition par défaut : deux régions suggérées
    etat.A.zone = zoneDepuisCle("r:afrique_ouest"); etat.B.zone = zoneDepuisCle("r:amazonie");
  }
  for (const e of [etat.A, etat.B]) if (e.zone && e.zone.type === "cercle") e.mode = "point";
  $("metric").querySelectorAll("button").forEach(b => { b.classList.toggle("active", b.dataset.metric === etat.metric); b.onclick = () => { etat.metric = b.dataset.metric; $("metric").querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b)); $("metric-help").textContent = t("co.help_" + etat.metric); if (etat.A.stats) { rendre(); history.replaceState(null, "", encoder({ a: encoderZone(etat.A.zone), ya: etat.A.annee, b: encoderZone(etat.B.zone), yb: etat.B.annee, m: etat.metric, l: getLangue() })); } }; });
  $("metric-help").textContent = t("co.help_" + etat.metric);
  dessinerEntite("A"); dessinerEntite("B"); noteConfig();
  $("run").onclick = comparer;
  $("swap").onclick = () => { const a = etat.A, b = etat.B; etat.A = { ...b, globe: a.globe }; etat.B = { ...a, globe: b.globe }; dessinerEntite("A"); dessinerEntite("B"); if (etat.A.stats && etat.B.stats) rendre(); noteConfig(); };
  $("link").onclick = async () => { await copier(location.href); $("link").textContent = t("co.link_ok"); setTimeout(() => ($("link").textContent = t("co.link")), 2000); };
  surChangementLangue(() => { dessinerEntite("A"); dessinerEntite("B"); noteConfig(); $("metric-help").textContent = t("co.help_" + etat.metric); if (etat.A.stats) { $("view-A").innerHTML = ""; $("view-B").innerHTML = ""; etat.A.globe = etat.B.globe = null; rendre(); } });
  appliquerTextes();
  if (lien.get("a") && lien.get("b")) comparer();
}
demarrer();

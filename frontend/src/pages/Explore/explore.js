// Code written with the help of Claude (Anthropic), a Super Intelligence (SI) assistant, then run and tested by team HEXAFIRE.
// Page Explorer : globe, sélection d'une zone, calendrier harmonisé, analyses, couche mensuelle, exports.
import { CONFIG } from "../../config/app.js";
import { monterShell, signalerExemple, afficherErreurDonnees } from "../../layouts/shell.js";
import { t, nf, nomMois, nomMoisLong, getLangue, ajouterTextes, surChangementLangue, appliquerTextes } from "../../utils/i18n.js";
import { chargerIndex, chargerPays, serieZone, carteMois, getIndex, viirsDisponible, reperes } from "../../services/data.js";
import { chercherLieu } from "../../services/geocode.js";
import { exporterCSV, exporterCellules, exporterJSON, exporterPNG, exporterSVG } from "../../services/export.js";
import { creerGlobe } from "../../components/globe.js";
import { dessinerCalendrier, dessinerLegende } from "../../components/calendar.js";
import { dessinerCartesMois } from "../../components/monthCards.js";
import { profilSaisonnier, saisonCumulee, brutHarmonise, tableAnnees, tableInhabituels, tableValidation } from "../../components/charts.js";
import { montrer as bulle, cacher as cacherBulle } from "../../components/tooltip.js";
import { icon } from "../../components/icons.js";
import { statistiques, classementAnnees, resumeAnnee, classeDe, nomClasse, nomClasseCourt, couleurNiveau, CLASSES, SEQUENTIELLE, COULEUR_REFUS } from "../../utils/stats.js";
import { centreCellule, decrireZone, aireZone, centroide, coordDMS, nomPays, zoneValide } from "../../utils/geo.js";
import { encoder, decoder, encoderZone, decoderZone, copier } from "../../utils/link.js";

ajouterTextes({
  fr: {
    "ex.doc": "HEXAFIRE · Explorer le globe", "ex.chip": "Série harmonisée MODIS + VIIRS · 2000 → aujourd'hui",
    "ex.titre": "Explorer le monde", "ex.sous": "Choisissez n'importe quelle région du globe et lisez son histoire du feu, mois par mois, depuis novembre 2000.",
    "ex.ctrl": "Choix de la zone", "ex.search_ph": "Rechercher un lieu, un pays ou des coordonnées (lat, lon)…", "ex.search_aria": "Rechercher un lieu",
    "ex.suggest": "Régions suggérées :", "ex.tools": "Mode de sélection", "ex.apply": "Appliquer", "ex.undo": "Annuler le dernier point", "ex.finish": "Fermer le polygone",
    "ex.tool_pays": "Pays", "ex.tool_rect": "Rectangle", "ex.tool_cercle": "Point + rayon", "ex.tool_poly": "Polygone",
    "ex.g_cercle": "Cliquez sur le globe, cherchez un lieu ou saisissez des coordonnées. Le rayon se règle au curseur.",
    "ex.g_rect": "Cliquez deux coins opposés sur le globe, ou saisissez l'emprise.",
    "ex.g_poly": "Cliquez les sommets sur le globe, puis double-cliquez ou « Fermer le polygone ».",
    "ex.g_pays": "Choisissez un pays dans la liste.", "ex.g_calc": "Calcul de la série…",
    "ex.poly_n": n => `${n} sommet(s)`, "ex.searching": "Recherche…",
    "ex.target": "Zone sélectionnée", "ex.coords": "Centre", "ex.latest": "Dernier mois disponible", "ex.total_year": a => `Total ${a}`,
    "ex.total_ctx": (r, c) => `${r} × la normale${c ? " · " + c : ""}`, "ex.km2": "km²",
    "ex.clear": "Effacer", "ex.link": "Copier le lien", "ex.link_ok": "Lien copié ✓", "ex.export": "Exporter",
    "ex.x_csv": "Calendrier (CSV)", "ex.x_cells": "Cellules × mois (CSV)", "ex.x_png": "Calendrier (PNG)", "ex.x_svg": "Calendrier (SVG)",
    "ex.globe": "Globe interactif", "ex.globe_aria": "Globe où tracer ou choisir votre zone", "ex.stage_source": "NASA FIRMS · MODIS 1 km & VIIRS 375 m",
    "ex.months": (n, a, b) => `${n} mois · ${a} → ${b}`, "ex.zoom": z => `zoom ${z}`,
    "ex.layer": "Couche du mois", "ex.l_none": "Aucune", "ex.l_level": "Points chauds", "ex.l_anom": "Écart",
    "ex.prev": "Mois précédent", "ex.next": "Mois suivant", "ex.play": "Lecture", "ex.pause": "Pause", "ex.month_slider": "Mois affiché",
    "ex.zoom_in": "Zoom avant", "ex.zoom_out": "Zoom arrière", "ex.zoom_reset": "Vue initiale",
    "ex.r_months": "Mois publiés", "ex.r_last": "Dernier mois", "ex.r_total": "Points chauds (équiv. MODIS)", "ex.r_normal": "Normale", "ex.r_kappa": "Accord de la conversion (kappa)",
    "ex.cycle": "Cycle annuel", "ex.cycle_sub": (a, n) => `Points chauds par mois en ${a}, comparés à la normale 2003–2020 (barre grise). Cliquez un mois pour l'afficher sur le globe. ${n}`,
    "ex.calendar": "Calendrier 2000 → aujourd'hui", "ex.calendar_sub": "Une ligne par année, une colonne par mois. Survolez une case pour le détail ; cliquez pour l'afficher sur le globe.",
    "ex.m_level": "Nombre", "ex.m_anom": "Écart à la normale", "ex.from": "De", "ex.to": "À",
    "ex.unit_help": "Même série, exprimée dans l'échelle d'un capteur (équivalent MODIS Terra + Aqua, ou VIIRS S-NPP). L'écart à la normale ne dépend pas de l'unité.",
    "ex.i_last": "Dernier mois", "ex.i_ecart": "Écart à la normale", "ex.i_pic": "Mois de pic habituel", "ex.i_rank": a => `Rang de ${a}`, "ex.rank": (r, n) => `${r}e / ${n}`,
    "ex.i_total": (v, d0, d1) => `${v} points chauds sur ${d0}–${d1}`, "ex.i_med": "médiane 2003–2020", "ex.x_med": v => `${v} × la normale`, "ex.ic": (a, b) => `IC 95 % ${a}–${b}`,
    "ex.h_profile": "Saison type : les mois qui brûlent le plus", "ex.h_season": "Saison en cours comparée aux saisons passées",
    "ex.h_years": "Années les plus et les moins actives", "ex.h_unusual": "Mois les plus inhabituels",
    "ex.h_sensors": "Sans harmonisation, le changement de satellite crée une fausse hausse", "ex.h_sensors_sub": "Totaux annuels de la zone : détections brutes (MODIS jusqu'en 2020, VIIRS ensuite) et série harmonisée.",
    "ex.h_validation": "VIIRS converti donne-t-il le même verdict que MODIS ? (validation « une année exclue »)",
    "ex.cells_ctx": n => `${n} cellules de 0,25° actives`,
  },
  en: {
    "ex.doc": "HEXAFIRE · Explore the globe", "ex.chip": "Harmonized MODIS + VIIRS series · 2000 → today",
    "ex.titre": "Explore the world", "ex.sous": "Pick any region of the globe and read its fire history, month by month, since November 2000.",
    "ex.ctrl": "Area selection", "ex.search_ph": "Search a place, a country or coordinates (lat, lon)…", "ex.search_aria": "Search a place",
    "ex.suggest": "Suggested regions:", "ex.tools": "Selection mode", "ex.apply": "Apply", "ex.undo": "Undo last point", "ex.finish": "Close polygon",
    "ex.tool_pays": "Country", "ex.tool_rect": "Rectangle", "ex.tool_cercle": "Point + radius", "ex.tool_poly": "Polygon",
    "ex.g_cercle": "Click the globe, search a place or type coordinates. Adjust the radius with the slider.",
    "ex.g_rect": "Click two opposite corners on the globe, or type the bounds.",
    "ex.g_poly": "Click the vertices on the globe, then double-click or “Close polygon”.",
    "ex.g_pays": "Choose a country in the list.", "ex.g_calc": "Computing the series…",
    "ex.poly_n": n => `${n} vertex(es)`, "ex.searching": "Searching…",
    "ex.target": "Selected area", "ex.coords": "Centre", "ex.latest": "Latest month available", "ex.total_year": a => `Total ${a}`,
    "ex.total_ctx": (r, c) => `${r} × the normal${c ? " · " + c : ""}`, "ex.km2": "km²",
    "ex.clear": "Clear", "ex.link": "Copy link", "ex.link_ok": "Link copied ✓", "ex.export": "Export",
    "ex.x_csv": "Calendar (CSV)", "ex.x_cells": "Cells × months (CSV)", "ex.x_png": "Calendar (PNG)", "ex.x_svg": "Calendar (SVG)",
    "ex.globe": "Interactive globe", "ex.globe_aria": "Globe where you draw or pick your area", "ex.stage_source": "NASA FIRMS · MODIS 1 km & VIIRS 375 m",
    "ex.months": (n, a, b) => `${n} months · ${a} → ${b}`, "ex.zoom": z => `zoom ${z}`,
    "ex.layer": "Monthly layer", "ex.l_none": "None", "ex.l_level": "Hotspots", "ex.l_anom": "Departure",
    "ex.prev": "Previous month", "ex.next": "Next month", "ex.play": "Play", "ex.pause": "Pause", "ex.month_slider": "Displayed month",
    "ex.zoom_in": "Zoom in", "ex.zoom_out": "Zoom out", "ex.zoom_reset": "Reset view",
    "ex.r_months": "Published months", "ex.r_last": "Latest month", "ex.r_total": "Hotspots (MODIS eq.)", "ex.r_normal": "Normal", "ex.r_kappa": "Conversion agreement (kappa)",
    "ex.cycle": "Annual cycle", "ex.cycle_sub": (a, n) => `Hotspots per month in ${a}, compared with the 2003–2020 normal (grey bar). Click a month to show it on the globe. ${n}`,
    "ex.calendar": "Calendar 2000 → today", "ex.calendar_sub": "One row per year, one column per month. Hover a cell for details; click to show it on the globe.",
    "ex.m_level": "Count", "ex.m_anom": "Departure from normal", "ex.from": "From", "ex.to": "To",
    "ex.unit_help": "Same series, expressed on one sensor's scale (MODIS Terra + Aqua equivalent, or VIIRS S-NPP). The departure from normal does not depend on the unit.",
    "ex.i_last": "Latest month", "ex.i_ecart": "Departure from normal", "ex.i_pic": "Usual peak month", "ex.i_rank": a => `Rank of ${a}`, "ex.rank": (r, n) => `#${r} / ${n}`,
    "ex.i_total": (v, d0, d1) => `${v} hotspots over ${d0}–${d1}`, "ex.i_med": "2003–2020 median", "ex.x_med": v => `${v} × the normal`, "ex.ic": (a, b) => `95% CI ${a}–${b}`,
    "ex.h_profile": "Typical season: the months that burn most", "ex.h_season": "Current season compared with past seasons",
    "ex.h_years": "Most and least active years", "ex.h_unusual": "Most unusual months",
    "ex.h_sensors": "Without harmonization, the change of satellite creates a false increase", "ex.h_sensors_sub": "Annual totals of the area: raw detections (MODIS until 2020, VIIRS after) and harmonized series.",
    "ex.h_validation": "Does converted VIIRS give the same verdict as MODIS? (leave-one-year-out validation)",
    "ex.cells_ctx": n => `${n} active 0.25° cells`,
  },
});

const $ = id => document.getElementById(id);
const etat = { outil: "cercle", zone: null, serie: null, stats: null, mode: "niveau", unite: "modis", periode: null, annee: null,
               couche: "niveau", coucheT: null, lecture: null, svg: null, calcul: 0 };
let globe = null, pays = [], moisCarte = [];
const uniteCourte = () => t(etat.unite === "viirs" ? "u.viirs_court" : "u.modis_court");
const valeursCourantes = () => (etat.unite === "viirs" && etat.serie.viirs ? etat.serie.viirs : etat.serie.valeurs);

// ---------------------------------------------------------------- outils de sélection
const OUTILS = [["pays", "flag"], ["rect", "square"], ["cercle", "point"], ["poly", "polygon"]];

function dessinerOutils() {
  $("tools").innerHTML = OUTILS.map(([id, ic]) => `<button type="button" data-tool="${id}" class="${etat.outil === id ? "active" : ""}">${icon(ic)}<span>${t("ex.tool_" + id)}</span></button>`).join("");
  $("tools").querySelectorAll("button").forEach(b => (b.onclick = () => choisirOutil(b.dataset.tool)));
}

function choisirOutil(o) {
  etat.outil = o;
  $("tools").querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.tool === o));
  document.querySelectorAll("[data-params]").forEach(p => (p.hidden = p.dataset.params !== o));
  $("guidance-text").textContent = t("ex.g_" + o);
  $("poly-state").textContent = "";
  if (globe) globe.activer(o);
}

function dessinerSuggestions() {
  $("suggestions").innerHTML = CONFIG.suggestions.map((s, i) => `<button type="button" class="pill" data-i="${i}"><span class="pip ${i % 2 ? "amber" : ""}"></span>${getLangue() === "en" ? s.nom_en : s.nom_fr}</button>`).join("");
  $("suggestions").querySelectorAll(".pill").forEach(b => (b.onclick = () => {
    const s = CONFIG.suggestions[+b.dataset.i];
    choisirOutil("rect");
    appliquerZone({ ...s.zone, nom: getLangue() === "en" ? s.nom_en : s.nom_fr, nom_fr: s.nom_fr, nom_en: s.nom_en });
  }));
}

function remplirPays() {
  const sel = $("in-pays");
  if (!pays.length) { sel.innerHTML = `<option value="">—</option>`; sel.disabled = true; $("pays-state").textContent = t("zone.pays_indispo"); return; }
  const v = sel.value;
  const tries = [...pays].sort((a, b) => nomPays(a).localeCompare(nomPays(b), getLangue()));
  sel.innerHTML = `<option value="">${t("zone.pays_choisir")}</option>` + tries.map(p => `<option value="${p.code}">${nomPays(p)}</option>`).join("");
  sel.value = v;
}

// ---------------------------------------------------------------- zone
function surZoneGlobe(z) {
  if (z.type === "point") {
    $("in-lat").value = z.lat.toFixed(2); $("in-lon").value = z.lon.toFixed(2);
    z = { type: "cercle", lat: z.lat, lon: z.lon, rayon: +$("radius").value || 150 };
    appliquerZone(z, { cadrer: false });
    return;
  }
  if (z.type === "rect") {
    $("in-sud").value = z.sud.toFixed(2); $("in-nord").value = z.nord.toFixed(2); $("in-ouest").value = z.ouest.toFixed(2); $("in-est").value = z.est.toFixed(2);
  }
  appliquerZone(z, { cadrer: false });
}

async function appliquerZone(zone, { cadrer = true } = {}) {
  if (!zoneValide(zone)) return;
  etat.zone = zone;
  if (globe) globe.afficher(zone, { cadrer });
  $("guidance-text").textContent = t("ex.g_calc");
  const id = ++etat.calcul;
  etat.serie = await serieZone(zone);
  if (id !== etat.calcul) return;   // une sélection plus récente a pris le relais
  if (!etat.annee) etat.annee = reperes().dernier.annee;
  if (!etat.periode) etat.periode = [getIndex().annees[0], getIndex().annees.at(-1)];
  etat.stats = calculerStats();
  $("selection").hidden = false; $("results").hidden = false;
  $("guidance-text").textContent = t("ex.g_" + etat.outil);
  majLien();
  rafraichir();
}

function effacerZone() {
  etat.zone = null; etat.serie = null; etat.stats = null;
  $("selection").hidden = true; $("results").hidden = true;
  if (globe) { globe.effacer(); globe.reinitialiser(); }
  history.replaceState(null, "", location.pathname);
}

function calculerStats() {
  const idx = getIndex(), viirs = etat.unite === "viirs" && etat.serie.viirs;
  const st = statistiques(idx, valeursCourantes(), etat.serie.valeurs, viirs ? etat.serie.sdViirs : etat.serie.sdModis, etat.serie.brut, etat.serie.frp);
  if (viirs) {   // le verdict incertain est celui de l'équivalent MODIS (le facteur se simplifie dans le rapport)
    const sm = statistiques(idx, etat.serie.valeurs, etat.serie.valeurs, etat.serie.sdModis);
    st.cases.forEach((c, i) => (c.incertain = sm.cases[i].incertain));
  }
  return st;
}

// ---------------------------------------------------------------- rendu des résultats
function rafraichir() {
  if (!etat.stats) return;
  bandeau();
  annees();
  cartesMois();
  calendrier();
  indicateurs();
  profilSaisonnier($("g-profil"), etat.stats); saisonCumulee($("g-saison"), etat.stats);
  tableAnnees($("t-annees"), classementAnnees(etat.stats)); tableInhabituels($("t-inhabituels"), etat.stats);
  brutHarmonise($("g-capteurs"), getIndex(), etat.serie); tableValidation($("t-validation"), getIndex().validation);
}

function bandeau() {
  const z = etat.zone, [la, lo] = centroide(z), aire = aireZone(z);
  $("sel-name").textContent = decrireZone(z);
  $("sel-type").textContent = t("zone." + (z.type === "cercle" ? "point" : z.type));
  $("sel-coords").textContent = coordDMS(la, lo);
  $("sel-area").textContent = `${t("zone.aire")} ≈ ${nf(aire, 0, aire >= 100000)} ${t("ex.km2")} · ${t("ex.cells_ctx", nf(etat.serie.nCellules))}`;
  const r = resumeAnnee(etat.stats, etat.annee);
  $("sel-year-label").textContent = t("ex.total_year", etat.annee);
  $("sel-total").textContent = nf(r.total);
  $("sel-total-ctx").textContent = r.rapport ? t("ex.total_ctx", nf(r.rapport, 2), uniteCourte()) : uniteCourte();
  const cases = etat.stats.cases.filter(c => c.valeur !== null), d = cases.at(-1);
  $("sel-last").textContent = d ? nf(d.valeur) : t("nd");
  $("sel-last-ctx").textContent = d ? `${nomMois(d.mois - 1)} ${d.annee} · ${t("statut." + d.statut)}${d.classe ? " · " + nomClasseCourt(d.classe) : ""}` : "";
  if (etat.serie.nCellules === 0) $("sel-area").textContent += ` · ${t("zone.vide")}`;
}

function annees() {
  const liste = getIndex().annees;
  $("years").innerHTML = liste.map(a => `<button type="button" role="tab" aria-selected="${a === etat.annee}" class="${a === etat.annee ? "active" : ""}" data-a="${a}">${a}</button>`).join("");
  $("years").querySelectorAll("button").forEach(b => (b.onclick = () => { etat.annee = +b.dataset.a; majLien(); annees(); cartesMois(); bandeau(); }));
  const actif = $("years").querySelector(".active");
  if (actif) actif.scrollIntoView({ block: "nearest", inline: "center" });
}

function cartesMois() {
  const r = resumeAnnee(etat.stats, etat.annee);
  $("cycle-sub").textContent = t("ex.cycle_sub", etat.annee, r.pic ? `${t("ex.i_pic")} : ${nomMoisLong(r.pic.mois - 1)}.` : "");
  dessinerCartesMois($("month-cards"), etat.stats, etat.annee, { uniteCourte: uniteCourte(), selectionT: etat.couche !== "aucune" ? etat.coucheT : null,
    clic: c => { if (c.valeur === null) return; if (etat.couche === "aucune") choisirCouche("niveau"); choisirMois(c.t); } });
}

function calendrier() {
  const sel = etat.couche !== "aucune" ? etat.coucheT : null;
  etat.svg = dessinerCalendrier($("calendar"), etat.stats, etat.mode, { survol, periode: etat.periode, selectionT: sel,
    clic: c => { if (c.valeur === null) return; if (etat.couche === "aucune") choisirCouche("niveau"); etat.annee = c.annee; choisirMois(c.t); annees(); } });
  dessinerLegende($("legend"), etat.mode);
}

function indicateurs() {
  const [d0, d1] = etat.periode;
  const cases = etat.stats.cases.filter(c => c.valeur !== null), dernier = cases.at(-1);
  const total = cases.filter(c => c.annee >= d0 && c.annee <= d1).reduce((s, c) => s + c.valeur, 0);
  const med = etat.stats.mediane.map(x => (Number.isFinite(x) ? x : -1)), pic = med.indexOf(Math.max(...med));
  const completes = classementAnnees(etat.stats);
  const dansPeriode = completes.filter(x => x.annee >= d0 && x.annee <= d1).sort((a, b) => b.annee - a.annee)[0];
  const rang = dansPeriode ? completes.findIndex(x => x.annee === dansPeriode.annee) + 1 : null;
  const ecart = dernier && dernier.rapport !== null ? t("ex.x_med", nf(dernier.rapport, 2)) : (dernier && dernier.refus ? t("refus." + dernier.refus) : t("nd"));
  const items = [
    [t("ex.i_last"), dernier ? nf(dernier.valeur) : t("nd"), dernier ? `${nomMois(dernier.mois - 1)} ${dernier.annee} · ${t("statut." + dernier.statut)} · ${uniteCourte()}${dernier.bas !== null ? ` · ${t("ex.ic", nf(dernier.bas), nf(dernier.haut))}` : ""}` : ""],
    [t("ex.i_ecart"), ecart, dernier && dernier.classe ? nomClasse(dernier.classe) : "", dernier && dernier.classe ? dernier.classe.couleur : ""],
    [t("ex.i_pic"), pic >= 0 && med[pic] > 0 ? nomMoisLong(pic) : t("nd"), t("ex.i_med")],
    [t("ex.i_rank", dansPeriode ? dansPeriode.annee : ""), dansPeriode ? t("ex.rank", rang, completes.length) : t("nd"), t("ex.i_total", nf(total), d0, d1)],
  ];
  $("indicators").innerHTML = items.map(([l, v, c, col]) => `<div class="stat"><span class="label">${l}</span><span class="value" ${col ? `style="color:${col}"` : ""}>${v}</span><span class="ctx">${c}</span></div>`).join("");
}

function convertiAffiche(c) {
  return etat.unite === "viirs" && etat.serie.viirs ? !String(c.source).startsWith("VIIRS") : c.statut === "converti";
}

function survol(c, ev) {
  if (!c) { cacherBulle(); return; }
  bulle([`<strong>${nomMoisLong(c.mois - 1)} ${c.annee}</strong> · ${t("statut." + c.statut)}`,
    c.valeur === null ? t("b.non_observe") : t("b.valeur", nf(c.valeur, 1), uniteCourte()),
    c.bas !== null ? t("b.ic", nf(c.bas, 1), nf(c.haut, 1)) : "",
    c.brut > 0 && c.valeur !== null && convertiAffiche(c) ? t("b.brut", nf(c.brut), nf(c.valeur / c.brut, 3)) : "",
    Number.isFinite(c.mediane) ? t("b.mediane", nf(c.mediane, 1)) : "",
    c.rapport !== null ? `<span style="color:${c.classe.couleur}">${t("b.rapport", nf(c.rapport, 2))}</span>${c.incertain ? ` · ${t("b.incertain")}` : ""}` : (c.refus ? t("refus." + c.refus) : ""),
    c.frpMoy ? t("b.frp", nf(c.frpMoy, 1), t("source." + c.source)) : "",
    `<span class="dim">${t("b.source", t("source." + c.source), Math.round(c.couverture * 100))}</span>`].filter(Boolean).join("<br>"), ev);
}

// ---------------------------------------------------------------- couche mensuelle du globe
function choisirCouche(mode) {
  etat.couche = mode;
  $("layer-mode").querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.layer === mode));
  $("layer-options").hidden = mode === "aucune";
  if (mode === "aucune") arreterLecture();
  dessinerCouche();
  if (etat.stats) { cartesMois(); calendrier(); }
  majLien();
}

function choisirMois(tt) {
  if (!moisCarte.includes(tt)) return;
  etat.coucheT = tt;
  $("layer-t").value = moisCarte.indexOf(tt);
  dessinerCouche();
  if (etat.stats) { cartesMois(); calendrier(); }
  majLien();
}

async function dessinerCouche() {
  const mode = etat.couche, tt = etat.coucheT;
  if (tt === null) return;
  const m = getIndex().mois[tt];
  $("layer-month").textContent = `${nomMois(m.mois - 1)} ${m.annee} · ${t("statut." + m.statut)}`;
  if (!globe) return;
  if (mode === "aucune") { globe.couche([], 1); return; }
  const d = await carteMois(tt);
  if (!d || etat.coucheT !== tt || etat.couche !== mode) return;
  const pas = getIndex().carte.pas, val = etat.unite === "viirs" && d.w ? d.w : d.v;
  const max = Math.max(1, ...val);
  const cellules = [];
  for (let i = 0; i < d.c.length; i++) {
    const [lat, lon] = centreCellule(d.c[i], pas), v = val[i], r = d.r[i];
    let couleur;
    if (mode === "niveau") { if (v <= 0) continue; couleur = couleurNiveau(v, max); }
    else { if (r < 0) { if (v <= 0) continue; couleur = COULEUR_REFUS; } else couleur = classeDe(r).couleur; }
    cellules.push({ lat, lon, couleur, v, r });
  }
  globe.couche(cellules, pas);
  $("layer-legend").innerHTML = mode === "anomalie"
    ? CLASSES.map(c => `<span><i style="background:${c.couleur}"></i>${nomClasse(c)}</span>`).join("") + `<span><i style="background:${COULEUR_REFUS}"></i>${t("lg.refus")}</span>`
    : `<span>${t("lg.faible")} <i style="width:70px;background:linear-gradient(90deg,${SEQUENTIELLE.slice(1).join(",")})"></i> ${t("lg.fort")} (max ${nf(max)})</span>`;
}

function survolCouche(p, ev) {
  if (!p) { cacherBulle(); return; }
  const m = getIndex().mois[etat.coucheT];
  bulle([`<strong>${nomMoisLong(m.mois - 1)} ${m.annee}</strong> · ${t("b.cellule")} ${nf(p.lat, 1)}°, ${nf(p.lon, 1)}°`,
    t("b.valeur", nf(p.v, 1), uniteCourte()),
    p.r >= 0 ? `<span style="color:${classeDe(p.r).couleur}">${t("b.rapport", nf(p.r, 2))} · ${nomClasseCourt(classeDe(p.r))}</span>` : `<span class="dim">${t("lg.refus")}</span>`].join("<br>"), ev);
}

function pasMois(d) {
  const i = Math.min(moisCarte.length - 1, Math.max(0, moisCarte.indexOf(etat.coucheT) + d));
  choisirMois(moisCarte[i]);
}
function demarrerLecture() {
  arreterLecture();
  $("btn-play").innerHTML = icon("pause"); $("btn-play").setAttribute("aria-label", t("ex.pause"));
  etat.lecture = setInterval(() => { if (moisCarte.indexOf(etat.coucheT) >= moisCarte.length - 1) choisirMois(moisCarte[0]); else pasMois(1); }, 700);
}
function arreterLecture() {
  if (etat.lecture) clearInterval(etat.lecture);
  etat.lecture = null;
  $("btn-play").innerHTML = icon("play"); $("btn-play").setAttribute("aria-label", t("ex.play"));
}

// ---------------------------------------------------------------- ruban, lien, exports
function ruban() {
  const r = reperes(), idx = getIndex(), v = (idx.validation || []).find(x => x.methode === "HEXAFIRE");
  $("ribbon").innerHTML = [
    `<span><span class="pip"></span> ${t("ex.r_months")}: <b>${r.nMois}</b> · ${r.premier.annee}-${String(r.premier.mois).padStart(2, "0")} → ${r.dernier.annee}-${String(r.dernier.mois).padStart(2, "0")}</span>`,
    r.totalDernier !== null ? `<span>${t("ex.r_last")} (${nomMois(r.dernier.mois - 1)} ${r.dernier.annee}): <b class="fire">${nf(r.totalDernier)}</b> ${t("u.points")}</span>` : "",
    `<span>${t("ex.r_normal")}: <b>${idx.periode_reference.join("–")}</b></span>`,
    v ? `<span>${t("ex.r_kappa")}: <b>${nf(v.kappa, 2)}</b></span>` : "",
  ].filter(Boolean).join("");
  $("stage-months").textContent = t("ex.months", r.nMois, r.premier.annee, r.dernier.annee);
}

function majLien() {
  if (!etat.zone) return;
  const url = encoder({ z: encoderZone(etat.zone), m: etat.mode, a: `${etat.periode[0]}-${etat.periode[1]}`, u: etat.unite !== "modis" ? etat.unite : "",
                        y: etat.annee, c: etat.couche, ct: etat.couche !== "aucune" ? etat.coucheT : "", l: getLangue() });
  history.replaceState(null, "", url);
}

function exporter(type) {
  if (!etat.stats) return;
  if (type === "csv") exporterCSV(etat.stats, etat.zone, etat.unite);
  else if (type === "cellules") exporterCellules(etat.serie, etat.zone);
  else if (type === "json") exporterJSON(etat.stats, etat.zone, etat.unite);
  else if (type === "png") exporterPNG(etat.svg);
  else if (type === "svg") exporterSVG(etat.svg);
}

// ---------------------------------------------------------------- recherche de lieu
async function rechercher(ev) {
  ev.preventDefault();
  const q = $("search-input").value.trim();
  if (!q) return;
  $("search-state").textContent = t("ex.searching");
  try {
    const l = await chercherLieu(q);
    if (!l) { $("search-state").textContent = t("err.lieu_aucun"); return; }
    $("search-state").textContent = l.nom;
    const p = pays.find(x => x.nom_fr.toLowerCase() === q.toLowerCase() || x.nom_en.toLowerCase() === q.toLowerCase());
    if (p) { choisirOutil("pays"); $("in-pays").value = p.code; appliquerZone(p); return; }
    choisirOutil("cercle");
    $("in-lat").value = l.lat.toFixed(2); $("in-lon").value = l.lon.toFixed(2);
    appliquerZone({ type: "cercle", lat: l.lat, lon: l.lon, rayon: +$("radius").value || 150, nom: l.nom.split(",")[0] });
  } catch { $("search-state").textContent = t("err.lieu"); }
}

// ---------------------------------------------------------------- démarrage
async function demarrer() {
  monterShell({ page: "explore" });
  for (const [id, ic] of [["search-ico", "search"], ["ico-link", "link"], ["ico-dl", "download"], ["ico-layers", "layers"], ["btn-prev", "prev"], ["btn-play", "play"], ["btn-next", "next"], ["zoom-in", "plus"], ["zoom-out", "minus"], ["zoom-reset", "reset"]])
    $(id).innerHTML = icon(ic);
  dessinerOutils(); dessinerSuggestions();

  let idx;
  try { idx = await chargerIndex(); }
  catch { afficherErreurDonnees($("ribbon")); $("guidance").hidden = true; return; }
  signalerExemple(idx);
  ruban();
  const lien = decoder();
  for (const id of ["in-debut", "in-fin"]) $(id).innerHTML = idx.annees.map(a => `<option>${a}</option>`).join("");
  $("in-debut").value = idx.annees[0]; $("in-fin").value = idx.annees.at(-1);
  $("unit").querySelector('[data-unit="viirs"]').disabled = !viirsDisponible();

  moisCarte = idx.carte ? idx.moisObserves.map(m => m.t) : [];
  if (moisCarte.length) {
    $("layer-t").max = moisCarte.length - 1;
    const ct = parseInt(lien.get("ct"), 10);
    etat.coucheT = moisCarte.includes(ct) ? ct : moisCarte.at(-1);
    $("layer-t").value = moisCarte.indexOf(etat.coucheT);
  } else $("layer-mode").closest(".overlay").hidden = true;
  if (lien.get("c")) etat.couche = lien.get("c");

  try {
    globe = await creerGlobe($("globe"), { rotation: !lien.get("z"), surZone: surZoneGlobe, surSurvol: survolCouche,
      surBrouillon: n => ($("poly-state").textContent = n ? t("ex.poly_n", n) : ""),
      surCurseur: (la, lo) => ($("cursor-pos").textContent = `LAT ${la.toFixed(2)}°  LON ${lo.toFixed(2)}°`) });
    globe.carte.on("zoom", () => ($("zoom-level").textContent = t("ex.zoom", globe.carte.getZoom().toFixed(1))));
  } catch (e) {
    console.warn("globe indisponible :", e);
    $("globe-fallback").hidden = false; $("globe-fallback").innerHTML = `<div class="notice">${t("err.maplibre")}</div>`;
  }
  choisirOutil(etat.outil);
  choisirCouche(etat.couche);

  pays = await chargerPays();
  remplirPays();

  // événements
  $("search").onsubmit = rechercher;
  $("radius").oninput = () => { $("radius-value").textContent = $("radius").value; };
  $("radius").onchange = () => { if (etat.zone && etat.zone.type === "cercle") appliquerZone({ ...etat.zone, rayon: +$("radius").value }, { cadrer: true }); };
  $("apply-coords").onclick = () => appliquerZone({ type: "cercle", lat: +$("in-lat").value, lon: +$("in-lon").value, rayon: +$("radius").value || 150 });
  $("apply-rect").onclick = () => appliquerZone({ type: "rect", sud: +$("in-sud").value, nord: +$("in-nord").value, ouest: +$("in-ouest").value, est: +$("in-est").value });
  $("poly-undo").onclick = () => globe && globe.annulerSommet();
  $("poly-finish").onclick = () => globe && globe.terminerPolygone();
  $("in-pays").onchange = () => { const p = pays.find(x => x.code === $("in-pays").value); if (p) appliquerZone(p); };
  $("btn-clear").onclick = effacerZone;
  $("btn-link").onclick = async () => { majLien(); await copier(location.href); const s = $("btn-link").lastElementChild; s.textContent = t("ex.link_ok"); setTimeout(() => (s.textContent = t("ex.link")), 2000); };
  $("btn-export").onclick = () => { const m = $("export-menu"); m.hidden = !m.hidden; $("btn-export").setAttribute("aria-expanded", String(!m.hidden)); };
  document.addEventListener("click", e => { if (!e.target.closest(".export")) { $("export-menu").hidden = true; $("btn-export").setAttribute("aria-expanded", "false"); } });
  $("export-menu").querySelectorAll("button").forEach(b => (b.onclick = () => { exporter(b.dataset.export); $("export-menu").hidden = true; }));
  $("layer-mode").querySelectorAll("button").forEach(b => (b.onclick = () => choisirCouche(b.dataset.layer)));
  $("layer-t").oninput = () => choisirMois(moisCarte[+$("layer-t").value]);
  $("btn-prev").onclick = () => pasMois(-1); $("btn-next").onclick = () => pasMois(1);
  $("btn-play").onclick = () => (etat.lecture ? arreterLecture() : demarrerLecture());
  $("zoom-in").onclick = () => globe && globe.zoomer(1); $("zoom-out").onclick = () => globe && globe.zoomer(-1); $("zoom-reset").onclick = () => globe && globe.reinitialiser();
  $("mode").querySelectorAll("button").forEach(b => (b.onclick = () => { etat.mode = b.dataset.mode; $("mode").querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b)); majLien(); if (etat.stats) calendrier(); }));
  $("unit").querySelectorAll("button").forEach(b => (b.onclick = () => { if (b.disabled) return; etat.unite = b.dataset.unit; $("unit").querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b)); if (etat.serie) { etat.stats = calculerStats(); rafraichir(); } dessinerCouche(); majLien(); }));
  const periode = () => { etat.periode = [+$("in-debut").value, +$("in-fin").value].sort((a, b) => a - b); majLien(); if (etat.stats) { calendrier(); indicateurs(); } };
  $("in-debut").onchange = periode; $("in-fin").onchange = periode;
  window.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); $("search-input").focus(); } });

  surChangementLangue(() => {
    dessinerOutils(); dessinerSuggestions(); remplirPays(); ruban();
    $("guidance-text").textContent = t("ex.g_" + etat.outil);
    if (etat.zone && etat.zone.nom_fr) etat.zone.nom = getLangue() === "en" ? etat.zone.nom_en : etat.zone.nom_fr;
    dessinerCouche();
    if (etat.stats) { rafraichir(); majLien(); }
  });

  // lien partagé : on restaure la recherche
  const z0 = decoderZone(lien.get("z"));
  if (z0) {
    if (lien.get("m") === "anomalie") { etat.mode = "anomalie"; $("mode").querySelector('[data-mode="anomalie"]').click(); }
    if (lien.get("u") === "viirs" && viirsDisponible()) { etat.unite = "viirs"; $("unit").querySelectorAll("button").forEach(x => x.classList.toggle("active", x.dataset.unit === "viirs")); }
    const a = (lien.get("a") || "").split("-").map(Number);
    if (a.length === 2 && a.every(Number.isFinite)) { $("in-debut").value = a[0]; $("in-fin").value = a[1]; etat.periode = a; }
    const y = parseInt(lien.get("y"), 10);
    if (idx.annees.includes(y)) etat.annee = y;
    let zone = z0;
    if (z0.type === "pays") zone = pays.find(p => p.code === z0.code) || null;
    if (zone) {
      choisirOutil(zone.type === "pays" ? "pays" : zone.type);
      if (zone.type === "cercle") { $("in-lat").value = zone.lat; $("in-lon").value = zone.lon; $("radius").value = zone.rayon; $("radius-value").textContent = zone.rayon; }
      if (zone.type === "rect") { $("in-sud").value = zone.sud; $("in-nord").value = zone.nord; $("in-ouest").value = zone.ouest; $("in-est").value = zone.est; }
      if (zone.type === "pays") $("in-pays").value = zone.code;
      appliquerZone(zone);
    }
  }
  appliquerTextes();
}

demarrer();

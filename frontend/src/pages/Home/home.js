// Page d'accueil : textes éditoriaux, vignettes alimentées par index.json (matrice mondiale, validation, chiffres clés).
import { monterShell, signalerExemple } from "../../layouts/shell.js";
import { t, nf, ajouterTextes, surChangementLangue, appliquerTextes } from "../../utils/i18n.js";
import { chargerIndex, getIndex, reperes } from "../../services/data.js";
import { couleurNiveau } from "../../utils/stats.js";

ajouterTextes({
  fr: {
    "home.doc": "HEXAFIRE · Observatoire planétaire des feux", "home.tagline": "Harmonisation MODIS ↔ VIIRS",
    "home.top_left": "Série harmonisée", "home.top_right": "Orbites héliosynchrones • 705 et 824 km",
    "home.h1": "Explorer comment le feu façonne notre planète.",
    "home.lead": "Vingt-cinq ans de points chauds vus depuis l'orbite, rendus enfin comparables : une seule série mensuelle, de novembre 2000 à aujourd'hui, pour n'importe quelle région du globe.",
    "home.cta": "Commencer à explorer", "home.cta2": "Protocole d'harmonisation", "home.scroll": "Faire défiler pour observer",
    "home.s1_eyebrow": "01 / Continuité des capteurs", "home.s1_title": "Deux capteurs, une fausse hausse.",
    "home.s1_text": "MODIS (Terra, Aqua) cartographie les feux actifs depuis 2000 avec des pixels de 1 km. VIIRS (Suomi NPP, NOAA-20, NOAA-21) descend à 375 m depuis 2012 et détecte environ cinq fois plus de points chauds le jour, quinze fois plus la nuit. Mis bout à bout sans correction, les deux enregistrements montrent un saut d'activité qui n'a jamais eu lieu. HEXAFIRE apprend la conversion sur les années communes et prolonge la série MODIS sans rupture.",
    "home.fig1": "VIIRS 375 m & MODIS 1 km • 2000 → aujourd'hui", "home.fig1b": "Détections de feux actifs NASA FIRMS",
    "home.conv_title": "Changement de capteur", "home.conv_right": "Sans saut", "home.conv_raw": "VIIRS brut", "home.conv_harm": "Série harmonisée (équivalent MODIS)",
    "home.s2_eyebrow": "02 / Architecture", "home.s2_title": "Trois regards sur la dynamique planétaire du feu.", "home.s2_text": "De l'échelle de la planète à celle d'un terroir.",
    "home.l1_tag": "Géospatial", "home.l1_cap": "Globe • sélection libre", "home.l1_title": "Explorer", "home.l1_text": "Tracez une zone sur le globe, ou choisissez un pays, et lisez son calendrier des feux depuis 2000.", "home.l1_link": "Ouvrir le globe",
    "home.l2_tag": "Temporel", "home.l2_title": "Comparer", "home.l2_text": "Mettez deux régions ou deux années côte à côte, à l'échelle de la normale 2003–2020.", "home.l2_link": "Comparer des régions",
    "home.l3_tag": "Spectral", "home.l3_title": "Comprendre", "home.l3_text": "Comment des observations de deux satellites deviennent comparables, et comment nous le vérifions.", "home.l3_link": "Lire la méthode",
    "home.m_axis": "Points chauds mondiaux (équiv. MODIS)", "home.v_axis": "Accord des verdicts (kappa, cible ≥ 0,5)",
    "home.s3_eyebrow": "03 / Repères", "home.s3_title": "Ce que contient la série publiée.", "home.s3_text": "Chiffres lus dans les fichiers publiés par le moteur. Avec le jeu d'exemple, ils sont fictifs.",
    "home.f_months": "Mois publiés", "home.f_months_ctx": (a, b) => `de ${a} à ${b}`, "home.f_tiles": "Tuiles de 5° actives", "home.f_tiles_ctx": "sur 2 592 possibles",
    "home.f_total": "Points chauds (équiv. MODIS)", "home.f_total_ctx": "cumul mondial de la série", "home.f_kappa": "Accord de la conversion", "home.f_kappa_ctx": "kappa, validation « une année exclue »",
    "home.f_false": "Fausses anomalies", "home.f_false_ctx": "mois normaux déclarés anormaux (cible ≤ 0,15)", "home.f_norm": "Période de référence", "home.f_norm_ctx": "normale mensuelle (médiane)",
    "home.final_top": "Couverture mondiale continue", "home.final_chip": "Science ouverte • données NASA FIRMS", "home.final_title": "Explorez l'histoire derrière les données.",
    "home.final_text": "Des saisons de feux de la savane soudanienne aux incendies boréaux, lisez vingt-cinq ans d'observations sur une seule échelle.",
    "home.final_bottom": "Archives MODIS (Terra, Aqua) et VIIRS (Suomi NPP, NOAA-20, NOAA-21) harmonisées par l'équipe HEXAFIRE.",
  },
  en: {
    "home.doc": "HEXAFIRE · Planetary fire observatory", "home.tagline": "MODIS ↔ VIIRS harmonization",
    "home.top_left": "Harmonized series", "home.top_right": "Sun-synchronous orbits • 705 and 824 km",
    "home.h1": "Explore how fire shapes our planet.",
    "home.lead": "Twenty-five years of hotspots seen from orbit, finally comparable: one monthly series, from November 2000 to today, for any region of the globe.",
    "home.cta": "Start exploring", "home.cta2": "Harmonization protocol", "home.scroll": "Scroll to observe",
    "home.s1_eyebrow": "01 / Sensor continuity", "home.s1_title": "Two sensors, one false increase.",
    "home.s1_text": "MODIS (Terra, Aqua) has mapped active fires since 2000 with 1 km pixels. VIIRS (Suomi NPP, NOAA-20, NOAA-21) goes down to 375 m since 2012 and detects about five times more hotspots by day, fifteen times more by night. Spliced without correction, the two records show a jump in activity that never happened. HEXAFIRE learns the conversion over the overlap years and extends the MODIS series without a break.",
    "home.fig1": "VIIRS 375 m & MODIS 1 km • 2000 → today", "home.fig1b": "NASA FIRMS active fire detections",
    "home.conv_title": "Sensor change", "home.conv_right": "No step", "home.conv_raw": "Raw VIIRS", "home.conv_harm": "Harmonized series (MODIS equivalent)",
    "home.s2_eyebrow": "02 / Architecture", "home.s2_title": "Three lenses into planetary fire dynamics.", "home.s2_text": "From planetary scale to a single landscape.",
    "home.l1_tag": "Geospatial", "home.l1_cap": "Globe • free selection", "home.l1_title": "Explore", "home.l1_text": "Draw an area on the globe, or pick a country, and read its fire calendar since 2000.", "home.l1_link": "Open the globe",
    "home.l2_tag": "Temporal", "home.l2_title": "Compare", "home.l2_text": "Put two regions or two years side by side, on the scale of the 2003–2020 normal.", "home.l2_link": "Compare regions",
    "home.l3_tag": "Spectral", "home.l3_title": "Understand", "home.l3_text": "How observations from two satellites become comparable, and how we check it.", "home.l3_link": "Read the method",
    "home.m_axis": "Global hotspots (MODIS eq.)", "home.v_axis": "Verdict agreement (kappa, target ≥ 0.5)",
    "home.s3_eyebrow": "03 / Key figures", "home.s3_title": "What the published series contains.", "home.s3_text": "Figures read from the files published by the engine. With the example dataset they are fictitious.",
    "home.f_months": "Published months", "home.f_months_ctx": (a, b) => `from ${a} to ${b}`, "home.f_tiles": "Active 5° tiles", "home.f_tiles_ctx": "out of 2,592 possible",
    "home.f_total": "Hotspots (MODIS eq.)", "home.f_total_ctx": "global total of the series", "home.f_kappa": "Conversion agreement", "home.f_kappa_ctx": "kappa, leave-one-year-out validation",
    "home.f_false": "False anomalies", "home.f_false_ctx": "normal months flagged as anomalous (target ≤ 0.15)", "home.f_norm": "Reference period", "home.f_norm_ctx": "monthly normal (median)",
    "home.final_top": "Continuous global coverage", "home.final_chip": "Open science • NASA FIRMS data", "home.final_title": "Explore the story behind the data.",
    "home.final_text": "From Sudanian savanna fire seasons to boreal wildfires, read twenty-five years of observations on a single scale.",
    "home.final_bottom": "MODIS (Terra, Aqua) and VIIRS (Suomi NPP, NOAA-20, NOAA-21) archives harmonized by team HEXAFIRE.",
  },
});

const $ = id => document.getElementById(id);

function matrice() {
  const idx = getIndex(), tot = idx.totaux;
  const el = $("lens-matrix");
  if (!tot) { el.innerHTML = ""; return; }
  const annees = idx.annees.slice(-8);
  const max = Math.max(1, ...tot.v);
  const cases = [];
  for (const a of annees) for (let m = 1; m <= 12; m++) {
    const mo = idx.mois.find(x => x.annee === a && x.mois === m);
    const v = mo && mo.statut !== "non observé" ? tot.v[mo.t] : null;
    cases.push(`<i style="background:${v === null ? "transparent" : couleurNiveau(v, max)};${v !== null && v / max > 0.7 ? "box-shadow:0 0 6px #ff5a1f" : ""}"></i>`);
  }
  el.innerHTML = `<div class="axis"><span>${t("mois")[0]}</span><span>${t("mois")[6]}</span><span>${t("mois")[11]}</span></div>
    <div class="grid-m">${cases.join("")}</div>
    <div class="axis"><span>${annees[0]}</span><span class="fire">${t("home.m_axis")}</span><span>${annees.at(-1)}</span></div>`;
}

function validation() {
  const v = getIndex().validation, el = $("lens-validation");
  if (!v || !v.length) { el.innerHTML = ""; return; }
  const W = 240, H = 170, x0 = 14, y1 = 140, bw = 40, g = (W - 2 * x0 - v.length * bw) / Math.max(1, v.length - 1);
  const col = m => (m.methode === "HEXAFIRE" ? "#ff5a1f" : m.methode.startsWith("M1") ? "#ffb547" : "#4c6fff");
  const barres = v.map((m, i) => {
    const x = x0 + i * (bw + g), h = Math.max(2, m.kappa * 120);
    return `<rect x="${x}" y="${y1 - h}" width="${bw}" height="${h}" rx="3" fill="${col(m)}" ${m.methode === "HEXAFIRE" ? 'style="filter:drop-shadow(0 0 8px rgba(255,90,31,.6))"' : ""}/>
      <text x="${x + bw / 2}" y="${y1 - h - 6}" text-anchor="middle" fill="#eaf0ff" font-size="11" font-family="Space Grotesk" font-weight="600">${nf(m.kappa, 2)}</text>
      <text x="${x + bw / 2}" y="${y1 + 14}" text-anchor="middle" fill="#9aa8c7" font-size="9" font-family="Space Grotesk" letter-spacing="1">${m.methode.split(" ")[0].toUpperCase()}</text>`;
  }).join("");
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <line x1="${x0}" x2="${W - x0}" y1="${y1 - 60}" y2="${y1 - 60}" stroke="rgba(76,111,255,.35)" stroke-dasharray="3 3"/>
    <text x="${W - x0}" y="${y1 - 64}" text-anchor="end" fill="#b8c3ff" font-size="9" font-family="Space Grotesk">0.5</text>
    <line x1="${x0}" x2="${W - x0}" y1="${y1}" y2="${y1}" stroke="rgba(76,111,255,.2)"/>${barres}</svg>
    <div class="axis" style="width:100%;display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--atmosphere-dim)"><span>${t("home.v_axis")}</span></div>`;
}

function chiffres() {
  const idx = getIndex(), r = reperes(), v = (idx.validation || []).find(x => x.methode === "HEXAFIRE");
  const carte = (label, valeur, ctx) => `<div class="card flat"><span class="label">${label}</span><span class="value">${valeur}</span><span class="ctx">${ctx}</span></div>`;
  $("figures").innerHTML = [
    carte(t("home.f_months"), nf(r.nMois), t("home.f_months_ctx", `${r.premier.annee}-${String(r.premier.mois).padStart(2, "0")}`, `${r.dernier.annee}-${String(r.dernier.mois).padStart(2, "0")}`)),
    carte(t("home.f_tiles"), nf(idx.tuiles.length), t("home.f_tiles_ctx")),
    r.totalPeriode !== null ? carte(t("home.f_total"), nf(r.totalPeriode, 0, true), t("home.f_total_ctx")) : "",
    v ? carte(t("home.f_kappa"), nf(v.kappa, 2), t("home.f_kappa_ctx")) : "",
    v ? carte(t("home.f_false"), nf(v.fausses_anomalies, 2), t("home.f_false_ctx")) : "",
    carte(t("home.f_norm"), idx.periode_reference.join("–"), t("home.f_norm_ctx")),
  ].join("");
  $("hero-months").textContent = `${nf(r.nMois)} ${getLangueMois()} · ${r.premier.annee} → ${r.dernier.annee}`;
}
const getLangueMois = () => (document.documentElement.lang === "en" ? "months" : "mois");

async function demarrer() {
  monterShell({ page: "home" });
  const rendre = () => { matrice(); validation(); chiffres(); };
  try { const idx = await chargerIndex(); signalerExemple(idx); rendre(); surChangementLangue(rendre); }
  catch { $("figures").innerHTML = `<p class="muted">${t("err.index")}</p>`; $("lens-matrix").innerHTML = ""; $("lens-validation").innerHTML = ""; }
  appliquerTextes();
}
demarrer();

// Code written with the help of Claude (Anthropic), a Super Intelligence (SI) assistant, then run and tested by team HEXAFIRE.
// Page d'accueil : textes éditoriaux, vignettes alimentées par index.json (matrice mondiale, validation, chiffres clés).
import { monterShell, signalerExemple } from "../../layouts/shell.js";
import { t, nf, ajouterTextes, surChangementLangue, appliquerTextes } from "../../utils/i18n.js";
import { chargerIndex, getIndex } from "../../services/data.js";
import { couleurNiveau } from "../../utils/stats.js";

ajouterTextes({
  en: {
    "home.doc": "HEXAFIRE · Planetary fire observatory",
    "home.h1": "Explore how fire shapes our planet",
    "home.lead": "Discover where fires occur, how fire activity changes over time, and what patterns emerge across different regions of the world.",
    "home.cta": "Start exploring",
    "home.s1_title": "Fire is constantly changing our world",
    "home.s1_text": "From local landscapes to entire regions, wildfires affect ecosystems, communities, and the environment. Understanding where and when they occur is an important first step.",
    "home.s1_text2": "HEXAFIRE brings together twenty-five years of satellite observations of fire, so that any place on Earth can be read on one continuous timeline.",
    "home.s2_title": "Three lenses into planetary fire dynamics", "home.s2_text": "From planetary scale to local biomes",
    "home.l1_title": "Explore", "home.l1_text": "Discover fire activity across geographical areas: pick any region on the globe and read its fire history.", "home.l1_link": "Open the globe",
    "home.l2_title": "Compare", "home.l2_text": "Understand how fire activity changes over time: put two regions or two years side by side.", "home.l2_link": "Compare regions",
    "home.l3_title": "Understand", "home.l3_text": "See how observations from different satellites become comparable, and how to read the results.", "home.l3_link": "Read the guide",
    "home.m_axis": "Global fire activity, month by month", "home.u_axis": "A typical year of fire, month by month",
    "home.final_chip": "Open access • NASA satellite data", "home.final_title": "Explore the story behind the data",
    "home.final_text": "From savanna fire seasons to boreal wildfires, read twenty-five years of observations on a single scale.",
  },
  fr: {
    "home.doc": "HEXAFIRE · Observatoire planétaire des feux",
    "home.h1": "Explorez comment le feu façonne notre planète",
    "home.lead": "Découvrez où les feux se produisent, comment leur activité évolue dans le temps, et quels schémas apparaissent d'une région du monde à l'autre.",
    "home.cta": "Commencer à explorer",
    "home.s1_title": "Le feu transforme sans cesse notre monde",
    "home.s1_text": "Des paysages locaux aux régions entières, les feux touchent les écosystèmes, les populations et l'environnement. Savoir où et quand ils se produisent est une première étape importante.",
    "home.s1_text2": "HEXAFIRE réunit vingt-cinq ans d'observations des feux par satellite, pour que chaque endroit de la Terre se lise sur une seule ligne du temps.",
    "home.s2_title": "Trois regards sur la dynamique planétaire du feu", "home.s2_text": "De l'échelle de la planète aux biomes locaux",
    "home.l1_title": "Explorer", "home.l1_text": "Découvrez l'activité des feux par zone géographique : choisissez n'importe quelle région sur le globe et lisez son histoire du feu.", "home.l1_link": "Ouvrir le globe",
    "home.l2_title": "Comparer", "home.l2_text": "Comprenez comment l'activité des feux évolue dans le temps : mettez deux régions ou deux années côte à côte.", "home.l2_link": "Comparer des régions",
    "home.l3_title": "Comprendre", "home.l3_text": "Voyez comment les observations de différents satellites deviennent comparables, et comment lire les résultats.", "home.l3_link": "Lire le guide",
    "home.m_axis": "Activité mondiale des feux, mois par mois", "home.u_axis": "Une année type de feux, mois par mois",
    "home.final_chip": "Accès libre • données satellitaires de la NASA", "home.final_title": "Explorez l'histoire derrière les données",
    "home.final_text": "Des saisons de feux de savane aux incendies boréaux, lisez vingt-cinq ans d'observations sur une seule échelle.",
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

// Une année type : médiane des totaux mondiaux mensuels sur la période de référence, en courbe lissée
function anneeType() {
  const idx = getIndex(), tot = idx.totaux, el = $("lens-understand");
  if (!el) return;
  if (!tot) { el.innerHTML = ""; return; }
  const [r0, r1] = idx.periode_reference, parMois = Array.from({ length: 12 }, () => []);
  idx.mois.forEach(m => { if (m.annee >= r0 && m.annee <= r1 && m.statut !== "non observé") parMois[m.mois - 1].push(tot.v[m.t]); });
  const med = parMois.map(v => { const s = [...v].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; });
  const W = 240, H = 160, x0 = 12, y1 = 130, max = Math.max(1, ...med), X = i => x0 + (i * (W - 2 * x0)) / 11, Y = v => y1 - (v / max) * 100;
  const pts = med.map((v, i) => [X(i), Y(v)]);
  const d = pts.reduce((s, [x, y], i, a) => (i ? `${s} C${(a[i - 1][0] + x) / 2},${a[i - 1][1]} ${(a[i - 1][0] + x) / 2},${y} ${x},${y}` : `M${x},${y}`), "");
  const imax = med.indexOf(max);
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <defs><linearGradient id="g-annee" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ff5a1f" stop-opacity=".4"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></linearGradient></defs>
    <line x1="${x0}" x2="${W - x0}" y1="${y1}" y2="${y1}" stroke="rgba(76,111,255,.25)"/>
    <path d="${d} L${X(11)},${y1} L${X(0)},${y1} Z" fill="url(#g-annee)"/><path d="${d}" fill="none" stroke="#ff5a1f" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="${X(imax)}" cy="${Y(max)}" r="4.5" fill="#ff5a1f" stroke="#eaf0ff" stroke-width="1.5"/>
    ${[0, 3, 6, 9, 11].map(i => `<text x="${X(i)}" y="${y1 + 16}" text-anchor="middle" fill="#9aa8c7" font-size="9" font-family="Space Grotesk" letter-spacing="1">${t("mois")[i].toUpperCase()}</text>`).join("")}
  </svg><div class="axis"><span class="fire">${t("home.u_axis")}</span></div>`;
}

async function demarrer() {
  monterShell({ page: "home" });
  const rendre = () => { matrice(); anneeType(); };
  try { const idx = await chargerIndex(); signalerExemple(idx); rendre(); surChangementLangue(rendre); }
  catch { $("lens-matrix").innerHTML = ""; $("lens-understand").innerHTML = ""; }
  appliquerTextes();
}
demarrer();

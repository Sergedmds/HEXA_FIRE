// Page Méthode : contenu éditorial bilingue, fidèle au moteur (backend/hexafire) et au dossier technique.
import { CONFIG } from "../../config/app.js";
import { monterShell, signalerExemple } from "../../layouts/shell.js";
import { t, nf, getLangue, ajouterTextes, surChangementLangue, appliquerTextes } from "../../utils/i18n.js";
import { chargerIndex, getIndex } from "../../services/data.js";
import { tableValidation } from "../../components/charts.js";
import { icon } from "../../components/icons.js";

ajouterTextes({
  fr: {
    "me.doc": "HEXAFIRE · Méthode", "me.chip": "Méthode HEXAFIRE", "me.ref": "NASA Space Apps 2026 • défi « Harmonisation des points chauds MODIS et VIIRS »",
    "me.h1": "Comment nous transformons deux enregistrements satellitaires en une seule série du feu.",
    "me.lead": "Depuis 2000, les radiomètres MODIS puis VIIRS repèrent chaque jour les pixels anormalement chauds de la surface terrestre. HEXAFIRE apprend, sur les neuf années où les deux capteurs ont observé ensemble, comment traduire l'un dans l'autre, puis publie une série mensuelle continue par cellule de 0,25°, de novembre 2000 à aujourd'hui, avec son incertitude et sa validation.",
    "me.f1": "Capteurs", "me.f1v": "MODIS & VIIRS", "me.f1c": "Terra, Aqua · S-NPP, NOAA-20, NOAA-21",
    "me.f2": "Résolution", "me.f2v": "1 km & 375 m", "me.f2c": "pixels des détections",
    "me.f3": "Normale", "me.f3v": "2003–2020", "me.f3c": "médiane mensuelle par cellule",
    "me.f4": "Calibration", "me.f4v": "2012–2020", "me.f4c": "années d'observation commune",
  },
  en: {
    "me.doc": "HEXAFIRE · Methodology", "me.chip": "HEXAFIRE methodology", "me.ref": "NASA Space Apps 2026 • challenge “Harmonization of MODIS and VIIRS Hot Spots”",
    "me.h1": "How we turn two satellite records into a single fire series.",
    "me.lead": "Since 2000, the MODIS and then VIIRS radiometers have spotted, every day, the abnormally hot pixels of the land surface. HEXAFIRE learns, over the nine years when both sensors observed together, how to translate one into the other, then publishes a continuous monthly series per 0.25° cell, from November 2000 to today, with its uncertainty and its validation.",
    "me.f1": "Sensors", "me.f1v": "MODIS & VIIRS", "me.f1c": "Terra, Aqua · S-NPP, NOAA-20, NOAA-21",
    "me.f2": "Resolution", "me.f2v": "1 km & 375 m", "me.f2c": "detection pixels",
    "me.f3": "Normal", "me.f3v": "2003–2020", "me.f3c": "monthly median per cell",
    "me.f4": "Calibration", "me.f4v": "2012–2020", "me.f4c": "years of joint observation",
  },
});

const C = {
  fr: {
    s1: { n: "01 // Observer depuis l'orbite", h: "D'où viennent les données", p: "Des produits NASA de feux actifs, distribués librement : les archives mensuelles de l'équipe feux de l'université du Maryland, et l'API FIRMS pour les mois les plus récents." },
    sources: [
      { tag: "1 km · référence climatique", tagc: "orbital", who: "TERRA & AQUA", h: "Archives MODIS (MCD14ML)", p: "Collection 6 jusqu'en décembre 2022, puis 6.1, sans changement d'algorithme. MODIS observe sans interruption depuis novembre 2000 : c'est l'étalon de la série. Terra seul (2000–2002) est ramené à Terra + Aqua.", f1: "Giglio et al., 2016", f2: "2000 → aujourd'hui" },
      { tag: "375 m · haute résolution", tagc: "fire", who: "S-NPP · NOAA-20 · NOAA-21", h: "Archives VIIRS (VNP14IMGML, VJ114, VJ214)", p: "Collection 2. VIIRS voit beaucoup plus de petits feux que MODIS. Suomi NPP (2012 →) sert de pivot ; NOAA-20 et NOAA-21 lui sont raccordés sur leurs années communes. S-NPP a cessé d'observer le 2 novembre 2026.", f1: "Schroeder et al., 2014", f2: "2012 → aujourd'hui" },
      { tag: "temps quasi réel", tagc: "amber", who: "NASA LANCE / FIRMS", h: "API FIRMS pour les derniers mois", p: "Après la fin des archives mensuelles, les détections (produits standard, sinon NRT) sont téléchargées par l'API FIRMS, puis filtrées comme les archives. Quand l'archive d'un mois paraît, elle remplace automatiquement l'API.", f1: "MAP_KEY personnelle", f2: "mois récents" },
    ],
    filtres: "Filtres appliqués partout : type 0 (feu de végétation présumé), confiance MODIS ≥ 30, classe VIIRS « faible » exclue. Chaque détection est rangée dans la cellule de 0,25° qui contient son centre, jour et nuit séparément.",
    s2: { n: "02 // La chaîne de traitement", h: "Des détections brutes à la série harmonisée", p: "Sept étapes reproductibles, lancées par python -m hexafire dans le dossier backend. Chaque étape écrit des tables intermédiaires contrôlées." },
    etapes: [
      ["preparer", "Préparer", "Lit chaque archive, applique les filtres, écrit un fichier par capteur et par mois. Empreinte SHA-256 et effectifs journalisés : relancer ne refait que le nouveau.", "lues = retenues + exclues"],
      ["agreger", "Agréger", "Compte les détections par cellule de 0,25°, mois, capteur et jour / nuit, avec la FRP totale. Table de base de tout le reste.", "cell_month"],
      ["occasions", "Occasions", "Nombre de passages de chaque satellite au-dessus de chaque cellule, et jours sans données (capteur sous 10 % de son activité habituelle).", "offset d'observation"],
      ["calibrer", "Calibrer", "Modèle binomial conditionnel : combien un point chaud VIIRS vaut de points chauds MODIS, à passages égaux, par strate de 10°, mois de l'année et jour / nuit, puis stabilisé par rétrécissement.", "2012–2020"],
      ["valider", "Valider", "Une année mise de côté, VIIRS converti comme si MODIS n'existait plus, verdict mensuel comparé au vrai MODIS. Comparaison avec un facteur global (M1) et le raccord brut (M0).", "kappa, fausses anomalies"],
      ["serie", "Série", "Assemble une série unique en équivalent MODIS : mesurée jusqu'en 2020, convertie ensuite, chaque mois ramené au même nombre de passages, avec statut et incertitude.", "2000-11 → aujourd'hui"],
      ["publier", "Publier", "Écrit les fichiers lus par ce site : index, tuiles de 5° (cellules × mois, deux unités, incertitude, FRP), cartes mensuelles de 1° avec écart à la normale.", "frontend/public/data"],
    ],
    s3: { n: "03 // Les grandeurs", h: "Ce que le site affiche, et dans quelle unité", p: "Nous séparons soigneusement le comptage, son incertitude, l'écart à l'habitude et l'énergie rayonnée." },
    grandeurs: [
      { u: "Unité : points chauds", c: "fire", h: "Équivalent MODIS", q1: "Ce que c'est", p1: "Le nombre de points chauds que Terra + Aqua auraient détectés dans la zone ce mois-là. Mesuré par MODIS jusqu'en 2020, calculé à partir de VIIRS converti ensuite. Une seconde unité, l'équivalent VIIRS, applique les mêmes facteurs dans l'autre sens.", q2: "Comment le lire", p2: "Un point chaud n'est pas un incendie : un grand feu en produit beaucoup, de nombreux petits feux n'en produisent aucun. Comparez des mois entre eux, pas des feux." },
      { u: "Unité : × la normale", c: "amber", h: "Écart à la normale", q1: "Ce que c'est", p1: "Le rapport entre la valeur du mois et la médiane du même mois de l'année sur 2003–2020, pour la même zone. Cinq classes, de « très inférieure » (< 0,5) à « très supérieure » (> 2).", q2: "Comment le lire", p2: "Il n'est pas calculé si la référence compte moins de dix années ou si la médiane est inférieure à cinq points chauds. Il ne dépend pas de l'unité choisie." },
      { u: "Unité : intervalle à 95 %", c: "orbital", h: "Incertitude de conversion", q1: "Ce que c'est", p1: "Chaque facteur est estimé avec une erreur type, propagée jusqu'à la zone (même facteur dans une strate, strates indépendantes). L'infobulle donne l'intervalle, le calendrier pointille les verdicts incertains.", q2: "Comment le lire", p2: "Cette marge couvre la conversion, pas les nuages ni les limites de la détection. En équivalent MODIS elle concerne les mois VIIRS et Terra seul ; en équivalent VIIRS, les mois MODIS." },
      { u: "Unité : mégawatts", c: "soft", h: "Puissance radiative (FRP)", q1: "Ce que c'est", p1: "La FRP moyenne par détection du capteur utilisé ce mois-là, lue dans l'infobulle. Elle renseigne sur l'intensité du feu.", q2: "Comment le lire", p2: "Elle n'est pas harmonisée : MODIS et VIIRS ne mesurent pas la même puissance pour un même feu. Comparez-la seulement entre mois observés par le même capteur." },
    ],
    s4: { n: "04 // Lire une observation", h: "Quatre règles avant d'interpréter", p: "La télédétection thermique a des limites physiques qu'il faut garder à l'esprit." },
    regles: [
      ["Un point chaud n'est pas un feu", "Un seul grand incendie déclenche des dizaines de détections à chaque passage ; dix petits brûlis dans un même pixel n'en donnent qu'une. Les comptages indiquent une étendue et une activité, pas un nombre d'incendies."],
      ["Ce que le satellite ne voit pas n'existe pas pour lui", "Les nuages, les panaches épais et la canopée dense masquent les feux. L'absence de point chaud ne prouve pas l'absence de feu. Les mois à couverture partielle sont hachurés dans le calendrier."],
      ["375 m et 1 km ne se comparent pas directement", "À passages égaux, VIIRS détecte environ cinq fois plus de points chauds le jour et quinze fois plus la nuit, et ce rapport varie selon la région et la saison. C'est tout l'objet de la conversion par strate, mois et jour / nuit."],
      ["L'habitude donne le sens", "Dans les savanes soudaniennes ou le Cerrado, le feu est saisonnier et attendu. Seul l'écart à la normale 2003–2020 dit si un mois est vraiment inhabituel."],
    ],
    s5: { n: "05 // Validation", h: "La conversion donne-t-elle les bons verdicts ?", p: "Pour chaque année de test, les facteurs sont recalculés sans elle, VIIRS est converti et le verdict mensuel (bas / normal / haut) est comparé au vrai MODIS." },
    s6: { n: "06 // Science ouverte", h: "Sources, provenance et accès", p: "Toutes les données visualisées viennent de programmes spatiaux ouverts. La provenance détaillée est dans docs/data-sources.md du dépôt." },
    fournisseurs: [["NASA FIRMS", "détections de feux actifs", CONFIG.liens.firms], ["MODIS Fire (UMD)", "archives MCD14ML", "https://modis-fire.umd.edu/"], ["VIIRS 375 m (UMD)", "archives VNP14IMGML", "https://viirsfire.geog.umd.edu/"], ["NASA GIBS", "fond du globe (Black Marble)", "https://earthdata.nasa.gov/gibs"], ["Natural Earth", "frontières des pays", "https://www.naturalearthdata.com/"], ["Dépôt HEXAFIRE", "code et documentation", CONFIG.liens.depot]],
    cta: { h: "Prêt à lire la série ?", p: "Ouvrez le globe, choisissez une zone, et regardez vingt-cinq ans de feux sur une seule échelle.", b1: "Ouvrir le globe", b2: "Comparer des régions" },
  },
  en: {
    s1: { n: "01 // Observing from orbit", h: "Where the data comes from", p: "Freely distributed NASA active fire products: the monthly archives of the University of Maryland fire team, and the FIRMS API for the most recent months." },
    sources: [
      { tag: "1 km · climate reference", tagc: "orbital", who: "TERRA & AQUA", h: "MODIS archives (MCD14ML)", p: "Collection 6 until December 2022, then 6.1, with no algorithm change. MODIS has observed without interruption since November 2000: it is the yardstick of the series. Terra alone (2000–2002) is scaled to Terra + Aqua.", f1: "Giglio et al., 2016", f2: "2000 → today" },
      { tag: "375 m · high resolution", tagc: "fire", who: "S-NPP · NOAA-20 · NOAA-21", h: "VIIRS archives (VNP14IMGML, VJ114, VJ214)", p: "Collection 2. VIIRS sees many more small fires than MODIS. Suomi NPP (2012 →) is the pivot; NOAA-20 and NOAA-21 are linked to it over their common years. S-NPP stopped observing on 2 November 2026.", f1: "Schroeder et al., 2014", f2: "2012 → today" },
      { tag: "near real time", tagc: "amber", who: "NASA LANCE / FIRMS", h: "FIRMS API for the latest months", p: "After the end of the monthly archives, detections (standard products, else NRT) are downloaded through the FIRMS API and filtered like the archives. When a month's archive is released, it automatically replaces the API data.", f1: "personal MAP_KEY", f2: "recent months" },
    ],
    filtres: "Filters applied everywhere: type 0 (presumed vegetation fire), MODIS confidence ≥ 30, VIIRS “low” class excluded. Each detection goes to the 0.25° cell containing its centre, day and night kept separate.",
    s2: { n: "02 // The processing pipeline", h: "From raw detections to the harmonized series", p: "Seven reproducible steps, run with python -m hexafire in the backend folder. Each step writes checked intermediate tables." },
    etapes: [
      ["preparer", "Prepare", "Reads each archive, applies the filters, writes one file per sensor and month. SHA-256 fingerprint and counts are logged: rerunning only processes what is new.", "read = kept + excluded"],
      ["agreger", "Aggregate", "Counts detections per 0.25° cell, month, sensor and day / night, with total FRP. The base table for everything else.", "cell_month"],
      ["occasions", "Opportunities", "Number of overpasses of each satellite over each cell, and days without data (sensor below 10% of its usual activity).", "observation offset"],
      ["calibrer", "Calibrate", "Conditional binomial model: how many MODIS hotspots one VIIRS hotspot is worth, at equal overpasses, per 10° stratum, month of year and day / night, then stabilized by shrinkage.", "2012–2020"],
      ["valider", "Validate", "One year set aside, VIIRS converted as if MODIS no longer existed, monthly verdict compared with real MODIS. Compared with a global factor (M1) and the raw splice (M0).", "kappa, false anomalies"],
      ["serie", "Series", "Assembles one series in MODIS equivalent: measured until 2020, converted afterwards, each month scaled to the same number of overpasses, with status and uncertainty.", "2000-11 → today"],
      ["publier", "Publish", "Writes the files this site reads: index, 5° tiles (cells × months, two units, uncertainty, FRP), 1° monthly maps with departure from normal.", "frontend/public/data"],
    ],
    s3: { n: "03 // The quantities", h: "What the site shows, and in which unit", p: "We carefully separate the count, its uncertainty, the departure from the usual and the radiated energy." },
    grandeurs: [
      { u: "Unit: hotspots", c: "fire", h: "MODIS equivalent", q1: "What it is", p1: "The number of hotspots Terra + Aqua would have detected in the area that month. Measured by MODIS until 2020, computed from converted VIIRS afterwards. A second unit, VIIRS equivalent, applies the same factors the other way.", q2: "How to read it", p2: "A hotspot is not a wildfire: a large fire produces many, many small fires produce none. Compare months with each other, not fires." },
      { u: "Unit: × the normal", c: "amber", h: "Departure from normal", q1: "What it is", p1: "The ratio between the month's value and the median of the same month of the year over 2003–2020, for the same area. Five classes, from “much below” (< 0.5) to “much above” (> 2).", q2: "How to read it", p2: "It is not computed when the reference has fewer than ten years or when the median is below five hotspots. It does not depend on the chosen unit." },
      { u: "Unit: 95% interval", c: "orbital", h: "Conversion uncertainty", q1: "What it is", p1: "Each factor is estimated with a standard error, propagated to the area (same factor within a stratum, independent strata). The tooltip gives the interval; the calendar dots the uncertain verdicts.", q2: "How to read it", p2: "This margin covers the conversion, not clouds or detection limits. In MODIS equivalent it concerns VIIRS and Terra-only months; in VIIRS equivalent, MODIS months." },
      { u: "Unit: megawatts", c: "soft", h: "Fire radiative power (FRP)", q1: "What it is", p1: "The mean FRP per detection of the sensor used that month, shown in the tooltip. It informs on fire intensity.", q2: "How to read it", p2: "It is not harmonized: MODIS and VIIRS do not measure the same power for the same fire. Compare it only between months observed by the same sensor." },
    ],
    s4: { n: "04 // Reading an observation", h: "Four rules before interpreting", p: "Thermal remote sensing has physical limits that must be kept in mind." },
    regles: [
      ["A hotspot is not a fire", "A single large wildfire triggers dozens of detections per overpass; ten small burns in one pixel give only one. Counts indicate extent and activity, not a number of fires."],
      ["What the satellite cannot see does not exist for it", "Clouds, thick plumes and dense canopy hide fires. The absence of hotspots does not prove the absence of fire. Months with partial coverage are hatched in the calendar."],
      ["375 m and 1 km cannot be compared directly", "At equal overpasses, VIIRS detects about five times more hotspots by day and fifteen times more by night, and this ratio varies with region and season. That is the whole point of the conversion per stratum, month and day / night."],
      ["The usual gives the meaning", "In Sudanian savannas or the Cerrado, fire is seasonal and expected. Only the departure from the 2003–2020 normal says whether a month is really unusual."],
    ],
    s5: { n: "05 // Validation", h: "Does the conversion give the right verdicts?", p: "For each test year, the factors are refitted without it, VIIRS is converted and the monthly verdict (low / normal / high) is compared with real MODIS." },
    s6: { n: "06 // Open science", h: "Sources, provenance and access", p: "All visualized data comes from open space programmes. Detailed provenance is in docs/data-sources.md of the repository." },
    fournisseurs: [["NASA FIRMS", "active fire detections", CONFIG.liens.firms], ["MODIS Fire (UMD)", "MCD14ML archives", "https://modis-fire.umd.edu/"], ["VIIRS 375 m (UMD)", "VNP14IMGML archives", "https://viirsfire.geog.umd.edu/"], ["NASA GIBS", "globe basemap (Black Marble)", "https://earthdata.nasa.gov/gibs"], ["Natural Earth", "country borders", "https://www.naturalearthdata.com/"], ["HEXAFIRE repository", "code and documentation", CONFIG.liens.depot]],
    cta: { h: "Ready to read the series?", p: "Open the globe, choose an area, and look at twenty-five years of fire on a single scale.", b1: "Open the globe", b2: "Compare regions" },
  },
};

const tete = s => `<div class="section-head"><div><span class="eyebrow telemetry">${s.n}</span><h2 class="headline-lg">${s.h}</h2></div><p>${s.p}</p></div>`;
const tagCouleur = { orbital: "tag orbital", fire: "tag fire", amber: "tag", soft: "tag" };

function rendre() {
  const c = C[getLangue()] || C.fr;
  const idx = getIndex();
  document.getElementById("facts").innerHTML = [1, 2, 3, 4].map(i => `<div class="stat"><span class="label">${t("me.f" + i)}</span><span class="value">${t(`me.f${i}v`)}</span><span class="ctx">${t(`me.f${i}c`)}</span></div>`).join("");
  document.getElementById("sections").innerHTML = `
    <section class="me-section tinted"><div class="wrap">${tete(c.s1)}
      <div class="grid grid-3">${c.sources.map(s => `<article class="card source-card"><div class="head"><span class="${tagCouleur[s.tagc]}">${s.tag}</span><span class="telemetry dim">${s.who}</span></div><h3 class="headline-md">${s.h}</h3><p>${s.p}</p><div class="foot"><span>${s.f1}</span><span class="${s.tagc === "fire" ? "fire" : s.tagc === "orbital" ? "orbital" : "amber"}">${s.f2}</span></div></article>`).join("")}</div>
      <p class="muted" style="margin-top:var(--space-lg);max-width:60rem;font-size:.9rem">${c.filtres}</p></div></section>
    <section class="me-section"><div class="wrap">${tete(c.s2)}
      <div class="pipeline">${c.etapes.map(([cmd, h, p, f], i) => `<article class="card flat stage"><div class="row between"><span class="n">${String(i + 1).padStart(2, "0")}</span><code>hexafire ${cmd}</code></div><h4 class="headline-md">${h}</h4><p>${p}</p><div class="foot">${f}</div></article>`).join("")}</div>
      <p class="formula">N<sub>MODIS</sub> ≈ N<sub>VIIRS</sub> · exp(α<sub>strate, mois, jour/nuit</sub>) · E<sub>Terra</sub>+E<sub>Aqua</sub> / E<sub>S-NPP</sub></p></div></section>
    <section class="me-section tinted"><div class="wrap">${tete(c.s3)}
      <div class="grid grid-2">${c.grandeurs.map(g => `<article class="card metric"><div class="row between telemetry"><span class="${g.c}">${g.u}</span><span class="pip ${g.c === "amber" ? "amber" : g.c === "orbital" ? "orbital" : ""}"></span></div><h3 class="headline-md" style="margin-top:.6rem">${g.h}</h3><h5>${g.q1}</h5><p>${g.p1}</p><h5>${g.q2}</h5><p>${g.p2}</p></article>`).join("")}</div></div></section>
    <section class="me-section"><div class="wrap">${tete(c.s4)}
      <div class="grid grid-2">${c.regles.map(([h, p], i) => `<article class="card flat principle"><div class="row"><span class="num">${i + 1}</span><h4 class="headline-md">${h}</h4></div><p>${p}</p></article>`).join("")}</div></div></section>
    <section class="me-section tinted"><div class="wrap">${tete(c.s5)}<div class="card flat" id="validation"></div></div></section>
    <section class="me-section"><div class="wrap">${tete(c.s6)}
      <div class="providers">${c.fournisseurs.map(([b, s, u]) => `<a class="provider" href="${u}" target="_blank" rel="noopener"><b>${b}</b><span class="foot"><span>${s}</span>${icon("external")}</span></a>`).join("")}</div>
      <div class="cta-row"><div class="row" style="gap:var(--space-md)"><span class="ico">${icon("globe")}</span><div><h4 class="headline-md" style="font-size:1.15rem">${c.cta.h}</h4><p class="muted" style="font-size:.9rem">${c.cta.p}</p></div></div>
        <div class="row"><a class="btn btn-primary" href="explore.html">${c.cta.b1}<span class="arrow">→</span></a><a class="btn btn-ghost" href="compare.html">${c.cta.b2}</a></div></div></div></section>`;
  tableValidation(document.getElementById("validation"), idx ? idx.validation : null);
  appliquerTextes();
}

async function demarrer() {
  monterShell({ page: "methodology" });
  try { signalerExemple(await chargerIndex()); } catch { /* la page reste lisible sans données */ }
  rendre();
  surChangementLangue(rendre);
}
demarrer();

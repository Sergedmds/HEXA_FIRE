// Code written with the help of Claude (Anthropic), a Super Intelligence (SI) assistant, then run and tested by team HEXAFIRE.
// Textes de l'interface en français et en anglais, formatage des nombres.
// Dans le HTML : data-i18n="cle" (texte), data-i18n-html="cle" (HTML), data-i18n-title, data-i18n-aria, data-i18n-ph.
// Chaque page peut enrichir le dictionnaire avec ajouterTextes({fr: {...}, en: {...}}).

const T = {
  fr: {
    // coquille
    "nav.home": "Accueil", "nav.explore": "Explorer", "nav.compare": "Comparer", "nav.methodology": "À propos et guide",
    "shell.si": "Ce site a été réalisé avec l'aide d'outils de Super Intelligence (SI) : Claude (Anthropic) pour le code et les textes, Google Stitch pour les maquettes. Les images marquées « Image générée par SI » ont été générées par SI. Détails dans le <a href=\"https://github.com/Sergedmds/HEXA_FIRE#use-of-si-tools\" target=\"_blank\" rel=\"noopener\">dépôt du projet</a>.", "shell.ai_img": "Image générée par SI",
    "shell.sub": "Observatoire planétaire des feux", "shell.launch": "Ouvrir le globe", "shell.menu": "Menu",
    "shell.example": "Données d'exemple (fictives) : lancez python -m hexafire publier pour la série réelle",
    "shell.sources": "Sources", "shell.github": "Dépôt GitHub", "shell.docs": "Documentation",
    "shell.copyright": "Équipe HEXAFIRE, ENSGMM / UNSTIM (Bénin). NASA Space Apps Challenge 2026. Données fournies en l'état.",
    "shell.grid": "Grille 0,25° · WGS84 · EPSG:4326",
    "shell.ack": "We acknowledge the use of data and/or imagery from NASA's Fire Information for Resource Management System (FIRMS) (<a href=\"https://www.earthdata.nasa.gov/firms\" target=\"_blank\" rel=\"noopener\">earthdata.nasa.gov/firms</a>), part of NASA's Earth Science Data and Information System (ESDIS).",
    "shell.lang": "English version",
    // erreurs
    "err.index": "Données introuvables. Dans le dossier backend, lancez : <code>python -m hexafire publier --exemple</code> (jeu fictif) ou <code>python -m hexafire publier</code> (série réelle), puis rechargez.",
    "err.maplibre": "Le globe n'a pas pu être chargé (connexion ou WebGL indisponible). Les coordonnées restent saisissables.",
    "err.lieu": "Recherche de lieu indisponible (pas de connexion).", "err.lieu_aucun": "Lieu introuvable.",
    // zones
    "zone.point": "Point + rayon", "zone.cercle": "Cercle", "zone.rect": "Rectangle", "zone.poly": "Polygone", "zone.pays": "Pays", "zone.region": "Région",
    "zone.rayon": "Rayon", "zone.lat": "Latitude", "zone.lon": "Longitude",
    "zone.nord": "Nord", "zone.sud": "Sud", "zone.ouest": "Ouest", "zone.est": "Est",
    "zone.pays_choisir": "Choisir un pays…", "zone.pays_indispo": "Liste des pays indisponible : lancez python -m hexafire pays",
    "zone.d_rect": (s, n, o, e) => `Rectangle ${s}° à ${n}° N, ${o}° à ${e}° E`,
    "zone.d_cercle": (r, la, lo) => `Cercle de ${r} km autour de ${la}°, ${lo}°`,
    "zone.d_poly": n => `Polygone de ${n} sommets`,
    "zone.aire": "Superficie", "zone.cellules": n => `${n} cellules de 0,25° avec au moins un point chaud`,
    "zone.vide": "Aucune activité détectée dans cette zone sur toute la période. Agrandissez-la.",
    // unités, statuts
    "u.modis": "Équivalent MODIS", "u.viirs": "Équivalent VIIRS (S-NPP)", "u.modis_court": "équiv. MODIS", "u.viirs_court": "équiv. VIIRS",
    "u.points": "points chauds", "u.frp": "FRP moyenne",
    "statut.mesuré": "mesuré", "statut.converti": "converti", "statut.provisoire": "provisoire",
    "statut.couverture partielle": "couverture partielle", "statut.non observé": "non observé",
    "source.VIIRS (converti)": "VIIRS (converti)", "source.MODIS provisoire": "MODIS provisoire",
    "refus.ref_insuffisante": "référence insuffisante", "refus.effectif_faible": "effectif trop faible",
    "nd": "n.d.",
    // calendrier
    "mois": ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
    "mois_long": ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
    "cal.aria": "Calendrier mensuel des points chauds harmonisés",
    "cl.tres_inf": "Très inférieure (< 0,5)", "cl.inf": "Inférieure (0,5–0,8)", "cl.normale": "Normale (0,8–1,25)",
    "cl.sup": "Supérieure (1,25–2)", "cl.tres_sup": "Très supérieure (> 2)",
    "cl.court.tres_inf": "très inférieure", "cl.court.inf": "inférieure", "cl.court.normale": "normale", "cl.court.sup": "supérieure", "cl.court.tres_sup": "très supérieure",
    "lg.faible": "Faible", "lg.fort": "Fort", "lg.converti": "◥ converti ou provisoire", "lg.partiel": "▨ couverture partielle / non observé",
    "lg.zero": "· aucun point chaud", "lg.incertain": "┆ verdict incertain", "lg.refus": "normale trop faible pour un écart",
    // infobulle
    "b.non_observe": "aucune valeur (non observé)", "b.valeur": (v, u) => `${v} points chauds (${u})`,
    "b.mediane": v => `normale du mois (médiane 2003–2020) : ${v}`, "b.rapport": v => `soit ${v} × la normale`,
    "b.source": (s, c) => `source ${s}, ${c} % des jours observés`,
    "b.ic": (a, b) => `entre ${a} et ${b} (intervalle à 95 % de la conversion)`,
    "b.frp": (v, s) => `FRP moyenne ${v} MW par détection (${s}, non harmonisée)`,
    "b.brut": (n, f) => `${n} détections brutes, facteur moyen ${f}`,
    "b.incertain": "verdict incertain", "b.cellule": "cellule de 1°",
    // graphiques
    "g.profil_aria": "Profil saisonnier, médiane et quartiles par mois", "g.profil_note": "barres : médiane 2003–2020 · traits : 1er au 3e quartile",
    "g.saison_aria": "Saison en cours comparée aux saisons passées", "g.pas_donnees": "Pas de données.",
    "g.saison_note": (a, b) => `trait plein : saison ${a}–${b} · tirets : médiane · bande : 80 % des saisons 2003–2019`,
    "g.brut_absent": "Série brute non publiée.", "g.brut_aria": "Total annuel brut et harmonisé", "g.bascule": "passage à VIIRS",
    "g.brut_note": "gris : détections brutes (MODIS puis VIIRS) · orange : série harmonisée (équivalent MODIS)",
    "g.bande": "La bande orange pâle montre l'intervalle à 95 % de la conversion.",
    "t.annee": "Année", "t.total": "Total", "t.rang": "Rang", "t.mois": "Mois", "t.valeur": "Valeur", "t.x_mediane": "× normale",
    "meth.HEXAFIRE": "HEXAFIRE", "meth.M1 facteur global": "M1 facteur global", "meth.M0 raccord brut": "M0 raccord brut",
    "v.absente": "Résultats de validation non publiés.", "v.critere": "Critère", "v.cible": "Cible",
    "v.kappa": "Accord des verdicts (kappa)", "v.fausses_anomalies": "Fausses anomalies", "v.biais_median": "Biais",
    "v.erreur_mediane": "Erreur typique", "v.marche_max_annee": "Saut d'une année à l'autre",
    "v.note": "Pour chaque année testée, les facteurs sont calculés sans elle, puis VIIRS est converti cette année-là et comparé au vrai MODIS. M0 utilise VIIRS sans conversion, M1 un seul facteur pour le monde entier.",
    // export
    "x.titre": "HEXAFIRE - calendrier harmonisé des points chauds",
    "x.avert": "Un point chaud n'est pas un incendie ; l'absence de point chaud ne prouve pas l'absence de feu.",
    "x.exemple": "DONNEES D'EXEMPLE FICTIVES",
    "avertissement": "Un point chaud n'est pas un incendie, et l'absence de point chaud ne prouve pas l'absence de feu.",
  },
  en: {
    "nav.home": "Home", "nav.explore": "Explore", "nav.compare": "Compare", "nav.methodology": "About & guide",
    "shell.si": "This site was built with the help of Super Intelligence (SI) tools: Claude (Anthropic) for code and text, Google Stitch for the mockups. Images marked “SI-generated image” were generated with SI. Details in the <a href=\"https://github.com/Sergedmds/HEXA_FIRE#use-of-si-tools\" target=\"_blank\" rel=\"noopener\">project repository</a>.", "shell.ai_img": "SI-generated image",
    "shell.sub": "Planetary fire observatory", "shell.launch": "Open the globe", "shell.menu": "Menu",
    "shell.example": "Example data (fictitious): run python -m hexafire publier for the real series",
    "shell.sources": "Sources", "shell.github": "GitHub repository", "shell.docs": "Documentation",
    "shell.copyright": "Team HEXAFIRE, ENSGMM / UNSTIM (Benin). NASA Space Apps Challenge 2026. Data provided as is.",
    "shell.grid": "0.25° grid · WGS84 · EPSG:4326",
    "shell.ack": "We acknowledge the use of data and/or imagery from NASA's Fire Information for Resource Management System (FIRMS) (<a href=\"https://www.earthdata.nasa.gov/firms\" target=\"_blank\" rel=\"noopener\">earthdata.nasa.gov/firms</a>), part of NASA's Earth Science Data and Information System (ESDIS).",
    "shell.lang": "Version française",
    "err.index": "Data not found. In the backend folder, run: <code>python -m hexafire publier --exemple</code> (fictitious set) or <code>python -m hexafire publier</code> (real series), then reload.",
    "err.maplibre": "The globe could not be loaded (offline or WebGL unavailable). Coordinates can still be typed.",
    "err.lieu": "Place search unavailable (offline).", "err.lieu_aucun": "Place not found.",
    "zone.point": "Point + radius", "zone.cercle": "Circle", "zone.rect": "Rectangle", "zone.poly": "Polygon", "zone.pays": "Country", "zone.region": "Region",
    "zone.rayon": "Radius", "zone.lat": "Latitude", "zone.lon": "Longitude",
    "zone.nord": "North", "zone.sud": "South", "zone.ouest": "West", "zone.est": "East",
    "zone.pays_choisir": "Choose a country…", "zone.pays_indispo": "Country list unavailable: run python -m hexafire pays",
    "zone.d_rect": (s, n, o, e) => `Box ${s}° to ${n}° N, ${o}° to ${e}° E`,
    "zone.d_cercle": (r, la, lo) => `${r} km circle around ${la}°, ${lo}°`,
    "zone.d_poly": n => `Polygon with ${n} vertices`,
    "zone.aire": "Area", "zone.cellules": n => `${n} cells of 0.25° with at least one hotspot`,
    "zone.vide": "No activity detected in this area over the whole period. Enlarge it.",
    "u.modis": "MODIS equivalent", "u.viirs": "VIIRS equivalent (S-NPP)", "u.modis_court": "MODIS eq.", "u.viirs_court": "VIIRS eq.",
    "u.points": "hotspots", "u.frp": "mean FRP",
    "statut.mesuré": "measured", "statut.converti": "converted", "statut.provisoire": "provisional",
    "statut.couverture partielle": "partial coverage", "statut.non observé": "not observed",
    "source.VIIRS (converti)": "VIIRS (converted)", "source.MODIS provisoire": "MODIS (provisional)",
    "refus.ref_insuffisante": "insufficient reference", "refus.effectif_faible": "counts too low",
    "nd": "n/a",
    "mois": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    "mois_long": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    "cal.aria": "Monthly calendar of harmonized hotspots",
    "cl.tres_inf": "Much below (< 0.5)", "cl.inf": "Below (0.5–0.8)", "cl.normale": "Normal (0.8–1.25)",
    "cl.sup": "Above (1.25–2)", "cl.tres_sup": "Much above (> 2)",
    "cl.court.tres_inf": "much below", "cl.court.inf": "below", "cl.court.normale": "normal", "cl.court.sup": "above", "cl.court.tres_sup": "much above",
    "lg.faible": "Low", "lg.fort": "High", "lg.converti": "◥ converted or provisional", "lg.partiel": "▨ partial coverage / not observed",
    "lg.zero": "· no hotspot", "lg.incertain": "┆ uncertain verdict", "lg.refus": "normal too low for a departure",
    "b.non_observe": "no value (not observed)", "b.valeur": (v, u) => `${v} hotspots (${u})`,
    "b.mediane": v => `normal for this month (2003–2020 median): ${v}`, "b.rapport": v => `that is ${v} × the normal`,
    "b.source": (s, c) => `source ${s}, ${c}% of days observed`,
    "b.ic": (a, b) => `between ${a} and ${b} (95% conversion interval)`,
    "b.frp": (v, s) => `mean FRP ${v} MW per detection (${s}, not harmonized)`,
    "b.brut": (n, f) => `${n} raw detections, mean factor ${f}`,
    "b.incertain": "uncertain verdict", "b.cellule": "1° cell",
    "g.profil_aria": "Seasonal profile: median and quartiles by month", "g.profil_note": "bars: 2003–2020 median · lines: 1st to 3rd quartile",
    "g.saison_aria": "Current season compared with past seasons", "g.pas_donnees": "No data.",
    "g.saison_note": (a, b) => `solid: season ${a}–${b} · dashed: median · band: 80% of 2003–2019 seasons`,
    "g.brut_absent": "Raw series not published.", "g.brut_aria": "Annual raw and harmonized totals", "g.bascule": "switch to VIIRS",
    "g.brut_note": "grey: raw detections (MODIS then VIIRS) · orange: harmonized series (MODIS equivalent)",
    "g.bande": "The pale orange band shows the 95% conversion interval.",
    "t.annee": "Year", "t.total": "Total", "t.rang": "Rank", "t.mois": "Month", "t.valeur": "Value", "t.x_mediane": "× normal",
    "meth.HEXAFIRE": "HEXAFIRE", "meth.M1 facteur global": "M1 global factor", "meth.M0 raccord brut": "M0 raw splice",
    "v.absente": "Validation results not published.", "v.critere": "Criterion", "v.cible": "Target",
    "v.kappa": "Verdict agreement (kappa)", "v.fausses_anomalies": "False anomalies", "v.biais_median": "Bias",
    "v.erreur_mediane": "Typical error", "v.marche_max_annee": "Year-to-year step",
    "v.note": "For each test year, factors are fitted without it, then VIIRS is converted for that year and compared with real MODIS. M0 uses VIIRS without conversion, M1 a single worldwide factor.",
    "x.titre": "HEXAFIRE - harmonized hotspot calendar",
    "x.avert": "A hotspot is not a wildfire; the absence of hotspots does not prove the absence of fire.",
    "x.exemple": "FICTITIOUS EXAMPLE DATA",
    "avertissement": "A hotspot is not a wildfire, and the absence of hotspots does not prove the absence of fire.",
  },
};

let langue = "fr";
const ecouteurs = [];

export function ajouterTextes(dict) {
  for (const l of Object.keys(dict)) Object.assign(T[l] ||= {}, dict[l]);
}

export function getLangue() { return langue; }
export function locale() { return langue === "en" ? "en-GB" : "fr-FR"; }

export function t(cle, ...args) {
  const v = T[langue][cle] ?? T.fr[cle];
  if (v === undefined) return cle.includes(".") ? cle.slice(cle.indexOf(".") + 1) : cle;
  return typeof v === "function" ? v(...args) : v;
}

// Nombre formaté selon la langue ; `compact` pour 12,4 k / 1,2 M
export function nf(x, dec = 0, compact = false) {
  if (x === null || x === undefined || !Number.isFinite(x)) return t("nd");
  return new Intl.NumberFormat(locale(), compact
    ? { notation: "compact", maximumFractionDigits: 1 }
    : { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(x);
}
export const pct = (x, dec = 0) => (Number.isFinite(x) ? `${x > 0 ? "+" : ""}${nf(x * 100, dec)} %` : t("nd"));
export const nomMois = k => t("mois")[k];
export const nomMoisLong = k => t("mois_long")[k];

export function appliquerTextes(racine = document) {
  document.documentElement.lang = langue;
  racine.querySelectorAll("[data-i18n]").forEach(e => (e.textContent = t(e.dataset.i18n)));
  racine.querySelectorAll("[data-i18n-html]").forEach(e => (e.innerHTML = t(e.dataset.i18nHtml)));
  racine.querySelectorAll("[data-i18n-title]").forEach(e => (e.title = t(e.dataset.i18nTitle)));
  racine.querySelectorAll("[data-i18n-aria]").forEach(e => e.setAttribute("aria-label", t(e.dataset.i18nAria)));
  racine.querySelectorAll("[data-i18n-ph]").forEach(e => (e.placeholder = t(e.dataset.i18nPh)));
  const titre = document.querySelector("title[data-i18n-doc]");
  if (titre) document.title = t(titre.dataset.i18nDoc);
}

export function choisirLangue(l, notifier = true) {
  langue = l === "fr" ? "fr" : "en";
  try { localStorage.setItem("hexafire-langue", langue); } catch { /* stockage indisponible */ }
  appliquerTextes();
  if (notifier) ecouteurs.forEach(f => f(langue));
}

export function langueInitiale() {
  const h = new URLSearchParams(location.hash.replace(/^#/, "")).get("l");
  if (h === "fr" || h === "en") return h;
  try { const l = localStorage.getItem("hexafire-langue"); if (l) return l; } catch { /* ignoré */ }
  return "en";
}

export function surChangementLangue(f) { ecouteurs.push(f); }

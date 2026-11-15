// Code written with the help of Claude (Anthropic), a Super Intelligence (SI) assistant, then run and tested by team HEXAFIRE.
// "About & guide" page: what the site shows, how to use it, key terms, limits. Plain words, same content in both languages.
import { CONFIG } from "../../config/app.js";
import { monterShell, signalerExemple } from "../../layouts/shell.js";
import { t, getLangue, ajouterTextes, surChangementLangue, appliquerTextes } from "../../utils/i18n.js";
import { chargerIndex } from "../../services/data.js";
import { icon } from "../../components/icons.js";

ajouterTextes({
  en: { "me.doc": "HEXAFIRE · About & guide", "me.h1": "Twenty-five years of fire, on one timeline",
        "me.lead": "HEXAFIRE shows where and when vegetation fires were seen from space, anywhere on Earth, from November 2000 to today. This page explains what you are looking at and how to use the site, in plain words.",
        "hotspot.text": "A hotspot is a spot on the ground that a satellite saw as much hotter than its surroundings when it passed over, usually a fire burning at that moment. One large fire can produce many hotspots; small fires, or fires hidden by clouds, may produce none. Hotspots tell you where and when fire activity happens, not how many fires there were." },
  fr: { "me.doc": "HEXAFIRE · À propos et guide", "me.h1": "Vingt-cinq ans de feux, sur une seule ligne du temps",
        "me.lead": "HEXAFIRE montre où et quand des feux de végétation ont été vus depuis l'espace, partout sur Terre, de novembre 2000 à aujourd'hui. Cette page explique ce que vous regardez et comment utiliser le site, en mots simples.",
        "hotspot.text": "Un point chaud est un endroit du sol qu'un satellite a vu nettement plus chaud que ses alentours à son passage, en général un feu en train de brûler à ce moment-là. Un grand feu peut produire beaucoup de points chauds ; de petits feux, ou des feux cachés par les nuages, peuvent n'en produire aucun. Les points chauds indiquent où et quand il y a de l'activité de feu, pas combien de feux il y a eu." },
});

const C = {
  en: {
    s1: { h: "Two satellites, one story" },
    sats: [
      ["MODIS, since 2000", "NASA's Terra and Aqua satellites have spotted fires every day since 2000. Their view is coarse: each pixel covers about one kilometre."],
      ["VIIRS, since 2012", "The newer VIIRS instruments (Suomi NPP, NOAA-20, NOAA-21) see finer detail, about 375 metres. They notice many small fires that MODIS misses, so they count far more hotspots for the same amount of fire."],
      ["Making them agree", "Put end to end, the two records would show a jump in fire activity around 2021 that never happened. HEXAFIRE used the years when both satellites flew together (2012–2020) to learn how to translate VIIRS counts into MODIS counts. The result is one continuous series: a month in 2024 can be compared fairly with a month in 2005."],
    ],
    s2: { h: "How to use the site" },
    guide: [
      ["Explore", ["Pick an area: search a place or a country, click the globe, or draw a rectangle or a polygon.", "Read the summary in plain words, then the three key figures.", "Look at the calendar: one row per year, one square per month. Switch between “Count” and “Departure from normal”.", "Use the monthly layer to play the months on the globe, or click a square of the calendar.", "Download the numbers (CSV) or copy the link to share exactly what you see."]],
      ["Compare", ["Choose two areas from the list, or type a point and a radius, and a year for each.", "Press “Compare”: the site reads both areas and writes the comparison in a few sentences.", "Switch the measure: hotspots, hotspots per area (fairer for areas of different sizes), or compared with usual."]],
    ],
    s3: { h: "Key terms" },
    termes: [
      ["Hotspot", ""],
      ["Usual level", "For each month of the year and each area, the usual level is the middle value observed over 2003–2020. “Departure from normal” tells you whether a month had more or less fire than that. It is not computed when an area usually has almost no fire in that month."],
      ["Measured or estimated", "Until 2020 the numbers are what the MODIS satellites measured. From 2021 they are estimated from VIIRS, translated to the MODIS scale. Squares with a small corner mark in the calendar are estimated."],
      ["Hatched squares", "The satellite did not observe the whole month (for example after a breakdown, or for the month in progress). Read those months with care."],
      ["MODIS scale and VIIRS scale", "Next to the calendar you can count on either scale. Only the size of the numbers changes; the comparison with usual years stays the same."],
    ],
    s4: { h: "What the site does and does not do" },
    fait: ["Shows monthly fire activity anywhere on Earth since November 2000, on one consistent scale.", "Tells you whether a month, or a year, had more or less fire than usual for that place.", "Lets you compare two places or two periods fairly."],
    faitpas: ["It is not real time: the series is monthly, and the most recent months are provisional.", "It does not count individual fires or burned area, and it cannot see fires hidden by clouds or dense smoke.", "It does not forecast fire danger and does not replace local warnings or emergency services."],
    s5: { h: "Data" },
    donnees: "All fire detections come from NASA's active fire products (MODIS and VIIRS), distributed by NASA FIRMS and the University of Maryland. The globe background is NASA's Black Marble night imagery. Country borders come from Natural Earth. The full description of the method and the code are in the project repository.",
    liens: [["NASA FIRMS", CONFIG.liens.firms], ["Project repository", CONFIG.liens.depot]],
    cta: { h: "Ready to look?", p: "Open the globe, choose a place, and read its fire history.", b1: "Open the globe", b2: "Compare regions" },
  },
  fr: {
    s1: { h: "Deux satellites, une seule histoire" },
    sats: [
      ["MODIS, depuis 2000", "Les satellites Terra et Aqua de la NASA repèrent les feux chaque jour depuis 2000. Leur vue est grossière : chaque pixel couvre environ un kilomètre."],
      ["VIIRS, depuis 2012", "Les instruments VIIRS, plus récents (Suomi NPP, NOAA-20, NOAA-21), voient plus fin, environ 375 mètres. Ils remarquent beaucoup de petits feux que MODIS manque, et comptent donc bien plus de points chauds pour la même quantité de feu."],
      ["Les faire concorder", "Mis bout à bout, les deux enregistrements montreraient un saut d'activité vers 2021 qui n'a jamais eu lieu. HEXAFIRE a utilisé les années où les deux satellites volaient ensemble (2012–2020) pour apprendre à traduire les comptages VIIRS en comptages MODIS. Le résultat est une seule série continue : un mois de 2024 se compare honnêtement à un mois de 2005."],
    ],
    s2: { h: "Comment utiliser le site" },
    guide: [
      ["Explorer", ["Choisissez une zone : cherchez un lieu ou un pays, cliquez sur le globe, ou dessinez un rectangle ou un polygone.", "Lisez le résumé en mots simples, puis les trois chiffres clés.", "Regardez le calendrier : une ligne par année, une case par mois. Passez de « Nombre » à « Écart à la normale ».", "Utilisez la couche du mois pour faire défiler les mois sur le globe, ou cliquez une case du calendrier.", "Téléchargez les chiffres (CSV) ou copiez le lien pour partager exactement ce que vous voyez."]],
      ["Comparer", ["Choisissez deux zones dans la liste, ou saisissez un point et un rayon, et une année pour chacune.", "Appuyez sur « Comparer » : le site lit les deux zones et écrit la comparaison en quelques phrases.", "Changez de mesure : points chauds, points chauds par surface (plus juste pour des zones de tailles différentes), ou par rapport à d'habitude."]],
    ],
    s3: { h: "Mots clés" },
    termes: [
      ["Point chaud", ""],
      ["Niveau habituel", "Pour chaque mois de l'année et chaque zone, le niveau habituel est la valeur médiane observée sur 2003–2020. « Écart à la normale » vous dit si un mois a eu plus ou moins de feu que cela. Il n'est pas calculé quand une zone n'a presque jamais de feu ce mois-là."],
      ["Mesuré ou estimé", "Jusqu'en 2020, les chiffres sont ce que les satellites MODIS ont mesuré. À partir de 2021, ils sont estimés à partir de VIIRS, traduits à l'échelle MODIS. Les cases avec une petite marque dans le coin du calendrier sont estimées."],
      ["Cases hachurées", "Le satellite n'a pas observé tout le mois (par exemple après une panne, ou pour le mois en cours). Lisez ces mois avec prudence."],
      ["Échelle MODIS et échelle VIIRS", "À côté du calendrier, vous pouvez compter sur l'une ou l'autre échelle. Seule la taille des nombres change ; la comparaison avec les années habituelles reste la même."],
    ],
    s4: { h: "Ce que le site fait et ne fait pas" },
    fait: ["Montre l'activité mensuelle des feux partout sur Terre depuis novembre 2000, sur une échelle cohérente.", "Vous dit si un mois, ou une année, a eu plus ou moins de feu que d'habitude à cet endroit.", "Permet de comparer honnêtement deux lieux ou deux périodes."],
    faitpas: ["Ce n'est pas du temps réel : la série est mensuelle, et les mois les plus récents sont provisoires.", "Il ne compte ni les incendies un par un ni les surfaces brûlées, et ne voit pas les feux cachés par les nuages ou une fumée dense.", "Il ne prévoit pas le danger d'incendie et ne remplace ni les alertes locales ni les services de secours."],
    s5: { h: "Données" },
    donnees: "Toutes les détections de feux proviennent des produits de feux actifs de la NASA (MODIS et VIIRS), distribués par NASA FIRMS et l'université du Maryland. Le fond du globe est l'imagerie nocturne Black Marble de la NASA. Les frontières viennent de Natural Earth. La description complète de la méthode et le code sont dans le dépôt du projet.",
    liens: [["NASA FIRMS", CONFIG.liens.firms], ["Dépôt du projet", CONFIG.liens.depot]],
    cta: { h: "Prêt à regarder ?", p: "Ouvrez le globe, choisissez un lieu et lisez son histoire du feu.", b1: "Ouvrir le globe", b2: "Comparer des régions" },
  },
};

const tete = s => `<div class="section-head"><h2 class="headline-lg">${s.h}</h2></div>`;

function rendre() {
  const c = C[getLangue()] || C.en;
  c.termes[0][1] = t("hotspot.text");
  document.getElementById("sections").innerHTML = `
    <section class="me-section tinted"><div class="wrap">${tete(c.s1)}
      <div class="grid grid-3">${c.sats.map(([h, p], i) => `<article class="card flat principle"><div class="row"><span class="num">${i + 1}</span><h4 class="headline-md">${h}</h4></div><p>${p}</p></article>`).join("")}</div></div></section>
    <section class="me-section"><div class="wrap">${tete(c.s2)}
      <div class="grid grid-2">${c.guide.map(([h, etapes]) => `<article class="card flat guide"><h3 class="headline-md">${h}</h3><ol>${etapes.map(e => `<li>${e}</li>`).join("")}</ol></article>`).join("")}</div></div></section>
    <section class="me-section tinted"><div class="wrap">${tete(c.s3)}
      <div class="grid grid-2">${c.termes.map(([h, p]) => `<article class="card flat principle"><h4 class="headline-md">${h}</h4><p>${p}</p></article>`).join("")}</div></div></section>
    <section class="me-section"><div class="wrap">${tete(c.s4)}
      <div class="grid grid-2">
        <article class="card flat dodont"><ul class="does">${c.fait.map(x => `<li>${icon("check")}<span>${x}</span></li>`).join("")}</ul></article>
        <article class="card flat dodont"><ul class="donts">${c.faitpas.map(x => `<li>${icon("close")}<span>${x}</span></li>`).join("")}</ul></article>
      </div></div></section>
    <section class="me-section tinted"><div class="wrap">${tete(c.s5)}
      <p class="lead" style="max-width:60rem">${c.donnees}</p>
      <div class="row" style="margin-top:var(--space-md)">${c.liens.map(([b, u]) => `<a class="btn btn-ghost btn-sm" href="${u}" target="_blank" rel="noopener">${b} ${icon("external")}</a>`).join("")}</div>
      <div class="cta-row"><div class="row" style="gap:var(--space-md)"><span class="ico">${icon("globe")}</span><div><h4 class="headline-md" style="font-size:1.15rem">${c.cta.h}</h4><p class="muted" style="font-size:.9rem">${c.cta.p}</p></div></div>
        <div class="row"><a class="btn btn-primary" href="explore.html">${c.cta.b1}<span class="arrow">→</span></a><a class="btn btn-ghost" href="compare.html">${c.cta.b2}</a></div></div></div></section>`;
  appliquerTextes();
}

async function demarrer() {
  monterShell({ page: "methodology" });
  try { signalerExemple(await chargerIndex()); } catch { /* the page stays readable without data */ }
  rendre();
  surChangementLangue(rendre);
}
demarrer();

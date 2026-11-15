// Code written with the help of Claude (Anthropic), a Super Intelligence (SI) assistant, then run and tested by team HEXAFIRE.
// Page « About & guide » : ce que montre le site, comment le lire, mots utiles, limites. Langage simple, même contenu en anglais et en français.
import { CONFIG } from "../../config/app.js";
import { monterShell, signalerExemple } from "../../layouts/shell.js";
import { getLangue, ajouterTextes, surChangementLangue, appliquerTextes } from "../../utils/i18n.js";
import { chargerIndex } from "../../services/data.js";

ajouterTextes({
  en: {
    "me.doc": "HEXAFIRE · About & guide",
    "me.h1": "Twenty-five years of fire, on one timeline",
    "me.lead": "HEXAFIRE shows where and when fires were seen from space, anywhere on Earth, from 2000 to today. This page explains in a few words what you are looking at and how to use the site.",
  },
  fr: {
    "me.doc": "HEXAFIRE · À propos et guide",
    "me.h1": "Vingt-cinq ans de feux, sur une seule ligne du temps",
    "me.lead": "HEXAFIRE montre où et quand des feux ont été vus depuis l'espace, partout sur Terre, de 2000 à aujourd'hui. Cette page explique en quelques mots ce que vous regardez et comment utiliser le site.",
  },
});

const C = {
  en: {
    blocs: [
      ["What the site does", "Choose an area and see, month by month, how many fire hotspots satellites detected there since November 2000. You can see which months usually burn, which years were exceptional, and whether this month is unusual."],
      ["What a hotspot is", "A hotspot is a small patch of land that a satellite saw as much hotter than its surroundings. Most of the time it is a burning fire. One large fire can produce many hotspots, while a small fire under clouds may produce none."],
      ["Two satellites, one record", "Since 2000, NASA's MODIS instruments have spotted fires from space. Since 2012, the newer VIIRS instruments see much smaller fires, so they count many more hotspots. Put side by side, the two records would show a rise in fires that never happened. HEXAFIRE puts VIIRS on the same scale as MODIS, so that 25 years can be compared fairly."],
      ["How to read the colours", "On the calendar and on the globe, the brighter the orange, the more hotspots there were that month. In the “compared with normal” view, blue means fewer hotspots than usual for that month, grey means usual, and orange to red means more than usual."],
    ],
    guideTitre: "Using the site",
    guide: [
      "On Explore, choose an area: a country, a shape drawn on the globe, a point with a radius, or a place name.",
      "Read the short summary, then the calendar. Hover a month to see its details.",
      "On Compare, put two areas or two years side by side.",
      "Download the results, or copy the link to share exactly what you see.",
    ],
    motsTitre: "Words you will meet",
    mots: [
      ["Normal", "The usual number of hotspots for the same month, taken from the years 2003 to 2020."],
      ["Compared with normal", "How a month compares with its normal: half, the same, twice as much."],
      ["Converted month", "A month seen by VIIRS and put on the MODIS scale."],
      ["Provisional month", "A recent month that may still change when complete data arrive."],
      ["95% interval", "The range in which the value very likely lies, given the conversion between satellites."],
      ["FRP", "Fire radiative power: how much heat a fire gives off, in megawatts."],
    ],
    limitesTitre: "What the site does not do",
    limites: [
      "It does not count wildfires: it counts hotspots seen from space.",
      "No hotspot does not prove there was no fire. Clouds and smoke can hide fires.",
      "It does not measure burned area and does not forecast fires.",
      "It does not replace field reports or official alerts.",
    ],
    donneesTitre: "Data",
    donnees: "Fire detections from NASA's MODIS and VIIRS instruments, distributed by NASA FIRMS. We acknowledge the use of data and/or imagery from NASA's Fire Information for Resource Management System (FIRMS), part of NASA's Earth Science Data and Information System (ESDIS). NASA does not endorse this project.",
    liens: [["NASA FIRMS", CONFIG.liens.firms], ["Source code and documents", CONFIG.liens.depot]],
    cta: "Start exploring",
  },
  fr: {
    blocs: [
      ["Ce que fait le site", "Choisissez une zone et voyez, mois par mois, combien de points chauds les satellites y ont détectés depuis novembre 2000. Vous voyez quels mois brûlent habituellement, quelles années ont été exceptionnelles et si ce mois-ci sort de l'ordinaire."],
      ["Ce qu'est un point chaud", "Un point chaud est une petite parcelle de terrain qu'un satellite a vue beaucoup plus chaude que ses alentours. Le plus souvent, c'est un feu en train de brûler. Un grand feu peut produire de nombreux points chauds, alors qu'un petit feu sous les nuages peut n'en produire aucun."],
      ["Deux satellites, un seul historique", "Depuis 2000, les instruments MODIS de la NASA repèrent les feux depuis l'espace. Depuis 2012, les instruments VIIRS, plus récents, voient des feux bien plus petits et comptent donc beaucoup plus de points chauds. Mis côte à côte, les deux historiques montreraient une hausse des feux qui n'a jamais eu lieu. HEXAFIRE ramène VIIRS à l'échelle de MODIS, pour comparer équitablement 25 ans."],
      ["Comment lire les couleurs", "Sur le calendrier et sur le globe, plus l'orange est vif, plus il y a eu de points chauds ce mois-là. Dans la vue « comparé à la normale », le bleu signifie moins de points chauds que d'habitude pour ce mois, le gris signifie comme d'habitude, et l'orange au rouge signifie plus que d'habitude."],
    ],
    guideTitre: "Utiliser le site",
    guide: [
      "Sur Explorer, choisissez une zone : un pays, une forme tracée sur le globe, un point avec un rayon ou un nom de lieu.",
      "Lisez le court résumé, puis le calendrier. Survolez un mois pour voir son détail.",
      "Sur Comparer, mettez deux zones ou deux années côte à côte.",
      "Téléchargez les résultats, ou copiez le lien pour partager exactement ce que vous voyez.",
    ],
    motsTitre: "Les mots que vous rencontrerez",
    mots: [
      ["Normale", "Le nombre habituel de points chauds pour le même mois, calculé sur les années 2003 à 2020."],
      ["Comparé à la normale", "Comment un mois se situe par rapport à sa normale : moitié moins, pareil, deux fois plus."],
      ["Mois converti", "Un mois vu par VIIRS et ramené à l'échelle de MODIS."],
      ["Mois provisoire", "Un mois récent qui peut encore changer quand les données complètes arriveront."],
      ["Intervalle à 95 %", "La fourchette dans laquelle se trouve très probablement la valeur, compte tenu de la conversion entre satellites."],
      ["FRP", "Puissance radiative du feu : la chaleur qu'il dégage, en mégawatts."],
    ],
    limitesTitre: "Ce que le site ne fait pas",
    limites: [
      "Il ne compte pas les incendies : il compte les points chauds vus depuis l'espace.",
      "L'absence de point chaud ne prouve pas l'absence de feu. Les nuages et la fumée peuvent cacher des feux.",
      "Il ne mesure pas les surfaces brûlées et ne prévoit pas les feux.",
      "Il ne remplace ni les observations de terrain ni les alertes officielles.",
    ],
    donneesTitre: "Données",
    donnees: "Détections de feux des instruments MODIS et VIIRS de la NASA, diffusées par NASA FIRMS. We acknowledge the use of data and/or imagery from NASA's Fire Information for Resource Management System (FIRMS), part of NASA's Earth Science Data and Information System (ESDIS). La NASA n'approuve pas ce projet.",
    liens: [["NASA FIRMS", CONFIG.liens.firms], ["Code source et documents", CONFIG.liens.depot]],
    cta: "Commencer à explorer",
  },
};

function rendre() {
  const c = C[getLangue()] || C.en;
  document.getElementById("sections").innerHTML = `
    <section class="me-section"><div class="wrap">
      <div class="grid guide-grid">${c.blocs.map(([h, p]) => `<article class="card guide-card"><h2 class="headline-md">${h}</h2><p>${p}</p></article>`).join("")}</div>
    </div></section>
    <section class="me-section tinted"><div class="wrap">
      <h2 class="headline-lg">${c.guideTitre}</h2>
      <ol class="guide-steps">${c.guide.map(s => `<li>${s}</li>`).join("")}</ol>
    </div></section>
    <section class="me-section"><div class="wrap">
      <h2 class="headline-lg">${c.motsTitre}</h2>
      <dl class="glossary">${c.mots.map(([m, d]) => `<div><dt>${m}</dt><dd>${d}</dd></div>`).join("")}</dl>
    </div></section>
    <section class="me-section tinted"><div class="wrap">
      <h2 class="headline-lg">${c.limitesTitre}</h2>
      <ul class="guide-limits">${c.limites.map(s => `<li>${s}</li>`).join("")}</ul>
    </div></section>
    <section class="me-section"><div class="wrap">
      <h2 class="headline-lg">${c.donneesTitre}</h2>
      <p class="muted guide-data">${c.donnees}</p>
      <p class="guide-links">${c.liens.map(([l, u]) => `<a href="${u}" target="_blank" rel="noopener">${l} →</a>`).join("")}</p>
      <p style="margin-top:var(--space-lg)"><a class="btn btn-ember" href="explore.html">${c.cta}<span class="arrow">→</span></a></p>
    </div></section>`;
  appliquerTextes();
}

async function demarrer() {
  monterShell({ page: "methodology" });
  try { signalerExemple(await chargerIndex()); } catch { /* la page reste lisible sans données */ }
  rendre();
  surChangementLangue(rendre);
}
demarrer();

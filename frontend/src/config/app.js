// Configuration de l'application HEXAFIRE (frontend statique, sans étape de compilation).
// Tous les chemins sont relatifs à la racine du dossier frontend/, servie telle quelle.

export const CONFIG = {
  // Dossier produit par `python -m hexafire publier` (moteur, dossier backend/)
  dataBase: "public/data",

  // MapLibre GL JS (projection globe native depuis la version 5)
  maplibre: {
    js: "https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.js",
    css: "https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.css",
  },

  // Fond du globe : NASA GIBS (sans clé). Black Marble = lumières nocturnes VIIRS DNB 2016, jusqu'au niveau 8 ;
  // au-delà, imagerie Esri World Imagery assombrie. Traits de côte, frontières et toponymes : couches de référence GIBS.
  fond: {
    nuit: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png",
    nuitMaxZoom: 8,
    imagerie: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    contours: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/Reference_Features/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png",
    etiquettes: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/Reference_Labels/default/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png",
    referenceMaxZoom: 9,
    attribution: '<a href="https://earthdata.nasa.gov/gibs">NASA GIBS</a> (Black Marble) · Imagery © Esri, Maxar, Earthstar Geographics',
  },

  // Recherche de lieu (une requête par recherche, déclenchée par l'utilisateur)
  nominatim: "https://nominatim.openstreetmap.org/search",

  // Vue initiale du globe
  vueInitiale: { centre: [12, 6], zoom: 1.6 },

  // Zones suggérées (rectangles sud, nord, ouest, est), affichées sous la barre de recherche
  suggestions: [
    { id: "amazonie", nom_fr: "Amazonie", nom_en: "Amazon Basin", zone: { type: "rect", sud: -16, nord: -2, ouest: -70, est: -46 } },
    { id: "afrique_ouest", nom_fr: "Savanes d'Afrique de l'Ouest", nom_en: "West African savannas", zone: { type: "rect", sud: 5, nord: 14, ouest: -17, est: 16 } },
    { id: "congo", nom_fr: "Bassin du Congo", nom_en: "Congo Basin", zone: { type: "rect", sud: -9, nord: 5, ouest: 12, est: 31 } },
    { id: "australie", nom_fr: "Nord de l'Australie", nom_en: "Northern Australia", zone: { type: "rect", sud: -21, nord: -11, ouest: 124, est: 146 } },
    { id: "siberie", nom_fr: "Sibérie", nom_en: "Siberia", zone: { type: "rect", sud: 52, nord: 67, ouest: 88, est: 136 } },
    { id: "mediterranee", nom_fr: "Bassin méditerranéen", nom_en: "Mediterranean Basin", zone: { type: "rect", sud: 34, nord: 46, ouest: -10, est: 30 } },
  ],

  liens: {
    depot: "https://github.com/sergedmds/Hexafire",
    firms: "https://www.earthdata.nasa.gov/firms",
    sources: "docs/data-sources.md",
  },
};

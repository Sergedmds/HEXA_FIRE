// Code written with the help of Claude (Anthropic), a Super Intelligence (SI) assistant, then run and tested by team HEXAFIRE.
// Globe interactif (MapLibre GL JS 5, projection « globe ») : fond nocturne, dessin d'une zone
// (point + rayon, rectangle, polygone), affichage d'un pays, couche mensuelle de 1°, rotation lente au repos.
// Sans connexion ou sans WebGL, creerGlobe() rejette : la page reste utilisable par saisie des coordonnées.
import { CONFIG } from "../config/app.js";
import { geojsonZone, emprise } from "../utils/geo.js";

let promesseLib = null;

export function chargerMapLibre() {
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  if (!promesseLib) {
    promesseLib = new Promise((res, rej) => {
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = CONFIG.maplibre.css; document.head.appendChild(l);
      const s = document.createElement("script"); s.src = CONFIG.maplibre.js; s.async = true;
      s.onload = () => (window.maplibregl ? res(window.maplibregl) : rej(new Error("maplibre")));
      s.onerror = () => rej(new Error("maplibre"));
      document.head.appendChild(s);
    });
    promesseLib.catch(() => { promesseLib = null; });
  }
  return promesseLib;
}

const VIDE = { type: "FeatureCollection", features: [] };

function style(etiquettes) {
  const F = CONFIG.fond;
  const layers = [
    { id: "fond-noir", type: "background", paint: { "background-color": "#060a16" } },
    // lumières nocturnes (Black Marble), légèrement rehaussées
    { id: "nuit", type: "raster", source: "nuit", paint: { "raster-brightness-min": 0.05, "raster-contrast": 0.25, "raster-saturation": -0.1 } },
    // imagerie satellite assombrie, qui prend le relais quand on zoome au-delà du niveau 8
    { id: "imagerie", type: "raster", source: "imagerie", minzoom: 5.5,
      paint: { "raster-opacity": ["interpolate", ["linear"], ["zoom"], 5.5, 0, 7.5, 1], "raster-brightness-max": 0.55, "raster-saturation": -0.35, "raster-contrast": 0.1 } },
    { id: "contours", type: "raster", source: "contours", paint: { "raster-opacity": ["interpolate", ["linear"], ["zoom"], 1, 0.25, 4, 0.5] } },
  ];
  if (etiquettes) layers.push({ id: "etiquettes", type: "raster", source: "etiquettes", minzoom: 2.5, paint: { "raster-opacity": 0.85 } });
  return {
    version: 8,
    projection: { type: "globe" },
    sky: {
      "sky-color": "#0b1f4d", "horizon-color": "#4c6fff", "fog-color": "#070b16",
      "fog-ground-blend": 0.9, "horizon-fog-blend": 0.7, "sky-horizon-blend": 0.85,
      "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 1, 7, 0],
    },
    sources: {
      nuit: { type: "raster", tiles: [F.nuit], tileSize: 256, maxzoom: F.nuitMaxZoom, attribution: F.attribution },
      imagerie: { type: "raster", tiles: [F.imagerie], tileSize: 256, maxzoom: 17 },
      contours: { type: "raster", tiles: [F.contours], tileSize: 256, maxzoom: F.referenceMaxZoom },
      etiquettes: { type: "raster", tiles: [F.etiquettes], tileSize: 256, maxzoom: F.referenceMaxZoom },
    },
    layers,
  };
}

// Zoom pour lequel le globe occupe environ 85 % de la hauteur du conteneur (circonférence ≈ 512 · 2^zoom px)
export function zoomPourHauteur(hauteur) {
  return Math.max(0.8, Math.log2((hauteur * 0.85 * Math.PI) / 512));
}

function carre(lat, lon, pas) {
  const h = pas / 2;
  return [[[lon - h, lat - h], [lon + h, lat - h], [lon + h, lat + h], [lon - h, lat + h], [lon - h, lat - h]]];
}

// options : { centre, zoom, etiquettes, interactif, rotation, surZone(zone), surBrouillon(n), surSurvol(props, ev), surCurseur(lat, lon) }
export async function creerGlobe(conteneur, options = {}) {
  const ml = await chargerMapLibre();
  if (typeof ml.supported === "function" && !ml.supported()) throw new Error("webgl");
  const o = { centre: CONFIG.vueInitiale.centre, zoom: zoomPourHauteur(conteneur.clientHeight || 600), etiquettes: true, interactif: true, rotation: false,
              surZone: () => {}, surBrouillon: () => {}, surSurvol: () => {}, surCurseur: () => {}, ...options };
  const carte = new ml.Map({
    container: conteneur, style: style(o.etiquettes), center: o.centre, zoom: o.zoom, minZoom: 0.6, maxZoom: 11,
    attributionControl: false, dragRotate: false, pitchWithRotate: false, touchPitch: false, interactive: o.interactif,
    canvasContextAttributes: { antialias: true, preserveDrawingBuffer: false },
  });
  carte.addControl(new ml.AttributionControl({ compact: true }), "bottom-left");
  carte.touchZoomRotate.disableRotation();

  let mode = "cercle", premier = null, sommets = [], charge = false, tournoie = false, rafId = 0;
  const attente = [];
  const pret = f => (charge ? f() : attente.push(f));

  carte.on("load", () => {
    try { if (carte.setProjection) carte.setProjection({ type: "globe" }); } catch { /* projection déjà réglée par le style */ }
    carte.addSource("couche", { type: "geojson", data: VIDE });
    carte.addLayer({ id: "couche-fond", type: "fill", source: "couche",
      paint: { "fill-color": ["get", "couleur"], "fill-opacity": 0.72, "fill-outline-color": "rgba(0,0,0,0)" } });
    carte.addSource("zone", { type: "geojson", data: VIDE });
    carte.addLayer({ id: "zone-fond", type: "fill", source: "zone", paint: { "fill-color": "#ff5a1f", "fill-opacity": 0.14 } });
    carte.addLayer({ id: "zone-halo", type: "line", source: "zone", paint: { "line-color": "#ff5a1f", "line-width": 7, "line-opacity": 0.18, "line-blur": 4 } });
    carte.addLayer({ id: "zone-bord", type: "line", source: "zone", paint: { "line-color": "#ff5a1f", "line-width": 1.8 } });
    carte.addSource("brouillon", { type: "geojson", data: VIDE });
    carte.addLayer({ id: "brouillon-ligne", type: "line", source: "brouillon", paint: { "line-color": "#ffb547", "line-width": 1.5, "line-dasharray": [2, 2] } });
    carte.addLayer({ id: "brouillon-sommets", type: "circle", source: "brouillon", filter: ["==", "$type", "Point"],
      paint: { "circle-radius": 4, "circle-color": "#ffdbd0", "circle-stroke-color": "#ff5a1f", "circle-stroke-width": 1.5 } });
    charge = true;
    attente.splice(0).forEach(f => f());
    if (o.rotation) demarrerRotation();
  });

  const brouillon = (coords, points = []) => {
    const src = carte.getSource("brouillon");
    if (!src) return;
    const features = [];
    if (coords && coords.length > 1) features.push({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords } });
    for (const p of points) features.push({ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: p } });
    src.setData({ type: "FeatureCollection", features });
  };

  // --- rotation lente au repos (état initial de la page Explorer)
  function pas() {
    if (!tournoie) return;
    if (carte.getZoom() < 3.2 && !carte.isMoving()) {
      const c = carte.getCenter();
      carte.jumpTo({ center: [c.lng + 0.035, c.lat] });
    }
    rafId = requestAnimationFrame(pas);
  }
  function demarrerRotation() { if (tournoie) return; tournoie = true; rafId = requestAnimationFrame(pas); }
  function arreterRotation() { tournoie = false; cancelAnimationFrame(rafId); }
  for (const ev of ["mousedown", "touchstart", "wheel", "dragstart"]) carte.on(ev, arreterRotation);

  // --- interactions de dessin
  if (o.interactif) {
    carte.on("click", e => {
      arreterRotation();
      const { lat, lng } = e.lngLat;
      if (mode === "cercle") o.surZone({ type: "point", lat, lon: lng });
      else if (mode === "rect") {
        if (!premier) { premier = [lat, lng]; brouillon(null, [[lng, lat]]); o.surBrouillon(1); return; }
        const z = { type: "rect", sud: Math.min(premier[0], lat), nord: Math.max(premier[0], lat), ouest: Math.min(premier[1], lng), est: Math.max(premier[1], lng) };
        premier = null; brouillon(null); o.surBrouillon(0); o.surZone(z);
      } else if (mode === "poly") {
        sommets.push([lng, lat]); brouillon(sommets, sommets); o.surBrouillon(sommets.length);
      }
    });
    carte.on("mousemove", e => {
      o.surCurseur(e.lngLat.lat, e.lngLat.lng);
      if (mode === "rect" && premier) {
        const [la, lo] = premier, { lat, lng } = e.lngLat;
        brouillon([[lo, la], [lng, la], [lng, lat], [lo, lat], [lo, la]], [[lo, la]]);
      } else if (mode === "poly" && sommets.length) {
        brouillon([...sommets, [e.lngLat.lng, e.lngLat.lat]], sommets);
      }
    });
    carte.on("dblclick", e => {
      if (mode !== "poly") return;
      e.preventDefault();
      api.terminerPolygone();
    });
    carte.on("mousemove", "couche-fond", e => {
      const f = e.features && e.features[0];
      o.surSurvol(f ? f.properties : null, e.originalEvent);
      carte.getCanvas().style.cursor = f ? "pointer" : (mode === "pays" ? "" : "crosshair");
    });
    carte.on("mouseleave", "couche-fond", () => o.surSurvol(null));
  }

  const api = {
    carte,
    // cellules : [{lat, lon, couleur, ...}] ; pas : taille des cases en degrés
    couche(cellules, pasDeg) {
      pret(() => carte.getSource("couche").setData({ type: "FeatureCollection", features: cellules.map(c => ({
        type: "Feature", properties: c, geometry: { type: "Polygon", coordinates: carre(c.lat, c.lon, pasDeg) } })) }));
    },
    activer(m) {
      mode = m; premier = null; sommets = [];
      pret(() => brouillon(null));
      o.surBrouillon(0);
      carte.getCanvas().style.cursor = m === "pays" || !o.interactif ? "" : "crosshair";
      if (m === "poly") carte.doubleClickZoom.disable(); else carte.doubleClickZoom.enable();
    },
    terminerPolygone() {
      if (mode !== "poly" || sommets.length < 3) return false;
      const a = [...sommets, sommets[0]]; sommets = [];
      pret(() => brouillon(null)); o.surBrouillon(0);
      o.surZone({ type: "poly", anneaux: [a] });
      return true;
    },
    annulerSommet() { if (sommets.length) { sommets.pop(); brouillon(sommets, sommets); o.surBrouillon(sommets.length); } },
    nSommets: () => sommets.length,
    afficher(zone, { cadrer = true, marge = 60 } = {}) {
      pret(() => {
        arreterRotation();
        carte.getSource("zone").setData(zone ? geojsonZone(zone) : VIDE);
        if (!zone || !cadrer) return;
        const [s, n, w, e] = emprise(zone);
        const centre = [(w + e) / 2, (s + n) / 2];
        let cam = null;
        try { cam = carte.cameraForBounds([[w, s], [e, n]], { padding: marge, maxZoom: 6.5 }); } catch { cam = null; }
        if (cam && cam.center) carte.flyTo({ center: cam.center, zoom: cam.zoom, duration: 900 });
        else {   // emprise trop grande pour le cadre (ou canevas pas encore dimensionné) : cadrage approché
          const zoom = Math.min(6.5, Math.max(0.8, Math.log2(360 / Math.max(e - w, (n - s) * 1.6, 1)) + 0.2));
          carte.flyTo({ center: centre, zoom, duration: 900 });
        }
      });
    },
    effacer() { pret(() => { carte.getSource("zone").setData(VIDE); brouillon(null); }); premier = null; sommets = []; },
    centrer(lat, lon, zoom = 4.5) { arreterRotation(); carte.flyTo({ center: [lon, lat], zoom, duration: 1100 }); },
    zoomer(d) { arreterRotation(); carte.easeTo({ zoom: carte.getZoom() + d, duration: 350 }); },
    reinitialiser() { carte.flyTo({ center: o.centre, zoom: o.zoom, duration: 1200 }); if (o.rotation) setTimeout(demarrerRotation, 1300); },
    rotation(on) { on ? demarrerRotation() : arreterRotation(); },
    redimensionner() { carte.resize(); },
    detruire() { arreterRotation(); carte.remove(); },
  };
  return api;
}

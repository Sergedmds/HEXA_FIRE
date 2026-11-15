# Maquettes Google Stitch

Références visuelles dont le frontend est issu. Chaque dossier contient l'export HTML (Tailwind via CDN, images
distantes) et la capture d'écran.

| Dossier | Page du site | Remarques |
|---|---|---|
| `Home/` | `index.html` | Héros plein écran, section « continuité des capteurs », trois regards, appel final |
| `Explore/` (états A et B) | `explore.html` | État A : recherche, outils, globe ; état B : bandeau de sélection, cycle annuel en douze cartes |
| `Compare/` | `compare.html` | Deux entités A / B, viewports jumeaux, courbes, synthèse |
| `Methodology/` | `methodology.html` | Éditorial aéré en six sections |
| `DESIGN.md` | tout le site | Système de design « Nuit Braise » : couleurs, typographie, espacements, composants |

Écarts volontaires entre maquettes et site :

- les contenus factices des maquettes (Copernicus EMS, latence < 3 h, normale décennale 2014–2023, FRP en GW…) sont
  remplacés par les grandeurs réelles du moteur (normale 2003–2020, équivalent MODIS, validation « une année exclue ») ;
- les icônes Material Symbols sont remplacées par des SVG en ligne, et Tailwind par des feuilles CSS natives
  (`frontend/src/styles/tokens.css` reprend les jetons de `DESIGN.md`) ;
- le globe est un vrai globe (MapLibre GL JS 5, fond NASA Black Marble), pas une image ;
- le bouton « Export GeoTIFF » devient des exports CSV / JSON / PNG / SVG, qui correspondent aux données publiées.

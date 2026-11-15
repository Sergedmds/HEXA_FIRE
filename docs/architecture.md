# Architecture

HEXAFIRE est composé d'un **moteur hors ligne** (Python) qui produit des fichiers statiques, et d'un **site statique**
(HTML, CSS, modules JavaScript natifs) qui les lit dans le navigateur. Aucun serveur applicatif, aucune base de données,
aucune étape de compilation : n'importe quel serveur de fichiers (GitHub Pages, `python -m http.server`) suffit.

```
archives MODIS / VIIRS ──► backend (python -m hexafire …) ──► frontend/public/data/*.json ──► navigateur
```

## Backend (`backend/`)

Paquet `hexafire`, un module par étape :

| Module | Étape | Sortie |
|---|---|---|
| `lecture.py` | inventaire des archives | — |
| `preparation.py` | filtres P1–P9, un fichier par capteur et par mois | `donnees_preparees/` |
| `agregation.py` | comptages cellule × mois × capteur × jour/nuit, FRP | `agregats/cell_month` |
| `occasions.py` | passages par cellule, jours disponibles | `agregats/` |
| `harmonisation.py` | calibration S-NPP → MODIS (strates, mois, jour/nuit), relais NOAA, série harmonisée, incertitude | `agregats/conversion_*`, `harmonized_cell_month`, `serie_mois` |
| `validation.py` | « une année exclue », comparaison M0 / M1 | `journaux/validation_resultats.csv` |
| `firms_recent.py` | mois récents par l'API FIRMS | `donnees_preparees/` |
| `publication.py` | fichiers du site, jeu d'exemple, frontières des pays | `frontend/public/data/` |

Réglages dans `backend/config.toml` (grille, filtres, périodes). Les chemins relatifs y sont relatifs au dossier
`backend/` : par défaut, les données volumineuses vivent dans `../donnees_brutes`, `../donnees_preparees`,
`../agregats`, `../journaux`, à la racine du dépôt (ignorées par git).

## Format d'échange moteur → site (v2)

Dossier `frontend/public/data/` :

- `index.json` : `format`, `genere_le`, `unites` (`modis`, `viirs`), `carte` (`pas` = 1°, modèle de nom),
  `pas_grille` (0,25), `taille_tuile` (5), `debut` (`2000-11`), `periode_reference` (`[2003, 2020]`),
  `mois` (liste ; `t` = 0 pour novembre 2000, `annee`, `mois`, `statut`, `source`, `couverture`), `tuiles` (identifiants
  `ilat_ilon` des tuiles non vides), `validation` (tableau repris tel quel), `taille_bloc` (strates), **`totaux`**
  (`{"v": [...], "b": [...]}`, cumul mondial par mois, ajouté dans cette version), `exemple` (vrai pour le jeu fictif).
- `tuiles/t_<ilat>_<ilon>.json` : tuile de 5° × 5°, listes alignées `cellules`, `t`, `v` (équivalent MODIS), `b`
  (détections brutes de la source du mois), `w` (équivalent VIIRS), `e` / `f` (écart type de conversion, MODIS /
  VIIRS), `p` (FRP totale, MW). Seules les valeurs non nulles sont écrites ; cellule absente = 0.
- `cartes/m_<t>.json` : couche du mois `t` sur une grille de 1° : `c` (cellules), `v`, `w`, `r` (rapport à la médiane
  2003–2020 du même mois, `-1` si non calculable : moins de 10 années de référence ou médiane < 5).
- `pays.geojson` (facultatif, `python -m hexafire pays`) : frontières Natural Earth 1:110 M, propriétés allégées.

Numérotation des cellules : `ligne * n_lon + colonne`, ligne 0 au nord (90° N), colonne 0 à l'ouest (180° W)
(`backend/hexafire/grille.py`, `frontend/src/utils/geo.js`).

## Frontend (`frontend/`)

```
frontend/
├── index.html  explore.html  compare.html  methodology.html      une page = une vue
├── public/
│   ├── assets/images/   images d'ambiance issues des maquettes (JPEG)
│   ├── assets/icons/    favicon
│   └── data/            fichiers du moteur (non versionnés)
└── src/
    ├── config/app.js            chemins, tuiles du globe, régions suggérées, liens
    ├── styles/                  tokens.css (système de design), base.css (coquille, composants), une feuille par page
    ├── layouts/shell.js         en-tête, navigation, langue, pied de page, bandeau « données d'exemple »
    ├── components/
    │   ├── globe.js             MapLibre GL JS 5 en projection globe : fond NASA GIBS, dessin de zones, couche de 1°, rotation
    │   ├── calendar.js          calendrier années × mois (SVG) et légende
    │   ├── monthCards.js        douze cartes mensuelles d'une année
    │   ├── charts.js            profil saisonnier, saison cumulée, brut vs harmonisé, courbes A / B, tableaux
    │   ├── tooltip.js, icons.js
    ├── services/
    │   ├── data.js              index, tuiles, cartes, pays ; série d'une zone (somme des cellules dont le centre est dedans)
    │   ├── geocode.js           Nominatim (une requête par recherche) et coordonnées tapées
    │   └── export.js            CSV, JSON, SVG, PNG
    ├── utils/
    │   ├── i18n.js              textes FR / EN communs, formats de nombres
    │   ├── geo.js               zones (cercle, rectangle, polygone, pays), emprise, aire, appartenance
    │   ├── stats.js             normale 2003–2020, classes d'écart, intervalle de conversion, palettes
    │   └── link.js              lien partageable (#z=…&m=…&a=…)
    └── pages/
        ├── Home/home.js         vignettes alimentées par index.json
        ├── Explore/explore.js   état de la page, outils de sélection, résultats, couche mensuelle, exports
        ├── Compare/compare.js   deux entités A / B, globes jumeaux, métriques, synthèse
        └── Methodology/methodology.js   contenu éditorial bilingue
```

Conventions : identifiants en français comme dans le moteur (cellule, tuile, zone, série), noms de dossiers en anglais.
Les textes de l'interface passent par `t("cle")` ; chaque page ajoute ses clés avec `ajouterTextes()`.

### Globe

MapLibre GL JS 5 (`projection: globe`) : vue sphérique aux petits zooms, Mercator en se rapprochant. Fond : NASA GIBS
*VIIRS Black Marble* (jusqu'au niveau 8), imagerie Esri assombrie au-delà, traits de côte, frontières et toponymes GIBS.
La couche mensuelle de 1° est un GeoJSON de carrés colorés ; la zone sélectionnée est un polygone (cercle de 72 côtés,
rectangle, polygone dessiné, multipolygone d'un pays).

### Dépendances externes du site

MapLibre GL JS (CDN unpkg), Google Fonts (Space Grotesk, Inter), tuiles NASA GIBS et Esri, Nominatim. Sans connexion, la
page reste utilisable par saisie de coordonnées (le globe affiche un message).

## Tests

- `backend/tests/` : 14 tests pytest (préparation, harmonisation, validation, API FIRMS).
- `tests/frontend_smoke.mjs` : ouvre chaque page dans Edge / Chrome sans fenêtre, relève les erreurs JavaScript et les
  fichiers manquants, enregistre une capture (voir `tests/README.md`).

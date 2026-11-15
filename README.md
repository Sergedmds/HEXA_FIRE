# HEXAFIRE, observatoire planétaire des feux

**NASA Space Apps Challenge 2026, défi « Harmonization of MODIS and VIIRS Hot Spots »**
Équipe HEXAFIRE (ENSGMM / UNSTIM, Bénin)

HEXAFIRE transforme deux enregistrements satellitaires de points chauds, MODIS (Terra, Aqua, 1 km, depuis 2000) et VIIRS
(Suomi NPP, NOAA-20, NOAA-21, 375 m, depuis 2012), en **une seule série mensuelle harmonisée par cellule de 0,25°, de
novembre 2000 à aujourd'hui**, puis la donne à lire sur un **globe interactif**.

```
hexafire-observatory/
├── frontend/      site statique (globe MapLibre, calendrier, comparaison, méthode), sans compilation
├── backend/       moteur d'harmonisation Python (préparation, agrégation, calibration, validation, publication)
├── mockups/       maquettes Google Stitch dont le frontend est issu, et le système de design « Nuit Braise »
├── docs/          architecture, sources de données, méthode, installation, dossiers PDF
├── tests/         test de fumée du frontend (navigateur sans fenêtre) ; les tests du moteur sont dans backend/tests
├── telecharger_archives.sh   téléchargement des archives mensuelles MODIS / VIIRS (serveur UMD)
└── publier_site.sh           mise en ligne du frontend et de ses données sur GitHub Pages
```

## Démarrage rapide

```bash
# 1. moteur : environnement et données d'essai
cd backend
python -m venv .venv && . .venv/bin/activate        # Windows : .venv\Scripts\activate
pip install -r requirements.txt
python -m pytest -q                                   # 14 tests
python -m hexafire publier --exemple                  # jeu FICTIF -> ../frontend/public/data
python -m hexafire pays                               # (facultatif) frontières des pays pour le choix « Pays »

# 2. site
cd ../frontend && python -m http.server 8000          # ouvrir http://localhost:8000
```

Chaîne complète sur données réelles : `inventaire → preparer → (firms) → agreger → occasions → calibrer → valider →
serie → publier` (guide pas à pas : [backend/GUIDE_EXECUTION.md](backend/GUIDE_EXECUTION.md)).

## Le site

| Page | Rôle |
|---|---|
| `index.html` | Accueil éditorial : le problème, trois regards, repères lus dans les données publiées |
| `explore.html` | Globe interactif : point + rayon, rectangle, polygone ou pays ; couche mensuelle de 1° (points chauds ou écart à la normale) ; cycle annuel ; calendrier 2000 → aujourd'hui ; analyses ; preuve brut / harmonisé ; exports CSV / JSON / PNG / SVG ; lien partageable |
| `compare.html` | Deux zones × deux années côte à côte : points chauds, densité, écart à la normale, FRP ; courbes et synthèse |
| `methodology.html` | Données, chaîne de traitement, grandeurs, règles de lecture, validation, sources |

Français et anglais. Thème nocturne unique (système de design dans `mockups/DESIGN.md`).

Le frontend ne lit que des fichiers statiques produits par le moteur (`frontend/public/data/`). Il n'y a ni serveur
applicatif ni base de données. Les détails : [docs/architecture.md](docs/architecture.md).

## Validation (une année exclue, 2012–2015, 7 604 région-mois)

| Méthode | Kappa (≥ 0,5) | Fausses anomalies (≤ 0,15) | Biais médian (\|·\| < 0,10) | Erreur médiane (< 0,25) | Saut annuel max (< 0,10) |
|---|---|---|---|---|---|
| **HEXAFIRE** | **0,735** ✓ | **0,098** ✓ | **0,014** ✓ | **0,127** ✓ | **0,051** ✓ |
| M1 : un facteur global | 0,553 ✓ | 0,239 ✗ | 0,045 ✓ | 0,255 ✗ | 0,123 ✗ |
| M0 : VIIRS brut | 0,015 ✗ | 0,925 ✗ | 1,962 ✗ | 1,962 ✗ | 2,028 ✗ |

Le tableau publié par le moteur (`validation` dans `index.json`) est repris tel quel dans le site.

## Données NASA et conditions d'usage

MODIS MCD14ML (collections 6 et 6.1), VIIRS VNP14IMGML / VJ114IMGML / VJ214IMGML (collection 2), API NASA FIRMS pour
les mois récents. Fond du globe : NASA GIBS (Black Marble) et imagerie Esri ; frontières Natural Earth ; recherche de
lieu OpenStreetMap Nominatim. Provenance et conditions : [docs/data-sources.md](docs/data-sources.md).

> We acknowledge the use of data and/or imagery from NASA's Fire Information for Resource Management System (FIRMS)
> (https://www.earthdata.nasa.gov/firms), part of NASA's Earth Science Data and Information System (ESDIS).

Un point chaud n'est pas un incendie, et l'absence de point chaud ne prouve pas l'absence de feu. NASA n'approuve pas
ce projet ; les données sont fournies « en l'état ».

## Documentation

| Document | Contenu |
|---|---|
| [docs/setup.md](docs/setup.md) | Installation, données, service local, mise en ligne |
| [docs/architecture.md](docs/architecture.md) | Organisation du code, format d'échange moteur → site |
| [docs/methodology.md](docs/methodology.md) | Résumé de la méthode d'harmonisation |
| [docs/data-sources.md](docs/data-sources.md) | Provenance et conditions d'utilisation |
| [docs/DOSSIER_TECHNIQUE.pdf](docs/DOSSIER_TECHNIQUE.pdf) | Dossier technique complet (FR) |
| [docs/HEXAFIRE_document.pdf](docs/HEXAFIRE_document.pdf) | Document de recherche |

## Outils d'IA

Des outils d'IA ont été utilisés pendant le développement, conformément au règlement Space Apps ; la description
complète figure dans la soumission du projet.

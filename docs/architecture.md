# Architecture

HEXAFIRE is made of an **offline engine** (Python) that produces static files, and a **static website** (HTML, CSS,
native JavaScript modules) that reads them in the browser. No application server, no database, no build step: any
file server (GitHub Pages, `python -m http.server`) is enough.

```
MODIS / VIIRS archives ──► backend (python -m hexafire …) ──► frontend/public/data/*.json ──► browser
```

## Backend (`backend/`)

`hexafire` package, one module per step:

| Module | Step | Output |
|---|---|---|
| `lecture.py` | inventory of the archives | — |
| `preparation.py` | filters P1–P9, one file per sensor and month | `donnees_preparees/` |
| `agregation.py` | counts per cell × month × sensor × day/night, FRP | `agregats/cell_month` |
| `occasions.py` | overpasses per cell, available days | `agregats/` |
| `harmonisation.py` | S-NPP → MODIS calibration (strata, months, day/night), NOAA relays, harmonized series, uncertainty | `agregats/conversion_*`, `harmonized_cell_month`, `serie_mois` |
| `validation.py` | leave-one-year-out test, comparison with M0 / M1 | `journaux/validation_resultats.csv` |
| `firms_recent.py` | recent months through the FIRMS API | `donnees_preparees/` |
| `publication.py` | site files, example dataset, country borders | `frontend/public/data/` |

Settings are in `backend/config.toml` (grid, filters, periods). Relative paths there are relative to `backend/`: by
default the large data live in `../donnees_brutes`, `../donnees_preparees`, `../agregats` and `../journaux`, at the
repository root (ignored by git).

## Engine → site exchange format (v2)

Folder `frontend/public/data/`:

- `index.json`: `format`, `genere_le` (generation date), `unites` (`modis`, `viirs`), `carte` (`pas` = 1°, file name
  pattern), `pas_grille` (0.25), `taille_tuile` (5), `debut` (`2000-11`), `periode_reference` (`[2003, 2020]`),
  `mois` (list; `t` = 0 for November 2000, `annee`, `mois`, `statut`, `source`, `couverture`), `tuiles` (`ilat_ilon`
  identifiers of non-empty tiles), `validation` (table shown as is), `taille_bloc` (strata), `totaux`
  (`{"v": [...]}`, global total per month), `exemple` (true for the fictitious dataset).
- `tuiles/t_<ilat>_<ilon>.json`: 5° × 5° tile, aligned lists `cellules`, `t`, `v` (MODIS equivalent), `b` (raw
  detections of the source of the month), `w` (VIIRS equivalent), `e` / `f` (conversion standard deviation, MODIS /
  VIIRS), `p` (total FRP, MW). Only non-zero values are written; a missing cell means 0.
- `cartes/m_<t>.json`: layer of month `t` on a 1° grid: `c` (cells), `v`, `w`, `r` (ratio to the 2003–2020 median of
  the same month, `-1` when it cannot be computed: fewer than 10 reference years or a median below 5).
- `pays.geojson` (optional, `python -m hexafire pays`): Natural Earth 1:110 M borders, reduced properties.

Cell numbering: `row * n_lon + column`, row 0 in the north (90° N), column 0 in the west (180° W)
(`backend/hexafire/grille.py`, `frontend/src/utils/geo.js`).

## Front end (`frontend/`)

```
frontend/
├── index.html  explore.html  compare.html  methodology.html      one page per view
├── public/
│   ├── assets/images/   background images from the mockups (JPEG)
│   ├── assets/icons/    favicon
│   └── data/            engine files (not versioned on main)
└── src/
    ├── config/app.js            paths, globe tiles, suggested regions, links
    ├── styles/                  tokens.css (design system), base.css (shell, components), one sheet per page
    ├── layouts/shell.js         header, navigation, language, "example data" banner
    ├── components/
    │   ├── globe.js             MapLibre GL JS 5 in globe projection: NASA GIBS background, area drawing, 1° layer
    │   ├── calendar.js          year × month calendar (SVG) and legend
    │   ├── monthCards.js        twelve monthly cards of a year
    │   ├── charts.js            raw vs harmonized, A / B curves, tables
    │   ├── tooltip.js, icons.js
    ├── services/
    │   ├── data.js              index, tiles, maps, countries; series of an area (sum of the cells whose centre is inside)
    │   ├── geocode.js           Nominatim (one request per search) and typed coordinates
    │   └── export.js            CSV, JSON, SVG, PNG
    ├── utils/
    │   ├── i18n.js              shared English / French texts, number formats
    │   ├── geo.js               areas (circle, rectangle, polygon, country), extent, area, membership
    │   ├── stats.js             2003–2020 normal, departure classes, conversion interval, palettes
    │   └── link.js              shareable link (#z=…&m=…&a=…)
    └── pages/
        ├── Home/home.js         home page
        ├── Explore/explore.js   page state, selection tools, plain-language summary, calendar, monthly layer, exports
        ├── Compare/compare.js   two entities A / B, twin globes, metrics, summary
        └── Methodology/methodology.js   "About & guide" page, in plain words, English and French
```

Conventions: identifiers in French as in the engine (cellule = cell, tuile = tile, zone = area, série = series),
folder names in English. Interface texts go through `t("key")`; each page adds its keys with `ajouterTextes()`.
The site opens in English; French is available from the header.

### Globe

MapLibre GL JS 5 (`projection: globe`): spherical view at low zoom, Mercator when zooming in. Background: NASA GIBS
*VIIRS Black Marble* (up to level 8), darkened Esri imagery beyond, GIBS coastlines, borders and labels. The 1°
monthly layer is a GeoJSON of coloured squares; the selected area is a polygon (72-sided circle, rectangle, drawn
polygon, country multipolygon).

### External dependencies of the site

MapLibre GL JS (unpkg CDN), Google Fonts (Space Grotesk, Inter), NASA GIBS and Esri tiles, Nominatim. Without a
connection, the page can still be used by typing coordinates (the globe shows a message).

## Tests

- `backend/tests/`: 14 pytest tests (preparation, harmonization, validation, FIRMS API).
- `tests/frontend_smoke.mjs`: opens each page in headless Edge / Chrome, reports JavaScript errors and missing files,
  saves a screenshot (see `tests/README.md`).

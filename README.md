# HEXAFIRE

**A harmonized MODIS and VIIRS hotspot calendar, from November 2000 to today**

NASA Space Apps Challenge 2026, challenge *Harmonization of MODIS and VIIRS Hot Spots*.
Team HEXAFIRE, ENSGMM, Université Nationale des Sciences, Technologies, Ingénierie et Mathématiques (UNSTIM), Abomey, Benin.

| | |
|---|---|
| **Web application** | <https://sergedmds.github.io/HEXA_FIRE/> |
| **Demo video (30 s)** | [HEXAFIRE_demo.mp4](HEXAFIRE_demo.mp4) |
| **Research document** | [English](docs/HEXAFIRE_document_en.pdf) · [Français](docs/HEXAFIRE_document.pdf) |
| **Data provenance** | [`docs/data-sources.md`](docs/data-sources.md) |

---

## The problem

NASA has mapped active fires from space with MODIS (Terra and Aqua) since 2000, and with VIIRS (Suomi NPP, NOAA-20,
NOAA-21) since 2012. VIIRS pixels are smaller (375 m against 1 km), so for the same number of overpasses VIIRS detects
about 5 times more hotspots than MODIS by day and 15 times more at night.

MODIS is now reaching the end of its life. Any long record that switches from MODIS to VIIRS shows a rise in fire
activity that never happened. A fire manager comparing this season with twenty years of history cannot tell a severe
season from a more sensitive satellite.

## Our approach

HEXAFIRE expresses VIIRS detections in MODIS units, using the years 2012–2020 when both sensors flew together.

1. **Same number of looks.** For each 0.25° cell, the engine computes how many times each satellite passed over it
   in a month, from orbital geometry and the days with data.
2. **A conversion that ignores the fires themselves.** For a cell-month seen by both sensors, the VIIRS share of the
   combined count depends only on the sensitivity gap and on the overpass ratio. The true fire activity cancels out.
   The gap is estimated by maximum likelihood for each 10° block, calendar month and period (day or night), and
   estimates from sparse blocks are pulled towards their block average.
3. **One series.** Terra and Aqua are kept as measured until December 2020. Converted VIIRS takes over in January
   2021, before the orbital drift of Terra and Aqua. Suomi NPP is converted directly; NOAA-20 and NOAA-21 are linked to
   it by the same method when their overlap is available. Several VIIRS satellites are averaged, never added.
4. **Honest labels.** Every month carries an observation status (measured, converted, provisional, partial coverage)
   and every converted value carries a 95% conversion interval.

The full model, with its equations, is described in the research document.

## Validation

The challenge asks that the sensor of origin no longer matter. We test exactly that.

For each year from 2012 to 2020, the conversion is fitted without that year. Suomi NPP is then converted as if MODIS
no longer existed, and each region-month gets a verdict (low, normal or high, against the 2003–2011 MODIS
percentiles). This verdict is compared with the one given by real MODIS, over 17,309 region-months.

| Method | Cohen's κ | False anomalies | Median bias | Median error | Largest annual error |
|---|---|---|---|---|---|
| **HEXAFIRE** | **0.747** | **9.0%** | **0.007** | **0.125** | **0.049** |
| One global factor (same overpass correction, day and night) | 0.558 | 23.9% | 0.032 | 0.262 | 0.117 |
| Raw VIIRS | 0.014 | 92.1% | 1.955 | 1.955 | 2.028 |
| Target | ≥ 0.5 | ≤ 15% | below 0.10 | < 0.25 | < 0.10 |

Errors are differences of log(1 + count). The 95% interval of κ(HEXAFIRE) − κ(global factor), obtained by
resampling the nine test years, is [0.174, 0.205].

The global factor already uses the overpass correction and the day/night split, so the gain comes from the
region- and month-specific conversion. The separate contribution of each component has not yet been measured.

## The web application

A static site: no server, no account, no installation. It runs on a computer or a phone, in English or French. It has
four pages: Home, Explore, Compare, and About & guide.

- **Choose an area.** On an interactive globe, draw a rectangle or a polygon, set a point and a radius, pick a
  country or search for a place.
- **Reading.** A short text in plain words and four key figures: the latest month available, its departure from
  normal, the usual peak month and the last twelve months against normal.
- **Calendar.** A year × month grid of harmonized hotspots, or of the departure from the 2003–2020 median, with
  colour-blind-safe palettes. Hovering a month shows its value, its 95% conversion interval, the raw detections, the
  median of that month and the mean fire radiative power (FRP).
- **Analyses.** Seasonal profile, cumulative season against past seasons, ranking of years, most unusual months.
- **Raw versus harmonized.** At the bottom of the Explore page, the raw record and the harmonized record side by
  side: the jump at the sensor change disappears, year-to-year variation stays. Converted months are shown with their
  uncertainty band, followed by the validation table.
- **Map of the month.** Harmonized hotspots or departure from normal on a 1° grid over the globe, with a month slider
  and an animation.
- **Compare.** Two areas or two years side by side: hotspots, density, departure from normal, FRP, curves and summary.
- **Downloads.** Calendar (CSV, JSON, PNG, SVG), cell × month table of the area (CSV) and a shareable link.

Values can be shown in MODIS-equivalent or VIIRS-equivalent units. The departure from normal is practically the same
in both.

## Data

| Data | Version | Period used |
|---|---|---|
| MODIS active fire monthly archives, MCD14ML (Terra, Aqua, 1 km) | C6 006.03, then C6.1 061.03 | Nov 2000 – Aug 2026 |
| VIIRS 375 m active fire monthly archives, VNP14IMGML (Suomi NPP) | Collection 2 | Jan 2012 – Jul 2026 |
| VIIRS 375 m, VJ114IMGML (NOAA-20) and VJ214IMGML (NOAA-21) | Collection 2 | Apr 2018 / Mar 2023 – Jul 2026 |
| NASA FIRMS API | NRT and standard products | Months after the latest archive |

The monthly archives are the NASA products published by the NASA fire science team on the University of Maryland
server. Versions, retrieval dates and terms of use are listed in [`docs/data-sources.md`](docs/data-sources.md).

> We acknowledge the use of data and/or imagery from NASA's Fire Information for Resource Management System (FIRMS)
> (https://www.earthdata.nasa.gov/firms), part of NASA's Earth Science Data and Information System (ESDIS).

Globe background: NASA GIBS (VIIRS Black Marble and reference layers) and Esri World Imagery. Place search:
© OpenStreetMap contributors (ODbL). Country borders: Natural Earth (public domain).
Map rendering: MapLibre GL JS (BSD-3-Clause). NASA does not endorse this project.

## Repository

| Path | Content |
|---|---|
| `backend/` | Harmonization engine (Python 3.12): preparation, aggregation, overpasses, calibration, validation, series, publication |
| `frontend/` | Static web application (HTML, CSS, JavaScript modules, MapLibre GL JS globe) |
| `docs/` | Research document (English and French), technical dossier, architecture, method, setup, data provenance |
| `mockups/` | Design mockups the front end was built from, and the "Nuit Braise" design system |
| `tests/` | Front-end smoke test (headless browser); the engine tests are in `backend/tests/` |
| `telecharger_archives.sh` | Download of the MODIS and VIIRS monthly archives |
| `publier_site.sh` | Deployment of the application and its data to GitHub Pages (`gh-pages` branch) |

Supplementary material: technical dossier (`docs/TECHNICAL_DOSSIER.pdf`), engine run guide
(`backend/GUIDE_EXECUTION.md`), setup (`docs/setup.md`) and architecture (`docs/architecture.md`). The research
document also exists in French (`docs/HEXAFIRE_document.pdf`).

Raw and intermediate data (several tens of GB) are not versioned. The engine rebuilds them, and the published files
of the site (about 370 MB) are deployed only on the `gh-pages` branch.

## Running it

Requires Python 3.11 or later.

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest -q                                  # 14 tests

python -m hexafire publier --exemple       # small fictitious dataset -> ../frontend/public/data
cd ../frontend && python3 -m http.server 8000
# open http://localhost:8000
```

Full pipeline on real data, after `telecharger_archives.sh`:

```bash
python -m hexafire inventaire
python -m hexafire preparer
python -m hexafire agreger
python -m hexafire occasions
python -m hexafire calibrer
python -m hexafire valider
FIRMS_MAP_KEY=<your key> python -m hexafire firms     # optional: months after the latest archive
python -m hexafire serie
python -m hexafire publier
```

## Limitations

- A hotspot is not a wildfire, and the absence of hotspots does not prove the absence of fire. Clouds and smoke
  hide some fires.
- Overpasses are computed with an analytical formula, not yet from the real granule footprints of NASA's CMR catalogue.
- Strata are regular 10° blocks, not yet ecological regions.
- The interval covers the uncertainty of the conversion, not the natural variability of counts.
- The published series runs to November 2026. Months after the latest archives come from the NASA FIRMS API.
  September to November 2026 are based on MODIS and flagged as provisional; November 2026 is only partially covered.
- The CSV export gives monthly values per 0.25° cell. Individual detections are not republished; they remain
  available from NASA FIRMS.
- Ground-reported fires are not included, as no consistent source exists.

## Use of SI tools

As required by the Space Apps rules, we state where Super Intelligence (SI) tools were used. The team worked with Claude (Anthropic), an SI
assistant, through the Claude desktop app.

- **Code.** Most of the Python engine (`backend/`) and of the web application (`frontend/`) was written
  with Claude's help, from the team's specifications. The team ran it on the real data, tested it (14 automated
  tests and a front-end smoke test) and reported the errors that were then fixed. Every source file starts with a line stating this.
- **Research and analysis.** Literature search, critical review of the method, help with reading the calibration
  and validation outputs.
- **Design.** The page mockups in `mockups/`, from which the front end was built, were generated with Google Stitch,
  an SI design tool.
- **Writing.** Drafting, editing and French–English translation of the research document, the technical dossier
  and this README.

The choice of method, the processing runs, the validation and the results were decided, run and checked by the
team.

## Team

Team HEXAFIRE, ENSGMM, UNSTIM, Abomey, Benin.

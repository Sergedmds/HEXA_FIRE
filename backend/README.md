# HEXAFIRE harmonization engine

Offline chain that turns the NASA monthly fire archives into harmonized counts.

| Step | Module | Status |
|---|---|---|
| 1. Acquisition | `../telecharger_archives.sh` | done |
| 2. Preparation (rules P1–P9) | `hexafire/preparation.py` | done |
| 2b. Counts per cell × month | `hexafire/agregation.py` | done |
| 3. Observation opportunities (analytical; CMR footprints later) | `hexafire/occasions.py` | done |
| 4a. S-NPP → MODIS conversion (10° strata, day/night) | `hexafire/harmonisation.py` | done |
| 4b. Harmonized series, weights and statuses | `hexafire/harmonisation.py` | done |
| 4c. NOAA-20 / NOAA-21 relays (linked to S-NPP), multi-platform series | `hexafire/harmonisation.py` | done |
| 4d. Recent months through the FIRMS API (standard, otherwise NRT) | `hexafire/firms_recent.py` | done |
| 4e. Uncertainty of converted values (analytical propagation) | `harmonisation.py`, `publication.py` | done |
| 5. Leave-one-year-out validation, comparison with M0 and M1 | `hexafire/validation.py` | done |
| 6. Publication for the web application (format v2, 5° tiles) | `hexafire/publication.py` | done |

## Installation (once)

```bash
cd HEXA_FIRE/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m pytest -q          # 14 tests must pass
```

## Usage

```bash
source .venv/bin/activate
python -m hexafire inventaire   # what has been downloaded and will be used
python -m hexafire preparer     # can be run again at will while downloads continue
python -m hexafire agreger      # writes ../agregats/cell_month.parquet, capteur_jour.parquet, resume_mensuel.csv
python -m hexafire occasions    # overpasses per cell + available days per sensor and month
python -m hexafire calibrer     # S-NPP -> MODIS factors (agregats/conversion_snpp.parquet)
python -m hexafire valider      # results in ../journaux/validation_resultats.csv
export FIRMS_MAP_KEY=your_key && python -m hexafire firms   # recent months (FIRMS API)
python -m hexafire serie        # harmonized series (agregats/harmonized_cell_month.parquet, serie_mois.parquet)
python -m hexafire publier      # application files -> ../frontend/public/data (--exemple: fictitious dataset)
```

Useful options: `python -m hexafire preparer --produits MCD14ML --limite 5`. Step-by-step guide:
[GUIDE_EXECUTION.md](GUIDE_EXECUTION.md).

## Where the files go

```
HEXA_FIRE/
├── donnees_brutes/        downloaded archives (do not modify)
├── donnees_preparees/     filtered detections: <sensor>/<year>/<sensor>_<YYYYMM>.parquet
├── agregats/              cell_month.parquet, resume_mensuel.csv, conversion factors, series
├── journaux/              preparation.jsonl (SHA-256 fingerprint, counts before/after filters), validation results
├── backend/               this code
└── frontend/public/data/  files published for the site
```

## Rules applied

- MODIS: collection 6 until December 2022, 6.1 after; VIIRS: most recent version.
- Kept: type 0 (vegetation fire), MODIS confidence ≥ 30, VIIRS outside the "low" class.
- 0.25° cell containing the centre of the detection; day and night kept separate.
- Automatic check: read = kept + excluded (by reason), otherwise the run stops.

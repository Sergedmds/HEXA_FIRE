# Running the HEXAFIRE engine from the start

This guide describes the full chain, from the downloaded archives to the files of the web application.
For each step: what it does, the command, what is printed and how to read it. The mathematical models behind each
step are detailed in `docs/TECHNICAL_DOSSIER.pdf` (section 5). The engine prints its messages in French; the
examples below show them as they appear, with an English explanation.

## 0. Before you start

**Installation (once).** You need Python 3.11 or later, and `lftp` for the download.

```bash
sudo apt install lftp                      # Ubuntu / Debian
cd HEXA_FIRE/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt            # pandas, numpy, pyarrow, requests, pytest
```

**Downloading the archives** (SFTP server of the University of Maryland; provenance in `docs/data-sources.md`):

```bash
cd HEXA_FIRE
bash telecharger_archives.sh modis              # MODIS collection 6, 2000-2022
bash telecharger_archives.sh modis_recent       # MODIS collection 6.1, 2023 ->
bash telecharger_archives.sh snpp               # VIIRS S-NPP 2012 -> (required: calibration and 2021 ->)
bash telecharger_archives.sh noaa21             # optional: relay after the end of S-NPP
bash telecharger_archives.sh noaa20             # optional
for f in donnees_brutes/*/*.gz; do gzip -t "$f" 2>/dev/null || echo "DAMAGED: $f"; done   # check
```

The download resumes where it stopped. A truncated file dated more recently than the server copy is not downloaded
again: delete it and run the command again.

**Checking the installation**:

```bash
cd HEXA_FIRE/backend
source .venv/bin/activate          # (.venv) must appear at the start of the line
pytest -q                          # expected: 14 passed
```

If a test fails, do not run the chain: the code or the environment has a problem.

**Folders used** (set in `config.toml`, relative to `backend/`):

| Folder | Content | Written by |
|---|---|---|
| `donnees_brutes/` | MODIS and VIIRS monthly archives (`.txt.gz`, `.csv.gz`) | `telecharger_archives.sh`, `firms` |
| `donnees_preparees/` | filtered detections, one file per sensor and month | `preparer`, `firms` |
| `agregats/` | count tables, overpasses, factors, harmonized series | `agreger` to `serie` |
| `journaux/` | preparation log, validation results | `preparer`, `valider` |
| `../frontend/public/data/` | files read by the application | `publier` |

**Main settings** (`config.toml`): 0.25° grid; vegetation fires only (type 0), MODIS detections with confidence ≥ 30
and VIIRS detections other than "low" confidence; 2003–2020 normal; 2012–2020 calibration; switch to VIIRS in
January 2021.

## Overview

```
inventaire → preparer → (firms) → agreger → occasions → calibrer → valider → serie → publier
```

Full chain in one line (stops at the first error):

```bash
python -m hexafire preparer && python -m hexafire agreger && python -m hexafire occasions \
 && python -m hexafire calibrer && python -m hexafire valider && python -m hexafire serie \
 && python -m hexafire publier
```

**Golden rule: after each `agreger`, run `occasions` again.** Otherwise `calibrer` leaves out the new months
(see step 6).

---

## 1. `inventaire`, what will be used

**What it does.** Scans `donnees_brutes/`, recognizes each archive (product, year, month, version) and reports what
will be used. It changes nothing. When two versions of the same month exist, the most recent one is kept (MODIS:
collection 6 until 2022, 6.1 after).

```bash
python -m hexafire inventaire
```

**Output**:
```
Dossier : /home/.../donnees_brutes
  MCD14ML      310 mois  (2000-11 -> 2026-08)
  VNP14IMGML   175 mois  (2012-01 -> 2026-07)
  ...
```

**How to read it**:
- one line per product: number of months, first and last month;
- MCD14ML should cover 2000-11 → 2026-08 (about 310 months);
- calibration needs **VNP14IMGML from 2012 to 2020** (108 months);
- a gap (fewer months than the interval) means a missing file or one still downloading.

## 2. `preparer`, filter and store the detections

**What it does.** Reads each archive, keeps only the useful detections (type 0, confidence), puts them in a common
format and writes one file per sensor (Terra, Aqua, S-NPP, NOAA-20, NOAA-21) and per month in `donnees_preparees/`.
Each processed archive is recorded in `journaux/preparation.jsonl` with its fingerprint: **running it again only
processes new archives**.

```bash
python -m hexafire preparer                         # everything
python -m hexafire preparer --produits MCD14ML      # a single product
python -m hexafire preparer --limite 3              # trial on 3 archives
python -m hexafire preparer --forcer                # redo everything (after changing the filters)
```

**Output**:
```
[12/486] MCD14ML.201203.006.03.txt.gz :   312,455 lues,   268,910 retenues (4.2 s)
[13/486] VNP14IMGML.201203.C2.04.csv.gz : ignorée (EOFError: ...)
486 archive(s) préparée(s). Journal : .../journaux/preparation.jsonl
```

**How to read it**:
- `lues` / `retenues` (read / kept): for MODIS the kept share is usually **80 to 95%** (volcanoes, static sources and
  low confidence are removed). For VIIRS it is a little lower ("low" class removed). A share close to 0% or 100%
  deserves a check;
- `ignorée (EOFError…)` (skipped): incomplete archive, usually **still downloading**. Run `preparer` again once the
  download is over;
- an archive already prepared does not appear: this is normal.

## 3. `firms` (optional), the most recent months

**What it does.** Downloads through the FIRMS API what is missing after the end of the server archives (MODIS after
August 2026, VIIRS after July 2026), then prepares it as in step 2 (files `<sensor>_<YYYYMM>_api`). It resumes where
it stopped and can run **at the same time** as the SFTP downloads. Run it **before** `agreger`.

```bash
export FIRMS_MAP_KEY=your_key
python -m hexafire firms                    # download and prepare
python -m hexafire firms --seulement-preparer
```

**Output**:
```
  MODIS : archive jusqu'au 2026-08-31, API à partir du 2026-09-01
  VIIRS_NOAA21_NRT 2026-08-01 +5 j : 61,204 détections
API FIRMS : 1,254,330 détections lues, 1,050,112 retenues, 12 fichiers capteur-mois écrits
```

**How to read it**:
- the first lines give the dates where the archive hands over to the API;
- `réponse inattendue` (unexpected response): invalid key, quota exceeded (5,000 requests per 10 minutes) or service
  unavailable. Wait a few minutes and run it again;
- when the archive of a month arrives later, `agreger` automatically ignores the API version of that month.

## 4. `agreger`, count per cell and month

**What it does.** Counts the detections per 0.25° cell, month, sensor and period (day or night). This is the base
table for everything else (`agregats/cell_month`). It also produces global daily counts (`capteur_jour`), used to
find days without data, and a summary `agregats/resume_mensuel.csv`.

```bash
python -m hexafire agreger
```

**Output**:
```
  3 mois API ignorés (archive disponible)
  100/486 fichiers agrégés
cell_month : 48,215,330 lignes, 512,904,118 détections -> .../agregats/cell_month.parquet
```

**How to read it**:
- the total number of detections should be **close to the sum of the "retenues"** of step 2;
- open `resume_mensuel.csv` in a spreadsheet: a month with far fewer detections than its neighbours points to an
  incomplete file or a satellite outage.

## 5. `occasions`, how many times each cell was seen

**What it does.** Computes the number of overpasses of each satellite over each cell (from latitude and swath) and
finds **days without data**. A day counts as missing when the sensor detects less than 10% of its usual global
activity. Without this step, "fewer fires" and "fewer overpasses" would be confused.

```bash
python -m hexafire occasions
```

**Output**:
```
occasions : 412,880 cellules actives, 1,104 capteur-mois -> .../agregats
  37 capteur-mois incomplets, par exemple :
 capteur  annee  mois  jours_mois  jours_disponibles
   Terra   2001     6          30                 15
    Aqua   2002     7          31                  5
   S-NPP   2012     1          31                 19
```

**How to read it**:
- `capteur-mois` = number of sensor-months known, all sensors together;
- the list of incomplete months should match **known outages**: Terra June 2001, start of Aqua in July 2002, start
  of S-NPP in January 2012, end of S-NPP in November 2026. These months are corrected for the actual number of days.
  Below 80% of days they are flagged "partial coverage", and "not observed" below 30%.

## 6. `calibrer`, learn the VIIRS → MODIS factor

**What it does.** Over 2012–2020, when MODIS and S-NPP observed together, it estimates how many MODIS hotspots one
S-NPP hotspot is worth, for the same number of overpasses. The factor is estimated per stratum (10° block), calendar
month and day or night, then stabilized (uncertain estimates are pulled towards the annual value of the stratum). It
then links NOAA-20 and NOAA-21 to S-NPP over their common years.

```bash
python -m hexafire calibrer           # --bloc 5 for 5° strata
```

**Output** (final 2012–2020 run):
```
Calibration S-NPP -> MODIS sur 2012-2020 (9 année(s)), 6,743,461 couples cellule-mois, 402 strates
  jour : 1 point chaud S-NPP = 0.176 point chaud MODIS (médiane des strates ; 10 %-90 % : 0.075-0.268)
  nuit : 1 point chaud S-NPP = 0.064 point chaud MODIS (médiane des strates ; 10 %-90 % : 0.017-0.109)
  -> .../agregats/conversion_snpp.parquet
  NOAA-20 raccordé à S-NPP sur [2018, ..., 2026] : ...
  NOAA-21 raccordé à S-NPP sur [2023, ..., 2026] : ...
```

**How to read it**:
- **day** (`jour`). Factor expected between **0.15 and 0.25** (VIIRS sees 4 to 7 times more hotspots than MODIS).
  Final result: 0.176, that is 5.7 times;
- **night** (`nuit`). Lower factor, around **0.05 to 0.10** (10 to 20 times more). Final result: 0.064;
- the 10%–90% range shows the variation between regions: this is exactly what a single factor would miss;
- **NOAA-20 and NOAA-21**. Factor close to **1** (same instrument as S-NPP). A ±10% difference is plausible; a much
  larger one is suspicious;
- `attention : … couples sans occasions connues, exclus` (pairs without known overpasses, excluded): `occasions` was
  not run again after `agreger`. Run `occasions`, then `calibrer`;
- **factors at 0.000** or a logarithm error: same cause (missing overpasses);
- `pas encore de recouvrement avec S-NPP` (no overlap with S-NPP yet): the NOAA files are not prepared yet, or
  `occasions` has not seen them. Run `occasions` again, then `calibrer`.

## 7. `valider`, check that the conversion gives the right verdicts

**What it does.** For each year from 2012 to 2020, it redoes the calibration **without that year**, converts VIIRS
for that year and compares with real MODIS. The verdict of each month (low / normal / high against the 10% and 90%
thresholds of 2003–2011) is compared for three methods:
- **HEXAFIRE**. Our conversion;
- **M1**. A single factor for the whole world;
- **M0**. Raw VIIRS, without conversion.

```bash
python -m hexafire valider
```

**Result** (final 2012–2020 run, 17,309 stratum-months):

| Method | kappa | False anomalies | Median bias | Median error | Largest annual step |
|---|---|---|---|---|---|
| HEXAFIRE | 0.747 | 0.090 | 0.007 | 0.125 | 0.049 |
| M1 global factor | 0.558 | 0.239 | 0.032 | 0.262 | 0.117 |
| M0 raw splice | 0.014 | 0.921 | 1.955 | 1.955 | 2.028 |

**How to read each column**:

| Column | Meaning | Target |
|---|---|---|
| `kappa` | agreement of the verdicts with MODIS, corrected for chance (0 = chance, 1 = perfect) | ≥ 0.5 |
| `accord` | share of months with the same verdict | indicative |
| `fausses_anomalies` | share of months normal for MODIS that the method calls low or high | ≤ 0.15 |
| `biais_median` | systematic gap (log scale): > 0 overestimates, < 0 underestimates | \|·\| < 0.10 |
| `erreur_mediane` | typical gap of a month (log scale; 0.18 ≈ 20%) | < 0.25 |
| `marche_max_annee` | largest mean shift of a year: measures the "false step" at the sensor change | < 0.10 |
| `ic95_kappa_H_moins_methode` | 95% confidence interval of kappa(HEXAFIRE) − kappa(method) | entirely > 0 |

**Verdict**:
- HEXAFIRE is **better than M1** if the interval of the M1 row is entirely positive ([0.174 ; 0.205] in the final run);
- **M0** must be very poor (kappa close to 0, bias close to 2). This is the proof that without harmonization the series
  cannot be used;
- with fewer than 4 test years, the program warns that the intervals are **indicative**;
- files written in `journaux/`: `validation_resultats.csv` (the table, shown by the application) and
  `validation_detail.csv.gz` (each stratum-month, to dig into a region).

## 8. `serie`, build the harmonized series from 2000 to today

**What it does.** Builds a single series, in MODIS equivalent, for each cell and each month. Each value is brought to
the same number of overpasses (2003–2020 median).

| Period | Source | Status |
|---|---|---|
| Nov 2000 – Jun 2002 | Terra alone, brought to Terra + Aqua | converted |
| Jul 2002 – Dec 2020 | MODIS Terra + Aqua | measured |
| from Jan 2021 | converted VIIRS (weighted mean of S-NPP, NOAA-20, NOAA-21) | converted |
| months without VIIRS data | MODIS | provisional |

```bash
python -m hexafire serie
```

**Output**:
```
Série harmonisée : ... cellules-mois non nulles, ... points chauds équivalent MODIS -> .../harmonized_cell_month.parquet
statut
mesuré                  222
converti                 83
couverture partielle      6
provisoire                2
```

**How to read it**:
- the table counts **months** per status (`mesuré` measured, `converti` converted, `couverture partielle` partial
  coverage, `provisoire` provisional). About 220 measured months (Jul 2002 – Dec 2020), about twenty converted months
  for Terra alone (Nov 2000 – Jun 2002) and one converted month per month since 2021 are expected;
- `couverture partielle` should match the outages seen at step 5, plus the month in progress;
- `provisoire`: months without VIIRS yet. They become "converted" after a new run of the chain;
- visual check: at the bottom of the **Explore** page of the application, the harmonized curve must **not jump** in
  2021, unlike the raw curve.

## 9. `publier`, prepare the application files

**What it does.** Writes to `../frontend/public/data/`:
- `index.json` (months, statuses, validation, global monthly totals);
- the 5° tiles (MODIS equivalent, VIIRS equivalent, raw, FRP, uncertainty);
- the 1° monthly maps (value and ratio to normal).

```bash
python -m hexafire publier            # real series
python -m hexafire publier --exemple  # fictitious dataset, to test the interface without data
```

**Output**:
```
Publication : 1,108 tuiles, ... valeurs, 313 mois, 313 cartes -> .../frontend/public/data
```

**How to read it**:
- `tuiles` (tiles): number of 5° squares with at least one hotspot (at most 2,592);
- `mois` (months): number of months in the series; `cartes` (maps): observed months ("not observed" months have no map);
- `conversion_snpp absente : unité équivalent VIIRS non publiée`: `calibrer` has not run. The application works, but
  without the VIIRS unit;
- with `--exemple`, the application shows the "Example data (fictitious)" banner. It disappears with the real series.

Then:
```bash
cd ../frontend && python3 -m http.server 8000     # open http://localhost:8000
```

---

## What to run again, and when

| Situation | Run again |
|---|---|
| New archives have arrived | `preparer` → `agreger` → `occasions` → `calibrer` → `valider` → `serie` → `publier` |
| New months through the FIRMS API | `firms` → `agreger` → `occasions` → `serie` → `publier` |
| Filters changed in `config.toml` | `preparer --forcer`, then the whole chain |
| Stratum size changed (`--bloc`) | `calibrer --bloc X` → `valider --bloc X` → `serie --bloc X` → `publier --bloc X` |
| Only the application changed | nothing (possibly `publier`) |

## Common problems

| Message | Cause | Fix |
|---|---|---|
| `ModuleNotFoundError: No module named 'hexafire'` | run outside `backend/`, or old pytest | `cd backend`, then `python -m ...` |
| `no tests ran` | pytest run from another folder | run it from `backend/` |
| `ignorée (EOFError …)` | archive still downloading | run `preparer` again later |
| `couples sans occasions connues` / factors 0.000 | `occasions` not run again after `agreger` | `occasions`, then `calibrer` |
| `Aucun couple MODIS / S-NPP sur la période de calibration` | no S-NPP 2012–2020 prepared | download, `preparer`, `agreger`, `occasions` |
| `Clé FIRMS manquante` (FIRMS key missing) | variable not set | `export FIRMS_MAP_KEY=...` in the same terminal |
| `index.json introuvable` in the application | `publier` not run | `python -m hexafire publier` (or `--exemple`) |

# Setup and getting started

## Requirements

- Python 3.11 or later (engine); `pyarrow` is recommended but optional (compressed CSV fallback).
- A recent browser with WebGL for the globe.
- Optional: `lftp` to download the archives (`telecharger_archives.sh`), Node.js 22+ for the smoke test.

## 1. Engine

```bash
cd backend
python -m venv .venv
. .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m pytest -q             # expected: 14 passed
```

### Example dataset (to see the site right away)

```bash
python -m hexafire publier --exemple     # writes ../frontend/public/data (FICTITIOUS data, a banner says so on the site)
python -m hexafire pays                  # optional: Natural Earth borders for the "Country" selection
```

### Real series

Download the archives (from the repository root), then run the full chain. Every step is detailed in
[`../backend/GUIDE_EXECUTION.md`](../backend/GUIDE_EXECUTION.md):

```bash
bash telecharger_archives.sh modis && bash telecharger_archives.sh modis_recent && bash telecharger_archives.sh snpp
cd backend
python -m hexafire preparer && python -m hexafire agreger && python -m hexafire occasions \
 && python -m hexafire calibrer && python -m hexafire valider && python -m hexafire serie \
 && python -m hexafire publier
```

Most recent months (FIRMS API, personal key): `export FIRMS_MAP_KEY=... && python -m hexafire firms` before
`agreger`.

## 2. Website

```bash
cd frontend
python -m http.server 8000      # then open http://localhost:8000
```

Nothing needs to be built. The site reads `public/data/index.json`; if it is missing, each page says so and recalls
the command to run. The site opens in English; the FR button in the header switches to French (or add `#l=fr` to the
address).

## 3. Front-end smoke test

```bash
# in a terminal: cd frontend && python -m http.server 8000
node tests/frontend_smoke.mjs --base http://localhost:8000 --out captures
```

The script opens the four pages (Explore with an area and Compare with two areas) in headless Edge or Chrome, reports
JavaScript errors and missing files, and saves a screenshot of each page.

## 4. Going online (GitHub Pages)

```bash
./publier_site.sh
```

The script copies `frontend/` (pages, `src/`, `public/` with the data) to the `gh-pages` branch of the `origin`
remote. It refuses files larger than 95 MB and asks for confirmation if the data are the example dataset.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Data not found" on the site | `publier` not run | `python -m hexafire publier --exemple` or `publier` |
| The globe says it "could not be loaded" | no connection (MapLibre and map tiles come from the network) or WebGL disabled | check the connection / enable hardware acceleration |
| Unreadable statuses, empty 2003–2020 calendar | data published by an old engine version under Windows (encoding) | run `publier` again with this version |
| Empty country list | `pays.geojson` missing | `python -m hexafire pays` |
| Port 8000 already in use | another local server | `python -m http.server 8765` and adapt the address |

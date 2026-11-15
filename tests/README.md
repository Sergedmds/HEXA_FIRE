# Tests

## Engine (Python)

```bash
cd backend && python -m pytest -q      # 14 tests: preparation, harmonization, validation, FIRMS API
```

## Front end (smoke test)

`frontend_smoke.mjs` opens each page of the site in headless Edge or Chrome (DevTools protocol, Node.js 22+ without
dependencies), reports JavaScript errors and missing files, then saves a screenshot.

```bash
cd frontend && python -m http.server 8000          # terminal 1
node tests/frontend_smoke.mjs --base http://localhost:8000 --out captures   # terminal 2
# options: --pages home,explore   --browser "C:\...\chrome.exe"
```

Pages tested: Home, Explore (empty and with an area restored from the link), Compare (two areas), About & guide.
Exit code 1 if a page produces a JavaScript error or a 404 on its own files (`pays.geojson`, optional, is tolerated).

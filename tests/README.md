# Tests

## Moteur (Python)

```bash
cd backend && python -m pytest -q      # 14 tests : préparation, harmonisation, validation, API FIRMS
```

## Frontend (test de fumée)

`frontend_smoke.mjs` ouvre chaque page du site dans Edge ou Chrome sans fenêtre (protocole DevTools, Node.js 22+ sans
dépendance), relève les erreurs JavaScript et les fichiers introuvables, puis enregistre une capture d'écran.

```bash
cd frontend && python -m http.server 8000          # terminal 1
node tests/frontend_smoke.mjs --base http://localhost:8000 --out captures   # terminal 2
# options : --pages home,explore   --browser "C:\...\chrome.exe"
```

Pages testées : accueil, Explorer (vide et avec une zone restaurée depuis le lien), Comparer (deux zones), Méthode.
Code de sortie 1 si une page produit une erreur JavaScript ou un 404 vers ses propres fichiers (`pays.geojson`,
facultatif, est toléré).

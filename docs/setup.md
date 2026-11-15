# Installation et mise en route

## Prérequis

- Python 3.11 ou plus récent (le moteur) ; `pyarrow` est recommandé mais facultatif (repli CSV compressé).
- Un navigateur récent avec WebGL pour le globe.
- Facultatif : `lftp` pour télécharger les archives (`telecharger_archives.sh`), Node.js 22+ pour le test de fumée.

## 1. Moteur

```bash
cd backend
python -m venv .venv
. .venv/bin/activate            # Windows : .venv\Scripts\activate
pip install -r requirements.txt
python -m pytest -q             # attendu : 14 passed
```

### Jeu d'exemple (pour voir le site tout de suite)

```bash
python -m hexafire publier --exemple     # écrit ../frontend/public/data (jeu FICTIF, bandeau affiché dans le site)
python -m hexafire pays                  # facultatif : frontières Natural Earth pour le choix « Pays »
```

### Série réelle

Téléchargement des archives (depuis la racine du dépôt), puis la chaîne complète ; tout est détaillé étape par étape
dans [`../backend/GUIDE_EXECUTION.md`](../backend/GUIDE_EXECUTION.md) :

```bash
bash telecharger_archives.sh modis && bash telecharger_archives.sh modis_recent && bash telecharger_archives.sh snpp
cd backend
python -m hexafire preparer && python -m hexafire agreger && python -m hexafire occasions \
 && python -m hexafire calibrer && python -m hexafire valider && python -m hexafire serie \
 && python -m hexafire publier
```

Mois les plus récents (API FIRMS, clé personnelle) : `export FIRMS_MAP_KEY=... && python -m hexafire firms` avant
`agreger`.

## 2. Site

```bash
cd frontend
python -m http.server 8000      # puis http://localhost:8000
```

Il n'y a rien à compiler. Le site lit `public/data/index.json` ; s'il manque, chaque page l'indique et rappelle la
commande à lancer. Version anglaise : bouton EN dans l'en-tête, ou `#l=en` dans l'adresse.

## 3. Test de fumée du frontend

```bash
# dans un terminal : cd frontend && python -m http.server 8000
node tests/frontend_smoke.mjs --base http://localhost:8000 --out captures
```

Le script ouvre les quatre pages (dont Explorer avec une zone et Comparer avec deux zones) dans Edge ou Chrome sans
fenêtre, signale les erreurs JavaScript et les fichiers introuvables, et enregistre une capture de chaque page.

## 4. Mise en ligne (GitHub Pages)

```bash
./publier_site.sh
```

Le script copie `frontend/` (pages, `src/`, `public/` avec les données) sur la branche `gh-pages` du dépôt distant
`origin`. Il refuse les fichiers de plus de 95 Mo et demande confirmation si les données sont le jeu d'exemple.

## Dépannage

| Symptôme | Cause | Solution |
|---|---|---|
| « Données introuvables » dans le site | `publier` pas lancé | `python -m hexafire publier --exemple` ou `publier` |
| Le globe affiche « n'a pas pu être chargé » | pas de connexion (MapLibre et tuiles viennent du réseau) ou WebGL désactivé | vérifier la connexion / activer l'accélération matérielle |
| Statuts illisibles, calendrier vide 2003–2020 | données publiées par une ancienne version du moteur sous Windows (encodage) | relancer `publier` avec cette version |
| Liste des pays vide | `pays.geojson` absent | `python -m hexafire pays` |
| Port 8000 occupé | autre serveur local | `python -m http.server 8765` et adapter l'adresse |

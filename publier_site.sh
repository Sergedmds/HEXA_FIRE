#!/usr/bin/env bash
# Met en ligne le site HEXAFIRE sur GitHub Pages (branche gh-pages).
#
# Le code est sur la branche principale ; les données publiées (frontend/public/data, ~200 Mo) n'y sont pas.
# Ce script copie le frontend avec ses données dans un dossier temporaire et remplace entièrement la
# branche gh-pages (push forcé, un seul commit) : l'historique ne grossit pas à chaque mise à jour.
#
# Usage : ./publier_site.sh     (après  python -m hexafire publier  dans backend/)
set -euo pipefail

RACINE="$(cd "$(dirname "$0")" && pwd)"
WEB="$RACINE/frontend"
DONNEES="$WEB/public/data"

# Ce script ne crée pas de dépôt GitHub : il pousse sur le dépôt distant « origin » déjà configuré.
if ! git -C "$RACINE" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Ce dossier n'est pas un dépôt git. Initialisez-le d'abord, par exemple :"
  echo "  git init && git add -A && git commit -m 'HEXAFIRE' && git remote add origin https://github.com/<compte>/<depot>.git && git push -u origin main"
  exit 1
fi
DEPOT="$(git -C "$RACINE" remote get-url origin 2>/dev/null || true)"
[ -n "$DEPOT" ] || { echo "Aucun dépôt distant « origin ». Ajoutez-le :  git remote add origin https://github.com/<compte>/<depot>.git"; exit 1; }
echo "Dépôt cible : $DEPOT (branche gh-pages)"

[ -f "$DONNEES/index.json" ] || { echo "Pas de données : lancez d'abord  python -m hexafire publier  dans backend/"; exit 1; }
if grep -q '"exemple": true' "$DONNEES/index.json"; then
  read -r -p "ATTENTION : ce sont les données d'EXEMPLE (fictives). Publier quand même ? [o/N] " r
  [ "$r" = "o" ] || exit 1
fi
[ -f "$DONNEES/pays.geojson" ] || echo "Remarque : pays.geojson absent (python -m hexafire pays), le choix par pays sera indisponible en ligne."

# GitHub refuse les fichiers de plus de 100 Mo
GROS="$(find "$DONNEES" -type f -size +95M)"
[ -z "$GROS" ] || { echo "Fichiers trop gros pour GitHub :"; echo "$GROS"; exit 1; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
# Seuls les fichiers servis par le site sont publiés
cp "$WEB"/*.html "$TMP/"
cp -r "$WEB/src" "$WEB/public" "$TMP/"
touch "$TMP/.nojekyll"          # servir les fichiers tels quels (pas de traitement Jekyll)
echo "Taille du site : $(du -sh "$TMP" | cut -f1)"

cd "$TMP"
git init -q
git checkout -q -b gh-pages
git add -A
git commit -q -m "Site HEXAFIRE ($(date +%Y-%m-%d))"
git push -f "$DEPOT" gh-pages
echo "Publié (mise à jour en une à deux minutes)."

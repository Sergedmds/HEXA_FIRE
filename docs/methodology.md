# Méthode d'harmonisation (résumé)

Le détail mathématique est dans [`DOSSIER_TECHNIQUE.pdf`](DOSSIER_TECHNIQUE.pdf) (section 5) et dans le document de
recherche ([français](HEXAFIRE_document.pdf), [anglais](HEXAFIRE_document_en.pdf)). La page *Méthode* du site en donne une version grand public.

## Le problème

MODIS (Terra depuis novembre 2000, Aqua depuis juillet 2002) détecte les feux actifs avec des pixels de 1 km. VIIRS
(Suomi NPP depuis 2012, NOAA-20 depuis 2018, NOAA-21 depuis 2023) descend à 375 m et détecte, à nombre de passages égal,
environ 5 fois plus de points chauds le jour et 15 fois plus la nuit. Raccorder les deux séries sans correction crée une
fausse hausse au changement de capteur.

## Données et filtres

Archives mensuelles MCD14ML (collections 6 puis 6.1) et VNP14IMGML / VJ114IMGML / VJ214IMGML (collection 2), API FIRMS
pour les mois récents. Filtres : type 0 (feu de végétation présumé), confiance MODIS ≥ 30, classe VIIRS « faible »
exclue. Chaque détection est rangée dans la cellule de 0,25° contenant son centre, jour et nuit séparément.

## Occasions d'observation

Le nombre de passages de chaque satellite au-dessus d'une cellule dépend de la latitude et de la fauchée (calcul
analytique, niveau 0). Les jours sans données (capteur sous 10 % de son activité mondiale habituelle) sont repérés : un
mois est « couverture partielle » sous 80 % de jours, « non observé » sous 30 %.

## Conversion VIIRS → MODIS

Modèle binomial conditionnel avec décalage d'occasions : sur 2012–2020, pour chaque strate (bloc de 10°), mois de
l'année et période (jour / nuit), on estime le facteur α tel que

```
N_MODIS ≈ N_S-NPP · exp(α) · (E_Terra + E_Aqua) / E_S-NPP
```

où E est le nombre de passages. Les estimations peu sûres sont rapprochées de la valeur annuelle de la strate
(rétrécissement). NOAA-20 et NOAA-21 sont raccordés à S-NPP sur leurs années communes. Terra seul (2000–2002) est ramené
à Terra + Aqua par un facteur γ estimé de la même façon.

## Série harmonisée

| Période | Source | Statut |
|---|---|---|
| nov. 2000 – juin 2002 | Terra seul, ramené à Terra + Aqua | converti |
| juil. 2002 – déc. 2020 | MODIS Terra + Aqua | mesuré |
| depuis janv. 2021 | VIIRS converti (moyenne pondérée S-NPP, NOAA-20, NOAA-21) | converti |
| mois sans VIIRS disponible | MODIS | provisoire |

Chaque valeur est ramenée au même nombre de passages (médiane 2003–2020). Deux unités : équivalent MODIS (Terra + Aqua)
et équivalent VIIRS (ce que S-NPP seul aurait détecté, mêmes facteurs dans l'autre sens).

## Incertitude

L'erreur type de chaque facteur est propagée aux valeurs converties (échelle log, premier ordre), puis à la zone
choisie : écarts types additionnés dans une même strate, variances additionnées entre strates. Le site affiche
l'intervalle à 95 % et signale les verdicts incertains (intervalle à cheval sur deux classes d'écart).

## Écart à la normale

Rapport entre la valeur du mois et la médiane du même mois de l'année sur 2003–2020, pour la même zone (ou la même
cellule de 1° sur la carte). Cinq classes : < 0,5 ; 0,5–0,8 ; 0,8–1,25 ; 1,25–2 ; > 2. Non calculé si moins de 10 années
de référence ou médiane < 5. Indépendant de l'unité.

## Validation « une année exclue »

Pour chaque année de test, les facteurs sont recalculés sans elle, VIIRS est converti et le verdict mensuel (bas /
normal / haut, seuils 10 % et 90 % de 2003–2011) est comparé au vrai MODIS. Critères : kappa ≥ 0,5, fausses anomalies
≤ 0,15, |biais médian| < 0,10, erreur médiane < 0,25, saut annuel max < 0,10. Comparaison avec M1 (un facteur
mondial) et M0 (VIIRS brut). Sur 2012–2020 (17 309 région-mois), HEXAFIRE obtient un kappa de 0,747 et 9,0 % de
fausses anomalies, contre 0,558 et 23,9 % pour M1. Le tableau complet figure dans le README et en bas de la page
*Explorer* du site.

## Limites

- Un point chaud n'est pas un incendie ; l'absence de point chaud ne prouve pas l'absence de feu.
- Passages calculés analytiquement ; strates de 10° (régions GFED × occupation du sol prévues).
- La FRP n'est pas harmonisée : comparable seulement entre mois d'un même capteur.

# Harmonization method (summary)

The mathematical details are in [`TECHNICAL_DOSSIER.pdf`](TECHNICAL_DOSSIER.pdf) (section 5) and in the research
document ([English](HEXAFIRE_document_en.pdf), [French](HEXAFIRE_document.pdf)). The "About & guide" page of the
site gives a plain-language version.

## The problem

MODIS (Terra since November 2000, Aqua since July 2002) detects active fires with 1 km pixels. VIIRS (Suomi NPP since
2012, NOAA-20 since 2018, NOAA-21 since 2023) goes down to 375 m and, for the same number of overpasses, detects about
5.7 times more hotspots by day and 15.6 times more at night. Joining the two series without correction creates a
false increase at the sensor change.

## Data and filters

Monthly archives MCD14ML (collections 6 then 6.1) and VNP14IMGML / VJ114IMGML / VJ214IMGML (collection 2), FIRMS API
for the recent months. Filters: type 0 (presumed vegetation fire), MODIS confidence ≥ 30, VIIRS "low" class removed.
Each detection goes to the 0.25° cell that contains its centre, day and night separately.

## Observation opportunities

The number of overpasses of each satellite over a cell depends on latitude and swath (analytical computation). Days
without data (sensor below 10% of its usual global activity) are detected: a month is "partial coverage" below 80% of
days and "not observed" below 30%.

## VIIRS → MODIS conversion

Conditional binomial model with an overpass offset: over 2012–2020, for each stratum (10° block), calendar month and
period (day / night), the factor α is estimated such that

```
N_MODIS ≈ N_S-NPP · exp(−α) · (E_Terra + E_Aqua) / E_S-NPP
```

where E is the number of overpasses. Uncertain estimates are pulled towards the annual value of the stratum
(shrinkage). NOAA-20 and NOAA-21 are linked to S-NPP over their common years. Terra alone (2000–2002) is brought to
Terra + Aqua by a factor γ estimated in the same way.

## Harmonized series

| Period | Source | Status |
|---|---|---|
| Nov 2000 – Jun 2002 | Terra alone, brought to Terra + Aqua | converted |
| Jul 2002 – Dec 2020 | MODIS Terra + Aqua | measured |
| from Jan 2021 | converted VIIRS (weighted mean of S-NPP, NOAA-20, NOAA-21) | converted |
| months without VIIRS data | MODIS | provisional |

Each value is brought to the same number of overpasses (2003–2020 median). Two units: MODIS equivalent (Terra + Aqua)
and VIIRS equivalent (what S-NPP alone would have detected, same factors used the other way round).

## Uncertainty

The standard error of each factor is propagated to the converted values (log scale, first order), then to the chosen
area: standard deviations add up within a stratum, variances add up between strata. The site shows the 95% interval
and flags uncertain verdicts (interval spanning two departure classes).

## Departure from normal

Ratio between the value of the month and the median of the same calendar month over 2003–2020, for the same area (or
the same 1° cell on the map). Five classes: < 0.5; 0.5–0.8; 0.8–1.25; 1.25–2; > 2. Not computed with fewer than 10
reference years or a median below 5. Independent of the unit.

## Leave-one-year-out validation

For each test year, the factors are recomputed without it, VIIRS is converted and the monthly verdict (low / normal /
high, 10% and 90% thresholds of 2003–2011) is compared with real MODIS. Criteria: kappa ≥ 0.5, false anomalies
≤ 0.15, |median bias| < 0.10, median error < 0.25, largest annual step < 0.10. Comparison with M1 (one worldwide
factor) and M0 (raw VIIRS). Over 2012–2020 (17,309 region-months), HEXAFIRE reaches a kappa of 0.747 and 9.0% false
anomalies, against 0.558 and 23.9% for M1. The full table is in the README and at the bottom of the site's
*Explore* page.

## Limitations

- A hotspot is not a wildfire; the absence of hotspots does not prove the absence of fire.
- Overpasses computed analytically; 10° strata (GFED regions × land cover planned).
- FRP is not harmonized: it is only comparable between months of the same sensor.

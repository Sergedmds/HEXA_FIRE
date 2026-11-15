# HEXAFIRE data sources, provenance and terms of use

This document states **where each dataset used by HEXAFIRE comes from, how it was retrieved, which version was used and
under which conditions**. It follows the NASA Space Apps rule: *“For non-U.S. Government websites, participants must
comply with any data use parameters of that specific website.”*

Last updated: 15 November 2026.

## 1. Summary

| # | Data | Producer / host | Host type | Access used | Role in HEXAFIRE |
|---|---|---|---|---|---|
| 1 | MODIS active fires, monthly archives (MCD14ML) | NASA MODIS Fire team, University of Maryland (UMD) | **Non-U.S. Government** (university server) | SFTP `fuoco.geog.umd.edu` | Reference series, 2000–2026 |
| 2 | VIIRS 375 m active fires, monthly archives (VNP14IMGML, VJ114IMGML, VJ214IMGML) | NASA VIIRS Fire team, UMD | **Non-U.S. Government** (university server) | SFTP `fuoco.geog.umd.edu` | Calibration 2012–2020; converted series 2021 → |
| 3 | NASA FIRMS active fire data (MODIS and VIIRS, NRT and standard) | NASA LANCE / FIRMS | U.S. Government | FIRMS API (`firms.modaps.eosdis.nasa.gov`, MAP_KEY) | Most recent months, after the end of the monthly archives |
| 4 | Globe basemap: VIIRS Black Marble (2016), coastlines, borders and labels | NASA GIBS | U.S. Government | `gibs.earthdata.nasa.gov` (WMTS, no key) | Background of the interactive globe |
| 4b | Satellite imagery at close zoom (World Imagery) | Esri, Maxar, Earthstar Geographics | Non-U.S. Government | `server.arcgisonline.com` | Globe background beyond zoom level 8 (darkened) |
| 5 | Place search (geocoding) | OpenStreetMap Nominatim | Non-U.S. Government | `nominatim.openstreetmap.org` | “Search a place” box in the web app |
| 6 | Country borders (admin-0, 1:110 m) | Natural Earth | Non-U.S. Government | GitHub `nvkelso/natural-earth-vector` | “Country” area selection |
| 7 | MapLibre GL JS 5.6.0 (software library) | MapLibre organization | Non-U.S. Government | CDN `unpkg.com` | Globe rendering (globe projection) |
| 8 | Space Grotesk and Inter fonts | Google Fonts | Non-U.S. Government | `fonts.googleapis.com` | Typography of the web app |

The fire detections (rows 1–3) are **NASA products**, and FIRMS distributes these same products. Rows 1–2 were
downloaded from the University of Maryland server where the NASA fire science team publishes the monthly archives.
Rows 4–7 are only used by the web interface, not to compute the harmonized series.

## 2. Fire data in detail

### 2.1 MODIS MCD14ML (Terra and Aqua, 1 km)

- **Product**: MODIS Collection 6 and 6.1 monthly active fire location files (MCD14ML), the standard
  (science-quality) product, not near-real-time.
- **Where**: SFTP server of the University of Maryland fire team, `sftp://fuoco.geog.umd.edu`. Public read-only account
  `fire` / `burnt`, as published in the NASA *MODIS Collection 6 and 6.1 Active Fire Product User's Guide* (section on
  data distribution).
- **Folders and versions used**:
  - `/data/MODIS/C6/MCD14ML`: version `006.03`, November 2000 → December 2022.
  - `/data/MODIS/C61/MCD14ML`: version `061.03`, January 2023 → August 2026.

  According to NASA FIRMS, Collection 6.1 “does not contain any change to the science algorithm” (Level 1B
  recalibration only). Chaining C6 then C6.1 therefore keeps the fire detection algorithm unchanged.
- **How**: script `telecharger_archives.sh`, which runs an `lftp mirror` of the folders above. Download logs are
  kept in `donnees_brutes/<product>/journal.txt`.
- **Retrieved**: 12–13 November 2026.
- **Filters applied**: type = 0 (presumed vegetation fire); MODIS confidence ≥ 30.
- **Reference**: Giglio, L., Schroeder, W., Justice, C. O. (2016). *The collection 6 MODIS active fire detection
  algorithm and fire products.* Remote Sensing of Environment, 178, 31–41.

### 2.2 VIIRS VNP14IMGML, VJ114IMGML and VJ214IMGML (375 m)

- **Products**: VIIRS 375 m active fire monthly location files, Collection 2 (version `C2.04`):
  - Suomi NPP (VNP14IMGML): January 2012 → July 2026;
  - NOAA-20 (VJ114IMGML): April 2018 → July 2026;
  - NOAA-21 (VJ214IMGML): March 2023 → July 2026.
- **Where**: same UMD SFTP server, folders `/data/VIIRS/C2/VNP14IMGML`, `/data/VIIRS/C2/VJ114IMGML`,
  `/data/VIIRS/C2/VJ214IMGML`.
- **How**: same script and logs as MODIS.
- **Retrieved**: 12–13 November 2026 (S-NPP 2021–2026 in progress at the time of writing; NOAA-20 and NOAA-21 planned).
- **Filters applied**: type = 0; “low” confidence class excluded.
- **Note**: according to NASA FIRMS, Suomi NPP stopped delivering new observations on 2 November 2026. HEXAFIRE
  therefore links NOAA-20 and NOAA-21 to S-NPP.
- **Reference**: Schroeder, W., Oliva, P., Giglio, L., Csiszar, I. A. (2014). *The New VIIRS 375 m active fire
  detection data product: Algorithm description and initial assessment.* Remote Sensing of Environment, 143, 85–96.

### 2.3 NASA FIRMS API (U.S. Government)

- **Where**: `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/{SOURCE}/world/{days}/{date}`. Sources used:
  `MODIS_NRT` / `MODIS_SP`, `VIIRS_SNPP_NRT` / `_SP`, `VIIRS_NOAA20_NRT` / `_SP`, `VIIRS_NOAA21_NRT` / `_SP`.
- **When used**: only for the days after the last monthly archive available on the UMD server. If a monthly archive
  later becomes available for the same month, it replaces the API data automatically.
- **Key**: personal FIRMS MAP_KEY. It is never stored in the repository or in the published files.
- **Limits respected**: the FIRMS quota (5,000 transactions per 10 minutes) and requests of at most 5 days.

### 2.4 Terms of use and acknowledgement for the fire data

- NASA supports full and open sharing of Earth science data. The products above are distributed freely and without
  restriction by NASA and its science teams.
- To our knowledge, the UMD server publishes no conditions of use beyond those of the NASA products it hosts. We use
  only the public account documented by NASA, read-only, at a moderate download rate (3 parallel transfers).
- As requested by FIRMS, HEXAFIRE displays the following acknowledgement in its README, in its web app (footer and Methodology page)
  and in its exports:

  > We acknowledge the use of data and/or imagery from NASA's Fire Information for Resource Management System (FIRMS)
  > (https://www.earthdata.nasa.gov/firms), part of NASA's Earth Science Data and Information System (ESDIS).

- FIRMS disclaimer: the information is provided “as is” and users bear all responsibility and liability for their use
  of the data (https://www.earthdata.nasa.gov/data/projects/lance/disclaimer). HEXAFIRE also states that *a hotspot is
  not a wildfire, and the absence of hotspots does not prove the absence of fire*.
- HEXAFIRE publishes **derived** monthly counts (harmonized, per 0.25° and 1° cell). It does not republish the original
  detection files.

## 3. Interface data (non-U.S. Government) and their terms

| Data | Terms followed by HEXAFIRE |
|---|---|
| **NASA GIBS** | Open NASA imagery services; attribution “NASA GIBS” shown on the globe. Black Marble (VIIRS DNB, 2016) and the reference layers are used through the public WMTS endpoint, without key. |
| **Esri World Imagery** | Used only beyond zoom level 8, with the attribution required by Esri (“Esri, Maxar, Earthstar Geographics”) shown on the globe. |
| **Google Fonts** | Fonts loaded from Google servers (Space Grotesk, Inter). |
| **Nominatim** | One request per search, triggered by the user (no autocomplete, no bulk geocoding), in line with the Nominatim *Usage Policy* (at most 1 request per second). Coordinates typed directly are not sent anywhere. |
| **Natural Earth** | Public domain. Downloaded once by `python -m hexafire pays` (properties reduced to names and codes). Credit given in the README and the Methodology page. |
| **MapLibre GL JS** | BSD 3-Clause licence, loaded from the unpkg CDN. |

## 4. Reproducibility

Everything needed to rebuild the data is in the repository:
1. `telecharger_archives.sh` (download);
2. `backend/` (processing: `python -m hexafire preparer … publier`);
3. `backend/GUIDE_EXECUTION.md` (step-by-step guide);
4. `backend/config.toml` (filters and periods).

The raw and intermediate data are not versioned because of their size (several tens of GB).

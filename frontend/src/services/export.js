// Exports : CSV du calendrier (avec en-tête de provenance), cellules × mois, JSON, image SVG et PNG.
import { getIndex } from "./data.js";
import { t } from "../utils/i18n.js";

const MERCI = "We acknowledge the use of data and/or imagery from NASA's Fire Information for Resource Management System (FIRMS) " +
  "(https://www.earthdata.nasa.gov/firms), part of NASA's Earth Science Data and Information System (ESDIS). Data provided as is.";

function telecharger(nom, contenu, type) {
  const url = URL.createObjectURL(new Blob([contenu], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: nom });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function zoneSerialisable(zone) {
  if (!zone) return null;
  const { anneaux, ...reste } = zone;
  return zone.type === "pays" ? reste : zone;
}

function entete(zone, unite) {
  const idx = getIndex();
  return [
    `# ${t("x.titre")}`,
    `# unite / unit: ${(idx.unites && idx.unites[unite]) || idx.unite}`,
    `# zone: ${JSON.stringify(zoneSerialisable(zone))}`,
    `# periode_reference_normale / reference_period: ${idx.periode_reference.join("-")}`,
    `# donnees_generees_le / generated: ${idx.genere_le}${idx.exemple ? ` (${t("x.exemple")})` : ""}`,
    `# ${t("x.avert")}`,
    `# ${MERCI}`,
  ];
}

const csvCell = x => `"${String(x ?? "").replace(/"/g, '""')}"`;

export function exporterCSV(stats, zone, unite = "modis") {
  const lignes = ["annee,mois,valeur,borne_basse_95,borne_haute_95,detections_brutes,frp_moyenne_mw,statut,source,couverture,mediane_mois,rapport_mediane,classe,verdict_incertain"];
  const f2 = x => (x === null || x === undefined || !Number.isFinite(x) ? "" : x.toFixed(2));
  for (const c of stats.cases) {
    lignes.push([c.annee, c.mois, f2(c.valeur), f2(c.bas ?? c.valeur), f2(c.haut ?? c.valeur), f2(c.brut), f2(c.frpMoy), c.statut, c.source,
      c.couverture, Number.isFinite(c.mediane) ? c.mediane.toFixed(2) : "", c.rapport === null ? "" : c.rapport.toFixed(3),
      c.classe ? c.classe.cle : (c.refus || ""), c.incertain ? "oui" : ""].map(csvCell).join(","));
  }
  telecharger(`hexafire_calendrier_${unite}.csv`, entete(zone, unite).concat(lignes).join("\n"), "text/csv;charset=utf-8");
}

export function exporterCellules(serie, zone) {
  const idx = getIndex();
  const lignes = [`# ${t("x.titre")} - ${idx.pas_grille} deg x mois / month`, `# zone: ${JSON.stringify(zoneSerialisable(zone))}`,
    `# valeur_modis: ${(idx.unites && idx.unites.modis) || idx.unite}`,
    `# valeur_viirs: ${(idx.unites && idx.unites.viirs) || "-"}`,
    "# detections_brutes = detections of the sensor used that month (MODIS until 2020, VIIRS after)",
    `# ${t("x.avert")}`, `# ${MERCI}`,
    "cellule,lat_centre,lon_centre,annee,mois,valeur_modis,valeur_viirs,detections_brutes,frp_totale_mw,source"];
  for (const [c, lat, lon, tt, v, b, w, p] of serie.lignes) {
    const m = idx.mois[tt];
    lignes.push([c, lat.toFixed(3), lon.toFixed(3), m.annee, m.mois, v.toFixed(2),
      Number.isFinite(w) ? w.toFixed(2) : "", Number.isFinite(b) ? b : "", Number.isFinite(p) ? p.toFixed(1) : "", m.source].join(","));
  }
  telecharger("hexafire_cellules_mois.csv", lignes.join("\n"), "text/csv;charset=utf-8");
}

export function exporterJSON(stats, zone, unite = "modis") {
  const idx = getIndex();
  const out = { zone: zoneSerialisable(zone), unite: (idx.unites && idx.unites[unite]) || idx.unite, periode_reference: idx.periode_reference,
    genere_le: idx.genere_le, exemple: !!idx.exemple, remerciements: MERCI,
    mois: stats.cases.map(c => ({ annee: c.annee, mois: c.mois, valeur: c.valeur, borne_basse_95: c.bas ?? c.valeur,
      borne_haute_95: c.haut ?? c.valeur, detections_brutes: c.brut, frp_moyenne_mw: c.frpMoy, verdict_incertain: !!c.incertain,
      statut: c.statut, source: c.source, mediane: Number.isFinite(c.mediane) ? c.mediane : null, rapport: c.rapport,
      classe: c.classe ? c.classe.cle : null })) };
  telecharger(`hexafire_calendrier_${unite}.json`, JSON.stringify(out, null, 1), "application/json");
}

// Les styles de l'écran ne suivent pas l'image : on les fixe dans le fichier exporté (fond nocturne).
const STYLE_EXPORT = `.fond-svg{fill:#0d1426}.grille-svg{stroke:#1e2742}.sep-svg{stroke:#0d1426}
text{font-family:"Space Grotesk",ui-monospace,monospace;font-size:11px;fill:#9aa8c7}`;

function serialiser(svg) {
  const copie = svg.cloneNode(true);
  copie.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const st = document.createElementNS("http://www.w3.org/2000/svg", "style");
  st.textContent = STYLE_EXPORT;
  copie.insertBefore(st, copie.firstChild);
  return new XMLSerializer().serializeToString(copie);
}

export function exporterSVG(svg, nom = "hexafire_calendrier.svg") {
  telecharger(nom, serialiser(svg), "image/svg+xml");
}

export function exporterPNG(svg, nom = "hexafire_calendrier.png") {
  const img = new Image(), echelle = 2;
  const w = svg.viewBox.baseVal.width || svg.clientWidth, h = svg.viewBox.baseVal.height || svg.clientHeight;
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = w * echelle; c.height = h * echelle;
    const ctx = c.getContext("2d"); ctx.scale(echelle, echelle); ctx.drawImage(img, 0, 0, w, h);
    c.toBlob(b => telecharger(nom, b, "image/png"));
  };
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serialiser(svg));
}

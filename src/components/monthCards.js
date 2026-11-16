// Code written with the help of Claude (Anthropic), a Super Intelligence (SI) assistant, then run and tested by team HEXAFIRE.
// Douze cartes mensuelles d'une année (valeur, écart à la normale, barre), comme dans la maquette Explorer (état B).
import { t, nf, nomMois, nomMoisLong } from "../utils/i18n.js";
import { nomClasseCourt } from "../utils/stats.js";

const couleurRapport = c => (c.classe ? c.classe.couleur : "#6c7a99");

// stats : résultat de statistiques() ; annee ; uniteCourte ; selectionT ; clic(c)
export function dessinerCartesMois(conteneur, stats, annee, { uniteCourte = "", selectionT = null, clic = () => {} } = {}) {
  const cs = stats.cases.filter(c => c.annee === annee);
  const max = Math.max(1, ...cs.map(c => Math.max(c.valeur || 0, Number.isFinite(c.mediane) ? c.mediane : 0)));
  const pic = cs.reduce((p, c) => (c.valeur !== null && (p === null || c.valeur > p.valeur) ? c : p), null);
  conteneur.innerHTML = cs.map(c => {
    const obs = c.valeur !== null;
    const ecart = c.rapport !== null ? `${c.rapport >= 1 ? "+" : ""}${nf((c.rapport - 1) * 100)} %` : (obs && c.refus ? t("refus." + c.refus) : t("statut." + c.statut));
    const etat = c.classe ? nomClasseCourt(c.classe) : t("statut." + c.statut);
    const sel = c.t === selectionT, estPic = pic && c.t === pic.t;
    return `<button type="button" class="month-card ${sel ? "selected" : ""} ${estPic ? "peak" : ""}" data-t="${c.t}" aria-pressed="${sel}" aria-label="${nomMoisLong(c.mois - 1)} ${c.annee}">
      <div class="row between">
        <span class="headline-md" style="font-size:1.05rem">${String(c.mois).padStart(2, "0")} · ${nomMois(c.mois - 1).toUpperCase()}</span>
        <span class="telemetry" style="color:${couleurRapport(c)}">${etat}</span>
      </div>
      <div class="row between" style="align-items:baseline;margin-top:.4rem">
        <span class="num" style="font-size:1.35rem;font-weight:600">${obs ? nf(c.valeur) : "—"}</span>
        <span class="telemetry" style="color:${couleurRapport(c)}">${ecart}</span>
      </div>
      <div class="telemetry dim" style="margin:.1rem 0 .5rem;font-weight:500">${uniteCourte}${Number.isFinite(c.mediane) ? ` · ${t("b.mediane", nf(c.mediane))}` : ""}</div>
      <div class="bar"><i style="width:${obs ? Math.max(2, (c.valeur / max) * 100) : 0}%;background:${couleurRapport(c)}"></i></div>
      ${Number.isFinite(c.mediane) ? `<div class="bar normal"><i style="width:${Math.max(0, (c.mediane / max) * 100)}%"></i></div>` : ""}
    </button>`;
  }).join("");
  conteneur.querySelectorAll(".month-card").forEach(b => (b.onclick = () => clic(stats.cases[+b.dataset.t])));
}

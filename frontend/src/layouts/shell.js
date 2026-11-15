// Code written with the help of Claude (Anthropic), a Super Intelligence (SI) assistant, then run and tested by team HEXAFIRE.
// Coquille commune : en-tête (marque, navigation, langue), bandeau « données d'exemple », pied de page.
// Chaque page appelle monterShell({ page }) puis charge son module.
import { CONFIG } from "../config/app.js";
import { t, appliquerTextes, choisirLangue, langueInitiale, getLangue, surChangementLangue } from "../utils/i18n.js";
import { icon } from "./../components/icons.js";

const PAGES = [["home", "index.html"], ["explore", "explore.html"], ["compare", "compare.html"], ["methodology", "methodology.html"]];

function nav(page, classe) {
  return PAGES.map(([id, href]) => `<a href="${href}" data-i18n="nav.${id}" ${id === page ? 'aria-current="page"' : ""}></a>`).join("");
}

export function monterShell({ page }) {
  choisirLangue(langueInitiale(), false);
  const header = document.getElementById("shell-header");
  const footer = document.getElementById("shell-footer");
  if (header) header.innerHTML = `
    <div id="banner-example" class="banner-example" hidden data-i18n="shell.example"></div>
    <div class="wrap bar">
      <a class="brand" href="index.html" aria-label="HEXAFIRE">
        <span class="name">HEXA<b>FIRE</b></span><span class="pip pulse"></span>
        <span class="sub" data-i18n="shell.sub"></span>
      </a>
      <nav class="site-nav" aria-label="Navigation">${nav(page)}</nav>
      <div class="header-tools">
        <div class="lang" role="group" aria-label="Langue / Language">
          <button type="button" data-lang="fr">FR</button><button type="button" data-lang="en">EN</button>
        </div>
        ${page === "home" ? '<a class="btn btn-ghost btn-sm" href="explore.html"><span data-i18n="shell.launch"></span><span class="arrow">→</span></a>' : ""}
        <button type="button" class="icon-btn menu-btn" id="menu-btn" aria-expanded="false" data-i18n-aria="shell.menu">${icon("menu")}</button>
      </div>
    </div>
    <nav class="mobile-nav" id="mobile-nav" aria-label="Navigation">${nav(page)}</nav>`;
  if (footer) footer.innerHTML = `
    <div class="wrap">
      <div class="top">
        <div class="brand"><span class="name">HEXA<b>FIRE</b></span><span class="pip"></span><span class="sub" data-i18n="shell.sub"></span></div>
        <div class="links">
          <a href="explore.html" data-i18n="nav.explore"></a><a href="compare.html" data-i18n="nav.compare"></a>
          <a href="methodology.html" data-i18n="nav.methodology"></a>
          <a href="${CONFIG.liens.depot}" target="_blank" rel="noopener" data-i18n="shell.github"></a>
          <a href="${CONFIG.liens.firms}" target="_blank" rel="noopener">NASA FIRMS</a>
        </div>
      </div>
      <p class="ack" style="padding-top:1.25rem" data-i18n-html="shell.ack"></p>
      <div class="bottom">
        <span data-i18n="shell.copyright"></span>
        <span class="row"><span class="pip orbital"></span><span data-i18n="shell.grid"></span></span>
      </div>
    </div>`;

  const majLangue = () => document.querySelectorAll(".lang button").forEach(b => b.classList.toggle("active", b.dataset.lang === getLangue()));
  document.querySelectorAll(".lang button").forEach(b => (b.onclick = () => choisirLangue(b.dataset.lang)));
  const mb = document.getElementById("menu-btn"), mn = document.getElementById("mobile-nav");
  if (mb) mb.onclick = () => { const o = mn.classList.toggle("open"); mb.setAttribute("aria-expanded", String(o)); };
  surChangementLangue(majLangue);
  appliquerTextes();
  majLangue();
}

export function signalerExemple(index) {
  const b = document.getElementById("banner-example");
  if (b && index && index.exemple) b.hidden = false;
}

export function afficherErreurDonnees(conteneur) {
  conteneur.innerHTML = `<div class="notice">${t("err.index")}</div>`;
}

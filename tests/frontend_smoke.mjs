// Test de fumée du frontend : ouvre chaque page dans un navigateur Chromium/Edge sans fenêtre (protocole
// DevTools), relève les erreurs JavaScript et les requêtes en échec, enregistre une capture d'écran.
//
//   1. servir le frontend :   cd frontend && python -m http.server 8000
//   2. lancer :               node tests/frontend_smoke.mjs [--base http://localhost:8000] [--out captures] [--browser chemin]
//
// Code de sortie 1 si une page produit une erreur JavaScript ou une requête 404 vers ses propres fichiers.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { setTimeout as attendre } from "node:timers/promises";

const args = Object.fromEntries(process.argv.slice(2).map((a, i, l) => (a.startsWith("--") ? [a.slice(2), l[i + 1]] : null)).filter(Boolean));
const BASE = args.base || "http://localhost:8000";
const OUT = args.out || "captures";
const PORT = 9300 + (process.pid % 500);   // un port par exécution, pour enchaîner plusieurs lancements
const CANDIDATS = [args.browser, process.env.BROWSER,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"].filter(Boolean);
const PAGES = [
  { nom: "home", url: "index.html", attente: 4000 },
  { nom: "explore", url: "explore.html", attente: 9000 },
  { nom: "explore-zone", url: "explore.html#z=rect%3A5.000%2C14.000%2C-17.000%2C16.000&m=anomalie&a=2000-2026&y=2026&c=niveau&l=fr", attente: 12000, hauteur: 3600 },
  { nom: "compare", url: "compare.html#a=rect%3A6.000%2C12.500%2C0.750%2C3.900&ya=2020&b=rect%3A4.700%2C11.200%2C-3.300%2C1.200&yb=2024&l=en", attente: 12000, hauteur: 3200 },
  { nom: "methodology", url: "methodology.html", attente: 4000, hauteur: 4200 },
];

const choisies = args.pages ? PAGES.filter(p => args.pages.split(",").includes(p.nom)) : PAGES;
const navigateur = CANDIDATS.find(p => existsSync(p));
if (!navigateur) { console.error("Aucun navigateur Chromium/Edge trouvé. Passez --browser <chemin>."); process.exit(2); }
mkdirSync(OUT, { recursive: true });

const proc = spawn(navigateur, [`--remote-debugging-port=${PORT}`, "--headless=new", "--no-first-run", "--no-default-browser-check",
  "--disable-extensions", "--hide-scrollbars", "--window-size=1440,900", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist",
  `--user-data-dir=${process.env.TEMP || "/tmp"}/hexafire-smoke-${process.pid}`, "about:blank"], { stdio: "ignore" });

async function versionWs() {
  for (let i = 0; i < 40; i++) {
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); return (await r.json()).webSocketDebuggerUrl; } catch { await attendre(250); }
  }
  throw new Error("navigateur injoignable");
}

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.attentes = new Map(); this.ecouteurs = []; ws.onmessage = e => this.recevoir(JSON.parse(e.data)); }
  recevoir(m) {
    if (m.id && this.attentes.has(m.id)) { const { res, rej } = this.attentes.get(m.id); this.attentes.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
    else if (m.method) this.ecouteurs.forEach(f => f(m));
  }
  envoyer(method, params = {}, sessionId) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((res, rej) => this.attentes.set(id, { res, rej }));
  }
  sur(f) { this.ecouteurs.push(f); }
}

let echecs = 0;
try {
  const ws = new WebSocket(await versionWs());
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  const cdp = new CDP(ws);
  for (const page of choisies) {
    const { targetId } = await cdp.envoyer("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.envoyer("Target.attachToTarget", { targetId, flatten: true });
    const erreurs = [], consoles = [], reseau = [];
    cdp.sur(m => {
      if (m.sessionId !== sessionId) return;
      if (m.method === "Runtime.exceptionThrown") erreurs.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
      if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type)) consoles.push(`${m.params.type}: ${m.params.args.map(a => a.value ?? a.description).join(" ")}`);
      if (m.method === "Network.responseReceived" && m.params.response.status >= 400) reseau.push(`${m.params.response.status} ${m.params.response.url}`);
      if (m.method === "Network.loadingFailed") reseau.push(`échec ${m.params.errorText} ${m.params.type}`);
    });
    await cdp.envoyer("Runtime.enable", {}, sessionId);
    await cdp.envoyer("Network.enable", {}, sessionId);
    const largeur = parseInt(args.width, 10) || 1440;
    await cdp.envoyer("Emulation.setDeviceMetricsOverride", { width: largeur, height: page.hauteur || 1800, deviceScaleFactor: 1, mobile: largeur < 800 }, sessionId);
    await cdp.envoyer("Page.enable", {}, sessionId);
    await cdp.envoyer("Page.navigate", { url: `${BASE}/${page.url}` }, sessionId);
    await attendre(page.attente);
    const etat = await cdp.envoyer("Runtime.evaluate", { expression: `JSON.stringify({titre: document.title, h: document.body.scrollHeight,
      textes: document.querySelectorAll('[data-i18n]:empty').length, canvas: !!document.querySelector('canvas'),
      visible: [...document.querySelectorAll('section[id],article')].filter(e => !e.hidden).length})`, returnByValue: true }, sessionId);
    const info = JSON.parse(etat.result.value);
    const { data } = await cdp.envoyer("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }, sessionId);
    writeFileSync(`${OUT}/${page.nom}.png`, Buffer.from(data, "base64"));
    const propres = reseau.filter(r => r.includes(BASE) && !r.includes("pays.geojson"));   // pays.geojson est facultatif
    const ko = erreurs.length || propres.length;
    if (ko) echecs++;
    console.log(`${ko ? "ÉCHEC" : "ok   "} ${page.nom.padEnd(12)} titre="${info.titre}" hauteur=${info.h} canvas=${info.canvas} i18n_vides=${info.textes}`);
    for (const e of erreurs) console.log(`      erreur JS : ${e.split("\n")[0]}`);
    for (const c of consoles.slice(0, 8)) console.log(`      console   : ${c.slice(0, 200)}`);
    for (const r of reseau.slice(0, 8)) console.log(`      réseau    : ${r}`);
    await cdp.envoyer("Target.closeTarget", { targetId });
  }
  ws.close();
} finally {
  proc.kill();
}
console.log(echecs ? `${echecs} page(s) en échec` : "Toutes les pages sont passées.");
process.exit(echecs ? 1 : 0);

# Google Stitch mockups

Visual references the front end was built from. They were generated with Google Stitch, a Super Intelligence (SI)
design tool. Each folder holds the HTML export (Tailwind through a CDN, remote images) and the screenshot.

| Folder | Site page | Notes |
|---|---|---|
| `Home/` | `index.html` | Full-screen hero, "fire is changing our world" section, three lenses, final call |
| `Explore/` (states A and B) | `explore.html` | State A: search, tools, globe; state B: selection banner, annual cycle in twelve cards |
| `Compare/` | `compare.html` | Two entities A / B, twin viewports, curves, summary |
| `Methodology/` | `methodology.html` | Airy editorial page in six sections |
| `DESIGN.md` | whole site | "Nuit Braise" design system: colours, typography, spacing, components |

Deliberate differences between the mockups and the site:

- the placeholder content of the mockups (Copernicus EMS, latency < 3 h, 2014–2023 decadal normal, FRP in GW…) is
  replaced by the real quantities of the engine (2003–2020 normal, MODIS equivalent, leave-one-year-out validation);
- Material Symbols icons are replaced by inline SVG, and Tailwind by native CSS sheets
  (`frontend/src/styles/tokens.css` takes the tokens of `DESIGN.md`);
- the globe is a real globe (MapLibre GL JS 5, NASA Black Marble background), not an image;
- the "Export GeoTIFF" button becomes CSV / JSON / PNG / SVG exports, which match the published data;
- the site was then simplified for non-specialist readers: technical labels removed, plain-language summary and
  "About & guide" page.

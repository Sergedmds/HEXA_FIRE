---
name: Night Ember Planetary Observatory
colors:
  surface: '#0f131e'
  surface-dim: '#0f131e'
  surface-bright: '#353946'
  surface-container-lowest: '#0a0e19'
  surface-container-low: '#171b27'
  surface-container: '#1b1f2b'
  surface-container-high: '#262a36'
  surface-container-highest: '#303441'
  on-surface: '#dfe2f2'
  on-surface-variant: '#e4beb3'
  inverse-surface: '#dfe2f2'
  inverse-on-surface: '#2c303c'
  outline: '#ab897f'
  outline-variant: '#5b4038'
  surface-tint: '#ffb59e'
  primary: '#ffb59e'
  on-primary: '#5e1700'
  primary-container: '#ff5a1f'
  on-primary-container: '#541400'
  inverse-primary: '#ae3200'
  secondary: '#b8c3ff'
  on-secondary: '#002388'
  secondary-container: '#003acf'
  on-secondary-container: '#afbcff'
  tertiary: '#ffb955'
  on-tertiary: '#452b00'
  tertiary-container: '#c68414'
  on-tertiary-container: '#3e2600'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59e'
  on-primary-fixed: '#3a0b00'
  on-primary-fixed-variant: '#852400'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b8c3ff'
  on-secondary-fixed: '#001356'
  on-secondary-fixed-variant: '#0035be'
  tertiary-fixed: '#ffddb4'
  tertiary-fixed-dim: '#ffb955'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#633f00'
  background: '#0f131e'
  on-background: '#dfe2f2'
  surface-variant: '#303441'
  surface-midnight: '#0D1426'
  text-starlight: '#EAF0FF'
  text-atmosphere: '#9AA8C7'
  border-orbital: rgba(76, 111, 255, 0.15)
  border-thermal: rgba(255, 90, 31, 0.25)
typography:
  display-hero:
    fontFamily: Space Grotesk
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 80px
    letterSpacing: -0.04em
  display-hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lead:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-default:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-muted:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-telemetry:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.12em
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 4rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.75rem
  space-xl: 3rem
---

## Brand & Style
The design system expresses a nocturnal, cinematic observation aesthetic known as "Nuit Braise" (Night Ember). It bridges high-resolution planetary satellite sensing with high-end environmental editorial publishing. The interface treats satellite telemetry not as a dense operational dashboard, but as a visceral scientific narrative: vast orbital darkness framing radiant thermal combustion.

The personality balances scientific gravitas, quiet urgency, and contemplative spatial clarity. It targets climatologists, aerospace researchers, investigative journalists, and environmental policy institutions. The visual architecture favors asymmetric layouts, generous negative space, astronomical coordinate anchors, and spectral thermal gradients, consciously rejecting cluttered SaaS widgetry in favor of deep-space immersion.

## Colors
The palette is rooted in the contrast between deep cosmic cold and planetary thermal energy.

- **Primary (`#FF5A1F` - Fire Orange):** Reserved for active fire anomalies, primary action states, focal telemetry points, and primary spectral metrics.
- **Secondary (`#4C6FFF` - Atmospheric Blue):** Represents orbital sensors, optical Rayleigh scatter, baseline boundaries, and scientific reference grids.
- **Tertiary (`#FFB547` - Hotspot Amber):** Used for secondary thermal severity tiers, data peaks, radiometric radiance indicators, and interactive micro-hover signals.
- **Neutral (`#070B16` - Cosmic Night):** The omnipresent dark substrate. It preserves contrast for spectral satellite bands and prevents eye fatigue during extensive observation.

Supporting tonal surfaces utilize `#0D1426` for atmospheric layering. Dividers and outlines avoid solid tones, using hairline optical gradients shifting between `rgba(76, 111, 255, 0.15)` and `rgba(255, 90, 31, 0.25)` to mimic thermal lens refraction.

## Typography
Typography is split purposefully between structural astronomical titling and pristine editorial legibility.

- **Space Grotesk:** Drives the technical voice. Used across hero headers, editorial leads, coordinate readouts, and metadata indexes. Uppercase styling with expanded tracking (`0.08em` to `0.12em`) gives metadata the feel of orbital apparatus documentation.
- **Inter:** Handles all continuous prose, analytical findings, long-form reporting, and system messages. Rendered in `#9AA8C7` for secondary tiers and `#EAF0FF` for primary narrative text to optimize reading comfort against deep void backgrounds.

## Layout & Spacing
The layout model employs a fluid 12-column editorial grid configured for planetary projection and observational data ribbons.

- **Desktop (1280px+):** Outer margins scale broadly to `4rem`, establishing deliberate isolation for each narrative block. Col-spans are frequently asymmetric (e.g., 7-column observation visualizer paired with 5-column editorial metadata).
- **Tablet (768px - 1279px):** Margins contract to `2rem` with an 8-column layout. Data indicators collapse to paired horizontal telemetry tracks.
- **Mobile (<768px):** 4-column flow with tight `1.25rem` outer margins. Deep data overlays shift to drawer-style contextual sheets with stacked scientific readouts.

Negative space acts as an active design material. Large vertical pauses between narrative sections reinforce the stillness of orbital space.

## Elevation & Depth
Depth avoids heavy, opaque drop shadows in favor of luminous optical tiers and spectral atmospheric glows.

- **Base Void:** Level 0 is rendered in pure cosmic night (`#070B16`).
- **Atmospheric Layering:** Level 1 containers utilize `#0D1426` at 85% opacity with an underlying `16px` backdrop-blur, preserving the visual presence of background satellite imagery and map projections.
- **Thermal Bloom & Ambient Halos:** Critical data nodes, fire clusters, and primary interactive components emit radial, chromatic energy glows rather than directional drops. Active thermal elements carry a dual glow: `box-shadow: 0 0 24px rgba(255, 90, 31, 0.3), 0 0 80px rgba(255, 90, 31, 0.08)`.
- **Optical Ghost Outlines:** Tonal tiers are defined using 1px hairline borders (`rgba(76, 111, 255, 0.15)`) transitioning to warm ember tints (`rgba(255, 90, 31, 0.25)`) where focal activity peaks.

## Shapes
The shape philosophy favors crisp, precision-machined edges with minimal softening (`roundedness: 1` / 4px base radius). This reflects high-grade scientific optics, focal lenses, and aerospace hardware.

Telemetry chips, coordinates, and data pill callouts may use subtle internal cut-corners or pill geometry sparingly for status pips, but all primary structural surfaces, data inspect panes, and image apertures maintain tight 4px corners to preserve architectural discipline.

## Components

### Buttons
- **Primary (Thermal Strike):** Solid `#FF5A1F` background with `#070B16` text in `label-telemetry` styling. Emits a warm ember outer glow on hover (`box-shadow: 0 0 20px rgba(255, 90, 31, 0.4)`).
- **Secondary (Orbital Ghost):** Transparent fill with a 1px border in `border-orbital`. Text in `#EAF0FF`. On hover, the border shifts toward `#4C6FFF` with a faint blue ambient wash.
- **Tertiary (Telemetry Action):** Ghost button with no border, marked by an uppercase `label-telemetry` indicator flanked by coordinate crosshairs (`+ [ ACTIVATE ]`).

### Chips & Sensor Badges
- Miniature scientific indicators (`font-size: 11px`, Space Grotesk, uppercase).
- Surfaced with `rgba(13, 20, 38, 0.8)` background, hairline border, and a 4px circular status pip (pulsing `#FF5A1F` for active thermal detections, `#FFB547` for warning levels, `#4C6FFF` for calibrated baseline).

### Cards & Observational Panes
- Rendered in `#0D1426` with hairline boundary framing (`border-orbital`).
- Top-left or top-right corners often contain faint technical tick marks or latitude/longitude anchor annotations in `#9AA8C7`.
- Hover interactions do not lift the card physically; instead, the border transitions softly to `border-thermal`, and the interior backdrop clarity sharpens.

### Data Inputs & Selectors
- Flat surfaces in `#070B16` flanked by subtle inset 1px borders.
- Text rendered in `#EAF0FF`. Focus state shifts the border to `#4C6FFF` accompanied by an ultra-subtle atmospheric halo.
- Monospaced numerical values use `Space Grotesk`.

### Lists & Telemetry Feeds
- Borderless rows separated by hairline gradient dividers (`linear-gradient(90deg, rgba(76, 111, 255, 0.15), transparent)`).
- Asymmetrical two-tier line items: large technical index on the left, descriptive editorial narrative on the right.

### Planetary Crosshairs & Reticles
- Custom observational overlays used over satellite imagery, including vector scale bars, azimuth brackets, and radiative power sliders with crisp 1px precision markings.
# Claims Resilience Testing Tool

## What this project is
A browser-based claims resilience testing tool for energy sector clients (nuclear operators).
It models claim volumes, processing capacity, and financial exposure for industrial incidents
(fire, explosion, chemical release, nuclear, fertiliser).

## Architecture (current)
- Single HTML file: `index.html` (~4,500 lines)
- All JavaScript is inline (no build step, no framework)
- Configuration stored in localStorage
- Hand-drawn canvas charts (no charting library)
- Monte Carlo simulation engine with Gaussian copula correlation

## Architecture (target)
We are refactoring into a modular structure:
- `config/` — JSON configuration files (sites, incidents, claim values, MC parameters)
- `src/engine/` — Pure calculation functions (no DOM). Simulation, Monte Carlo, distributions.
- `src/ui/` — UI rendering, sidebar, results display, admin panel
- `src/charts/` — Chart rendering (migrating to Chart.js)
- `src/reports/` — PDF report generation
- `src/data/` — Storage layer (IndexedDB + JSON import/export)

## Key domain concepts
- Claims follow bimodal distributions: acute spike then long tail (especially chemical/nuclear)
- Time horizons are severity-calibrated (a minor fire = 8 weeks, catastrophic nuclear = 30 years)
- Monte Carlo uses triangular distributions with Gaussian copula correlation
- Historical validation against real incidents (Bhopal, Fukushima, BP Texas City, etc.)

## Tech decisions
- No framework (vanilla JS with ES modules)
- No build step — must work by opening index.html in a browser
- Chart.js loaded from CDN for charts
- SheetJS loaded from CDN for Excel import/export
- IndexedDB for scenario persistence

## Who uses this
Semi-technical risk managers at energy companies. They are comfortable with spreadsheets
but not code. The admin panel must be intuitive. The modelling must be defensible under
regulatory scrutiny (ONR for nuclear clients).

## Important conventions
- All monetary values in GBP (£)
- Population figures include both local residents and site staff
- Claim patterns are defined per incident type AND severity level
- Reserve development factors account for late-emerging claims

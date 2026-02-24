# Company websites

This repo holds multiple company/client sites in one place.

## Sites

| Site | Path | Description |
|------|------|-------------|
| **AXIS Baseball** | [sites/axis-baseball/](sites/axis-baseball/) | AXIS Player Development – baseball training programs |
| **KPP** | [sites/kpp/](sites/kpp/) | KPP company website (placeholder) |

## Adding a new site

1. Create a new folder under `sites/` (e.g. `sites/new-company/`).
2. Build the site there (static HTML, or your stack of choice).
3. Deploy that folder as its own Netlify (or other) project, with **Base directory** set to `sites/new-company`.

Each site can have its own `package.json`, `netlify.toml`, and assets.

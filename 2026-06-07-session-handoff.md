# 2026-06-07 — GitHub Pages Setup Handoff

## Goal
Get the portfolio site live at https://badr-0b.github.io. No design or content changes — deployment only.

## What Was Fixed

### 1. `'use client'` in root layout
`app/layout.tsx` had `'use client'` at the top. Next.js forbids this on the root layout (it must be a Server Component). Removed it. Child components (`Navbar`, `LanguageProvider`) already had their own `'use client'` so they were unaffected.

### 2. GitHub Actions — outdated action versions
The workflow was using Node.js 20-based actions (`@v4`/`@v3`) which GitHub is force-migrating to Node.js 24. Updated all five actions to their current latest:
- `actions/checkout` → v6
- `actions/setup-node` → v6
- `actions/configure-pages` → v6
- `actions/upload-pages-artifact` → v5
- `actions/deploy-pages` → v5

Also added `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` env var (harmless to keep).

### 3. `npm ci` peer dependency conflict
`eslint-config-next@16` requires `eslint >= 9`, but `package.json` pins `eslint@^8`. The lock file was generated with legacy peer dep resolution. Fixed by adding `.npmrc` with `legacy-peer-deps=true` so CI matches local behavior.

### 4. Wrong basePath injected by configure-pages
The `actions/configure-pages` step had `static_site_generator: next`, which caused it to inject `/badr.github.io` as the basePath, serving the site at the wrong sub-path. Removed that option — `next.config.mjs` already handles static export correctly on its own.

### 5. Repo rename (root cause of the sub-path issue)
The repo was named `badr.github.io` but the GitHub username is `Badr-0b`. GitHub Pages only serves a site at `https://<username>.github.io/` if the repo is named exactly `<username>.github.io`. Renamed to `Badr-0b.github.io` and updated the local remote URL.

## Current State
- Site is live at **https://badr-0b.github.io**
- Deployment is fully automated via GitHub Actions on every push to `main`
- No git client installed locally — using GitHub Desktop's bundled git at `$env:LOCALAPPDATA\GitHubDesktop\app-3.5.12\resources\app\git\cmd\git.exe`

## What's Next
Design and content work on the portfolio — TBD next session.

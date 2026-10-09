# CLAUDE.md — badr.github.io

Personal portfolio for Badr. **Next.js 16 static export → GitHub Pages.** Multilingual
(en / fr / ar / ja / zh; Arabic is RTL) via `app/components/LanguageContext.tsx`.

## Read this before any visual work

> **Before ANY UI / visual / design / styling / layout / motion / typography change, read
> [`AESTHETIC_DIRECTION.md`](./AESTHETIC_DIRECTION.md) in full. It is the single source of truth
> for how this site looks, moves, and feels.** Hold its rules; if a request conflicts with them,
> say so and propose the on-brand version.

`docs/archive/` is **retired history** (an older aesthetic direction). Never follow it or treat
it as current — if it disagrees with `AESTHETIC_DIRECTION.md`, the direction doc wins.

## Quality bar — About and Projects lead, the other pages are not references

Per Badr (2026-10-03): **the landing (`/`), contact and resume pages were built with less effort.
Do NOT use them as a design or effort reference** — copying their patterns caps the work at their
level.

- Design new UI **from the UI docs** (`AESTHETIC_DIRECTION.md`, plus `Bare Bones.md` for page
  content and structure), with original interactive ideas, held to a "profoundly premium" bar.
- **`/about` (`app/about/`) and `/projects` + `/projects/[slug]` (`app/projects/`, rebuilt
  2026-10-09) are the quality bar.** Both were built from the docs alone. When a page is redone,
  match their level of craft (not necessarily their exact components).
- **Vary the composition.** Badr disliked every section starting on the same left line: place
  blocks on a 12-column field so consecutive views don't share an anchor (left, full, far side…).
- The lower-effort pages **will be rebuilt later**. Until then, keep their existing behaviour
  working, but don't copy their patterns into new work.
- Shared infrastructure is still shared, and its technical constraints still apply: the tokens in
  `app/globals.css`, `Navbar`, `CustomCursor`, `LanguageContext`, and `body { overflow-x: clip }`.

## The kit — `app/kit/` (reusable assets; use them when rebuilding pages)

- `motion.ts` — the one rAF motion engine (`onFrame`, `onMeasure`, `useReveal`, `useMagnet`, `ease`).
  Page roots with class `k-scope` get the shared reveal CSS (`data-reveal` / `data-in`) from `kit.css`.
- `draw/` + `Plate.tsx` — technical plan drawings of each project (bespoke for cleave / nerona /
  azimuth, seeded fallbacks by `kind` for new projects) that rebuild in the order the thing was made,
  with inspectable parts, balloons, and a stage legend.
- `three/` — hidden-line 3D (three.js, lazy-loaded): `Bench` (index hero), `Specimen` (exploded
  view). Recoloured from the CSS tokens, so light mode just works.
- `PageIndex`, `CopyButton`, `Bearing` — small shared controls.
- Project content lives in `app/projects/projects.data.ts`; drawing part ids are referenced by its
  `notes` and decision `parts`.

## Build & deploy

- Static export (`output: 'export'` in `next.config.mjs`). No server runtime — design and build
  for static HTML/CSS/JS only.
- `.npmrc` has `legacy-peer-deps=true` (needed for `npm ci` to resolve). Keep it.
- Push to `main` → GitHub Actions builds and deploys automatically. Live at
  https://badr-0b.github.io.
- **No standalone git installed** — git operations use GitHub Desktop's bundled binary. Badr
  prefers Claude to run git operations directly rather than being handed commands.

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

## Build & deploy

- Static export (`output: 'export'` in `next.config.mjs`). No server runtime — design and build
  for static HTML/CSS/JS only.
- `.npmrc` has `legacy-peer-deps=true` (needed for `npm ci` to resolve). Keep it.
- Push to `main` → GitHub Actions builds and deploys automatically. Live at
  https://badr-0b.github.io.
- **No standalone git installed** — git operations use GitHub Desktop's bundled binary. Badr
  prefers Claude to run git operations directly rather than being handed commands.

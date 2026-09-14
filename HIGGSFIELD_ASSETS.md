# Higgsfield asset brief — badr.github.io

Assets to generate so the brand hits harder. **Read `AESTHETIC_DIRECTION.md` first** — every
asset must obey it. This is not decoration; it's the "Modern Monolith" made visual.

---

## 0. Global rules (apply to EVERY prompt)

**Look:** cool near-monochrome, cinematic, architectural, expensive, restrained. A monolith at
night. Deep shadow, one controlled light source, matte surfaces, subtle specular glints.

**Palette (hard):** cool near-black ground `#0A0A0B` · cool off-white highlights `#F4F5F7` ·
**one** accent = cold luminous silver-blue `#C8D2E0`. Never warm, never neon, never saturated.

**Always append to the prompt:**
> cinematic product photography, extreme minimalism, cool desaturated near-monochrome, deep matte
> black background #0A0A0B, single soft key light, subtle silver-blue specular highlights, shallow
> depth of field, high detail, 8k, editorial, moody, architectural, negative space

**Negative prompt (always):**
> neon, RGB, gamer aesthetic, rainbow, saturated colors, warm tones, orange/teal, gradient
> backgrounds, text, watermark, logo, ui, anime, cartoon, glossy plastic, cluttered, busy,
> lens flare, stock-photo lighting, people, faces, hands

**Tech:** 16:9, highest resolution, then upscale. The site re-treats images in CSS
(`grayscale(0.35) brightness(0.72) contrast(1.05)`) so generate them **clean and a touch brighter
than final** — don't pre-crush the blacks.

**Where they go:** drop files in `/public/projects/`, then set the `image` field on the matching
entry in `app/projects/projects.data.ts` (e.g. `image: '/projects/cleave.jpg'`). No layout change.

---

## 1. Project tiles (the priority — the mosaic is placeholder right now)

Aspect **16:9**, ~1920×1080+. `object-fit: cover`, so keep the subject centered with breathing room.
These should read as **authentic artifacts of Badr's actual work**, shot like a flagship launch.

### `cleave.jpg` — CLEAVE · SILICON / RISC-V
> Extreme macro of a custom silicon chip die, RISC-V processor, iridescent etched circuitry and
> geometric metal traces on a dark wafer, cool silver-blue reflections, single raking light across
> the surface, GDSII-layout geometry, matte black void around it
- Alt subject if you want variety: a bare silicon wafer tilted in darkness catching one cold light.

### `nerona.jpg` — NERONA · PCB / EDGE AI
> Macro of a custom black PCB with a central NPU processor, fine copper traces, a MIPI camera
> ribbon connector, precise SMD components, cool cinematic lighting, shallow depth of field, a
> single component in razor focus, dark matte background
- The board should feel purposeful and dense-but-clean, not a generic green Arduino.

### `azimuth.jpg` — AZIMUTH · PCB / SENSOR FUSION
> Macro of a dark navigation circuit board, GNSS module and IMU sensor chips, a small antenna
> trace, fine soldering, cool blue-grey tones, top-down-ish angle, deep shadow, one soft key light,
> minimalist
- Optional motif: faint compass/azimuth geometry etched subtly into the silkscreen.

### `future.jpg` — FUTURE WORKS (the "More to come." tile) — optional
> Abstract dark monolith, a single vertical slab of brushed dark metal in a black void, one
> hairline of cold silver-blue light down its edge, fog, architectural, mysterious, empty space

---

## 2. Hero / entrance ambience (high impact — optional but strong)

The entrance ritual is "void → a hairline of light → reveal" (§2). A **subtle looping video** or
still behind the hero would deepen it. Keep it near-black and slow; it must never fight the type.

### `hero-ambient.mp4` — Higgsfield **video**, 16:9, 8–12s seamless loop, very slow
> Slow cinematic drift through a vast dark architectural void, a single distant hairline of cold
> silver-blue light, fine floating dust, volumetric shadow, near-black, extremely subtle motion,
> no camera shake, seamless loop, minimalist, ambient
- Must be **dark enough to sit under white text at 20–35% opacity**. Provide a still fallback frame.

### `entrance-sheen.png` — the one-time specular sweep (§2), optional
> A single soft specular light streak, cold white-blue `#F4F8FF`, on transparent/black, horizontal
> glint like light catching glass, no color, no rainbow
- Used once, swept across the "welcome to my domain" letterforms. Keep it a glint, not a glow.

---

## 3. Social / OG share image

### `og-image.jpg` — 1200×630
Generate only the **background** (dark monolith texture, cool, lots of negative space on the left).
**Add the "Badr Obtel — Hardware Engineer" type in code/Figma** — do NOT let Higgsfield render text
(it garbles it). One dark cinematic backdrop, subject weighted to the right third.

---

## 4. Optional accents (only if they earn their place — §6 restraint)

- `texture-grain.png` — a fine, near-invisible film-grain / noise overlay (monochrome) for depth on
  flat panels. Very subtle.
- About-page atmospheric still — same monolith language, a workbench-in-shadow read without clutter
  or faces.

Skip anything that starts to feel busy. Empty space is the design.

---

## Quick checklist before using any asset
- [ ] Cool near-monochrome, single accent — no warm/neon/saturated color
- [ ] Deep matte black, generous negative space, one light source
- [ ] No text / logos / people baked in
- [ ] 16:9 (tiles/hero) or 1200×630 (OG), upscaled, exported as optimized `.jpg`/`.webp`
- [ ] Reads as a real artifact of the work, not a stock render
- [ ] Dropped in `/public/projects/` and wired via `image:` in `projects.data.ts`

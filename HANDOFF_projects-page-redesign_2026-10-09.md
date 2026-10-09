```yaml
---
handoff_id: projects-page-redesign-2026-10-09
generated_utc: 2026-10-09 13:59 UTC
source_session_title: Full redesign of /projects and /projects/[slug] to the /about quality bar, a shared asset kit (SVG drawings + three.js hidden-line 3D), and a layout-variation pass on /about
scope: full
depth: full
supersedes: null
project_context: badr.github.io repository (Claude Code session on Windows; no claude.ai project)
domains: [web-frontend, nextjs-static-export, threejs, svg, motion-design, i18n-rtl, portfolio-content-embedded-hardware]
live_thread: Projects redesign, shipped and live as commit 21b5d22; post-ship review and follow-ups
artifacts_produced: 17
open_questions: 13
blocking_items: 0
next_action: Get Badr's review of the live redesign and his answers to section 9 questions 1 to 5, then correct the misleading `image` field comment in app/projects/projects.data.ts.
---
```

# 0. Bootstrap prompt

```text
You are picking up work on Badr Obtel's personal portfolio: a Next.js 16 static-export site at C:\Users\Nitro\Documents\GitHub\badr.github.io (remote https://github.com/Badr-0b/Badr-0b.github.io, branch main, live at https://badr-0b.github.io). Every push to main deploys the live site through GitHub Actions. Badr is a third-year electrical engineering student at AUM in Kuwait. He wants work done directly, including git operations, but commit or push only when he asks. There is no standalone git: use GitHub Desktop's bundled binary at %LOCALAPPDATA%\GitHubDesktop\app-3.6.6\resources\app\git\cmd\git.exe (the app-* folder changes when GitHub Desktop updates; use the newest one).

Before any visual change, read AESTHETIC_DIRECTION.md in full plus CLAUDE.md, and hold their rules: three fonts, cool near-monochrome plus one accent, one easing curve, transform and opacity motion only, reduced-motion end states, RTL mirroring, no literal gacha or anime imagery. If a request conflicts with them, say so and propose the on-brand version. Before writing code, read the untracked .gitignore in the repo root. It holds Badr's private AI rules (kept off GitHub on purpose, so do not copy them anywhere committed). The codebase does not currently follow its first rule; ask Badr whether those rules still apply before you add or strip code comments.

Current state: /projects and the three /projects/[slug] pages were fully redesigned as "the drawing set". A shared asset kit now lives in app/kit: the site motion engine, SVG technical drawings that rebuild with scroll, and three.js hidden-line 3D. The projects-page nav rail was removed. /about got a layout-variation pass. Badr committed and pushed everything himself as 21b5d22 "projects page revamp"; it is live and was verified. The working tree is clean except for this handoff file.

Immediate next action: ask Badr for his review of the live pages and his answers to the open questions in section 9 (the .gitignore rules, copy and translation approval, the nav rail removal, the gradient-drawn light-mode grid). Then fix the `image` field comment in app/projects/projects.data.ts, which claims the detail page renders `image`; no component does.

Full detail is in the attached handoff document, sections 1 through 13. Read it before responding.
```

# 1. Session at a glance

Badr asked for a full, from-scratch redesign of the Projects page at the craft level of /about, with optional reusable "asset elements" (inspired by how gacha-game sites compose artist-made assets), optional open-source 3D models recoloured for both themes, and more asymmetry and variation on both /projects and /about. Claude built "the drawing set": every project is an engineering sheet whose hairline plan drawing rebuilds in the order the artifact was really made, hero and detail pages carry hidden-line 3D renders, and each detail page tells one project-specific story scene. The work produced a reusable kit in `app/kit/`, a rebuilt `/projects` index, rebuilt `/projects/cleave`, `/projects/nerona` and `/projects/azimuth`, the removal of the old nav rail, translations for all new strings in fr, ar, ja and zh, and a CSS-only variation pass on /about. Type-check and the static-export build pass, the console is clean on every page, and visual QA covered five viewport sizes, both themes, Arabic RTL, Japanese and reduced motion. Badr then committed and pushed everything himself (21b5d22, 65 files, +8384 / -1261) without commenting on individual decisions, and asked for this handoff. While writing it, Claude verified the deploy is live and found two defects that shipped: the `image` field is documented but never rendered, and `npm run lint` is broken on Next 16 (pre-existing). Claude also found Badr's private AI rules in `.gitignore`, which nobody read during the build; the shipped code may conflict with them. The next agent should collect Badr's review and decisions (section 9) and then work the follow-ups in section 10.

# 2. Context

## 2.1 Operator profile and working constraints

- **Identity.** Badr Obtel, git author `Badr Ob <badr@obtel.org>`. Third-year Electrical Engineering student (Dean's Honors List) at the American University of the Middle East (AUM), Kuwait; based in Salmiya, GMT+3. [SOURCE: app/about/about.data.ts and app/translations/en.json about.* strings; commit 21b5d22 author line]
- **Languages.** English native; Arabic fluent in Darija, conversational Kuwaiti and Egyptian; French beginner. [SOURCE: en.json keys about.now.lang.en / ar / fr] Badr can review the Arabic strings himself; French, Japanese and Chinese need another reviewer.
- **Working style.** Prefers Claude to run git operations directly rather than receive commands. [USER, via CLAUDE.md and prior-session memory] The harness rule still applies: commit or push only when asked, because a push to main deploys the live site. In this session Badr committed and pushed himself through GitHub Desktop. [SOURCE: git log]
- **Effort setting.** Badr set `/effort max` for this session and wrote "take as long as you need to think and reason". [USER]
- **Project governance.** CLAUDE.md requires reading AESTHETIC_DIRECTION.md in full before any UI, visual, motion or typography change, holding its rules, and pushing back on conflicting requests with an on-brand alternative. [USER, via CLAUDE.md] Do not treat the landing, contact or resume pages as design references; /about and now /projects are the quality bar. [USER via CLAUDE.md; CLAUDE.md updated this session by Claude to add /projects]
- **Private AI rules.** The repo root `.gitignore` is untracked (it ignores itself) and contains AI rules Badr keeps off GitHub on purpose. Read it locally; do not restate it in any committed file. This session did not read it until the handoff was being written. [SOURCE: .gitignore, 14 lines, last modified 2026-03-08]
- **Hard constraints.** Static export only (no server runtime); five languages (en, fr, ar, ja, zh) with Arabic RTL; `body { overflow-x: clip }` must stay; no standalone git; no `gh` CLI installed. [SOURCE: CLAUDE.md, next.config.mjs, globals.css; `command -v gh` returned nothing]
- **Chat formatting bans from Badr.** None stated in this session.

## 2.2 Domain primer

**The site.** A personal portfolio styled as a "Modern Monolith": a dark, cool near-monochrome space with one accent, small refined type (Clash Display for display, Satoshi for body, Space Mono for wide-tracked mono labels), pervasive scroll-linked motion under one easing curve `cubic-bezier(0.16, 1, 0.3, 1)`, extreme asymmetry, hairlines instead of boxes. The aesthetic doc frames entering the site as a rare "6-star pull" reveal that is felt through pacing and never shown with gacha iconography. Light mode is a warm "paper" variant with a bronze accent.

**The projects (content facts, all from app/projects/projects.data.ts).**
- **CLEAVE** (SILICON / RISC-V): a from-scratch RV32I single-cycle RISC-V core in Verilog, hardened to a DRC/LVS-clean sky130 GDSII through an open-source flow (Yosys synthesis, OpenROAD/LibreLane place-and-route and CTS, Magic/KLayout/netgen sign-off) at a 25 MHz target, packaged as a TinyTapeout 1x1 tile, verified with 10 self-checking Icarus Verilog benches (9 unit + 1 full-ISA integration) through a debug port.
- **NERONA** (PCB / EDGE AI): a custom KiCad PCB around the STM32N6 MCU and its NPU for on-device computer-vision inference with no cloud dependency; MIPI CSI-2 camera interface, power delivery, memory subsystem, SI/EMC rules, quantized object-detection deployment through STM32CubeMX.
- **AZIMUTH** (PCB / SENSOR FUSION): an ESP32-S3 navigation board with defined sensor roles (GNSS position, magnetometer heading, accelerometer tilt correction, gyroscope smoothing) and a planned IMU dead-reckoning fallback for GNSS dropout.
- **Lear**: Badr's 2026 Embedded DevOps internship, shown on /about only. **Feneris**: a SaaS product Badr founded (feneris.app); only a one-line mention exists.

**Vocabulary introduced this session.**

| Term | Meaning |
|------|---------|
| Drawing set | The /projects concept: the portfolio as a set of engineering sheets, one per project. |
| Sheet | One project's section on /projects: title strip, plate, copy, notes. |
| Plate | `app/kit/Plate.tsx`: a framed technical drawing (corner marks, probe readout, stage strip) that rebuilds its layers with scroll, time, or a parent's progress ref. |
| Build stages | The order a drawing rebuilds in. Silicon: floorplan, placement, clock tree (CTS), routing, sign-off. Boards: outline, placement, routing, pour, silkscreen. Software fallback: model, services, wiring, ship. |
| Part / probe | An inspectable region of a drawing (for example U1, CSI-2, REGFILE). Hover lights it in the accent; the probe line names it; the custom cursor shows its refdes. |
| Balloon / note | A numbered circle with a leader line to a part; it pairs with a numbered note or decision in the page copy. Hovering either lights both. |
| Kit | `app/kit/`: the shared, reusable assets and engine (Badr's "asset elements"). |
| HLR | Hidden-line rendering: 3D faces drawn in the page background colour (they occlude but stay invisible) with edges as 1-CSS-px hairlines. |
| Bench | `app/kit/three/Bench.tsx`: the index hero's composition of the three 3D artifacts with flags. |
| Specimen | `app/kit/three/Specimen.tsx`: the detail hero's single 3D artifact that separates into labelled layers (exploded assembly) while pinned. |
| Flag | A mono label with a vertical leader riding on a 3D object's projected anchor point. |
| Story scene | A pinned, scrubbed scene on each detail page: CLEAVE bench matrix, NERONA inference paths, AZIMUTH GNSS dropout. |
| Register | The index's drawing list section ("00 Index"), one row per project plus the reserved sheet. |
| Reserved sheet | The honest "next sheet" placeholder: a blank grid plate, "More to come.", and the Feneris line. |
| `k-scope` | A class on a page root that opts it into the kit's shared reveal CSS (`data-reveal`, `data-in`). |
| `--k` | CSS variable set on each plate SVG to drawing-units-per-CSS-pixel, so hairlines stay 1 px at any plate size. |

**Technical terms used in the drawings.** GDSII is the chip layout file format; DRC/LVS are design-rule and layout-versus-schematic sign-off checks; sky130 is SkyWater's open 130 nm PDK; an H-tree is a symmetric clock distribution; met4 straps are power rails on metal layer 4; BGA is a ball-grid-array package; a via fence is a row of stitching vias along a board edge for EMC; a pour is a copper fill plane; silkscreen is the printed legend layer; MIPI CSI-2 is the camera serial interface (differential pairs); dead reckoning estimates position from motion sensors when GNSS is lost.

## 2.3 Environment and toolchain

| Item | Value |
|------|-------|
| OS | Windows 11 Pro 10.0.26200 |
| Shells | PowerShell 5.1 (primary) and Git Bash |
| Node / npm | v24.13.1 / 11.8.0 |
| Framework | Next.js 16.1.6 with Turbopack (`package.json` `^16.1.6`), static export: `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true` |
| React | `^19.2.4` |
| TypeScript | `^5` |
| three.js | 0.185.1 installed (`package.json` `^0.185.1`) |
| @types/three | 0.185.0 installed (`package.json` devDependency `^0.185.0`) |
| gsap | `^3.15.0`, now used only by the landing page (`app/components/useHomeJourney.ts`) |
| npm config | `.npmrc` has `legacy-peer-deps=true` (required; keep it) |
| Repo path | `C:\Users\Nitro\Documents\GitHub\badr.github.io` |
| Remote | `https://github.com/Badr-0b/Badr-0b.github.io` |
| Branch / HEAD | `main` at `21b5d223a0284b1a2470b8863c7b492ae7ca4745` "projects page revamp" |
| Live site | `https://badr-0b.github.io` (GitHub Actions deploy on push to main) |
| git binary | `C:\Users\Nitro\AppData\Local\GitHubDesktop\app-3.6.6\resources\app\git\cmd\git.exe` |
| gh CLI | Not installed |
| Chrome (for headless QA) | `C:/Program Files/Google/Chrome/Application/chrome.exe` |
| Previous handoff in repo | `2026-06-07-session-handoff.md` (deployment-only session; committed as 3637fc8 "Handoff") |
| Session scratchpad (ephemeral) | `C:\Users\Nitro\AppData\Local\Temp\claude\C--Users-Nitro-Documents-GitHub-badr-github-io\d3ff1345-5b8f-44e3-93f9-598bc03943d7\scratchpad` (holds `shot.mjs`, screenshots; may be deleted) |

# 3. Objective and scope

**Objective.** Redesign the Projects page "fully and thoroughly", ignoring all of its existing design choices, at the level of /about: interactive UI, scroll-driven animation, clean visuals. [USER]

**In scope, as stated by Badr.** [USER]
- Full redesign of the Projects page.
- Reusable asset elements, only if they fit the documented aesthetic.
- 3D models are allowed; open-source models are acceptable if recoloured for the site, including light mode.
- The gacha-site approach (artists make assets, developers place and animate them) was offered as his train of thought, to be dropped if it did not fit the aesthetic.
- Asymmetry and variation on the Projects page and on /about ("i didn't like how everything was left centered").

**In scope, as interpreted by Claude.** [CLAUDE]
- `/projects/[slug]` detail pages are part of "the Projects page" and were redesigned too.
- The old nav rail was part of the old Projects page's design and was removed.

**Out of scope.** [CLAUDE, consistent with CLAUDE.md]
- Rebuilding the landing, contact and resume pages (CLAUDE.md lists them for a later rebuild).
- Translating project content (blurbs, problem statements, decisions, deliverables). The data file states that content is intentionally English; only page chrome is localized.
- Committing or pushing. Claude asked; Badr did it himself.

# 4. Chronological narrative

1. **Setup.** Badr set `/effort max`, then sent the redesign request (verbatim in appendix A).
2. **Reading.** Claude read AESTHETIC_DIRECTION.md, Bare Bones.md, HIGGSFIELD_ASSETS.md (Badr's asset brief, which already suggests "faint compass/azimuth geometry etched subtly into the silkscreen" for AZIMUTH), Scroll_Anim.md, the June handoff, every /about source file (including all 2,147 lines of about.css), the old Projects page, Navbar, CustomCursor, LanguageContext, translations and memory. Claude did not read `.gitignore` during the build (see step 24).
3. **Calibration screenshots.** Claude wrote a headless-Chrome CDP screenshot tool (`shot.mjs`, appendix H) and captured /about and the old /projects. Diagnosis of the /about complaint: at 1440 px every section's content starts on the same x of about 322 px and runs left, leaving the right half repeatedly empty (Experience header, HIL scene, Contact title).
4. **Concept decision.** Claude chose "the drawing set": each project's plan drawing rebuilds in its real build order, so the motion carries content (AESTHETIC_DIRECTION §5 "serve the content"). The gacha asset idea was kept and translated on-brand: the "artist set" became technical drawings and 3D hidden-line models, never character art (§9). 3D was limited to heroes (one WebGL context per page); 2D SVG drawings carry everything else.
5. **Engine move.** `git mv app/about/motion.ts app/kit/motion.ts`; all /about imports updated (`./motion` to `../kit/motion`, `../motion` to `../../kit/motion`).
6. **Drawing kit.** Claude wrote `app/kit/draw/` (types, path primitives with 0.1-unit deterministic rounding and a seeded RNG, a parametric die builder, board helpers, bespoke CLEAVE, NERONA and AZIMUTH drawings, seeded fallbacks) plus `Plate.tsx`, `kit.css`, `PageIndex.tsx`, `CopyButton.tsx` and `Bearing.tsx`.
7. **Index page, first pass.** New data fields, server `page.tsx`, `ProjectsPage.tsx`, parts (Hero, Register, Sheet, Reserved, ExitRamp), `projects.css`, English strings, a stub Bench.
8. **First QA and self-corrections** [CLAUDE self-corrections; no user corrections occurred in this session]:
   - The nav rail still rendered on /projects. Removed from `Navbar.tsx` and `Navbar.css`, and `--rail-w` from globals.css. `app/components/useProjectsGallery.ts` deleted.
   - The CLEAVE H-tree overshot the die. Fixed by starting the recursion at w/4 and h/4 (derivation in section 7.5).
   - The clock trunk ran at 45 degrees. On-die routing is Manhattan (45 degrees is a PCB idiom), so the trunk became an L-route from the clk pin.
   - Metal routing was too loud. met3 lowered to faint ink, met2 to fine, vias to faint.
   - Register columns misaligned by 22 px because `3.4em` resolved against two font sizes. Switched to `clamp(38px, 4vw, 60px)`.
   - NERONA label collisions. Labels moved, and keep-out boxes added to the via fence and stitching.
   - Blank-sheet grid too faint (fine ink), and composition C's plate too large (cols 1 to 9 plus a negative top margin).
   - One screenshot showed a stray "2" balloon inside the CLEAVE die. It did not reproduce; the cause was assumed to be a hot-reload frame. [ASSUMED]
9. **3D.** Installed three 0.185.1 (0.186.1 was two weeks old; 0.185.1 had been stable since 2026-07-01). Wrote `hlr.ts` (Builder, palette in sRGB, LineSegments2 hairlines), procedural `models.ts`, and `Bench.tsx`. The first composition collided with the title block, so Claude solved world positions from screen-space targets along the camera's right and toward vectors (azimuth -0.62 rad). Light mode and mobile were verified; the faces matched the page ground exactly in both themes.
10. **Stage refactor.** Extracted `stage.ts` (renderer, camera, face material, palette cross-fade, orbit, `add(model)`) and rebuilt Bench on it to avoid duplicating setup in the new Specimen.
11. **Detail pages.** Server page with `generateStaticParams`, `dynamicParams = false`, and `generateMetadata`; `ProjectDetail.tsx`; parts (DetailHero, Brief, Decisions, Delivered, NextSheet); `project.css`. The hero title became a lowercase line per project (§3 forbids uppercase-monumental heroes), with the project name as the eyebrow and an `sr-only` copy inside the h1.
12. **Pivot: pinned detail hero.** QA showed the specimen exploding while it scrolled out of view. Pinned scenes are explicitly sanctioned for "a project unfolding" (§5), so the hero became a 190svh sticky track on desktop. The copy steps aside first, then the specimen drifts toward centre stage, dollies in 14 percent and separates by 3 times its layer offsets.
13. **Story scenes.** A shared `Scrub.tsx` shell (sticky over a 260vh track at 900 px and up, in-flow scrub below). AZIMUTH: GNSS dropout and dead-reckoning plot. CLEAVE: 9 unit benches plus integration. NERONA: camera to NPU path, the deployment path, and the cloud branch cut. Self-corrections [CLAUDE]:
    - AZIMUTH readouts were written imperatively and would drift from React's text nodes after a language switch. Phase became React state.
    - Faithfulness: the project text attributes the "ALU ops, store/load round-trips, branch conditions, JAL/JALR" validation to the suite as a whole. The draft hung those checks on the integration bench, so they moved to a separate "Validated" list that ticks across the whole run.
    - The AZIMUTH line ran ahead of the estimate's head (a "hook") because the reveal used the curve parameter instead of arc length. Fixed with cumulative arc length.
    - The NERONA moving line painted over the blocks' labels. Fixed by paint order: paths and tokens sit beneath the ground-filled blocks.
    - A bash heredoc failed while appending CSS (appendix F). The chunk was written to a scratch file and appended with `cat`.
14. **Orphan cleanup.** `app/components/Reveal.tsx` had no importers left, so it and its `.reveal` CSS in globals.css were deleted.
15. **Translations.** fr, ar, ja and zh received 111 new strings each through a script. Terminology followed /about's existing translations, plus each language's EDA/PCB usage: pour is "plan de masse", ベタ and 铺铜; sheet is "planche", 図面 and 图纸; sign-off is "Validation", サインオフ and 签核. All five files ended at 256 keys.
16. **Build.** `npx next build` passed; sizes measured (section 7.8).
17. **Dev-server incidents.**
    - After TaskStop, the original dev server's node child (PID 89696) kept port 3123, so the restart failed with EADDRINUSE (appendix F).
    - Running `next build` underneath that orphan later corrupted it: the Next overlay showed "Jest worker encountered 2 child process exceptions, exceeding retry limit".
    - Claude killed the PID and started a fresh dev server; all routes returned 200.
18. **QA matrix and fixes.**
    - Mobile at 390x844: stage legend tightened with a 420 px container query.
    - Arabic RTL: the 3D cluster collided with the mirrored copy, and English content reordered under bidi ("25 MHz target" displayed as "MHz target 25"; a sentence period jumped lines). Fixed with a `side` flip on the camera view offset and `<bdi>` isolation on all English content. `dir="ltr"` was avoided because it flips block alignment.
    - Light mode, Japanese and reduced motion all passed.
    - Tablet at 1024x768: the cluster clipped and touched the title, so camera distance now scales with aspect and narrowing width.
    - 1280x720 and 1920x1080 passed.
    - Hover checks: hovering the AZIMUTH magnetometer lit it, recessed the rest of the board, filled the probe, and swung the bearing needle to AZ 254°. Hovering on the bench lifted NERONA.
    - The console sweep across all pages, in en and ar, found nothing.
19. **About variation pass.** CSS only, at 1024 px and up: the Experience intro moved to the far side, the GPA figure anchored to the far side, the Contact title anchored to the far side, and at 1100 px and up the HIL readout split into timer and captions with the bar spanning both. The label column and trace were untouched.
20. **Final checks.** `tsc` clean, `next build` clean. `out/` was served with `python -m http.server` and the 3D bench plus exploded specimen rendered from plain static files.
21. **Docs and memory.** CLAUDE.md now lists /projects as a quality-bar page and documents the kit. Claude's memory gained a kit note and a layout-variation feedback note; the projects note was rewritten and the about and setup notes updated. `next-env.d.ts` and `tsconfig.tsbuildinfo` were restored to HEAD because they only toggle between dev and build.
22. **Ask.** Claude summarized the work and asked whether to commit and push (appendix C).
23. **Ship.** Badr committed and pushed it himself at 2026-10-09 16:51:20 +0300 (13:51:20 UTC) as 21b5d22 "projects page revamp", with 65 files and no comment. Then he wrote "alright handoff". [USER]
24. **Handoff findings.**
    - Claude confirmed remote main is 21b5d22 and that the live /projects, three detail pages and /about return HTTP 200 with the new markup (appendix G).
    - The `image` field is documented as rendered on the detail page, but nothing renders it.
    - `npm run lint` fails on Next 16.1.6 (appendix F).
    - `.gitignore` holds private AI rules that the session never read.

# 5. Decisions locked

Provenance key for this table: Badr shipped everything in 21b5d22 without discussing individual choices. "[CLAUDE], shipped" means Claude made the call and Badr shipped it without explicit comment on that item.

| # | Decision | Value / choice | Rationale | Provenance | Reversible? |
|---|----------|----------------|-----------|------------|-------------|
| 1 | Redesign the Projects page from scratch | Old horizontal-pan mosaic, GSAP gallery hook and tile placeholders removed | Badr: "Ignore all of it's current design choices" | [USER] | costly |
| 2 | Include the detail pages | /projects/[slug] rebuilt to the same bar | A redesigned index linking to a lower-effort detail page would break the experience; Bare Bones calls detail pages "your actual sales tool" | [CLAUDE], shipped | costly |
| 3 | Concept | "The drawing set": sheets whose drawings rebuild in real build order | Motion that carries content (§5); fits the engineering identity; maps the gacha "asset set" idea on-brand | [CLAUDE], shipped | costly |
| 4 | Asset kit | `app/kit/` holds the engine, drawings, Plate, 3D, small controls | Badr asked for reusable elements if on-brand | [USER] request, [CLAUDE] design, shipped | yes |
| 5 | 3D source | Procedural models in code (`models.ts`) | Electronics are boxes and cylinders; exact control; a few KB; no licence or attribution; recolourable by construction. Badr offered open-source models as optional ("should you need any") | [CLAUDE], shipped | yes |
| 6 | 3D placement | Heroes only: Bench (index), Specimen (detail); SVG elsewhere | One WebGL context per page; avoids scroll-sync lag of a shared fixed canvas | [CLAUDE], shipped | yes |
| 7 | 3D look | Hidden-line: faces in `--bg`, edges as LineSegments2 at 1 CSS px, inks mixed in sRGB from CSS tokens; theme changes cross-fade over 300 ms | Matches the 2D plates and the hairline rule; light mode works automatically | [CLAUDE], shipped | yes |
| 8 | three.js version | 0.185.1 (`^0.185.1`) | 0.186.1 was published 2026-09-24, only two weeks old; 0.185.1 published 2026-07-01 | [CLAUDE], shipped | yes |
| 9 | three.js loading | `next/dynamic` with `ssr: false` from the hero components | Copy paints first; the 150 KB gzip chunk loads only on /projects routes | [CLAUDE], shipped | yes |
| 10 | Remove the nav rail | Navbar is one top bar on every page | Part of the old Projects design; it narrowed the full-bleed field and complicated RTL. Badr had explicitly requested it in an earlier session [SOURCE: prior-session memory] | [CLAUDE], shipped | yes (restore from 5ee1432) |
| 11 | Index structure | Hero (Bench), Register, one sheet per project, Reserved sheet, Exit ramp, colophon, PageIndex | Scannable register for recruiters; scales to many projects | [CLAUDE], shipped | yes |
| 12 | Sheet compositions | Three variants cycling A, B, C on a 12-column field (section 7.3) | Badr's variation request; consecutive sheets never share an anchor | [USER] request, [CLAUDE] design, shipped | yes |
| 13 | Detail hero title | Lowercase line per project (`line`, `projects.line.<slug>`); project name as eyebrow | §3 forbids uppercase-monumental heroes | [CLAUDE], shipped | yes |
| 14 | Pinned scenes | Detail hero 190svh at 761 px and up; story scenes 260vh at 900 px and up; both only with motion allowed | Explode and scenes must be seen; pinned scenes are sanctioned in §5 | [CLAUDE], shipped | yes |
| 15 | Project content language | Project prose stays English; chrome translated | Data file states English is intentional; avoids 5x writing per new project | [CLAUDE] (following existing file comment), shipped | yes |
| 16 | Feneris | One "Also" line with a link on the reserved sheet | No project content exists for it; no invention | [CLAUDE], shipped | yes |
| 17 | Honesty treatment | AZIMUTH scene labelled "Illustrative" and framed as the plan; CLEAVE checks attributed to the suite; no fabricated bench names, confidence scores or metres | Facts must match projects.data.ts | [CLAUDE], shipped | no (keep) |
| 18 | RTL handling | `<bdi>` around English content; 3D view offset flips with `dir` | Bidi reordering broke numbers and punctuation in Arabic | [CLAUDE], shipped | yes |
| 19 | About variation | CSS-only pass at 1024 px and up (section 7.10); label column and trace untouched | Badr disliked uniform left anchoring; the trace runs through the label column | [USER] request, [CLAUDE] design, shipped | yes |
| 20 | Light-mode structure | Faint 12-column guides behind sheets in light mode (drawn with a hard-stop `repeating-linear-gradient`) | §6: white space must be "more gridded and deliberate" | [CLAUDE], shipped | yes |
| 21 | Ship | Commit 21b5d22 pushed to main | Badr's action | [USER] | costly (it is live) |

# 6. Rejected approaches

| Option considered | Why rejected | Revisit if |
|-------------------|--------------|------------|
| Download open-source 3D models (KiCad packages3D WRL/STEP, Sketchfab, Poly Haven) | Needs a WRL/STEP to GLB conversion pipeline; KiCad models are CC-BY-SA 4.0 with an exception and Sketchfab CC-BY needs login and attribution; fine detail turns to noise at hero scale (a 9 mm part spans about 70 px) | Badr wants authentic close-up geometry of a specific part (for example an ESP32-S3-WROOM module) or photoreal renders |
| Show CLEAVE as a decapped QFN package or a die on a TinyTapeout shuttle chip | Would imply CLEAVE was fabricated; the data only says "packaged as a TinyTapeout 1x1 tile" | Badr confirms a tape-out and fabricated silicon |
| Keep the left nav rail on /projects | Badr said to ignore all current design choices; the rail took 126 to 172 px of width and complicated RTL | Badr asks for it back; old code is in commit 5ee1432 (`Navbar.tsx`, `Navbar.css`, `--rail-w` in globals.css) |
| "Roster" layout (pinned project list plus a switching visual) | Limits per-project detail to one viewport; less room for the drawing story | The project count grows past about 10 and the sheets get too long |
| Mosaic or grid of cards | It was the old design's family; cards are boxes | Never, unless Badr asks |
| One fixed full-screen WebGL canvas rendering every sheet through scissor viewports | Canvas lags DOM scroll by a frame ("swimming"); many contexts if split per sheet | WebGPU or a technique that syncs canvas and scroll on the compositor becomes practical |
| CSS-3D SVG plates for the index hero | Repeats /about's Stack hero too closely | Never for /projects |
| Cursor-following preview images in the register | Redundant with the sheets below; a larger effect than §5's "tactile and small" | Sheets get compressed and the register needs previews |
| Full drawing-sheet border box with zone letters around the viewport | Violates "hairlines, never boxes" | Never; corner marks were used instead |
| `vector-effect: non-scaling-stroke` on plate paths that animate with `pathLength` dashes | Interaction across browsers uncertain; replaced by the `--k` stroke compensation | Never for plates. Story scenes still use it, see section 12 |
| Translate project prose (blurbs, decisions, deliverables) into five languages | Data file says English is intentional; each new project would need five versions | Badr asks for full localization |
| Accent colour on every bench PASS cell | Ten accent marks would break "one accent, used sparingly" | Never; accent stays on the final integration PASS |
| Uppercase project names as hero titles | §3: heroes are lowercase and never uppercase-monumental | Never |
| Fabricated specifics (test bench names, detection confidence values, uncertainty in metres, USB-C connectors, "length-matched" claims) | Not in the source data | Badr supplies the real facts |

# 7. Hard specifics

## 7.1 Commands

| Purpose | Command | Notes |
|---------|---------|-------|
| Dev server | `npx next dev -p 3123` | Port used all session |
| Production build | `npx next build` | Writes `out/`; never run while dev is running |
| Type-check | `npx tsc --noEmit -p tsconfig.json` | Clean at end of session |
| Serve export | `python -m http.server 3200 --directory out` | Trailing-slash routes resolve to `index.html` |
| Kill a port listener (PowerShell) | `Get-NetTCPConnection -LocalPort 3123 -State Listen \| % { Stop-Process -Id $_.OwningProcess -Force }` | TaskStop leaves the Next node child alive |
| Install three | `npm install three@0.185.1` and `npm install -D @types/three@0.185.0` | npm wrote caret ranges |
| Git (Bash form) | `GIT="$(ls -d "$LOCALAPPDATA"/GitHubDesktop/app-* \| sort -V \| tail -1)/resources/app/git/cmd/git.exe"` then `"$GIT" status` | Always pick the newest `app-*` |
| Screenshot QA | `node shot.mjs --url http://localhost:3123/projects/ --out name --w 1440 --h 900 --scroll 0,900 --wheel [--theme light] [--lang ar] [--reduce] [--mobile --dpr 2] [--hoverafter x,y]` | Tool source in appendix H |
| Lint | `npm run lint` | Broken: Next 16.1.6 has no `lint` command (appendix F) |

## 7.2 Design tokens in force (app/globals.css, unchanged this session except removals)

| Token | Dark | Light |
|-------|------|-------|
| `--bg` | `#0a0a0b` | `#f3f1ec` |
| `--surface` | `#141517` | `#eae7df` |
| `--text` | `#f4f5f7` | `#17140d` |
| `--text-dim` | `#8a8f98` | `#5d574a` |
| `--text-faint` | `#585c63` | `#9c9689` |
| `--border` | `#232529` | `#dbd6cc` |
| `--accent` | `#c8d2e0` | `#7d6a48` |
| `--ease-luxury` | `cubic-bezier(0.16, 1, 0.3, 1)` | same |
| `--edge` | `clamp(20px, 3.2vw, 56px)` | same |
| Removed this session | `--rail-w: clamp(126px, 11.5vw, 172px)`; `.reveal` and `.reveal.in` rules | |

## 7.3 Layout values

| Item | Value | Source |
|------|-------|--------|
| `--pj-gap` | `clamp(16px, 2vw, 32px)` | projects.css |
| `--pj-sec` (section spacing) | `clamp(104px, 15vw, 200px)` | projects.css |
| `--pj-row` | `clamp(18px, 2.4vw, 28px)` | projects.css |
| Register columns | `clamp(38px, 4vw, 60px) minmax(0,1.3fr) minmax(0,1fr) minmax(0,1.1fr) 22px`; at 720 px and below `36px minmax(0,1fr) 20px` | projects.css |
| Sheet variant A | plate cols 5 to 13; copy cols 1 to 5, bottom-aligned, `padding-bottom: 72px` | projects.css |
| Sheet variant B | plate cols 1 to 9; copy cols 9 to 13, top-aligned, `padding-top: clamp(40px, 9vh, 96px)` | projects.css |
| Sheet variant C | copy cols 5 to 13 in two inner columns; plate cols 1 to 9, row 3, `margin-top: calc(var(--pj-sec) * -0.35)` | projects.css |
| Variant assignment | `['a','b','c'][index % 3]` | Sheet.tsx |
| At 1099 px and below | Plates full width; copy below: A cols 1 to 9, B cols 5 to 13, C full | projects.css |
| At 720 px and below | One column; variant B copy `padding-inline-start: 14%` | projects.css |
| Detail hero pin | `.js .pd-hero { height: 190svh }`, `.pd-hero__pin` sticky `100svh`, at `(min-width: 761px) and (prefers-reduced-motion: no-preference)` | project.css |
| Story pin | `.js .pd-story__track { height: 260vh }`, stage sticky `100svh`, at `(min-width: 900px) and (prefers-reduced-motion: no-preference)` | project.css |
| Decisions sticky plate | `top: max(96px, calc(50vh - 300px))`; decision blocks `min-height: 58vh` (last `46vh`); not sticky at 1099 px and below | project.css |
| Plate strip container queries | 560 px and below: only the active stage shows its name; 420 px and below: only the active stage shows | kit.css |
| PageIndex | Hidden at 720 px and below | kit.css |
| Light-mode guides | `:root.light .pj-sheet::before`, hairline every `(100% + gap) / 12`, colour `color-mix(in srgb, var(--border) 55%, transparent)`, hidden at 720 px and below | projects.css |

## 7.4 Motion values

| Item | Value | Source |
|------|-------|--------|
| Plate scroll window | progress = `span(scrollY, top - 0.86vh, top - 0.22vh)`, damped with lambda 7 | Plate.tsx |
| Plate layer timing | stage s of N, offset a: start `(s + 0.5a) / N`, length `0.5 / N`; band b of B starts `start + (b / (B-1)) * len * 0.55`, lasts `len * 0.45`; labels use a = 0.45, parts 0.6, balloons appear in stage `max(partStage, N-1)` at 0.7 | Plate.tsx |
| Plate `time` build | 2.6 s, starts when 25 percent visible | Plate.tsx |
| Drop (pick-and-place) | translateY from -7 drawing units to 0 | Plate.tsx |
| Scrub (story) | pinned: `span(y, top, top + H - vh)`; in flow: `span(y, stageTop - 0.8vh, stageTop - 0.1vh)`; lambda 7 | Scrub.tsx |
| Decisions build | desktop `span(y, top - 0.75vh, top + 0.25vh)`; stacked `span(y, top - 0.9vh, top - 0.1vh)`; current decision = last i with `y + 0.55vh >= mid_i - 0.22vh` | Decisions.tsx |
| Detail copy exit (pinned) | q = `span(y, track*0.04, track*0.36)`; translateY `-48q` px; opacity `1 - q`; track = heroHeight - innerHeight | DetailHero.tsx |
| Bearing needle | damped lambda 5.5; shortest-path wrap; readout `AZ 000°` format; rests at north | Bearing.tsx |
| AZIMUTH scene | N = 160 samples; dropout t from 0.36 to 0.66; settle by 0.78; drift up to 28 units; uncertainty radius 5 to 35; tt = `min(1, q * 1.08)` | AzimuthScene.tsx |
| CLEAVE scene | unit i runs `span(q, 0.04 + 0.055i, 0.16 + 0.055i)`; integration `span(q, 0.62, 0.92)`; check k passes at `q >= 0.26 + 0.2k` | CleaveScene.tsx |
| NERONA scene | inference path `ease(span(q, 0.04, 0.5))`; deployment `ease(span(q, 0.56, 0.9))`; NPU lit while inference is between 0.55 and 0.999, or once deployment completes | NeronaScene.tsx |

## 7.5 3D values

| Item | Value | Source |
|------|-------|--------|
| Camera | `PerspectiveCamera(17, aspect, 20, 3000)`; pixel ratio `min(devicePixelRatio, 2)`; eye = `target + D(cos el sin az, sin el, cos el cos az)` | stage.ts |
| Lines | `LineMaterial` linewidth 1 (hot 1.15), `worldUnits: false`, resolution = canvas CSS size | hlr.ts |
| 3D ink strengths | edge 0.95, mid 0.55, fine 0.36, faint 0.2, hot 0.92 (hot uses `--text`) | hlr.ts |
| Bench base pose | azimuth -0.62 rad, elevation 0.5 rad, target (4, 6, 2) | Bench.tsx |
| Bench pointer lean | az + 0.07 * pointer.x; el - 0.04 * pointer.y; damping lambda 3.2 | Bench.tsx |
| Bench scroll | hp = `span(scrollY, 0, heroH * 0.85)`; el + 0.5 * ease(hp); fade `1 - span(hp, 0.5, 0.95)`; per-object rise * hp | Bench.tsx |
| Bench distance | desktop `480 * fit`, fit = `max(1, 1.6 / aspect) * (1 + 0.2 * span(W, 1440, 900))`; mobile 560 | Bench.tsx |
| Bench framing | `setViewOffset(W, H, W * (0.135 + 0.05 * span(W, 1440, 900)) * side, H * 0.02, W, H)`; side = -1 when `dir="rtl"`; cleared on mobile | Bench.tsx |
| Bench spots, desktop | cleave pos (62, 12, -24) ry 0.34 rise 34; nerona (-25, 0, -23) ry 0.08 rise 14; azimuth (-21, 4, 57) ry -0.2 rise 22 | Bench.tsx |
| Bench spots, mobile | cleave (38, 12, -30); nerona (-20, 0, -18); azimuth (-8, 4, 46); same ry and smaller rise (26, 10, 16) | Bench.tsx |
| Bench hover | lift 5 mm; others dim to 0.32; edges mix toward accent; intro 2400 ms with per-object stagger 0.16 | Bench.tsx |
| Specimen distance | `D = radius * 12.5`; desktop fit `max(1, 1.6 / aspect)`; mobile fit 0.92; dolly `1 - 0.14 * ease(span(hp, 0.1, 0.7))` | Specimen.tsx |
| Specimen explode | ex = `0.14 + 0.86 * ease(span(hp, 0.02, 0.7))`; layer offset = `explode * ex * 3`; el = `0.42 + 0.16 ex` | Specimen.tsx |
| Specimen framing | x offset from `-0.17W` drifting to `-0.04W` (times side); y offset `-0.06H` easing to 0 | Specimen.tsx |
| Model radii | cleave 16, nerona 34, azimuth 34 (mm, framing only) | models.ts |
| Layer explode vectors | cleave metal (0, 7, 0); nerona parts (0, 6, 0), camera (-6, 3, 0); azimuth parts (0, 6, 0) | models.ts |

**Fit factor worked example at 1024x768.** aspect = 1024 / 768 = 1.333. 1.6 / 1.333 = 1.2. span(1024, 1440, 900) = (1024 - 1440) / (900 - 1440) = 0.770. fit = 1.2 * (1 + 0.2 * 0.770) = 1.2 * 1.154 = 1.385. Distance = 480 * 1.385 = 665. View offset = (0.135 + 0.05 * 0.770) W = 0.1735 W = 178 px. Result in QA: AZIMUTH's right corner at about 518 px against the title block's left edge at 520 px (tight, no overlap).

## 7.6 Drawing geometry and part ids

| Drawing | viewBox | Key geometry | Part ids (probe name) |
|---------|---------|--------------|-----------------------|
| CLEAVE | 640 x 452 | die x 64, y 64, w 512, h 354; core inset 7; 4 VPWR/VGND strap pairs; row height 10.4 | io (I/O), pwr (MET4), cts (CTS), stamp (SIGN-OFF), rf (REGFILE), alu (ALU), dmem (DMEM), br (BRANCH), pc (PC), imm (IMM), ctl (CTRL), dbg (DBG) |
| NERONA | 660 x 440 | board x 132, y 36, w 496, h 368, r 18; camera module x 26 to 86; U1 BGA 120 units, 15 x 15 balls at pitch 7.2 | u1 (U1), mipi (CSI-2), j1 (J1), cam (CAM), u2 (U2), u3 (U3), pwr (PWR) |
| AZIMUTH | 640 x 440 | board x 48, y 40, w 544, h 360, r 16; compass rose cx 310, cy 262, r 74 (exported as `ROSE`) | ant (ANT1), gnss (U2), imu (U3), mag (U4), esp (U1), pwr (J1) |
| Blank (reserved) | 640 x 440 | dot grid every 32 units; centre mark at (320, 220) | none |

**CLEAVE pin layout.** Groups in order ui_in[7:0] (8), uo_out[7:0] (8), uio[7:0] (8), "clk rst_n ena" (3); clock enters on group 3. Pin pitch 10, group gap 22 centre to centre. Span = 27 pins: 0 to 70, 92 to 162, 184 to 254, 276 to 296, so 296 units; left = 64 + (512 - 296) / 2 = 172.

**Die aspect.** TinyTapeout 1x1 tile assumed at 161 x 111.52 µm, ratio 161 / 111.52 = 1.444 [UNVERIFIED]. Drawn die 512 x 354, ratio 512 / 354 = 1.446.

**H-tree fix derivation.** hTree(cx, cy, w, h, 5) starts at w/4 and h/4. Horizontal extent = w/4 + w/8 + w/16 = 7w/16; vertical extent = h/4 + h/8 = 3h/8. With core w = 512 - 14 = 498, the tree width w = 498 * 0.86 = 428.3, so the extent is plus or minus 187.4 around cx = 71 + 249 = 320, giving x from 132.6 to 507.4 inside core x 71 to 569. With core h = 354 - 14 = 340, the tree height h = 340 * 0.84 = 285.6, so the extent is plus or minus 107.1 around cy = 71 + 170 = 241, giving y from 133.9 to 348.1 inside core y 71 to 411.

## 7.7 Project data contract (app/projects/projects.data.ts)

| Field | Type | Purpose |
|-------|------|---------|
| slug, title, category, blurb, tags, problem, deliverables, github | unchanged | as before |
| kind | `'silicon' \| 'board' \| 'software'` | picks build stages and the seeded fallback drawing |
| spec | string | short mono spec line in the register |
| line | string | lowercase detail-hero line; `projects.line.<slug>` translation overrides it |
| notes | `{ part: string \| string[]; text: string }[]` | up to three balloons on the index sheet |
| decisions | `string \| { text; parts: string[] }` | detail page; `parts` light while the decision is current |
| image? | string | declared and documented as shown on the detail page; nothing renders it (defect, section 9) |
| feature | removed | was used only by the old mosaic |

| Project | kind | spec | notes (part: text) | decision parts |
|---------|------|------|--------------------|----------------|
| cleave | silicon | `RV32I → SKY130 GDSII` | rf: RV32I single-cycle core; cts: 25 MHz target; stamp: DRC / LVS-clean sky130 GDSII | d1 pc, rf, alu, imm, br, ctl, dmem; d2 stamp, cts, io; d3 dbg |
| nerona | board | `STM32N6 · MIPI CSI-2` | u1: STM32N6 NPU, on-device inference; [mipi, j1, cam]: MIPI CSI-2 camera interface; pwr: Power delivery under SI / EMC rules | d1 pwr, mipi, j1, cam, u2, u3; d2 mipi; d3 u1 |
| azimuth | board | `ESP32-S3 · GNSS · IMU` | [gnss, ant]: GNSS for position; mag: Magnetometer for heading; imu: IMU for tilt and smoothing | d1 gnss, ant, mag, imu; d2 imu |

All three `github` values are `https://github.com/Badr-0b` (pre-existing data).

## 7.8 Measured sizes and verification numbers

| Item | Value | Unit | Source |
|------|-------|------|--------|
| out/projects/index.html | 127,645 raw / 26,372 gzip | bytes | local build, `wc -c` and `gzip -c \| wc -c` |
| out/projects/cleave/index.html | 105,964 / 22,548 | bytes | same |
| out/about/index.html | 45,857 / 9,757 | bytes | same |
| out/index.html | 17,141 | bytes | same |
| Largest JS chunk (three.js) | 591,652 raw / 149,521 gzip | bytes | `out/_next/static/chunks/a366965921fed593.js` (hash differs per build) |
| Live /projects/ | HTTP 200, 127,813 | bytes | curl, 2026-10-09 about 13:55 UTC |
| Live /projects/cleave/, /nerona/, /azimuth/, /about/ | 200 each; 106,080 / 71,004 / 102,877 / 45,857 | bytes | curl, same time |
| Commit 21b5d22 | 65 files, +8384 / -1261 | lines | `git show --stat` |
| Commit time | 2026-10-09 16:51:20 +0300 = 13:51:20 UTC | time | `git show -s` |
| Session source added | 8,251 lines across new and rewritten projects and kit files | lines | `wc -l` at end of session |

## 7.9 Translation accounting

| Item | Value |
|------|-------|
| Keys per language at session start | 161 |
| Keys removed (16) | projects.title, projects.description, projects.eyebrow, projects.headline, projects.lede, projects.scroll_cue, projects.future.title, projects.future.text, projects.future.note, projects.detail.problem, projects.detail.links, projects.detail.github, projects.gallery_label, projects.outro.eyebrow, projects.outro.title, projects.outro.cta |
| Keys added (111) | namespaces `kit.*` (17), `projects.*` new chrome, `projects.detail.*` (brief, drawing, decision, tools, repo, next), `projects.line.*` (3), `pd.az.*` (23), `pd.cl.*` (15), `pd.ne.*` (16) |
| English values changed (2) | projects.detail.back "All Projects" to "All projects"; projects.detail.decisions "Key Decisions" to "Key decisions" |
| Keys per language at end | 161 - 16 + 111 = 256 in each of en, fr, ar, ja, zh |
| Added then removed within session | projects.detail.story |

## 7.10 About variation pass (app/about/about.css, before the RESPONSIVE block)

| Breakpoint | Selector | Change |
|------------|----------|--------|
| 1024 px and up | `.ab-exp__head` | `max-width: min(600px, 62%)`; `margin-inline-start: auto` |
| 1024 px and up | `.ab-rec__fig-in` | `justify-content: flex-end` |
| 1024 px and up | `.ab-contact__title` | `margin-inline-start: auto`; `margin-inline-end: 0`; `width: fit-content` |
| 1100 px and up | `.ab-hil__readout` | grid with areas `'time caps' / 'bar bar'`; captions `justify-self: end`, `width: min(100%, 46ch)` |

## 7.11 Section numbering on pages

| Page | Sections and indices |
|------|----------------------|
| /projects | Hero; "00 Index"; sheets numbered by project order (01, 02, 03); "04 Next" (projects + 1); "→ Contact" |
| /projects/[slug] | Hero; then order brief, drawing, story (when a scene exists), delivered, next, contact, numbered 01 onward |
| Story section names | cleave "Verification" (`pd.cl.name`); nerona "Inference" (`pd.ne.name`); azimuth "Fallback" (`pd.az.name`) |

# 8. Artifacts produced

| Artifact | Type | Location / filename | State | Notes |
|----------|------|---------------------|-------|-------|
| Commit "projects page revamp" | git commit | `21b5d223a0284b1a2470b8863c7b492ae7ca4745` on main, pushed | final, live | Committed and pushed by Badr; file list in appendix D |
| Asset kit | source (20 files) | `app/kit/`: `motion.ts`, `kit.css`, `Plate.tsx`, `PageIndex.tsx`, `CopyButton.tsx`, `Bearing.tsx`, `draw/{types,primitives,die,cleave,board,nerona,azimuth,generic,index}.ts`, `three/{hlr,stage,models}.ts`, `three/{Bench,Specimen}.tsx` | final | `motion.ts` moved from app/about (git rename R094) |
| /projects index | source | `app/projects/page.tsx`, `ProjectsPage.tsx`, `projects.css`, `parts/{Hero,Register,Sheet,Reserved,ExitRamp}.tsx` | final | `projects.css` fully rewritten |
| /projects/[slug] | source | `app/projects/[slug]/page.tsx`, `ProjectDetail.tsx`, `project.css`, `parts/{DetailHero,Brief,Decisions,Delivered,NextSheet}.tsx`, `parts/scenes/{index.ts,Scrub,AzimuthScene,CleaveScene,NeronaScene}.tsx` | final | `project.css` fully rewritten |
| Project data | source | `app/projects/projects.data.ts` | final with one defect | `image` comment is inaccurate (section 9, Q6) |
| About changes | source | `app/about/about.css` (variation block); import edits in `AboutPage.tsx` and `parts/{Contact,FieldScene,Record,SectionIndex,Stack,Statement,Toolkit,Trace}.tsx` | final | About still has its own SectionIndex, copy button and reveal CSS |
| Shared infrastructure edits | source | `app/components/Navbar.tsx`, `Navbar.css`, `app/globals.css`; deleted `app/components/Reveal.tsx`, `app/components/useProjectsGallery.ts` | final | Rail removed; orphans deleted |
| Translations | data | `app/translations/{en,fr,ar,ja,zh}.json` | final, unreviewed | 256 keys each; non-English strings written by Claude |
| Dependencies | config | `package.json`, `package-lock.json` | final | `three ^0.185.1`, `@types/three ^0.185.0` |
| CLAUDE.md | doc | repo root | final | Quality bar now includes /projects; new "The kit" section |
| Claude memory | notes (outside repo) | `C:\Users\Nitro\.claude\projects\C--Users-Nitro-Documents-GitHub-badr-github-io\memory\` | final | Rewrote `project_projects_page_redesign.md` and `MEMORY.md`; added `project_kit_shared_assets.md`, `feedback_layout_variation.md`; updated `project_about_page.md`, `project_portfolio_setup.md` |
| QA screenshot tool | script | scratchpad `shot.mjs` | final, ephemeral | Verbatim in appendix H |
| Translation script | script | scratchpad `i18n_projects.py` | used once | Wrote fr/ar/ja/zh in en.json key order |
| Story CSS chunk | css | scratchpad `story.css` | used once | Appended into `project.css` after a heredoc failure |
| Screenshots | png | scratchpad `shots/` | ephemeral | About before and after, old projects, every QA state |
| Local static export | build output | `out/` (gitignored) | rebuilt at end | Served and checked locally |
| Earlier session handoff | doc | `2026-06-07-session-handoff.md` | unchanged | From the June deployment session |
| This handoff | doc | `HANDOFF_projects-page-redesign_2026-10-09.md` (repo root) | final | Untracked; contains no private .gitignore rule text |

# 9. Open questions and unresolved threads

1. **Do the AI rules in `.gitignore` still apply?** The file (untracked, dated 2026-03-08) holds private rules for AI agents. The codebase, including /about from 2026-10-03 and everything shipped in 21b5d22, does not follow its first rule. Unresolved because nobody read the file during the build and Badr has not been asked. Resolves when Badr says whether to keep the codebase as is or bring it into line. Owner: Badr.
2. **Approval of Claude-written copy.** The strings are `projects.hero.title` ("the work, drawn the way it was built."), `projects.hero.sub`, the three `projects.line.*` detail lines, the register and reserved-sheet copy, the scene titles and captions (`pd.*`), and the notes in projects.data.ts. All are [CLAUDE] and shipped without explicit review. Owner: Badr.
3. **Translation review.** There are 111 new strings per language in fr, ar, ja and zh, written by Claude. Badr can review the Arabic; French, Japanese and Chinese need a native reader. Owner: Badr.
4. **Nav rail removal.** Badr explicitly requested the rail in an earlier session, and this session removed it under "ignore all current design choices". He has not confirmed. Owner: Badr.
5. **Light-mode column guides.** They are drawn with a hard-stop `repeating-linear-gradient` (projects.css, `:root.light .pj-sheet::before`). They render as 1 px hairlines, but the doc says "No decorative gradients. Flat color only." Badr should rule whether this counts. Owner: Badr.
6. **The `image` field.** The comment in projects.data.ts says images show on the detail page, and no component renders them. The new design has no image slot yet. Two things are needed: Badr's real images (owed since the September redesign) and a decision on where an image belongs (for example beside the drawing in a plate-style frame with the CSS treatment from HIGGSFIELD_ASSETS.md). Owner: Badr for images and placement; the next agent fixes the comment now.
7. **Feneris.** Bare Bones asks to "show it, it proves range". Only a one-line "Also" mention exists, because there is no project content. Owner: Badr supplies content.
8. **Repository links.** All three projects link to `https://github.com/Badr-0b` (the profile), shown in each Brief's spec sheet and repo row. Owner: Badr supplies per-project repository URLs if they exist.
9. **Illustrative accuracy of drawings and models.** These were drawn from the data's facts plus typical practice and are unconfirmed against Badr's design files:
    - TinyTapeout pins drawn on the tile's top edge.
    - The STM32N6 shown as a 15 x 15 BGA, two external memories, and a regulator with two inductors on NERONA.
    - An ESP32-S3 module with a printed antenna, a GNSS patch antenna, and J1 as power input on AZIMUTH.
    - Module floorplan blocks on CLEAVE.

   Owner: Badr confirms what is acceptable as stylization.
10. **Broken lint script.** `package.json` has `"lint": "next lint"`, and Next 16.1.6 has no `lint` command. This predates the session. Owner: Badr decides whether to remove the script or set up the ESLint CLI.
11. **Tablet fit at 1024x768.** AZIMUTH's 3D board reaches about 518 px against the title block at 520 px. Acceptable as shipped; tune if Badr notices. Owner: next agent if asked.
12. **About and kit duplication.** /about still uses its own SectionIndex, an inline copy button and `.ab`-scoped reveal CSS, while the kit has equivalents (`PageIndex`, `CopyButton`, `.k-scope` reveal). Consolidating would touch the quality-bar page. Owner: Badr decides.
13. **Cross-browser and device coverage.** Only headless Chrome with SwiftShader was tested. Safari, Firefox, real phones, real touch, real GPU performance, no-JS, and keyboard-only use were not tested. fr and zh were never inspected visually, and RTL /about after the variation pass was not re-checked. Owner: next agent with Badr's devices.

# 10. Next actions

| Order | Action | Owner | Blocked by | Definition of done |
|-------|--------|-------|------------|--------------------|
| 1 | Ask Badr to review the live pages (desktop and phone, dark and light, Arabic) and answer section 9 questions 1 to 5 | next agent with Badr | Badr's availability | Answers recorded; follow-up edits listed |
| 2 | Correct the `image` comment in `app/projects/projects.data.ts` so it no longer claims the detail page renders it, or implement an image slot if Badr has decided placement | next agent | Placement decision only if implementing | Comment truthful, or image renders on-brand in both themes and RTL |
| 3 | Apply Badr's decisions: copy edits, translation fixes, nav rail restore or confirm, guide treatment | next agent | Action 1 | Changes built with `npx next build`, screenshot-verified, committed only when Badr asks |
| 4 | Resolve the `.gitignore` rules question (Q1) and, if the rules stand, agree with Badr on how to bring the codebase into line | next agent with Badr | Badr's answer | Rule status written into CLAUDE.md or memory as Badr prefers |
| 5 | Cross-browser and device QA (Safari, Firefox, a real phone), with priority on SVG balloon `r` styling, `pathLength` dashes under `non-scaling-stroke` in story scenes, touch inspection and 3D performance | next agent | Access to devices | Issues found and fixed, or the matrix recorded as passing |
| 6 | Fix or remove `npm run lint` | next agent | Badr's preference | `npm run lint` succeeds or the script is gone |
| 7 | When Badr adds projects: add data entries (kind, spec, line, notes, decisions), check the seeded fallback drawing renders, and optionally add a bespoke drawing, model and scene | next agent | Badr's content | New sheet and detail page pass the QA matrix |
| 8 | Later: rebuild landing, contact and resume to the /about and /projects bar using `app/kit/` | future session | Badr's go-ahead | Pages built from the docs, varied composition, full QA |

# 11. Guardrails for the next agent

- Read `AESTHETIC_DIRECTION.md` in full and `CLAUDE.md` before any visual change. `docs/archive/` is retired history; never follow it.
- Read `.gitignore` locally before writing code. Never copy its rules into a committed file; Badr keeps them off GitHub on purpose.
- Commit or push only when Badr asks. A push to main deploys the live site.
- Do not reopen the overall concept, the 3D approach, or the removal of the old mosaic unless Badr raises them. He shipped them.
- Do not fabricate project facts. Keep the AZIMUTH scene's "Illustrative" label and its framing as a plan. Never depict CLEAVE as fabricated silicon.
- Keep `body { overflow-x: clip }`. Keep `.npmrc` `legacy-peer-deps=true`.
- Never run `next build` while `next dev` is running. After stopping a dev server, kill whatever still listens on its port.
- Keep three.js lazy (`next/dynamic` with `ssr: false`). Render 3D on demand inside the kit motion loop. No idle loops, no GSAP in new work.
- Put per-frame imperative state in `style` or `data-*` attributes. Never toggle a class that React manages; React will wipe it.
- In RTL contexts, wrap English content in `<bdi>`. Do not put `dir="ltr"` on blocks that must keep page alignment.
- Plates keep the `--k` hairline compensation; do not switch plate paths to `vector-effect: non-scaling-stroke`.
- Keep all five translation files on the same key set (256 keys now). Add every new key to all five.
- Use one easing curve, transform and opacity motion only, and a reduced-motion end state for every effect.
- Vary composition between consecutive views (left, full, far side, split); do not anchor every block on one line.

# 12. Verification register

| Claim | Status | Source or gap |
|-------|--------|---------------|
| Type-check passes | [SOURCE: `npx tsc --noEmit -p tsconfig.json`, clean, end of session] | |
| Static export builds all routes | [SOURCE: `npx next build` output, appendix E] | |
| Static files render the 3D bench and exploded specimen | [SOURCE: screenshots of `python -m http.server` on `out/`] | Headless Chrome only |
| No console errors or hydration warnings | [SOURCE: CDP console capture on /projects, /cleave, /nerona, /azimuth, /about, / (en) and /projects (ar)] | Dev server only |
| Commit 21b5d22 is on GitHub and live | [SOURCE: `git ls-remote origin refs/heads/main`; curl of live pages, appendix G] | Deploy logs not seen (no gh CLI) |
| Layouts at 1440x900, 1280x720, 1024x768, 1920x1080, 390x844 | [SOURCE: screenshots] | Phone emulation only |
| Dark, light, Arabic RTL, Japanese, reduced motion | [SOURCE: screenshots] | Reduced motion checked on /projects index only |
| French and Chinese render correctly | [UNVERIFIED] | Keys present; never inspected visually |
| RTL /about after the variation pass | [UNVERIFIED] | Not re-screenshotted |
| Hover probe, balloons, bearing (AZ 254°), bench lift | [SOURCE: screenshots with synthetic mouse movement] | Real touch not tested |
| Safari and Firefox behaviour | [UNVERIFIED] | Not tested; risks: SVG `r` as a CSS property (fallback attribute is r=8.5), `pathLength` with `non-scaling-stroke` in story scenes |
| No-WebGL fallbacks for Bench and Specimen | [UNVERIFIED] | Code paths never rendered |
| Seeded fallback drawings for future projects | [UNVERIFIED] | `genericDie`, `genericBoard`, `genericSoftware` never rendered |
| 60 fps on real hardware | [UNVERIFIED] | Headless SwiftShader only |
| TinyTapeout tile is 161 x 111.52 µm | [UNVERIFIED] | Recalled, not looked up |
| TinyTapeout interface pin names (ui_in, uo_out, uio, clk, rst_n, ena) | [UNVERIFIED] | Recalled, not looked up; pin edge stylized |
| STM32N6 package type and board component choices | [ASSUMED] | Illustrative, see section 9 Q9 |
| Non-English translations are accurate | [UNVERIFIED] | Written by Claude |
| `next lint` does not exist in Next 16.1.6 | [SOURCE: `npx next --help` and `npx next lint` output, appendix F] | |
| `image` field is not rendered anywhere | [SOURCE: grep of `app/` for `.image`, `image?`, `image:` found only the type declaration and one CSS `background-image`] | |
| The stray "2" balloon was a hot-reload frame | [ASSUMED] | Not reproducible afterwards |
| Badr approves individual design decisions | [UNVERIFIED] | He shipped without comment |

# 13. Verbatim appendix

**A. Badr's request (first user message of the session).**

```text
Alright the about page was decorated REALLY well and was made with interactive UI with scroll driven animations and clean visuals.

I want you to do the same with the Projects page now. Ignore all of it's current design choices, I want it fully and thoroughly redesigned.

You are set to max effort for this session. That means we are in no rush to speed through things, *take as long as you need to think and reason*.

If you see it fit, take the time to also make separate asset elements that can be reused throughout the website. I want to adhere to the aesthetics the website follows in general (refer to the documentation). IF it doesn't fit the aesthetics, then don't proceed with that.

To add any nice aesthetic touches, should you need any 3D models feel free to get any good open source ones but make sure you recolor them to fit the site aesthetics (take into account light mode too!!)


For you to have my train of thought, i was looking at some of these gacha games' websites and noticed that they actually have artists make a set of assets and then the developers place them where they'd fit and then animate then for a final result.
If this does NOT fit the overall site aesthetics, ignore the full proposed idea of making different assets and just focus on an absolute redesign.

keep in mind i want some asymmetry because for the about page, i didn't like how everything was left centered. i want variation in that page as well as the projects page.
```

**B. Badr's second message.**

```text
alright handoff
```

**C. Claude's closing question before the ship (end of the build summary).**

```text
Want me to commit and push? Pushing to `main` deploys to the live site. If you'd rather look first, run `npm run dev` and open `/projects`.
```

**D. Commit 21b5d22 file list (`git show --name-status --format= 21b5d22`).**

```text
M	CLAUDE.md
M	app/about/AboutPage.tsx
M	app/about/about.css
M	app/about/parts/Contact.tsx
M	app/about/parts/FieldScene.tsx
M	app/about/parts/Record.tsx
M	app/about/parts/SectionIndex.tsx
M	app/about/parts/Stack.tsx
M	app/about/parts/Statement.tsx
M	app/about/parts/Toolkit.tsx
M	app/about/parts/Trace.tsx
M	app/components/Navbar.css
M	app/components/Navbar.tsx
D	app/components/Reveal.tsx
D	app/components/useProjectsGallery.ts
M	app/globals.css
A	app/kit/Bearing.tsx
A	app/kit/CopyButton.tsx
A	app/kit/PageIndex.tsx
A	app/kit/Plate.tsx
A	app/kit/draw/azimuth.ts
A	app/kit/draw/board.ts
A	app/kit/draw/cleave.ts
A	app/kit/draw/die.ts
A	app/kit/draw/generic.ts
A	app/kit/draw/index.ts
A	app/kit/draw/nerona.ts
A	app/kit/draw/primitives.ts
A	app/kit/draw/types.ts
A	app/kit/kit.css
R094	app/about/motion.ts	app/kit/motion.ts
A	app/kit/three/Bench.tsx
A	app/kit/three/Specimen.tsx
A	app/kit/three/hlr.ts
A	app/kit/three/models.ts
A	app/kit/three/stage.ts
A	app/projects/ProjectsPage.tsx
M	app/projects/[slug]/ProjectDetail.tsx
M	app/projects/[slug]/page.tsx
A	app/projects/[slug]/parts/Brief.tsx
A	app/projects/[slug]/parts/Decisions.tsx
A	app/projects/[slug]/parts/Delivered.tsx
A	app/projects/[slug]/parts/DetailHero.tsx
A	app/projects/[slug]/parts/NextSheet.tsx
A	app/projects/[slug]/parts/scenes/AzimuthScene.tsx
A	app/projects/[slug]/parts/scenes/CleaveScene.tsx
A	app/projects/[slug]/parts/scenes/NeronaScene.tsx
A	app/projects/[slug]/parts/scenes/Scrub.tsx
A	app/projects/[slug]/parts/scenes/index.ts
M	app/projects/[slug]/project.css
M	app/projects/page.tsx
A	app/projects/parts/ExitRamp.tsx
A	app/projects/parts/Hero.tsx
A	app/projects/parts/Register.tsx
A	app/projects/parts/Reserved.tsx
A	app/projects/parts/Sheet.tsx
M	app/projects/projects.css
M	app/projects/projects.data.ts
M	app/translations/ar.json
M	app/translations/en.json
M	app/translations/fr.json
M	app/translations/ja.json
M	app/translations/zh.json
M	package-lock.json
M	package.json
```

**E. Final production build output (`npx next build`, end of session, tail).**

```text
✓ Generating static pages using 19 workers (10/10) in 476.4ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ○ /contact
├ ○ /projects
├ ● /projects/[slug]
│ ├ /projects/cleave
│ ├ /projects/nerona
│ └ /projects/azimuth
└ ○ /resume


○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses generateStaticParams)
```

**F. Error messages, exact.**

Dev server restart while the orphaned server still held the port (from the dev log):

```text
⨯ Failed to start server
Error: listen EADDRINUSE: address already in use :::3123
    at <unknown> (Error: listen EADDRINUSE: address already in use :::3123)
    at new Promise (<anonymous>) {
  code: 'EADDRINUSE',
  errno: -4091,
  syscall: 'listen',
  address: '::',
  port: 3123
}
```

Next.js dev overlay after `next build` ran underneath the orphaned dev server (overlay badge read "Next.js 16.1.6 (stale) Turbopack", label "Runtime Error"):

```text
Jest worker encountered 2 child process exceptions, exceeding retry limit
```

Bash heredoc failure while appending CSS:

```text
/usr/bin/bash: -c: line 323: unexpected EOF while looking for matching `''
```

`npx next lint` on Next 16.1.6:

```text
Invalid project directory provided, no such directory: C:\Users\Nitro\Documents\GitHub\badr.github.io\lint
```

`npx next --help` command list (excerpt):

```text
Commands:
  build [directory] [options]                 Creates an optimized production build of your application. The output displays information about each route.
  experimental-analyze [options] [directory]  Analyze production bundle output with an interactive web ui. Does not produce an application build. Only compatible with Turbopack.
  dev [directory] [options]                   Starts Next.js in development mode with hot-code reloading, error reporting, and more.
  start [directory] [options]                 Starts Next.js in production mode. The application should be compiled with `next build` first.
  typegen [directory] [options]               Generate TypeScript definitions for routes, pages, and layouts without running a full build.
  internal [options] [command]                Internal debugging commands. Use with caution. Not covered by semver.
```

**G. Live deployment check (handoff preparation, about 13:55 UTC).**

```text
remote main:
21b5d223a0284b1a2470b8863c7b492ae7ca4745	refs/heads/main
--- live /projects/:
HTTP 200, 127813 bytes
     82 k-plate
     12 pj-hero
      1 the work, drawn the way it was built
--- gh:
gh not available
projects/cleave    HTTP 200 106080B markers:1
projects/nerona    HTTP 200 71004B markers:1
projects/azimuth   HTTP 200 102877B markers:1
about              HTTP 200 45857B markers:1
```

**H. QA screenshot tool (scratchpad `shot.mjs`, final version). Requires Node 24 (global WebSocket and fetch) and Chrome at the path inside. Writes PNGs to a `shots/` folder beside the script.**

```javascript
// Headless Chrome screenshot tool over CDP (Node 24: global WebSocket + fetch).
// usage: node shot.mjs --url http://localhost:3123/about/ --out about --w 1440 --h 900
//        [--theme dark|light] [--lang en|fr|ar|ja|zh] [--scroll 0,900,1800] [--wheel]
//        [--wait 2500] [--reduce] [--mobile] [--dpr 1] [--full] [--eval "js"] [--hover x,y]
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
    process.argv.slice(2).reduce((acc, a, i, arr) => {
        if (a.startsWith('--')) {
            const next = arr[i + 1];
            acc.push([a.slice(2), next && !next.startsWith('--') ? next : true]);
        }
        return acc;
    }, [])
);

const SCR = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const OUT = path.join(SCR, 'shots');
mkdirSync(OUT, { recursive: true });
const url = args.url;
const name = args.out || 'shot';
const W = Number(args.w || 1440);
const H = Number(args.h || 900);
const DPR = Number(args.dpr || 1);
const wait = Number(args.wait || 2500);
const port = 9300 + Math.floor(Math.random() * 600);

const chrome = spawn(
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    [
        '--headless=new',
        `--remote-debugging-port=${port}`,
        `--user-data-dir=${path.join(SCR, 'chrome-prof-' + port)}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--hide-scrollbars',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--ignore-gpu-blocklist',
        `--window-size=${W},${H}`,
        'about:blank',
    ],
    { stdio: 'ignore' }
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function json(p, method = 'GET') {
    for (let i = 0; i < 80; i++) {
        try {
            const r = await fetch(`http://127.0.0.1:${port}${p}`, { method });
            if (r.ok) return r.json();
        } catch {}
        await sleep(150);
    }
    throw new Error('chrome did not start');
}

let ws;
let id = 0;
const pending = new Map();
const listeners = [];
function send(method, params = {}) {
    return new Promise((resolve, reject) => {
        const mid = ++id;
        pending.set(mid, { resolve, reject });
        ws.send(JSON.stringify({ id: mid, method, params }));
    });
}
function once(event) {
    return new Promise((resolve) => listeners.push({ event, resolve }));
}

const consoleLines = [];

async function main() {
    await json('/json/version');
    const targets = await json('/json/list');
    const page = targets.find((t) => t.type === 'page');
    ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));
    ws.onmessage = (m) => {
        const msg = JSON.parse(m.data);
        if (msg.id && pending.has(msg.id)) {
            const p = pending.get(msg.id);
            pending.delete(msg.id);
            msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
        } else if (msg.method) {
            if (msg.method === 'Runtime.consoleAPICalled') {
                consoleLines.push(
                    `[${msg.params.type}] ` + msg.params.args.map((a) => a.value ?? a.description).join(' ')
                );
            }
            if (msg.method === 'Runtime.exceptionThrown') {
                consoleLines.push('[exception] ' + JSON.stringify(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text));
            }
            for (let i = listeners.length - 1; i >= 0; i--) {
                if (listeners[i].event === msg.method) {
                    listeners[i].resolve(msg.params);
                    listeners.splice(i, 1);
                }
            }
        }
    };
    await send('Page.enable');
    await send('Runtime.enable');
    const mobile = !!args.mobile;
    await send('Emulation.setDeviceMetricsOverride', {
        width: W,
        height: H,
        deviceScaleFactor: DPR,
        mobile,
    });
    if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: args.reduce ? 'reduce' : 'no-preference' }],
    });

    // seed theme / language on the origin before the real load
    const origin = new URL(url).origin;
    let loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url: origin + '/__nothing__' });
    await loaded;
    await send('Runtime.evaluate', {
        expression: `localStorage.setItem('portfolio-theme', ${JSON.stringify(args.theme || 'dark')});
                     localStorage.setItem('portfolio-language', ${JSON.stringify(args.lang || 'en')});`,
    });

    loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url });
    await loaded;
    await sleep(wait);

    if (args.eval) {
        const r = await send('Runtime.evaluate', { expression: String(args.eval), returnByValue: true, awaitPromise: true });
        console.log('eval:', JSON.stringify(r.result?.value ?? r.result?.description));
    }

    if (args.hover) {
        const [hx, hy] = String(args.hover).split(',').map(Number);
        await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: hx, y: hy, pointerType: 'mouse' });
        await sleep(900);
    }

    const scrolls = String(args.scroll ?? '0').split(',').map(Number);
    let cur = 0;
    for (let i = 0; i < scrolls.length; i++) {
        const y = scrolls[i];
        if (args.wheel) {
            // real wheel input, in steps (engines that listen to scroll see genuine events)
            let delta = y - cur;
            while (Math.abs(delta) > 1) {
                const step = Math.sign(delta) * Math.min(Math.abs(delta), 120);
                await send('Input.dispatchMouseEvent', {
                    type: 'mouseWheel',
                    x: W / 2,
                    y: H / 2,
                    deltaX: 0,
                    deltaY: step,
                });
                delta -= step;
                await sleep(16);
            }
            cur = y;
        } else {
            await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${y})` });
        }
        await sleep(Number(args.settle || 1400));
        if (args.hoverafter) {
            // a short glide to the target, so pointer-driven effects see real movement
            const [hx, hy] = String(args.hoverafter).split(',').map(Number);
            for (let k = 1; k <= 8; k++) {
                await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: hx - 40 + k * 5, y: hy - 24 + k * 3, pointerType: 'mouse' });
                await sleep(30);
            }
            await sleep(Number(args.hoverwait || 1200));
        }
        let clip;
        if (args.full) {
            const m = await send('Page.getLayoutMetrics');
            const ch = Math.ceil(m.cssContentSize.height);
            await send('Emulation.setDeviceMetricsOverride', { width: W, height: ch, deviceScaleFactor: DPR, mobile });
            await sleep(600);
            clip = { x: 0, y: 0, width: W, height: ch, scale: 1 };
        }
        const shot = await send('Page.captureScreenshot', { format: 'png', ...(clip ? { clip, captureBeyondViewport: true } : {}) });
        const file = path.join(OUT, `${name}${scrolls.length > 1 ? '-' + String(i).padStart(2, '0') : ''}.png`);
        writeFileSync(file, Buffer.from(shot.data, 'base64'));
        const info = await send('Runtime.evaluate', {
            expression: `JSON.stringify({sy: Math.round(scrollY), docH: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, vw: innerWidth})`,
            returnByValue: true,
        });
        console.log(file, info.result.value);
    }
    if (consoleLines.length) console.log('console:\n' + consoleLines.slice(0, 40).join('\n'));
}

main()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(() => {
        try {
            ws?.close();
        } catch {}
        chrome.kill();
    });
```

**I. About variation rules (excerpt of app/about/about.css at 21b5d22, comments omitted).**

```css
@media (min-width: 1024px) {
    .ab-exp__head {
        max-width: min(600px, 62%);
        margin-inline-start: auto;
    }
    .ab-rec__fig-in {
        justify-content: flex-end;
    }
    .ab-contact__title {
        margin-inline-start: auto;
        margin-inline-end: 0;
        width: fit-content;
    }
}
@media (min-width: 1100px) {
    .ab-hil__readout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        grid-template-areas:
            'time caps'
            'bar bar';
        align-items: end;
        column-gap: var(--ab-gap);
        row-gap: 18px;
    }
    .ab-hil__time {
        grid-area: time;
    }
    .ab-hil__bar {
        grid-area: bar;
    }
    .ab-hil__captions {
        grid-area: caps;
        justify-self: end;
        width: min(100%, 46ch);
    }
}
```

**J. Navbar after rail removal (excerpts at 21b5d22, comments omitted). The removed rail logic (route detection with `usePathname`, cold CSS entrance, FLIP layout effect, `nav--rail*` classes and the RAIL MODE CSS block) is recoverable from commit 5ee1432.**

```tsx
<nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
```

```css
@media (min-width: 761px) {
    .nav__overlay {
        display: none;
    }
}
```

**K. The `image` field as shipped (excerpt of app/projects/projects.data.ts at 21b5d22). The second comment line is inaccurate.**

```typescript
    /**
     * Optional artifact image (dropped in /public, referenced with a leading '/').
     * Shown on the detail page beside the drawing when present.
     */
    image?: string;
```

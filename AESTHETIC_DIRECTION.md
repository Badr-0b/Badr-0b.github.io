# Aesthetic Direction — badr.github.io

**This is the single source of truth for how this site looks, moves, and feels.**
**Owner:** Badr · **Status:** Active authority · **Supersedes:** `docs/archive/` (do not follow those)

---

## 0. For the AI reading this

You are the art director for this portfolio. Read this whole file **before** any UI, visual,
styling, layout, motion, or typography change — then hold the line. When a request would break
a rule here, say so and propose the on-brand version instead of quietly complying.

Two hard facts about the build you must respect while designing:
- **Next.js 16 static export → GitHub Pages** (`output: 'export'`). No server runtime. Everything
  is static HTML/CSS/JS. Design for that (no server-side anything, no runtime image optimization).
- **Multilingual: en / fr / ar / ja / zh** via `app/components/LanguageContext.tsx`. Arabic is
  **RTL**. Every type and layout decision has to survive all five scripts (see §3).

Anything under `docs/archive/` is **retired history** (an older "warm Swiss bank" direction). It
is kept only for reference. Never treat it as current. If it and this file disagree, this file wins.

---

## 1. The soul

> **Extreme minimalism. High-end luxury. User-interactive. The site *is* my domain — entering it
> should feel like a rare, ceremonial reveal, and then it gets out of your way.**

Not a CV site. Not a dev-portfolio template. A quiet, exact, slightly cinematic space that a
person *enters*. The rarity and prestige of a 6-star pull, expressed through restraint and pacing
— **never** through literal game/anime decoration (see §2 and §9).

What it should feel like: a monolithic architecture at night · a flagship product page with the
volume turned down · a private space that acknowledges you arrived. What it must never feel like:
a hackathon page · a Bootstrap template · a neon "gamer" UI · anything trying too hard.

---

## 2. The first open — the "6-star pull" ritual  (FELT, NOT SHOWN)

The very first visit is a short choreographed entrance. The point is **the pacing of a rare
reveal**, not any rarity iconography. Sequence:

1. **Void** — cold near-black, empty. A held beat, ~600–900ms. Nothing moves. This silence is
   the setup; do not fill it.
2. **Charge** — a single point or hairline of light builds tension. One element, low intensity.
3. **Reveal** — **"welcome to my domain"** resolves in Clash Display: opacity + upward settle +
   a clip-reveal, ~800–1000ms on the `--ease-luxury` curve. A **single specular sheen** may sweep
   across the letterforms **once** — that light-catching-glass glint is the only "rarity" tell.
4. **Settle** — the line composes into the real hero; the nav fades in *after* (see §7). From here
   it is just the site.

**Non-negotiable behaviors:**
- **Skippable.** Any click / scroll / keypress jumps straight to the settled state. This is what
  keeps replaying it safe — a returning visitor is never *trapped* behind it.
- **Plays every visit.** (Per Badr's call, overriding the old once-only gate.) No `localStorage`
  gate; the full ritual runs on every load. Because it stays skippable and reduced-motion-safe,
  no one is ever forced to sit through it twice.
- **Reduced-motion.** `prefers-reduced-motion: reduce` → skip the build-up entirely, render the
  settled hero immediately.
- **Total length** ~2.5–3.5s per visit, and never blocking (content is present, just revealed).

**Forbidden here:** literal ★ ratings or a `★★★★★★` burst, confetti/particles, a "pull" card
flip, "Domain Expansion" text or anime art, sound-on-load. The reference is an easter egg of
*energy*; if a visitor can name the reference from what they see, it's too literal.

---

## 3. Typography — "Modern Monolith"

Type carries this identity. Three faces, no more. **Refined and restrained — luxury is
precision, not size.** The type is deliberately *small*; the drama comes from composition and
negative space, never from a giant headline. A huge centered hero reads as vibe-coded — the
opposite of the goal.

| Role | Font | Source | Weights | Used for |
|---|---|---|---|---|
| **Display** | **Clash Display** | Fontshare (free) | Medium 500 · Semibold 600 | The reveal line, hero, section-opening statements, any monolithic type. |
| **Body / UI** | **Satoshi** | Fontshare (free) | Regular 400 · Medium 500 | Paragraphs, nav, buttons, most labels. Neutral to the point of near-invisible — it *is* the minimalism. |
| **Technical / accent** | **Space Mono** | Google Fonts (free) | Regular 400 | Section indices (`01 / WORK`), metadata, coordinates, timestamps, "system/domain" micro-text. This is the digital-domain tell that stands in for gacha iconography. |

### Scale (rem, 16px root) — refined, NOT monumental
```
Hero title   clamp(1.9rem, 4.2vw, 3.75rem)   lowercase, tight leading, left-aligned
Work titles  clamp(1.35rem, 2.6vw, 2.05rem)  the project index
Statement    clamp(1.25rem, 2.2vw, 1.9rem)   the single sparse thought
CTA title    clamp(1.75rem, 3.4vw, 3rem)
Body / sub   0.95–1.0rem                      paragraphs, positioning line
Label / mono 0.68–0.72rem (Space Mono)        wide-tracked caps, indices, metadata
```
The **only** licensed big-type moment is the Entrance reveal line (§2) — the 6-star peak. Nothing
in the page proper should approach it.

### Tracking
- Clash Display at display sizes: **tight**, `-0.02em` to `-0.04em`. The hero is **lowercase,
  left-aligned, and small** — never uppercase-monumental. Let the composition carry the weight.
- Satoshi body: `0em`.
- Space Mono labels: **wide**, `+0.12em` to `+0.18em`, uppercase. This wide-tracked mono caps
  treatment is the signature "tell" — use it for every small label.

### Loading (implementation notes)
- **Clash Display + Satoshi are not on Google Fonts.** Self-host via **`next/font/local`**:
  download the `.woff2` files from Fontshare, drop them in `app/fonts/` **with the Fontshare
  license file**, and register them with the `variable` option. Self-hosting = zero layout shift,
  no external request, and a clean first paint (which the entrance in §2 depends on).
- **Space Mono** loads via **`next/font/google`** (matches the current Inter setup in
  `app/layout.tsx`).
- Expose three CSS variables — `--font-display`, `--font-body`, `--font-mono` — and drive
  everything off those. Never hard-code a family name in a component.

### Multilingual / non-Latin fallbacks (en / fr / ar / ja / zh)
Clash Display and Satoshi cover **Latin / Latin-Extended only** (fine for en/fr). For the other
scripts, define fallbacks so nothing ever renders tofu:
- **JA** → `"Noto Sans JP"`. *Optional upgrade for the hero reveal:* `"Shippori Mincho"` — an
  editorial mincho whose brush-cut serifs quietly carry the "domain" gravity. This is where the
  Japanese "welcome to my domain" can feel special without any literal anime art.
- **ZH (Simplified)** → `"Noto Sans SC"`.
- **AR** → `"Noto Naskh Arabic"` (elegant) or `"Noto Sans Arabic"`. Set `dir="rtl"` on the
  document when Arabic is active and mirror the layout (§6).
- Noto is the safe baseline everywhere. CJK faces are heavy — load **only the active language's**
  face; `LanguageContext` already knows the current language and should gate which face loads.

### Premium swap path (optional, later)
Clash + Satoshi are already premium-grade, so this is a nicety, not a need. If ever licensing:
display → PP Neue Montreal / GT America Expanded; body → Söhne / Suisse Int'l. Keep Space Mono.

---

## 4. Color — cool near-monochrome + one accent

Dark is primary. Cool, architectural, almost no color — the opposite of the retired warm-gold
palette. **Never** more than the mono scale plus one accent on screen.

### Dark (default)
| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#0A0A0B` | Page ground — cool near-black, never pure `#000` |
| `--surface` | `#141517` | Cards, elevated blocks |
| `--text` | `#F4F5F7` | Primary text — cool off-white, never pure `#FFF` |
| `--text-dim` | `#8A8F98` | Secondary copy, captions, metadata |
| `--text-faint` | `#585C63` | Disabled / placeholder |
| `--border` | `#232529` | All hairlines — barely visible |
| `--accent` | `#C8D2E0` | Cold luminous silver-blue — links, hover, cursor, active states |
| `--sheen` | `#F4F8FF` | The one-time specular highlight in the entrance (§2) |

### Light — a subtle shift, not a second design
Same layout and structure; only the tokens change, plus minor contrast tuning. Light leans a warm
"paper" ground with a warm-bronze accent, where dark stays a cool cinematic void — each mode reads
intentional without becoming two separate designs.
`--bg #F3F1EC` · `--surface #EAE7DF` · `--text #17140D` · `--text-dim #5D574A` ·
`--text-faint #9C9689` · `--border #DBD6CC` · `--accent #7D6A48` (warm bronze) · `--sheen #FFFFFF`.

### Rules
- Never pure black or pure white. Always the cool near-variants above.
- **One accent.** `--accent` appears sparingly — interactive states, cursor, the entrance. If
  everything glows, nothing is rare.
- **No decorative gradients.** Flat color only. The single sanctioned exception is the one-time
  entrance sheen (§2) — a specular highlight, not a rainbow. (If Badr ever wants the gacha nod
  louder, a *faint* iridescent tint on that one sheen is the maximum — never elsewhere.)
- Theme changes crossfade all tokens over ~300ms; no hard flash.

---

## 5. Motion — the site's spine, not its garnish

**Governing thesis:** minimalism governs what's on screen *at rest*; motion governs the
*experience of moving through it*. Spare frames, rich transit. A near-empty layout still feels
alive and high-end not by adding clutter, but by making scroll itself the medium. So **yes —
scroll-driven motion is pervasive here.** Most things enter, shift, scrub, or respond as you move.
The luxury is *not* in how *few* animations there are; it's that they all obey **one motion
language**, so a dozen of them read as one intentional system instead of a template's grab-bag.

### The one motion language
- **Easing:** everything uses `--ease-luxury: cubic-bezier(0.16, 1, 0.3, 1)` (expo-out), or a
  direct linear tie to scroll position. No second easing curve competing with it.
- **Weight:** slow and heavy. Things arrive like they have mass; nothing snaps.
- **Direction:** consistent — content rises into place (`translateY` up), it does not dart
  sideways at random. Pick a logic, hold it site-wide.

### Scroll-driven techniques (use liberally — this is where "everywhere" lives)
- **Reveals** — elements enter on scroll: `opacity 0→1`, `translateY 24–48px→0`, ~700–900ms,
  children staggered 80–120ms (`IntersectionObserver`, threshold ~0.15).
- **Scroll-linked / scrubbed** — a value tied directly to scroll progress: parallax layers, a line
  that draws, type that shifts weight/tracking, a counter that ticks, an image that scales inside
  its frame. Lean on this hard.
- **Pinned scenes** — a section holds while its contents advance with scroll (a project
  "unfolding"), then releases. Ideal for the monolith moments.
- **Hover** — tactile and small: underlines draw left→right (~250ms), cards lift `translateY(-4px)`.
- **Entrance ritual** — as specified in §2.

### The discipline that keeps "everywhere" luxury (non-negotiable)
- **One language, many uses.** If a new animation needs a different easing or vibe to work, it's
  the wrong animation.
- **Serve the content.** Motion reveals or clarifies something; it never decorates empty space.
- **Performance budget.** 60fps, `transform`/`opacity` only (never animate layout properties),
  GPU-friendly. Jank instantly kills the luxury read. Prefer `IntersectionObserver` +
  `requestAnimationFrame`; never do heavy work in a raw scroll listener.
- **`prefers-reduced-motion: reduce`** collapses ALL of this to instant end-states — no build-ups,
  no parallax. Mandatory.

**Never:** a *second* motion vocabulary competing with the one above · bounce / spring / elastic ·
scale above `1.03` · loops that run without user input · **scroll-hijacking** — fighting or
re-timing the user's real scroll input, or motion that induces nausea (scroll-*linked* is embraced;
scroll-*hijacked* is banned) · loading spinners.

---

## 6. Layout & negative space

Extreme minimalism = the emptiness *is* the design. But **empty space is not neutral — its color
changes its meaning**, and this site is dark-primary, so most of your "negative space" is *black
space*, which behaves very differently from white space. Use the right one on purpose.

**Black space (this site's default — dark mode)**
- Recedes and absorbs. Feels heavy, cinematic, intimate, premium, a little mysterious.
- Acts like a spotlight: a single lit element in a black field reads as *precious* — exactly the
  monolith / 6-star-reveal mood. Lean into it. The void is a stage, not a gap.
- Risk: an undifferentiated black expanse can read as "still loading." Anchor every black void with
  one lit focal element and/or scroll-driven motion so it feels intentional, never blank.

**White space (only if/when light mode is used)**
- Advances and opens. Feels airy, clean, editorial, gallery / luxury-retail — lighter, more
  "product," less moody.
- Does *not* spotlight the way black does; it exposes structure instead. Light-mode emptiness must
  be more *gridded and deliberate* — white reveals misalignment that black would hide.
- Don't just invert the dark tokens and assume the mood carries; white space needs its own
  spacing/rhythm pass.

**Structure**
- **Extreme asymmetry — never center the hero.** Content is anchored off-axis (the landing hero
  sinks to the **lower-left**); a centered hero or a symmetric two-button cluster reads as
  vibe-coded and is banned. One focal point per view; the drama is placement, not size.
- **Activate the void.** The empty regions are not dead space — pin small mono margin-labels to
  them (metadata upper-right, a `[01]` index lower-right, section labels in a narrow left column).
  Asymmetry only reads as *designed* when the negative space is composed, not left blank.
- **Full-bleed to the edges — not a centered container.** Nav, hero, and sections break out to a
  shared `--edge` gutter (`clamp(20px, 3.2vw, 56px)`) so content hugs the viewport's left/right
  edges; a centered `1280px` box reads as too safe / boxed-in. Sections run a two-column editorial
  split — narrow label column left, content right — spanning the full width.
- **Asymmetry is required, not optional** — offset hero, unequal spans, micro-typography in the
  corners. Hairlines, never boxes.
- **Spacing scale:** `4 · 8 · 16 · 32 · 64 · 128 · 200` (px). Section-to-section: `200px` desktop /
  `128px` mobile.
- **Dividers:** `1px` `--border` rules only. No decorative separators, no icon dividers.
- **RTL:** when Arabic is active, mirror the layout (`dir="rtl"`), flip asymmetry and any
  directional motion (underline draw, reveals) accordingly.

---

## 7. Interactivity — a headline feature, not a garnish

This site is meant to feel *heavily* interactive — the visitor should feel the domain notice and
respond to them constantly. Go big on it. The only rule is the same as motion (§5): **everything
responds in one coherent language**, so "responds to everything" reads as a living space, not a
box of tricks.

- **Custom cursor (desktop only):** a small `--accent` dot that expands into a thin ring (a
  reticle, not a blob) over interactive elements; position lerp-chases the real pointer (factor
  ~0.12) for a weighted lag. Disable entirely on touch — system cursor there.
- **Pointer-reactive elements:** the hero mark (and other key elements) tilt / parallax subtly
  toward the cursor — "the domain is aware of you." Small movements, consistent logic.
- **Scroll-reactive everything:** per §5, most sections move as you scroll. This is the primary
  interactivity — the page is a thing you *move through*, and it answers every scroll.
- **Nav:** appears *after* the entrance settles. Fixed, minimal, floats clean over the hero on
  load and gains a barely-there treatment only after ~60px scroll. Items in Satoshi or wide-tracked
  Space Mono caps.
- **Touch & keyboard:** degrade gracefully — pointer effects off on touch, everything reachable and
  operable by keyboard, focus states visible.

Push the interactivity as far as you want — just never let it fork into a second visual/motion
vocabulary (§5), and never let it cost the 60fps.

---

## 8. Tone of voice

The copy obeys the same discipline as the design: spare, confident, evidence-led.

- Say less than you could. Cut any word not earning its place.
- Active voice, always. Numbers over adjectives. **"shipped" / "built" / "designed"** — never
  **"passionate" / "hardworking" / "excited to."**
- No hedging. "I design embedded systems," not "I'm passionate about embedded systems."

---

## 9. Guardrails — never do

- **No literal gacha / anime** — no ★ ratings, rarity bursts, pull cards, "Domain Expansion"
  text, or anime art. Rarity is *felt* through pacing (§2), full stop.
- **Don't resurrect** the retired warm-gold / Cormorant Garamond direction in `docs/archive/`.
- **Never exceed three fonts** (Clash Display · Satoshi · Space Mono) + the defined script fallbacks.
- **No decorative gradients** (the single entrance sheen is the only exception).
- **No pure `#000` / `#FFF`.**
- The **entrance must stay skippable and reduced-motion-safe** — it plays every visit, so those
  two escapes are what keep a returning visitor from ever being trapped behind it.
- **Motion stays one language.** Go heavy on scroll-driven interactivity, but never fork into a
  second easing/vibe, drop below 60fps, or hijack the user's real scroll (§5, §7).
- No stock photography; use negative space or large type instead.

---

## 10. Quick reference

| | |
|---|---|
| Display font | **Clash Display** — Medium/Semibold, tight tracking (self-host, `next/font/local`) |
| Body font | **Satoshi** — Regular/Medium (self-host, `next/font/local`) |
| Mono/accent | **Space Mono** — Regular, wide-tracked caps (`next/font/google`) |
| JA / ZH / AR | Noto Sans JP *(hero: Shippori Mincho)* / Noto Sans SC / Noto Naskh Arabic |
| Type | refined + small — hero `clamp(1.9rem,4.2vw,3.75rem)`; NOT monumental. Big type only in the Entrance reveal |
| Composition | extreme asymmetry — hero lower-left, metadata upper-right, `[01]` lower-right; **never center the hero** |
| Ground / Text | `#0A0A0B` / `#F4F5F7` (dark, default) · light: warm paper `#F3F1EC` / `#17140D` |
| Accent | dark `#C8D2E0` (cool) · light `#7D6A48` (warm bronze); sheen `#F4F8FF`, used once |
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Grid | 12-col, `1280px`, pad `clamp(24px,5vw,80px)`; sections = label col left / content right |
| Section gap | `clamp(104px,15vw,200px)` vertical |
| Negative space | black space (default) = cinematic spotlight; white space (light mode) = airy/editorial — behaves differently, spec on purpose |
| Motion | pervasive scroll-driven (reveals · scrubbed · pinned) under ONE easing `cubic-bezier(0.16,1,0.3,1)`; 60fps, transform/opacity only |
| Cursor | accent dot → ring reticle, lerp ~0.12, desktop only |
| Entrance | void → charge → "welcome to my domain" + one sheen → settle; skippable, plays every visit |
| Build constraints | Next.js static export · multilingual en/fr/ar/ja/zh · Arabic RTL |

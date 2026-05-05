
# Visual Identity Document
**Owner:** Badr  
**Document type:** Visual Identity / Brand Style Guide  
**Scope:** Personal Portfolio Site  
**Last Updated:** May 2026

---

## 1. Brand Essence

### The Feeling
Not a developer portfolio. Not a CV website. A quiet statement of competence.

The aesthetic reference is a private Swiss bank's annual report crossed with an Awwwards SOTD from a Zurich studio. Nothing shouts. Everything is considered. The site communicates expertise the way a bespoke suit does -- through restraint, proportion, and material quality.

### One-Sentence Direction
> Clean Swiss grid discipline, warm luxury palette, editorial typography -- the kind of site that makes a Tier 1 recruiter pause.

### What It Should Feel Like
- A Loro Piana lookbook: generous whitespace, barely any copy, everything earned
- Monocle magazine: editorial hierarchy, confident type sizing, understated color
- A well-funded fintech: precision layout, no decorative noise, total intentionality
- Brunello Cucinelli: warmth without being soft, luxury without being loud

### What It Should Never Feel Like
- A hackathon project page
- A Bootstrap template
- Anything with a purple gradient
- Anything that tries too hard

---

## 2. Typography

Typography carries the entire identity. Get this wrong and nothing else saves it.

### Type Scale Philosophy
Large. Confident. Sparse. The display type should feel like it costs something.

### Font Stack

#### Display / Headings: Cormorant Garamond
- Weight used: Light (300) and Regular (400) only. Never bold for display.
- Why: Razor-thin strokes, high contrast, genuine editorial pedigree. Used by luxury fashion houses. Free via Google Fonts.
- Feel: The "IB director in Geneva" font. Old money.
- Fallback: `Georgia, serif`

**Premium upgrade (if budget allows later):**  
Canela by Commercial Type, or GT Super Display -- both industry-standard luxury editorial serifs.

#### Body / UI: Syne
- Weight used: Regular (400) for body, Medium (500) for labels and UI elements
- Why: Geometric but not cold. Distinctive enough to not look default. Free via Google Fonts.
- Feel: A Zurich design studio's internal deck. Precise, slightly unusual.
- Fallback: `system-ui, sans-serif`

#### Code / Technical: IBM Plex Mono
- Weight used: Regular (400) only
- Used for: Code snippets, technical specs, version strings, any monospaced context
- Feel: Industrial precision without the cliche of JetBrains Mono

### Type Size Scale (rem-based, 16px root)
```
Display XL:   6.0rem  -- Hero name, single large statements only
Display L:    3.5rem  -- Section headers, project titles
Heading:      2.0rem  -- Subsection headers
Subheading:   1.25rem -- Card titles, nav items
Body:         1.0rem  -- All paragraph text
Caption:      0.8rem  -- Tags, metadata, timestamps
Mono:         0.875rem -- Code, technical strings
```

### Tracking (Letter-spacing)
```
Display text:   -0.03em to -0.05em  (tight, compressed -- luxury standard)
Body text:       0em                (neutral)
Caps/labels:    +0.12em to +0.18em  (wide-tracked small caps for labels)
```

### Key Rule
Uppercase labels are **always** small, wide-tracked (0.15em+), and in Syne Regular. This is the "Swiss design" tell that elevates everything around it.

---

## 3. Color System

### Philosophy
Warm neutrals as the base. Gold as the single accent. Never more than three colors active on a single screen.

### Light Mode

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#F6F3EE` | Page background -- warm off-white, like fine laid paper |
| `--bg-surface` | `#EDEAE3` | Cards, elevated surfaces |
| `--bg-subtle` | `#E3DFD7` | Dividers, very subtle separators |
| `--text-primary` | `#1A1814` | Main body copy -- warm near-black, never pure black |
| `--text-secondary` | `#6B6050` | Supporting copy, captions, metadata |
| `--text-disabled` | `#A89E90` | Placeholder, inactive states |
| `--accent-gold` | `#B8913A` | Primary accent -- links, highlights, active states, hover underlines |
| `--accent-warm` | `#C9A55A` | Hover state on gold, secondary accent use |
| `--accent-sand` | `#D4BFA0` | Subtle decorative use -- borders, thin lines |
| `--border` | `#D8D3CA` | All borders and dividers |

### Dark Mode

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#0D0C09` | Page background -- warm near-black, never pure black |
| `--bg-surface` | `#161410` | Cards, elevated surfaces |
| `--bg-subtle` | `#1F1D18` | Subtle sections |
| `--text-primary` | `#F0EDE6` | Main body -- warm off-white |
| `--text-secondary` | `#9A8E7E` | Supporting copy |
| `--text-disabled` | `#5C5448` | Inactive states |
| `--accent-gold` | `#D4A843` | Brighter in dark mode to maintain contrast |
| `--accent-warm` | `#C9A55A` | Hover state |
| `--accent-sand` | `#7A6E5E` | Muted decorative lines |
| `--border` | `#2A2820` | All borders -- barely visible |

### Rules
- Never use pure `#000000` or pure `#FFFFFF`. Always the warm variants.
- Gold is used sparingly. One use per section maximum. If everything is gold, nothing is.
- No color gradients. Flat color only. Gradients are noise here.
- Dark mode toggle: No jarring flash. Transition all color tokens over 300ms ease.

---

## 4. Motion & Animation

### Philosophy
Cinematic. Slow. Everything moves like it has weight. This is the Loro Piana of motion -- you notice it left, not when it happens.

### Core Easing Curve
```css
--ease-luxury: cubic-bezier(0.16, 1, 0.3, 1);
```
This is the standard "expo out" ease. Fast start, extremely long tail. Used for reveals, transitions, anything moving into position.

### Duration Baseline
```
Page transitions:     700ms
Scroll reveals:       800ms
Hover states:         250ms ease-out
Color transitions:    200ms ease
Theme toggle:         300ms ease
```

### Scroll-Driven Reveals
Every content section enters on scroll. Behavior:
- Starts: `opacity: 0`, `transform: translateY(24px)`
- Ends: `opacity: 1`, `transform: translateY(0)`
- Stagger child elements by 80-120ms each
- Use `IntersectionObserver` with a threshold of 0.15

### Parallax
- Hero section only. Text layer moves at 0.4x scroll speed relative to background.
- Project images: subtle parallax at 0.6x on hover (not scroll, keeps it controlled)
- Do not apply parallax to more than 2 elements per page. Restraint.

### Page Transitions
- Fade out current page over 350ms, fade in next over 350ms
- Optional: thin gold horizontal line sweeps across the viewport during transition (1px, full-width, 400ms)

### Hover States
- Links: Underline draws from left to right over 250ms. Gold color.
- Buttons: Background fills from bottom up over 200ms.
- Project cards: Slight upward shift (`translateY(-4px)`) over 300ms. No shadow explosion.
- Navigation items: Gold dot appears to the left of active item. Slides in.

### Never Do
- Bounce / spring / elastic easing
- Scale animations above 1.03x (looks cheap)
- Animations that loop indefinitely without user interaction
- Scroll-jacking (locking scroll to drive animation -- too aggressive)
- Loading spinners. Use skeleton screens or just fast load times.

---

## 5. Layout & Grid

### Grid
- 12-column grid, `1280px` max container width
- Column gutter: `24px`
- Page horizontal padding: `clamp(24px, 5vw, 80px)`

### Swiss Asymmetry
The signature move of high-end Swiss typography: content does not sit centered. It sits offset.

- Hero text: Starts at column 1, bleeds large. Name in display XL at left margin.
- Section headers: Pinned left with wide tracked caps label above them.
- Project cards: 2-column grid, but the first card spans 7 columns and the second 5. Never equal halves.
- About section: Text block occupies columns 1-6. The right 6 columns hold a single photo or a technical diagram. Nothing else.

### Spacing Scale
```
--space-xs:   4px
--space-sm:   8px
--space-md:   16px
--space-lg:   32px
--space-xl:   64px
--space-2xl:  128px
--space-3xl:  200px
```

Section padding between major sections: `--space-3xl` on desktop, `--space-2xl` on mobile. The whitespace is not wasted space. It is the design.

### Dividers
- Thin `1px` horizontal rules in `--border` color only
- No decorative elements, no icons used as dividers, no gradients fading to transparent
- Section labels sit above dividers, not below

---

## 6. UI Components

### Navigation
The nav is a floating pill. It is the only element on the site that uses a glass treatment. Nothing else does.

**Shape & Position:**
- Pill-shaped container: `border-radius: 9999px`
- Centered horizontally, floating `24px` from top of viewport (`position: fixed`)
- Does not span full-width. Width is content-fitted with `padding: 10px 28px`
- Floats above content like a hud element, not pinned to an edge

**Glass Treatment (restrained -- this is not 2021 glassmorphism):**
- Background: `--bg-primary` at `60-70%` opacity
- `backdrop-filter: blur(12px)` -- subtle, not heavy. `blur(30px)` is the bad version.
- Border: `1px solid --border` (light mode) / `1px solid rgba(255,255,255,0.06)` (dark mode)
- No white tint. No blue tint. Warm and barely-there.
- No drop shadow. The blur is the only depth signal.

**On Load:**
- Nav appears fully transparent, no background, no border
- After `60px` scroll: glass treatment fades in over `400ms` with `--ease-luxury`
- This keeps the hero section completely clean on first load

**Items:**
- Syne Regular, `0.8rem`, letter-spacing `0.12em`, uppercase
- Spacing between items: `28px`
- Active state: gold dot (`4px` circle) appears centered below the active link. Slides in from opacity 0 over `250ms`.
- Hover: text color shifts to `--accent-gold` over `200ms`

**Mobile:**
- Pill nav collapses to just name + menu icon
- On menu tap: full-screen overlay, `--bg-primary` at 95% opacity, centered nav links in Cormorant Garamond at `3rem`, staggered fade-in
- No hamburger-with-flyout panel. Full screen or nothing.

**Glass rule:**
This is the only element on the site with `backdrop-filter`. If you find yourself reaching for it elsewhere, stop.

### Buttons
Primary:
- Border: `1px solid --accent-gold`
- Background: transparent
- Text: Syne Medium, tracked, gold color
- Hover: Background fills gold, text inverts to `--bg-primary`
- No border-radius. Square corners only. Luxury brands do not round their corners.

Secondary:
- Text-only with the left-to-right underline draw on hover
- No background, no border

### Project Cards
- No card border in default state
- Thin `1px` top border in `--border` only (a line above the card, not a box around it)
- Image: Full-bleed within card, aspect ratio locked to 16:9
- On hover: Image scales to 1.02x over 400ms, card shifts up 4px
- Title: Cormorant Garamond Regular, large
- Tags: Syne Regular, 0.75rem, wide-tracked caps, `--text-secondary` color

### Cursor (Desktop only)
Custom cursor is the highest-ROI detail on the site. ~30 lines of JS. Do it.

**Default state:**
- Solid filled circle, `8px` diameter, `--accent-gold` fill
- Replaces the system cursor entirely (`cursor: none` on `body`)

**Hover state (any clickable/interactive element):**
- Circle expands to `28-32px` diameter
- Becomes a ring: transparent fill, `1.5px` gold border
- Think target reticle, not blob
- Transition: `200ms` with `--ease-luxury`

**On text/body copy:**
- Cursor shrinks to a thin vertical bar (`2px x 18px`) so it doesn't fight readability
- Standard text cursor behavior, gold colored

**Movement:**
- Position interpolates at lerp factor `0.12` -- the rendered cursor chases the real mouse position with a deliberate lag
- This weighted, trailing feel is what Awwwards SOTD sites use. It is the entire effect.
- Implementation: `requestAnimationFrame` loop updating a `translate(x, y)` on the cursor element

**Never do:**
- Do not add a secondary trailing circle (the "two cursor" look is 2020 and overused)
- Do not add color blending / `mix-blend-mode: difference` (cheap and distracting)
- Mobile: disable entirely. Touch devices get the system default.

---

## 7. Imagery & Visual Assets

### Hardware Photography (your strongest asset)
- PCB and board photos: High contrast, dark background preferred (matte black or anthracite surface)
- Lighting: Raking side light to reveal trace texture. No flat overhead flash.
- No lifestyle context. No hand holding the board. Just the board, precisely composed.
- Crop tight. Let the hardware fill the frame.

### Diagrams & Schematics
- Export on transparent or `--bg-surface` background
- If KiCad schematics: export in dark mode or invert and apply a warm tint
- Block diagrams: drawn in a consistent thin-line style, gold accent for signal paths

### No Stock Photography
None. Ever. If a section needs a visual and you don't have one, use negative space or a large typographic element instead.

---

## 8. Tone of Voice

The copy follows the same rules as the design: spare, confident, no word that isn't earning its place.

### Principles
- Say less than you could. Luxury is knowing what to leave out.
- No adjectives that aren't earned by evidence. Not "experienced" -- "shipped."
- No hedging. Not "I'm passionate about embedded systems" -- "I design embedded systems."
- Active voice. Always.
- Numbers over vague claims. "ESP32 board, 4-layer, shipped to fab" beats "complex PCB experience."

### Vocabulary to Use
`delivered` / `shipped` / `built` / `designed` / `engineered` / `precise` / `clean`

### Vocabulary to Avoid
`passionate` / `hardworking` / `dedicated` / `excited to` / `I believe` / `synergy` / `leveraged`

### Example: Hero Copy
```
Bad:  "Hi, I'm Badr, a passionate EE student who loves building cool things."
Good: "Hardware engineer. Embedded systems. PCB design.
       Currently: 2nd year EE, building in public."
```

---

## 9. What This Site Is Not

Document this to avoid drift during build.

- Not a developer portfolio (no GitHub contribution graph as hero)
- Not a dark hacker terminal aesthetic (that is a different identity entirely)
- Not a resume website (the resume is one page, linked, not the site itself)
- Not an agency site (no "our services" language, no team page)
- Not a blog-first site (writing is secondary; the work is primary)

---

## 10. Quick Reference Card

| Element | Decision |
|---|---|
| Display font | Cormorant Garamond Light/Regular |
| UI font | Syne Regular/Medium |
| Code font | IBM Plex Mono |
| Light bg | `#F6F3EE` |
| Dark bg | `#0D0C09` |
| Accent | `#B8913A` (light) / `#D4A843` (dark) |
| Border radius | `0px` -- no rounding |
| Primary easing | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Grid max-width | `1280px` |
| Section spacing | `200px` desktop / `128px` mobile |
| Scroll reveal | `opacity 0→1`, `translateY 24px→0`, 800ms |
| Custom cursor | `8px` gold dot, expands to `30px` ring on hover, lerp `0.12` lag |
| Navigation | Floating pill, centered, `blur(12px)` warm glass, appears on scroll |
| Images | Hardware photography on dark surface |
| Copy tone | Terse, active, evidence-based |
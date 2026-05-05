
Based on everything we've established -- your profile, your SOP, and the dual freelance/internship goal -- here's the full breakdown.

---

## Pages

**1. Home**
**2. Projects**
**3. About**
**4. Contact**
**5. Resume** (secondary, add after core four)

---

## Page-by-Page Structure

### 1. Home (`/`)

The only job of this page is to make the right person stay and click something.

**Hero section**
- Your name, large display type
- One-line positioning statement (from your SOP: embedded systems + PCB design, shipped hardware)
- Two CTAs: "View Work" and "Get in Touch"
- Nothing else. No photo, no list of skills, no scrolling ticker.

**Selected Work (preview)**
- 2-3 project cards, not all of them
- Pick your strongest: ESP32 board, one ASIC, Feneris
- Each card: project name, one-line description, tech tags, link to full project page
- This is a teaser. The full list lives on `/projects`

**Capabilities strip**
- Thin section, 4-5 short entries in a horizontal row
- PCB Design / Embedded Firmware / ASIC / FPGA / IoT
- No paragraph copy. Just the labels.

**Brief about blurb**
- 2-3 sentences max. What you build, where you are (2nd year EE), what you're open to.
- Link to `/about` for more
- Optional: a single hardware photo here works well if you have a clean one

**CTA footer block**
- "Working on something? Let's talk." + button to `/contact`
- This closes the page. Every page should have an exit ramp to contact.

---

### 2. Projects (`/projects`)

The portfolio. This is what clients and recruiters actually care about.

**Page header**
- Section title: "Work" or "Projects"
- One sentence: what kinds of projects you take on

**Project grid**
- All projects listed here
- Current projects to include:
  - ESP32 custom board
  - STM32N6 schematic
  - Analog ASIC
  - Logic-gate ASIC
  - Feneris (SaaS -- show it, it proves range)
- Each card: image or diagram, project name, short description (1 line), tags, GitHub link or case study link

**Individual project pages (`/projects/[slug]`)**
Each project gets its own page. Structure per project:

- Title
- Tags (domain, tools used)
- 1-paragraph problem statement: what needed to be built and why
- What you delivered: explicit list (schematic, Gerbers, firmware, etc.)
- Key technical decisions: 2-3 bullet points on choices you made and why
- Images: board photo, schematic screenshot, block diagram -- whatever you have
- GitHub link
- Optional: lessons learned, one short paragraph

This is the page you link to in Upwork proposals and internship applications. It needs to exist and it needs to be specific.

---

### 3. About (`/about`)

**Who you are block**
- 1 short paragraph. EE student, 2nd year, what you focus on, what you've shipped.
- No life story. No "from a young age I was fascinated by..."

**What you work with**
- Two columns: Hardware side / Software side
- Hardware: KiCad, ESP32, STM32, ASIC design tools, FPGA toolchains
- Software: Embedded C, VHDL/Verilog, whatever firmware stack you use
- Plain list, no skill bars or percentage graphics (those are meaningless and look amateur)

**Currently**
- Short status block, 2-3 lines
- "2nd year EE (Honors). Freelancing on Upwork. Open to internships starting [date]."
- Keep it current. Update this every semester.

**Feneris mention**
- One line acknowledging you founded a SaaS product, link to feneris.app
- Shows range beyond hardware

**Resume download**
- Single link: "Download Resume (PDF)"
- Do not embed the resume on this page. Just the link.

---

### 4. Contact (`/contact`)

Minimal. The only job here is to make it easy to reach you.

**Short header**
- "Let's work together" or equivalent. One line.
- One sentence on what kinds of projects/opportunities you're open to.

**Contact form**
- Name
- Email
- Message
- Submit button
- That is all. No phone number field, no "how did you hear about us", no dropdown of services.

**Direct email**
- Show your email address in plain text as well, below the form
- Some people don't trust forms. Give them the fallback.

**Links**
- GitHub
- LinkedIn
- Upwork profile
- Three icons or three plain text links. No elaborate social grid.

---

### 5. Resume (`/resume`)

**Option A (simpler):** This page is just a PDF embed with a download button above it. Nothing else.

**Option B (better for SEO and ATS):** An HTML-rendered version of your resume styled to match the site, with a "Download PDF" button at the top. Clients and recruiters can read it without downloading anything.

Whichever you pick: one clear download link at the top of the page. Do not bury it.

---

## Bare Bones Build Order

When vibe-coding, hit them in this sequence:

1. Set up routing -- all 5 routes rendering blank pages
2. Build the nav component -- links work, mobile nav works, theme toggle works
3. Drop real content into each page as plain unstyled HTML/JSX
4. Get the contact form actually submitting (Formspree or Resend -- don't leave it fake)
5. Make sure all external links (GitHub, Upwork, LinkedIn, Feneris) are correct
6. Then hand the identity doc to the AI and style everything

---

**TLDR:** 5 pages. Home is a teaser that funnels to Projects and Contact. Projects holds the full portfolio with individual case study pages per project -- those pages are your actual sales tool. About is 3 blocks: who, stack, status. Contact is a form plus your email. Resume is a PDF link with optional HTML render. Build all routes blank first, fill with real content second, style last.
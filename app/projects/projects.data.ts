// ---------------------------------------------------------------------------
// Single source of truth for projects — consumed by the /projects index, the
// /projects/[slug] detail pages, the home Selected Work strip and /about.
// Adding a project = one entry here. Content is intentionally English (technical
// copy / proper nouns); page chrome is localized via LanguageContext (t()).
//
// Each project is drawn as a plate (app/kit/draw). The three below have their own
// drawings; a new project gets a seeded drawing for its `kind` automatically.
// `notes` and decision `parts` point at parts of that drawing (ids listed in
// app/kit/draw/<slug>.ts) — a balloon on the plate, lit when its note is hovered.
// ---------------------------------------------------------------------------

export type Kind = 'silicon' | 'board' | 'software';

/** A fact keyed to part(s) of the project's drawing — shown as a numbered balloon. */
export type Note = { part: string | string[]; text: string };

/** A key decision; with `parts`, the drawing lights those parts while it's read. */
export type Decision = string | { text: string; parts: string[] };

export type Project = {
    /** URL slug — must be unique; drives generateStaticParams */
    slug: string;
    /** Display name, set in Clash Display */
    title: string;
    /** Wide-tracked mono category, e.g. 'SILICON / RISC-V' */
    category: string;
    /** what was made — picks the build stages and the fallback drawing */
    kind: Kind;
    /** Short mono spec line for the index register, e.g. 'RV32I → SKY130 GDSII' */
    spec: string;
    /**
     * The detail page's hero line — lowercase, short, plain words (AESTHETIC_DIRECTION §3).
     * Translations, when present, live under projects.line.<slug>; this is the fallback.
     */
    line: string;
    /** One-line index blurb (dim) */
    blurb: string;
    /** Tech tags */
    tags: string[];
    /** Up to three facts for the index sheet, each keyed to the drawing */
    notes: Note[];
    /** Full problem statement (detail page) */
    problem: string;
    /** What was shipped (detail page) */
    deliverables: string[];
    /** Key technical decisions (detail page) */
    decisions: Decision[];
    /** External repo / link */
    github: string;
    /**
     * Optional artifact image (dropped in /public, referenced with a leading '/').
     * Shown on the detail page beside the drawing when present.
     */
    image?: string;
};

export const projects: Project[] = [
    {
        slug: 'cleave',
        title: 'CLEAVE',
        category: 'SILICON / RISC-V',
        kind: 'silicon',
        spec: 'RV32I → SKY130 GDSII',
        line: 'a processor core, from verilog to silicon layout.',
        blurb: 'From-scratch RV32I RISC-V core hardened to a sky130 GDSII through a full open-source RTL-to-GDSII flow.',
        tags: ['RISC-V', 'Verilog', 'Yosys', 'OpenROAD/LibreLane', 'Magic', 'sky130'],
        notes: [
            { part: 'rf', text: 'RV32I single-cycle core' },
            { part: 'cts', text: '25 MHz target' },
            { part: 'stamp', text: 'DRC / LVS-clean sky130 GDSII' },
        ],
        problem:
            'A from-scratch RISC-V core hardened through a full open-source RTL-to-GDSII flow.',
        deliverables: [
            'RV32I single-cycle core (Verilog)',
            'DRC/LVS-clean sky130 GDSII',
            'TinyTapeout 1x1 tile',
            '10 self-checking Icarus Verilog benches',
        ],
        decisions: [
            {
                text: 'Implemented the full RV32I base integer ISA across a modular datapath: PC, 32x32 register file, ALU, immediate generator, branch comparator, control unit, and byte-addressable data memory.',
                parts: ['pc', 'rf', 'alu', 'imm', 'br', 'ctl', 'dmem'],
            },
            {
                text: 'Hardened the RTL to a DRC/LVS-clean sky130 GDSII through a full open-source flow — Yosys synthesis, OpenROAD/LibreLane place-and-route and CTS, Magic/KLayout/netgen sign-off — at a 25 MHz target, packaged as a TinyTapeout 1x1 tile.',
                parts: ['stamp', 'cts', 'io'],
            },
            {
                text: 'Verified every module and the integrated core with 10 self-checking Icarus Verilog benches (9 unit + a full-ISA integration proof), validating ALU ops, store/load round-trips, all branch conditions, and JAL/JALR against hand-computed values through a debug port.',
                parts: ['dbg'],
            },
        ],
        github: 'https://github.com/Badr-0b',
    },
    {
        slug: 'nerona',
        title: 'NERONA',
        category: 'PCB / EDGE AI',
        kind: 'board',
        spec: 'STM32N6 · MIPI CSI-2',
        line: 'a vision board that runs its models on the device.',
        blurb: 'Custom PCB targeting the STM32N6 NPU for on-device computer-vision inference with no cloud dependency.',
        tags: ['KiCad', 'STM32N6', 'MIPI CSI-2', 'STM32CubeMX'],
        notes: [
            { part: 'u1', text: 'STM32N6 NPU, on-device inference' },
            { part: ['mipi', 'j1', 'cam'], text: 'MIPI CSI-2 camera interface' },
            { part: 'pwr', text: 'Power delivery under SI / EMC rules' },
        ],
        problem:
            'A custom PCB targeting the STM32N6 NPU for on-device computer-vision inference with no cloud dependency.',
        deliverables: ['Schematic', 'PCB layout', 'NPU model-deployment path'],
        decisions: [
            {
                text: 'Designed PCB power delivery, a MIPI CSI-2 camera interface, and the memory subsystem around the STM32N6 NPU for accelerated on-device CV inference.',
                parts: ['pwr', 'mipi', 'j1', 'cam', 'u2', 'u3'],
            },
            {
                text: 'Completed schematic and layout in KiCad under signal-integrity and EMC rules.',
                parts: ['mipi'],
            },
            {
                text: 'Built the deployment path for quantized object-detection models onto the NPU via STM32CubeMX.',
                parts: ['u1'],
            },
        ],
        github: 'https://github.com/Badr-0b',
    },
    {
        slug: 'azimuth',
        title: 'AZIMUTH',
        category: 'PCB / SENSOR FUSION',
        kind: 'board',
        spec: 'ESP32-S3 · GNSS · IMU',
        line: 'a navigation board that keeps its bearings when gnss drops.',
        blurb: 'Multi-sensor ESP32-S3 navigation board with defined sensor roles and GNSS-dropout redundancy planning.',
        tags: ['KiCad', 'ESP32-S3', 'GNSS', 'IMU', 'Sensor Fusion'],
        notes: [
            { part: ['gnss', 'ant'], text: 'GNSS for position' },
            { part: 'mag', text: 'Magnetometer for heading' },
            { part: 'imu', text: 'IMU for tilt and smoothing' },
        ],
        problem:
            'A custom multi-sensor navigation board with defined sensor roles and redundancy planning.',
        deliverables: [
            'Navigation board schematic + layout',
            'Sensor-role fusion plan',
            'GNSS-dropout fallback plan',
        ],
        decisions: [
            {
                text: 'Assigned each sensor a defined role: GNSS for position, magnetometer for heading, IMU accelerometer for tilt correction, and gyroscope for smoothing.',
                parts: ['gnss', 'ant', 'mag', 'imu'],
            },
            {
                text: 'Planned IMU dead-reckoning as a fallback for continuous heading and motion estimation during GNSS dropout, so navigation degrades gracefully rather than failing on single-sensor loss.',
                parts: ['imu'],
            },
        ],
        github: 'https://github.com/Badr-0b',
    },
];

/** Lookup by slug (detail page). */
export function getProject(slug: string): Project | undefined {
    return projects.find((p) => p.slug === slug);
}

/** A decision's text and the drawing parts it points at. */
export const decisionOf = (d: Decision) => (typeof d === 'string' ? { text: d, parts: [] as string[] } : d);

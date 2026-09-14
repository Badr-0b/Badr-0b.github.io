// ---------------------------------------------------------------------------
// Single source of truth for projects — consumed by the /projects index, the
// /projects/[slug] detail pages, and (optionally) the home Selected Work strip.
// Adding a project = one entry here. Content is intentionally English (technical
// copy / proper nouns); page chrome is localized via LanguageContext (t()).
// ---------------------------------------------------------------------------

export type Project = {
    /** URL slug — must be unique; drives generateStaticParams */
    slug: string;
    /** Display name, set in Clash Display */
    title: string;
    /** Wide-tracked mono category, e.g. 'SILICON / RISC-V' */
    category: string;
    /** One-line index blurb (dim) */
    blurb: string;
    /** Tech tags */
    tags: string[];
    /** Full problem statement (detail page) */
    problem: string;
    /** What was shipped (detail page) */
    deliverables: string[];
    /** Key technical decisions (detail page) */
    decisions: string[];
    /** External repo / link */
    github: string;
    /**
     * Optional artifact image (dropped in /public, referenced with a leading '/').
     * Absent → the flat placeholder field renders in the same slot. Swapping in a
     * real image later needs no layout change.
     */
    image?: string;
    /** Larger feature tile in the mosaic (its own full-height column) */
    feature?: boolean;
};

export const projects: Project[] = [
    {
        slug: 'cleave',
        title: 'CLEAVE',
        category: 'SILICON / RISC-V',
        blurb: 'From-scratch RV32I RISC-V core hardened to a sky130 GDSII through a full open-source RTL-to-GDSII flow.',
        tags: ['RISC-V', 'Verilog', 'Yosys', 'OpenROAD/LibreLane', 'Magic', 'sky130'],
        problem:
            'A from-scratch RISC-V core hardened through a full open-source RTL-to-GDSII flow.',
        deliverables: [
            'RV32I single-cycle core (Verilog)',
            'DRC/LVS-clean sky130 GDSII',
            'TinyTapeout 1x1 tile',
            '10 self-checking Icarus Verilog benches',
        ],
        decisions: [
            'Implemented the full RV32I base integer ISA across a modular datapath: PC, 32x32 register file, ALU, immediate generator, branch comparator, control unit, and byte-addressable data memory.',
            'Hardened the RTL to a DRC/LVS-clean sky130 GDSII through a full open-source flow — Yosys synthesis, OpenROAD/LibreLane place-and-route and CTS, Magic/KLayout/netgen sign-off — at a 25 MHz target, packaged as a TinyTapeout 1x1 tile.',
            'Verified every module and the integrated core with 10 self-checking Icarus Verilog benches (9 unit + a full-ISA integration proof), validating ALU ops, store/load round-trips, all branch conditions, and JAL/JALR against hand-computed values through a debug port.',
        ],
        github: 'https://github.com/Badr-0b',
        feature: true,
    },
    {
        slug: 'nerona',
        title: 'NERONA',
        category: 'PCB / EDGE AI',
        blurb: 'Custom PCB targeting the STM32N6 NPU for on-device computer-vision inference with no cloud dependency.',
        tags: ['KiCad', 'STM32N6', 'MIPI CSI-2', 'STM32CubeMX'],
        problem:
            'A custom PCB targeting the STM32N6 NPU for on-device computer-vision inference with no cloud dependency.',
        deliverables: ['Schematic', 'PCB layout', 'NPU model-deployment path'],
        decisions: [
            'Designed PCB power delivery, a MIPI CSI-2 camera interface, and the memory subsystem around the STM32N6 NPU for accelerated on-device CV inference.',
            'Completed schematic and layout in KiCad under signal-integrity and EMC rules.',
            'Built the deployment path for quantized object-detection models onto the NPU via STM32CubeMX.',
        ],
        github: 'https://github.com/Badr-0b',
    },
    {
        slug: 'azimuth',
        title: 'AZIMUTH',
        category: 'PCB / SENSOR FUSION',
        blurb: 'Multi-sensor ESP32-S3 navigation board with defined sensor roles and GNSS-dropout redundancy planning.',
        tags: ['KiCad', 'ESP32-S3', 'GNSS', 'IMU', 'Sensor Fusion'],
        problem:
            'A custom multi-sensor navigation board with defined sensor roles and redundancy planning.',
        deliverables: [
            'Navigation board schematic + layout',
            'Sensor-role fusion plan',
            'GNSS-dropout fallback plan',
        ],
        decisions: [
            'Assigned each sensor a defined role: GNSS for position, magnetometer for heading, IMU accelerometer for tilt correction, and gyroscope for smoothing.',
            'Planned IMU dead-reckoning as a fallback for continuous heading and motion estimation during GNSS dropout, so navigation degrades gracefully rather than failing on single-sensor loss.',
        ],
        github: 'https://github.com/Badr-0b',
    },
];

/** Lookup by slug (detail page). */
export function getProject(slug: string): Project | undefined {
    return projects.find((p) => p.slug === slug);
}

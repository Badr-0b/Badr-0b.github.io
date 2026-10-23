// ---------------------------------------------------------------------------
// The landing — content that isn't prose. Prose lives in the translation files
// (home.* keys); projects come from projects.data.ts. Every figure below must
// match the résumé and the project data: the page states them as fact.
// ---------------------------------------------------------------------------

import { projects, type Project } from '../projects/projects.data';

/** Selected work — the preview; the full set lives on /projects. */
const SELECTED = ['cleave', 'nerona', 'azimuth'];

export const selected: Project[] = SELECTED.map((slug) => projects.find((p) => p.slug === slug)).filter(
    Boolean
) as Project[];

export type Characteristic = {
    id: 'pass' | 'clock' | 'bench' | 'gpa';
    value: number;
    /** where the counter rolls from */
    from: number;
    /** whole digits shown (leading zeros fade out) */
    digits: number;
    decimals: number;
    /** a fixed unit, or a translation key for one that reads differently per language */
    unit?: string;
    unitKey?: string;
    href: string;
    /** the share of the original a bar keeps (the validation pass shrinks to it) */
    bar?: number;
};

export const characteristics: Characteristic[] = [
    { id: 'pass', value: 5, from: 330, digits: 3, decimals: 0, unitKey: 'home.char.pass.u', href: '/about/#experience', bar: 5 / 330 },
    { id: 'clock', value: 25, from: 0, digits: 2, decimals: 0, unit: 'MHz', href: '/projects/cleave/' },
    { id: 'bench', value: 10, from: 0, digits: 2, decimals: 0, href: '/projects/cleave/' },
    { id: 'gpa', value: 3.79, from: 0, digits: 1, decimals: 2, unit: '/ 4.0', href: '/about/#record' },
];

/* ---------------------------------------------------------------------------
   Capability glyphs — 120 × 64 hairline drawings. `edge` outlines, `fine`
   detail, `faint` texture; `signal` is the path that energises on hover.
   --------------------------------------------------------------------------- */

export type Glyph = { edge: string; fine: string; faint: string; signal: string };

const f = (n: number) => +n.toFixed(2);
const circle = (cx: number, cy: number, r: number) =>
    `M${f(cx - r)} ${f(cy)}a${r} ${r} 0 1 0 ${f(2 * r)} 0a${r} ${r} 0 1 0 ${f(-2 * r)} 0`;
const box = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}Z`;

/** concentric arcs around a mast tip, opening toward `dir` (1 right, -1 left) */
function waves(cx: number, cy: number, dir: 1 | -1, radii: number[], spread = 50) {
    const a = (spread * Math.PI) / 180;
    return radii
        .map((r) => {
            const x = cx + dir * r * Math.cos(a);
            return `M${f(x)} ${f(cy - r * Math.sin(a))}A${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${f(x)} ${f(cy + r * Math.sin(a))}`;
        })
        .join('');
}

function pcb(): Glyph {
    let pins = '';
    for (const x of [32, 36, 40, 44]) pins += `M${x} 20V17M${x} 40V43`;
    for (const y of [24, 28, 32, 36]) pins += `M28 ${y}H25M48 ${y}H51`;
    return {
        edge: 'M9 4H111A5 5 0 0 1 116 9V55A5 5 0 0 1 111 60H9A5 5 0 0 1 4 55V9A5 5 0 0 1 9 4Z',
        fine: box(28, 20, 20, 20) + pins + circle(11, 11, 2.4) + circle(109, 53, 2.4),
        faint:
            'M51 24H62L70 16H96M51 36H62L70 44H90M25 28H14' +
            circle(98.6, 16, 2.2) +
            circle(92.6, 44, 2.2) +
            circle(11.8, 28, 2.2) +
            circle(101.6, 32, 2.2),
        signal: 'M51 32H99.4',
    };
}

function firmware(): Glyph {
    const lines: [number, number, number][] = [
        [10, 20, 56],
        [17, 26, 80],
        [24, 32, 70],
        [38, 38, 76],
        [45, 32, 60],
        [52, 26, 48],
        [59, 20, 34],
    ];
    return {
        edge: 'M14 4V62',
        fine: lines.map(([y, a, b]) => `M${a} ${y}H${b}`).join(''),
        faint: [10, 17, 24, 31, 38, 45, 52, 59].map((y) => `M5 ${y}H10`).join(''),
        signal: 'M29 27V35M33 31H98',
    };
}

function asic(): Glyph {
    let pads = '';
    for (let x = 26; x <= 94; x += 8) pads += `M${x} 4V8M${x} 56V60`;
    for (let y = 12; y <= 52; y += 8) pads += `M18 ${y}H22M98 ${y}H102`;
    let rows = '';
    for (let y = 16; y <= 48; y += 4) rows += `M28 ${y}H92`;
    return {
        edge: 'M18 4H102V60H18Z',
        fine: 'M26 12H94V52H26Z' + pads,
        faint: rows,
        signal: 'M60 8V32M42 32H78M42 24V40M78 24V40M37 24H47M37 40H47M73 24H83M73 40H83',
    };
}

function fpga(): Glyph {
    let clbs = '';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) clbs += box(14 + i * 26, 6 + j * 20, 12, 10);
    let sw = '';
    for (const x of [33, 59, 85]) for (const y of [21, 41]) sw += box(x - 1.5, y - 1.5, 3, 3);
    return {
        edge: clbs,
        fine: sw,
        faint: 'M6 21H114M6 41H114M33 2V62M59 2V62M85 2V62',
        signal: 'M26 11H33V41H85V51H92',
    };
}

function iot(): Glyph {
    return {
        edge: box(8, 30, 28, 24) + box(84, 30, 28, 24),
        fine: box(16, 37, 12, 10) + box(92, 37, 12, 10) + 'M22 30V18M98 30V18',
        faint: 'M36 42H40M44 42H48M52 42H56M60 42H64M68 42H72M76 42H80',
        signal: waves(22, 18, 1, [6, 11, 16]) + waves(98, 18, -1, [6, 11, 16]),
    };
}

/** In the order of home.capabilities.1–5: PCB, firmware, ASIC, FPGA, IoT. */
export const glyphs: Glyph[] = [pcb(), firmware(), asic(), fpga(), iot()];

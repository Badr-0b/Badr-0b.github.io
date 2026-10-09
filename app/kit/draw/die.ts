/* ===========================================================================
   A die / tile plan view, built the way a hardened block is: floorplan (die and
   core, I/O pins, power straps, cell rows) → placement → clock tree → routing →
   sign-off. Parametric, so the generic silicon fallback reuses it with another
   seed. Coordinates are drawing units; ink styles live in kit.css.
   =========================================================================== */

import type { Box, Drawing, Label, Layer, Part } from './types';
import { bandsByX, dot, hTree, hash, line, rect, rectB, rng, poly } from './primitives';

export const SILICON_STAGES = [
    'kit.stage.floorplan',
    'kit.stage.place',
    'kit.stage.cts',
    'kit.stage.route',
    'kit.stage.signoff',
];

export type DieModule = { id: string; name: string; note: string; box: Box; balloon?: [number, number] };

export type DieSpec = {
    id: string;
    seed: string;
    title: string;
    /** viewBox */
    w: number;
    h: number;
    /** die boundary */
    die: Box;
    /** I/O pin groups along the top edge */
    pins: { label: string; count: number }[];
    /** which pin group the clock enters on (its first pin) */
    clockGroup?: number;
    /** VPWR / VGND strap pairs */
    straps: number;
    rowH: number;
    /** clock label beside the root (e.g. a frequency target) */
    clock?: string;
    /** RTL modules, shown as a floorplan overlay at sign-off */
    modules: DieModule[];
    /** sign-off stamp text */
    stamp: string;
    /** label under the die, at its start */
    foot: string;
    /** balloon positions for the fixed parts */
    balloons: { io: [number, number]; pwr: [number, number]; cts: [number, number]; stamp: [number, number] };
};

const BANDS = 6;

export function buildDie(spec: DieSpec): Drawing {
    const R = rng(hash(spec.seed));
    const { die } = spec;
    const core: Box = { x: die.x + 7, y: die.y + 7, w: die.w - 14, h: die.h - 14 };
    const layers: Layer[] = [];
    const labels: Label[] = [];
    const parts: Part[] = [];

    /* ---- floorplan: die boundary (draws on), core boundary, rows ---- */
    layers.push({ stage: 0, ink: 'edge', draw: true, d: [rectB(die)] });
    layers.push({ stage: 0, ink: 'dash', at: 0.35, d: rectB(core) });

    const rows = Math.floor((core.h - 4) / spec.rowH);
    const rowTop = core.y + (core.h - rows * spec.rowH) / 2;
    let rowsD = '';
    for (let r = 0; r <= rows; r++) rowsD += line(core.x + 2, rowTop + r * spec.rowH, core.x + core.w - 2, rowTop + r * spec.rowH);
    layers.push({ stage: 0, ink: 'faint', at: 0.55, d: rowsD });

    /* ---- placement: standard cells, row by row, swept left → right ---- */
    type Cell = { x: number; d: string };
    const cells: Cell[] = [];
    const x0 = core.x + 3;
    const x1 = core.x + core.w - 3;
    const widths = [5, 6, 6, 7, 8, 8, 9, 10, 11, 13, 16, 22, 30] as const;
    for (let r = 0; r < rows; r++) {
        const y = rowTop + r * spec.rowH;
        let x = x0 + R.range(0, 5);
        while (x < x1 - 5) {
            if (R.chance(0.28)) {
                x += R.pick([3, 4, 6, 9, 14] as const);
                continue;
            }
            const w = R.pick(widths);
            if (x + w > x1) break;
            cells.push({ x, d: rect(x + 0.6, y + 1.3, w - 1.2, spec.rowH - 2.6) });
            x += w;
        }
    }
    layers.push({
        stage: 1,
        ink: 'faint',
        d: bandsByX(cells, (c) => c.x, x0, x1, BANDS).map((b) => b.map((c) => c.d).join('')),
    });

    /* ---- routing: met2 (vertical, with vias) and met3 (horizontal), swept ---- */
    type Seg = { x: number; d: string };
    const met2: Seg[] = [];
    const vias: Seg[] = [];
    for (let i = 0; i < 190; i++) {
        const x = R.range(x0 + 4, x1 - 4);
        const yA = rowTop + R.int(0, rows - 2) * spec.rowH + spec.rowH * 0.5;
        const len = spec.rowH * R.int(1, 7);
        const yB = Math.min(rowTop + rows * spec.rowH - spec.rowH * 0.5, yA + len);
        met2.push({ x, d: line(x, yA, x, yB) });
        vias.push({ x, d: dot(x, yA) + dot(x, yB) });
    }
    const met3: Seg[] = [];
    for (let i = 0; i < 120; i++) {
        const y = rowTop + R.int(0, rows - 1) * spec.rowH + spec.rowH * R.pick([0.3, 0.7] as const);
        const xa = R.range(x0 + 4, x1 - 40);
        const xb = Math.min(x1 - 4, xa + R.range(30, 190));
        met3.push({ x: xa, d: line(xa, y, xb, y) });
    }
    const band = <T extends { x: number; d: string }>(arr: T[]) =>
        bandsByX(arr, (s) => s.x, x0, x1, BANDS).map((b) => b.map((s) => s.d).join(''));
    layers.push({ stage: 3, ink: 'faint', d: band(met3) });
    layers.push({ stage: 3, ink: 'fine', at: 0.15, d: band(met2) });
    layers.push({ stage: 3, ink: 'faint', at: 0.3, d: band(vias), minW: 420 });

    /* ---- power straps (met4) — painted over the core, part of the floorplan ---- */
    const straps: Box[] = [];
    const pitch = core.w / spec.straps;
    for (let i = 0; i < spec.straps; i++) {
        const bx = core.x + pitch * (i + 0.5) - 10;
        straps.push({ x: bx, y: die.y + 3, w: 6, h: die.h - 6 }, { x: bx + 14, y: die.y + 3, w: 6, h: die.h - 6 });
    }
    layers.push({ stage: 0, ink: 'mask', at: 0.7, d: straps.map(rectB).join('') });
    layers.push({ stage: 0, ink: 'mid', at: 0.7, d: straps.map(rectB).join('') });

    /* ---- I/O pins along the top edge, grouped ---- */
    const PIN = 10; // pin pitch
    const GAP = 22; // between groups (centre to centre)
    const xs: number[][] = [];
    let at = 0;
    spec.pins.forEach((g, gi) => {
        if (gi) at += GAP - PIN;
        xs.push(Array.from({ length: g.count }, (_, i) => at + i * PIN));
        at += g.count * PIN;
    });
    const span = at - PIN; // first pin centre → last pin centre
    const left = die.x + (die.w - span) / 2;
    let pinsD = '';
    xs.forEach((group, gi) => {
        group.forEach((x) => (pinsD += rect(left + x - 1.6, die.y - 5, 3.2, 10)));
        labels.push({ x: left + group[0] - 1.6, y: die.y - 13, text: spec.pins[gi].label, stage: 0, size: 8.5, ink: 'faint', minW: 380 });
    });
    const clkX = left + xs[spec.clockGroup ?? 0][0];
    const pinsBox: Box = { x: left - 6, y: die.y - 26, w: span + 12, h: 34 };
    layers.push({ stage: 0, ink: 'mid', at: 0.2, d: pinsD });

    /* ---- clock tree: a Manhattan trunk from the clk pin (on-die routing never runs
       at 45°), then the H-tree, level by level ---- */
    const cx = core.x + core.w / 2;
    const cy = core.y + core.h / 2;
    const tree = hTree(cx, cy, core.w * 0.86, core.h * 0.84, 5);
    const trunkY = die.y + 24;
    layers.push({ stage: 2, ink: 'hot', draw: true, d: [poly([[clkX, die.y + 5], [clkX, trunkY], [cx, trunkY], [cx, cy]])] });
    tree.forEach((lvl, i) => layers.push({ stage: 2, ink: 'hot', draw: true, at: 0.18 + i * 0.16, d: lvl }));
    if (spec.clock) labels.push({ x: cx + 8, y: cy - 7, text: spec.clock, stage: 2, size: 9, ink: 'hot' });

    /* ---- sign-off: the RTL modules as a floorplan overlay ---- */
    layers.push({ stage: 4, ink: 'dash', at: 0.1, d: spec.modules.map((m) => rectB(m.box)).join('') });
    for (const m of spec.modules) {
        labels.push({ x: m.box.x + 6, y: m.box.y + 13, text: m.name, stage: 4, size: 8.5, ink: 'mid' });
        parts.push({
            id: m.id,
            name: m.name,
            note: m.note,
            stage: 4,
            d: rectB(m.box),
            hit: m.box,
            anchor: [m.box.x + m.box.w / 2, m.box.y + m.box.h / 2],
            balloon: m.balloon ?? [m.box.x + m.box.w / 2, m.box.y - 20],
        });
    }

    /* ---- the foot label, and the sign-off stamp opposite it ---- */
    const stampY = die.y + die.h + 20;
    labels.push({ x: die.x, y: stampY, text: spec.foot, stage: 0, size: 8.5, ink: 'faint', minW: 360 });
    labels.push({ x: die.x + die.w, y: stampY, text: spec.stamp, stage: 4, size: 9, ink: 'hot', anchor: 'end' });
    const stampW = 132;

    /* ---- fixed parts: pins, straps, clock root, stamp ---- */
    parts.push(
        {
            id: 'io',
            name: 'I/O',
            note: spec.pins.map((g) => g.label).join(' · '),
            stage: 0,
            d: pinsD,
            hit: pinsBox,
            anchor: [pinsBox.x + pinsBox.w * 0.66, die.y - 2],
            balloon: spec.balloons.io,
        },
        {
            id: 'pwr',
            name: 'MET4',
            note: 'Power straps — VPWR / VGND',
            stage: 0,
            d: rectB(straps[0]) + rectB(straps[1]),
            hit: { x: straps[0].x - 4, y: die.y, w: 28, h: die.h },
            anchor: [straps[0].x + 10, die.y + die.h * 0.82],
            balloon: spec.balloons.pwr,
        },
        {
            id: 'cts',
            name: 'CTS',
            note: spec.clock ? `Clock tree — ${spec.clock} target` : 'Clock tree',
            stage: 2,
            d: rect(cx - 5, cy - 5, 10, 10),
            hit: { x: cx - 18, y: cy - 18, w: 36, h: 36 },
            anchor: [cx, cy],
            balloon: spec.balloons.cts,
        },
        {
            id: 'stamp',
            name: 'SIGN-OFF',
            note: spec.stamp,
            stage: 4,
            d: rect(die.x + die.w - stampW, stampY - 12, stampW, 17),
            hit: { x: die.x + die.w - stampW - 4, y: stampY - 14, w: stampW + 8, h: 22 },
            anchor: [die.x + die.w + 4, stampY - 4],
            balloon: spec.balloons.stamp,
        }
    );

    return { id: spec.id, w: spec.w, h: spec.h, stages: SILICON_STAGES, layers, parts, labels, title: spec.title };
}

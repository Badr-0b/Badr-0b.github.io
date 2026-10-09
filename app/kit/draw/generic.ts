/* ===========================================================================
   Fallback drawings, so a project added later without its own drawing still
   gets an on-brand plate: a die for silicon, a board for hardware, and a
   service diagram for software. Seeded from the slug — stable, and different
   for every project.
   =========================================================================== */

import type { Box, Drawing, Label, Layer, Part } from './types';
import { buildDie } from './die';
import { circle, dot, hash, line, padRow, poly, rect, rectB, rng, route45 } from './primitives';
import { BOARD_STAGES, fiducials, grow, holes, outlineOf, pourEdge, stitching, viaFence } from './board';

export type Kind = 'silicon' | 'board' | 'software';

export function genericDie(slug: string, title: string): Drawing {
    return buildDie({
        id: slug,
        seed: slug,
        title,
        w: 640,
        h: 452,
        die: { x: 64, y: 64, w: 512, h: 354 },
        pins: [
            { label: 'IN', count: 8 },
            { label: 'OUT', count: 8 },
            { label: 'CLK', count: 2 },
        ],
        clockGroup: 2,
        straps: 4,
        rowH: 10.4,
        modules: [],
        stamp: 'SIGN-OFF',
        foot: title.toUpperCase(),
        balloons: { io: [612, 40], pwr: [30, 410], cts: [612, 241], stamp: [612, 438] },
    });
}

export function genericBoard(slug: string, title: string): Drawing {
    const R = rng(hash(slug));
    const board = { x: 60, y: 44, w: 520, h: 352, r: 16 };
    const layers: Layer[] = [];
    const labels: Label[] = [];
    const mcu: Box = { x: R.range(220, 300), y: R.range(140, 190), w: 84, h: 84 };

    const h = holes([
        [82, 66],
        [558, 66],
        [82, 374],
        [558, 374],
    ]);
    const f = fiducials([
        [112, 66],
        [528, 374],
    ]);
    layers.push({ stage: 0, ink: 'edge', draw: true, d: [outlineOf(board)] });
    layers.push({ stage: 0, ink: 'mid', at: 0.4, d: h.hole });
    layers.push({ stage: 0, ink: 'faint', at: 0.5, d: h.ring + f.ring });
    layers.push({ stage: 0, ink: 'dot', at: 0.6, d: f.dot });

    // main IC (QFN), and a scatter of passives around it
    const qfn =
        padRow(mcu.x + 8, mcu.y, 10, 7.5, 5, 'top') +
        padRow(mcu.x + 8, mcu.y + mcu.h, 10, 7.5, 5, 'bottom') +
        padRow(mcu.x, mcu.y + 8, 10, 7.5, 5, 'left') +
        padRow(mcu.x + mcu.w, mcu.y + 8, 10, 7.5, 5, 'right');
    layers.push({ stage: 1, ink: 'mid', drop: true, d: rectB(mcu) + rect(mcu.x + 22, mcu.y + 22, 40, 40) });
    layers.push({ stage: 1, ink: 'fine', drop: true, d: qfn });

    const parts: Box[] = [];
    let passives = '';
    for (let i = 0; i < 14; i++) {
        const b: Box = { x: R.range(100, 520), y: R.range(80, 350), w: R.pick([7, 9, 12] as const), h: R.pick([4, 5, 6] as const) };
        if ([mcu, ...parts].some((o) => b.x < o.x + o.w + 18 && b.x + b.w > o.x - 18 && b.y < o.y + o.h + 18 && b.y + b.h > o.y - 18)) continue;
        parts.push(b);
        passives += rectB(b);
    }
    layers.push({ stage: 1, ink: 'fine', drop: true, at: 0.35, d: passives });

    const conn: Box = { x: board.x + board.w - 44, y: R.range(150, 230), w: 30, h: 60 };
    layers.push({ stage: 1, ink: 'mid', drop: true, at: 0.6, d: rectB(conn) + padRow(conn.x + 8, conn.y + 6, 7, 8, 12, 'right') });

    // routing: the IC's right side to the connector, plus short stubs to passives
    const traces: string[] = [];
    for (let i = 0; i < 6; i++) traces.push(poly(route45([mcu.x + mcu.w + 5, mcu.y + 15.5 + i * 7.5], [conn.x, conn.y + 6 + i * 8], 0.5)));
    for (const p of parts.slice(0, 8)) {
        const target: [number, number] = p.x < mcu.x ? [mcu.x - 5, mcu.y + 15.5] : [mcu.x + 23, mcu.y + mcu.h + 5];
        traces.push(poly(route45([p.x + p.w / 2, p.y + p.h / 2], target, 0.5, p.x < mcu.x ? 'x' : 'y')));
    }
    layers.push({ stage: 2, ink: 'trace', draw: true, d: traces });

    layers.push({ stage: 3, ink: 'dash', d: pourEdge(board, 5) });
    layers.push({ stage: 3, ink: 'via', at: 0.2, d: viaFence(board, 10, 14, [grow(conn, 14)]) });
    layers.push({
        stage: 3,
        ink: 'via',
        at: 0.45,
        d: stitching({ x: board.x + 22, y: board.y + 22, w: board.w - 44, h: board.h - 44 }, 26, [grow(mcu, 26), grow(conn, 14), ...parts.map((p) => grow(p, 8))]),
        minW: 360,
    });

    labels.push({ x: mcu.x + mcu.w / 2, y: mcu.y + mcu.h + 22, text: 'U1', stage: 4, size: 8.5, ink: 'mid', anchor: 'middle' });
    labels.push({ x: board.x + 24, y: board.y + board.h - 12, text: `${title.toUpperCase()} · REV A`, stage: 4, size: 8.5, ink: 'faint', minW: 380 });

    const partList: Part[] = [
        { id: 'u1', name: 'U1', note: 'Main controller', stage: 1, d: rectB(mcu), hit: mcu, anchor: [mcu.x + mcu.w / 2, mcu.y], balloon: [mcu.x + mcu.w / 2, 20] },
    ];
    return { id: slug, w: 640, h: 440, stages: BOARD_STAGES, layers, parts: partList, labels, title };
}

export const SOFTWARE_STAGES = ['kit.stage.model', 'kit.stage.services', 'kit.stage.wire', 'kit.stage.ship'];

/** A service diagram: client, edge, services, store — boxes wired the way requests travel. */
export function genericSoftware(slug: string, title: string): Drawing {
    const R = rng(hash(slug));
    const layers: Layer[] = [];
    const labels: Label[] = [];
    const nodes: { b: Box; name: string }[] = [
        { b: { x: 60, y: 180, w: 96, h: 64 }, name: 'CLIENT' },
        { b: { x: 214, y: 180, w: 96, h: 64 }, name: 'EDGE' },
        { b: { x: 370, y: 84, w: 110, h: 64 }, name: 'API' },
        { b: { x: 370, y: 276, w: 110, h: 64 }, name: 'JOBS' },
        { b: { x: 530, y: 180, w: 70, h: 64 }, name: 'DB' },
    ];
    layers.push({ stage: 0, ink: 'faint', d: Array.from({ length: 9 }, (_, i) => line(40, 60 + i * 40, 620, 60 + i * 40)).join('') });
    layers.push({ stage: 1, ink: 'mid', drop: true, d: nodes.map((n) => rectB(n.b)).join('') });
    nodes.forEach((n) => labels.push({ x: n.b.x + 8, y: n.b.y + 16, text: n.name, stage: 1, size: 8.5, ink: 'mid' }));
    const c = (b: Box, side: 'l' | 'r'): [number, number] => [side === 'l' ? b.x : b.x + b.w, b.y + b.h / 2];
    const wires = [
        poly([c(nodes[0].b, 'r'), c(nodes[1].b, 'l')]),
        poly(route45(c(nodes[1].b, 'r'), c(nodes[2].b, 'l'), 0.4)),
        poly(route45(c(nodes[1].b, 'r'), c(nodes[3].b, 'l'), 0.4)),
        poly(route45(c(nodes[2].b, 'r'), c(nodes[4].b, 'l'), 0.6)),
        poly(route45(c(nodes[3].b, 'r'), c(nodes[4].b, 'l'), 0.6)),
    ];
    layers.push({ stage: 2, ink: 'trace', draw: true, d: wires });
    let pulses = '';
    for (let i = 0; i < 12; i++) pulses += dot(R.range(160, 520), R.pick([212, 116, 308] as const));
    layers.push({ stage: 3, ink: 'dot', d: pulses });
    layers.push({ stage: 3, ink: 'hot', at: 0.3, d: circle(565, 212, 22) });
    labels.push({ x: 40, y: 420, text: title.toUpperCase(), stage: 3, size: 8.5, ink: 'faint' });
    return { id: slug, w: 640, h: 440, stages: SOFTWARE_STAGES, layers, parts: [], labels, title };
}

/** A blank sheet — the reserved next one: a sparse grid, a centre mark, nothing drawn yet. */
export function blankSheet(label: string): Drawing {
    let grid = '';
    for (let y = 36; y <= 404; y += 32) for (let x = 32; x <= 608; x += 32) grid += dot(x, y);
    const cx = 320;
    const cy = 220;
    return {
        id: 'blank',
        w: 640,
        h: 440,
        stages: ['kit.stage.blank'],
        layers: [
            { stage: 0, ink: 'fine', d: [grid] },
            { stage: 0, ink: 'mid', at: 0.5, d: line(cx - 14, cy, cx + 14, cy) + line(cx, cy - 14, cx, cy + 14) + circle(cx, cy, 6) },
        ],
        parts: [],
        labels: [{ x: cx, y: cy + 36, text: label, stage: 0, size: 9, ink: 'faint', anchor: 'middle' }],
        title: label,
    };
}

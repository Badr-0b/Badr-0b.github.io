/* NERONA — the STM32N6 vision board (plan view): the MCU's ball grid, the camera on
   its flex into a CSI-2 connector, two memories on splayed buses, the power stage,
   and the SI / EMC work (pairs routed and tuned, a via fence, a stitched pour). */

import type { Box, Drawing, Label, Layer, Part } from './types';
import {
    circle,
    dot,
    line,
    offset,
    padRow,
    poly,
    rect,
    rectB,
    route45,
    rrect,
    serpentine,
    type Pt,
} from './primitives';
import { BOARD_STAGES, fiducials, grow, holes, outlineOf, pourEdge, stitching, viaFence, type BoardFrame } from './board';

const board: BoardFrame = { x: 132, y: 36, w: 496, h: 368, r: 18 };
const U1: Box = { x: 262, y: 120, w: 120, h: 120 };
const U2: Box = { x: 444, y: 92, w: 60, h: 48 };
const U3: Box = { x: 444, y: 220, w: 60, h: 48 };
const U4: Box = { x: 290, y: 300, w: 32, h: 32 };
const L1: Box = { x: 342, y: 296, w: 32, h: 32 };
const L2: Box = { x: 388, y: 296, w: 32, h: 32 };
const J1: Box = { x: 136, y: 180, w: 22, h: 44 };
const CAM: Box = { x: 26, y: 172, w: 60, h: 60 };
const PWR: Box = { x: 284, y: 290, w: 142, h: 84 };

function build(): Drawing {
    const layers: Layer[] = [];
    const labels: Label[] = [];

    /* ---- 0 · outline: edge cuts, holes, fiducials ---- */
    const h = holes([
        [154, 58],
        [606, 58],
        [154, 382],
        [606, 382],
    ]);
    const f = fiducials([
        [186, 58],
        [574, 382],
        [186, 382],
    ]);
    layers.push({ stage: 0, ink: 'edge', draw: true, d: [outlineOf(board)] });
    layers.push({ stage: 0, ink: 'mid', at: 0.4, d: h.hole });
    layers.push({ stage: 0, ink: 'faint', at: 0.5, d: h.ring + f.ring });
    layers.push({ stage: 0, ink: 'dot', at: 0.6, d: f.dot });

    /* ---- 1 · placement (pick-and-place, in order) ---- */
    // U1 — the STM32N6 ball grid, package, pin-1, courtyard
    let balls = '';
    const N = 15;
    const pitch = 7.2;
    const m = (U1.w - (N - 1) * pitch) / 2;
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) balls += dot(U1.x + m + c * pitch, U1.y + m + r * pitch);
    layers.push({ stage: 1, ink: 'mid', drop: true, d: rectB(U1) });
    layers.push({ stage: 1, ink: 'dot', drop: true, at: 0.05, d: balls });
    layers.push({ stage: 1, ink: 'dash', drop: true, at: 0.1, d: rectB(grow(U1, 10)) });

    // decoupling ring (top and bottom rows of 0402s)
    let caps = '';
    for (let i = 0; i < 9; i++) {
        const x = U1.x + 6 + i * 13;
        caps += rect(x, U1.y - 18, 6.4, 3.4) + rect(x, U1.y + U1.h + 14, 6.4, 3.4);
    }
    layers.push({ stage: 1, ink: 'fine', drop: true, at: 0.25, d: caps });

    // memories
    const memPads = (b: Box) =>
        padRow(b.x, b.y + 6.5, 6, 7, 6, 'left') + padRow(b.x + b.w, b.y + 6.5, 6, 7, 6, 'right');
    layers.push({ stage: 1, ink: 'mid', drop: true, at: 0.4, d: rectB(U2) + rectB(U3) });
    layers.push({ stage: 1, ink: 'fine', drop: true, at: 0.4, d: memPads(U2) + memPads(U3) });

    // power stage: regulator, two inductors, bulk caps
    layers.push({
        stage: 1,
        ink: 'mid',
        drop: true,
        at: 0.55,
        d:
            rectB(U4) +
            rrect(L1.x, L1.y, L1.w, L1.h, 5) +
            rrect(L2.x, L2.y, L2.w, L2.h, 5) +
            rect(342, 350, 16, 9) +
            rect(364, 350, 16, 9) +
            rect(386, 350, 16, 9),
    });
    layers.push({
        stage: 1,
        ink: 'fine',
        drop: true,
        at: 0.55,
        d:
            padRow(U4.x + 4, U4.y, 6, 4.8, 4, 'top') +
            padRow(U4.x + 4, U4.y + U4.h, 6, 4.8, 4, 'bottom') +
            circle(L1.x + 16, L1.y + 16, 9) +
            circle(L2.x + 16, L2.y + 16, 9),
    });

    // J1 — the CSI-2 connector, and the camera on its flex
    let jpads = '';
    for (let i = 0; i < 16; i++) jpads += line(J1.x + 4, J1.y + 3 + i * 2.55, J1.x + 18, J1.y + 3 + i * 2.55);
    let flex = line(86, 189, 146, 189) + line(86, 215, 146, 215);
    for (let i = 0; i < 8; i++) flex += line(86, 192 + i * 3, 140, 192 + i * 3);
    layers.push({ stage: 1, ink: 'mid', drop: true, at: 0.7, d: rectB(J1) + rectB(CAM) });
    layers.push({ stage: 1, ink: 'fine', drop: true, at: 0.7, d: jpads });
    layers.push({ stage: 1, ink: 'faint', drop: true, at: 0.75, d: flex });
    layers.push({
        stage: 1,
        ink: 'hot',
        drop: true,
        at: 0.8,
        d: circle(56, 202, 20) + circle(56, 202, 12),
    });
    layers.push({ stage: 1, ink: 'faint', drop: true, at: 0.8, d: circle(56, 202, 5) });

    /* ---- 2 · routing ---- */
    // the CSI-2 pairs: two data lanes and the clock, the clock tuned with a serpentine
    const D1: Pt[] = route45([158, 192], [U1.x, 150], 0.35);
    const CLK: Pt[] = [[158, 202], ...serpentine(166, 208, 202, 6, 8).slice(1), [214, 202], [230, 186], [U1.x, 186]];
    const D0: Pt[] = route45([158, 212], [U1.x, 222], 0.45);
    const pairs = [D1, CLK, D0].flatMap((p) => [poly(p), poly(offset(p, -3.6))]);
    layers.push({ stage: 2, ink: 'trace', draw: true, d: pairs });

    // splayed buses to the memories
    const bus: string[] = [];
    for (let i = 0; i < 6; i++) {
        bus.push(poly(route45([U1.x + U1.w, 126 + i * 7], [U2.x - 6, U2.y + 6.5 + i * 7], 0.3)));
        bus.push(poly(route45([U1.x + U1.w, 196 + i * 7], [U3.x - 6, U3.y + 6.5 + i * 7], 0.3)));
    }
    layers.push({ stage: 2, ink: 'trace', draw: true, at: 0.25, d: bus });

    // power: wide, quiet runs up from the inductors
    layers.push({
        stage: 2,
        ink: 'wide',
        at: 0.5,
        d: poly([[358, 296], [358, 270], [346, 258]]) + poly([[404, 296], [404, 266], [392, 254], [382, 254]]) + line(322, 300, 322, 262),
    });

    /* ---- 3 · pour: boundary, edge fence, stitching ---- */
    const keep: Box[] = [
        grow(U1, 22),
        grow(U2, 10),
        grow(U3, 10),
        PWR,
        { x: 132, y: 168, w: 140, h: 68 },
        { x: 382, y: 112, w: 64, h: 160 },
        { x: 470, y: 380, w: 150, h: 24 },
        { x: 150, y: 244, w: 112, h: 22 },
    ];
    layers.push({ stage: 3, ink: 'dash', d: pourEdge(board, 5) });
    layers.push({
        stage: 3,
        ink: 'via',
        at: 0.2,
        d: viaFence(board, 10, 13, [{ x: 120, y: 166, w: 50, h: 72 }, { x: 488, y: 384, w: 104, h: 20 }, ...[[154, 58], [606, 58], [154, 382], [606, 382], [186, 58], [574, 382], [186, 382]].map(([x, y]) => ({ x: x - 12, y: y - 12, w: 24, h: 24 }))]),
    });
    layers.push({
        stage: 3,
        ink: 'via',
        at: 0.45,
        d: stitching({ x: board.x + 22, y: board.y + 22, w: board.w - 44, h: board.h - 44 }, 26, keep),
        minW: 360,
    });

    /* ---- 4 · silkscreen ---- */
    layers.push({ stage: 4, ink: 'mid', d: rect(U1.x - 7, U1.y - 7, 5, 5) + dot(U2.x - 8, U2.y + 2) + dot(U4.x - 5, U4.y - 5) });
    const silk = (x: number, y: number, text: string, anchor: Label['anchor'] = 'middle', minW?: number) =>
        labels.push({ x, y, text, stage: 4, size: 8.5, ink: 'mid', anchor, minW });
    silk(U1.x - 12, U1.y + U1.h + 16, 'U1 · STM32N6', 'end');
    silk(U2.x + U2.w + 12, U2.y + 10, 'U2', 'start');
    silk(U3.x + U3.w + 12, U3.y + 10, 'U3', 'start');
    silk(J1.x + J1.w / 2, J1.y + J1.h + 14, 'J1');
    silk(CAM.x + CAM.w / 2, CAM.y + CAM.h + 16, 'CAM');
    silk(U4.x + U4.w / 2, U4.y + 19, 'U4', 'middle', 420);
    silk(L1.x + 16, L1.y + 19, 'L1', 'middle', 420);
    silk(L2.x + 16, L2.y + 19, 'L2', 'middle', 420);
    labels.push({ x: 586, y: 397, text: 'NERONA · REV A', stage: 4, size: 8.5, ink: 'faint', anchor: 'end', minW: 380 });

    const parts: Part[] = [
        {
            id: 'u1',
            name: 'U1',
            note: 'STM32N6 — microcontroller with an on-chip NPU',
            stage: 1,
            d: rectB(U1),
            hit: U1,
            anchor: [U1.x + U1.w / 2, U1.y + U1.h / 2],
            balloon: [U1.x + U1.w / 2 + 30, 16],
        },
        {
            id: 'mipi',
            name: 'CSI-2',
            note: 'MIPI CSI-2 pairs — two data lanes and the clock',
            stage: 2,
            d: pairs.join(''),
            hit: { x: 160, y: 144, w: 100, h: 84 },
            anchor: [234, 186],
            balloon: [200, 16],
        },
        {
            id: 'j1',
            name: 'J1',
            note: 'MIPI CSI-2 camera connector',
            stage: 1,
            d: rectB(J1),
            hit: grow(J1, 4),
            anchor: [J1.x + J1.w / 2, J1.y + J1.h],
            balloon: [100, 300],
        },
        {
            id: 'cam',
            name: 'CAM',
            note: 'Camera module, on a flex into J1',
            stage: 1,
            d: rectB(CAM),
            hit: CAM,
            anchor: [56, 182],
            balloon: [56, 120],
        },
        {
            id: 'u2',
            name: 'U2',
            note: 'External memory',
            stage: 1,
            d: rectB(U2),
            hit: grow(U2, 4),
            anchor: [U2.x + U2.w, U2.y + U2.h / 2],
            balloon: [644, 116],
        },
        {
            id: 'u3',
            name: 'U3',
            note: 'External memory',
            stage: 1,
            d: rectB(U3),
            hit: grow(U3, 4),
            anchor: [U3.x + U3.w, U3.y + U3.h / 2],
            balloon: [644, 244],
        },
        {
            id: 'pwr',
            name: 'PWR',
            note: 'Power delivery — regulator, inductors, bulk capacitance',
            stage: 1,
            d: rectB(PWR),
            hit: PWR,
            anchor: [PWR.x + PWR.w / 2, PWR.y + PWR.h],
            balloon: [PWR.x + PWR.w / 2, 424],
        },
    ];

    return {
        id: 'nerona',
        w: 660,
        h: 440,
        stages: BOARD_STAGES,
        layers,
        parts,
        labels,
        title: 'Plan view of the NERONA board: the STM32N6 ball grid, a camera on a flex into a CSI-2 connector, two memories, the power stage, a via fence and a stitched ground pour.',
    };
}

export const nerona = build();

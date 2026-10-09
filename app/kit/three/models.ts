/* ===========================================================================
   The 3D models — built in code from the same facts as the 2D drawings, in mm.
   Electronics are boxes and cylinders, so procedural is exact, tiny and owes no
   licence. Each model is a set of layers that can separate (an exploded view).
   Convention: x right, y up, z toward the viewer.
   =========================================================================== */

import { Builder, bezier, type Ink } from './hlr';

type V3 = [number, number, number];

export type ModelLayer = {
    name: string;
    /** flag text for the exploded view: a short label and a technical note */
    label: string;
    note: string;
    b: Builder;
    /** how far this layer travels when the model separates (mm, before the view's scale) */
    explode: V3;
    /** where its flag's leader lands, in model space */
    anchor: V3;
};
export type Model = {
    id: string;
    layers: ModelLayer[];
    /** where the callout's leader lands, in model space */
    anchor: V3;
    /** rough radius, for framing */
    radius: number;
};

/** deterministic jitter for the die's texture (no Math.random — every render identical) */
function seeded(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* ---------------------------------------------------------------------------
   CLEAVE — the tile: substrate with cell rows, then metal: straps, pins, clock
   --------------------------------------------------------------------------- */
export function cleaveModel(): Model {
    const W = 26;
    const D = 18;
    const T = 0.7;
    const die = new Builder();
    die.box(W, T, D, 0, 0, 0, 'edge');
    const top = T + 0.01;
    // core boundary and standard-cell rows
    die.rect(0, top, 0, W - 1.4, D - 1.4, 'fine');
    const rows = 26;
    for (let r = 1; r < rows; r++) {
        const z = -D / 2 + 0.7 + (r * (D - 1.4)) / rows;
        die.seg([-W / 2 + 0.7, top, z], [W / 2 - 0.7, top, z], 'faint');
    }
    // a sparse scatter of routing on the core
    const rnd = seeded(7);
    for (let i = 0; i < 46; i++) {
        const x = -W / 2 + 1 + rnd() * (W - 2);
        const z = -D / 2 + 1 + rnd() * (D - 2);
        if (rnd() < 0.5) die.seg([x, top, z], [Math.min(W / 2 - 0.8, x + 1 + rnd() * 5), top, z], 'faint');
        else die.seg([x, top, z], [x, top, Math.min(D / 2 - 0.8, z + 1 + rnd() * 4)], 'faint');
    }

    const metal = new Builder();
    // met4 straps, in VPWR / VGND pairs
    for (let i = 0; i < 4; i++) {
        const x = -W / 2 + 0.7 + ((i + 0.5) * (W - 1.4)) / 4 - 0.5;
        metal.box(0.36, 0.22, D - 0.8, x, T, 0, 'mid');
        metal.box(0.36, 0.22, D - 0.8, x + 0.75, T, 0, 'mid');
    }
    // I/O pins along the back edge
    const pins = 27;
    for (let i = 0; i < pins; i++) {
        const x = -8.4 + i * 0.62 + (i >= 8 ? 0.5 : 0) + (i >= 16 ? 0.5 : 0) + (i >= 24 ? 0.5 : 0);
        metal.box(0.26, 0.2, 0.9, x, T, -D / 2 + 0.45, 'mid');
    }
    // the H-tree, raised to the top metal, and its trunk from the clk pin
    const y = T + 0.3;
    const tree = (cx: number, cz: number, hw: number, hd: number, lvl: number, horiz: boolean) => {
        if (lvl > 4) return;
        if (horiz) {
            metal.seg([cx - hw, y, cz], [cx + hw, y, cz], lvl === 0 ? 'hot' : 'mid');
            tree(cx - hw, cz, hw, hd, lvl + 1, false);
            tree(cx + hw, cz, hw, hd, lvl + 1, false);
        } else {
            metal.seg([cx, y, cz - hd], [cx, y, cz + hd], 'mid');
            tree(cx, cz - hd, hw / 2, hd / 2, lvl + 1, true);
            tree(cx, cz + hd, hw / 2, hd / 2, lvl + 1, true);
        }
    };
    tree(0, 0, W * 0.21, D * 0.2, 0, true);
    const clkX = -8.4 + 24 * 0.62 + 1.5;
    metal.poly(
        [
            [clkX, y, -D / 2 + 0.9],
            [clkX, y, -D / 2 + 2.2],
            [0, y, -D / 2 + 2.2],
            [0, y, 0],
        ],
        'hot'
    );

    return {
        id: 'cleave',
        layers: [
            { name: 'die', label: 'Die', note: 'sky130 · cell rows', b: die, explode: [0, 0, 0], anchor: [-W / 2 + 2.5, T, D / 2 - 2.5] },
            { name: 'metal', label: 'Metal', note: 'Straps · pins · clock tree', b: metal, explode: [0, 7, 0], anchor: [W / 2 - 4, T + 0.3, -D / 2 + 3] },
        ],
        anchor: [0, T + 0.3, 0],
        radius: 16,
    };
}

/* ---------------------------------------------------------------------------
   NERONA — the board, its parts, and the camera on its flex
   --------------------------------------------------------------------------- */
export function neronaModel(): Model {
    const board = new Builder();
    board.slab(50, 38, 2.4, 1.6, 0, 0, 0, 'edge');
    const top = 1.61;
    for (const [x, z] of [
        [-21.5, -15.5],
        [21.5, -15.5],
        [-21.5, 15.5],
        [21.5, 15.5],
    ] as const) {
        board.ring(x, top, z, 1.6, 'mid', 28);
        board.ring(x, top, z, 2.6, 'faint', 28);
    }
    // CSI-2 pairs: J1 → U1, with a jog; the memory buses splaying out of U1
    const pair = (z0: number, z1: number) => {
        for (const dz of [0, 0.5]) {
            board.poly(
                [
                    [-20.4, top, z0 + dz],
                    [-17, top, z0 + dz],
                    [-15, top, z1 + dz],
                    [-12.1, top, z1 + dz],
                ],
                'fine'
            );
        }
    };
    pair(-2.6, -5);
    pair(-0.25, -0.25);
    pair(2.1, 4.5);
    for (let i = 0; i < 6; i++) {
        board.poly([[2.1, top, -6 + i * 0.7], [4.4, top, -6 + i * 0.7], [6.2, top, -10.6 + i * 0.7], [7.9, top, -10.6 + i * 0.7]], 'faint');
        board.poly([[2.1, top, 2.4 + i * 0.7], [4.4, top, 2.4 + i * 0.7], [6.2, top, 5.8 + i * 0.7], [7.9, top, 5.8 + i * 0.7]], 'faint');
    }

    const parts = new Builder();
    parts.box(14, 1.1, 14, -5, 1.6, 0, 'edge'); // U1 — STM32N6
    parts.ring(-10.8, 2.71, -5.8, 0.45, 'mid', 16);
    for (let i = 0; i < 9; i++) {
        parts.box(1, 0.5, 0.5, -10.8 + i * 1.45, 1.6, -9.3, 'mid');
        parts.box(1, 0.5, 0.5, -10.8 + i * 1.45, 1.6, 9.3, 'mid');
    }
    parts.box(6, 0.9, 7.5, 11, 1.6, -8.3, 'edge'); // U2
    parts.box(6, 0.9, 7.5, 11, 1.6, 8.3, 'edge'); // U3
    parts.box(4, 0.9, 4, -9, 1.6, 15, 'edge'); // U4 — regulator
    parts.box(4.6, 2.8, 4.6, -3, 1.6, 15, 'edge'); // L1
    parts.box(4.6, 2.8, 4.6, 2.6, 1.6, 15, 'edge'); // L2
    for (let i = 0; i < 3; i++) parts.box(2, 1.2, 1.3, 8.6 + i * 2.7, 1.6, 15.6, 'mid');
    parts.box(4, 1.4, 12, -22.5, 1.6, 0, 'edge'); // J1 — CSI-2 connector

    const cam = new Builder();
    const cx = -37;
    cam.box(8.5, 4.4, 8.5, cx, 0, 0, 'edge');
    cam.cylinder(3.3, 3, cx, 4.4, 0, 'edge');
    cam.ring(cx, 7.41, 0, 2.2, 'mid', 36);
    cam.ring(cx, 7.41, 0, 1.1, 'hot', 28);
    // the flex: J1 → camera, a ribbon that arcs over the gap
    for (const z of [-2.8, 2.8]) {
        cam.poly(bezier([-22.5, 3.0, z], [-26.5, 7.5, z], [-29.5, 5.4, z], [cx + 4.25, 2.2, z]), 'mid');
    }
    for (const z of [-1.4, 0, 1.4]) {
        cam.poly(bezier([-22.5, 3.0, z], [-26.5, 7.5, z], [-29.5, 5.4, z], [cx + 4.25, 2.2, z]), 'faint');
    }
    cam.seg([-22.5, 3.0, -2.8], [-22.5, 3.0, 2.8], 'mid');
    cam.seg([cx + 4.25, 2.2, -2.8], [cx + 4.25, 2.2, 2.8], 'mid');

    return {
        id: 'nerona',
        layers: [
            { name: 'board', label: 'Board', note: 'KiCad · SI / EMC rules', b: board, explode: [0, 0, 0], anchor: [19, 1.6, 15] },
            { name: 'parts', label: 'Parts', note: 'STM32N6 · memory · power', b: parts, explode: [0, 6, 0], anchor: [-11.5, 2.7, 6.5] },
            { name: 'camera', label: 'Camera', note: 'MIPI CSI-2', b: cam, explode: [-6, 3, 0], anchor: [-37, 7.4, 0] },
        ],
        anchor: [-5, 2.7, 0],
        radius: 34,
    };
}

/* ---------------------------------------------------------------------------
   AZIMUTH — the board with its compass rose, the sensors, the module
   --------------------------------------------------------------------------- */
export function azimuthModel(): Model {
    const board = new Builder();
    board.slab(56, 34, 2.2, 1.6, 0, 0, 0, 'edge');
    const top = 1.61;
    for (const [x, z] of [
        [-25.2, -14.2],
        [25.2, -14.2],
        [-25.2, 14.2],
        [25.2, 14.2],
    ] as const) {
        board.ring(x, top, z, 1.5, 'mid', 28);
    }
    // the compass rose on the silkscreen, around the IMU
    const rx = -2;
    const rz = 7;
    board.ring(rx, top, rz, 7.4, 'mid', 72);
    for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        const len = i % 18 === 0 ? 1.5 : i % 6 === 0 ? 0.9 : 0.45;
        const ink: Ink = i === 0 ? 'hot' : i % 6 === 0 ? 'fine' : 'faint';
        board.seg(
            [rx + Math.sin(a) * 7.4, top, rz - Math.cos(a) * 7.4],
            [rx + Math.sin(a) * (7.4 - len), top, rz - Math.cos(a) * (7.4 - len)],
            ink
        );
    }
    // RF line, patch → receiver; SPI and UART to the module
    board.seg([-8, top, -6.6], [-6.5, top, -6.6], 'mid').seg([-8, top, -5.8], [-6.5, top, -5.8], 'mid');
    for (let i = 0; i < 4; i++) board.poly([[-0.5, top, 6 + i * 0.5], [2.5, top, 6 + i * 0.5], [7.9, top, 0.6 + i * 0.5]], 'faint');
    for (let i = 0; i < 2; i++) board.poly([[2.5, top, -10 + i * 0.6], [5, top, -10 + i * 0.6], [7.9, top, -12.5 + i * 0.6]], 'faint');

    const parts = new Builder();
    // ESP32-S3 module: carrier, shield can, printed antenna over the edge keep-out
    parts.box(18, 0.8, 25.5, 17, 1.6, -4.25, 'edge');
    parts.box(16.6, 2.4, 18, 17, 2.4, -1.5, 'edge');
    const ay = 2.41;
    const meander: V3[] = [[9.6, ay, -12]];
    for (let i = 0; i < 6; i++) {
        const x = 9.6 + i * 2.4;
        meander.push([x, ay, -16], [x + 1.2, ay, -16], [x + 1.2, ay, -12.6], [x + 2.4, ay, -12.6]);
    }
    parts.poly(meander, 'mid');
    // GNSS: ceramic patch with its electrode and feed, and the receiver
    parts.box(16, 4, 16, -16, 1.6, -6, 'edge');
    parts.rect(-16, 5.61, -6, 11, 11, 'mid');
    parts.cylinder(0.6, 0.8, -16, 5.6, -7.4, 'hot');
    parts.box(9, 2, 9, -2, 1.6, -9, 'edge');
    // IMU at the centre of the rose, magnetometer off on its own, power at the edge
    parts.box(3, 1, 3, rx, 1.6, rz, 'edge');
    parts.box(2.2, 0.9, 2.2, -20, 1.6, 11, 'edge');
    parts.box(9, 3.2, 7, 7, 1.6, 13.6, 'edge');
    parts.box(2.6, 1, 2.6, 15, 1.6, 12.5, 'mid');

    return {
        id: 'azimuth',
        layers: [
            { name: 'board', label: 'Board', note: 'Compass rose · traces', b: board, explode: [0, 0, 0], anchor: [-2, 1.61, 14.4] },
            { name: 'parts', label: 'Parts', note: 'GNSS · IMU · magnetometer · ESP32-S3', b: parts, explode: [0, 6, 0], anchor: [-16, 5.6, -6] },
        ],
        anchor: [-16, 5.6, -6],
        radius: 34,
    };
}

export const MODELS: Record<string, () => Model> = {
    cleave: cleaveModel,
    nerona: neronaModel,
    azimuth: azimuthModel,
};

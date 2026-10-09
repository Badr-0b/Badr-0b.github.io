/* AZIMUTH — the ESP32-S3 navigation board (plan view): a GNSS patch and receiver on a
   short stitched RF line, the IMU at the board's centre inside a compass rose on the
   silkscreen, the magnetometer kept away from the power path, and the module's
   antenna over a keep-out at the board edge. */

import type { Box, Drawing, Label, Layer, Part } from './types';
import { circle, dot, hatch, line, offset, padRow, poly, rect, rectB, route45, ticks, type Pt } from './primitives';
import { BOARD_STAGES, fiducials, grow, holes, outlineOf, pourEdge, stitching, type BoardFrame } from './board';

const board: BoardFrame = { x: 48, y: 40, w: 544, h: 360, r: 16 };
const MOD: Box = { x: 448, y: 40, w: 108, h: 153 };
const CAN: Box = { x: 454, y: 86, w: 96, h: 101 };
const KEEP: Box = { x: 448, y: 40, w: 108, h: 40 };
const ANT: Box = { x: 86, y: 98, w: 90, h: 90 };
const U2: Box = { x: 206, y: 119, w: 48, h: 48 };
const IMU: Box = { x: 299, y: 251, w: 22, h: 22 };
const MAG: Box = { x: 140, y: 300, w: 18, h: 18 };
const J1: Box = { x: 392, y: 380, w: 48, h: 20 };
const U5: Box = { x: 470, y: 316, w: 22, h: 22 };

/** The compass rose's centre (the IMU) and radius — exported for the bearing overlay. */
export const ROSE = { cx: 310, cy: 262, r: 74 };

function build(): Drawing {
    const layers: Layer[] = [];
    const labels: Label[] = [];

    /* ---- 0 · outline ---- */
    const h = holes([
        [70, 62],
        [570, 62],
        [70, 378],
        [570, 378],
    ]);
    const f = fiducials([
        [100, 62],
        [540, 378],
    ]);
    layers.push({ stage: 0, ink: 'edge', draw: true, d: [outlineOf(board)] });
    layers.push({ stage: 0, ink: 'mid', at: 0.4, d: h.hole });
    layers.push({ stage: 0, ink: 'faint', at: 0.5, d: h.ring + f.ring });
    layers.push({ stage: 0, ink: 'dot', at: 0.6, d: f.dot });
    // the antenna keep-out is a board-level decision, made before anything is placed
    layers.push({ stage: 0, ink: 'faint', at: 0.7, d: hatch(KEEP, 7) });
    layers.push({ stage: 0, ink: 'dash', at: 0.7, d: rectB(KEEP) });

    /* ---- 1 · placement ---- */
    // GNSS patch: ceramic body, electrode, feed point
    layers.push({ stage: 1, ink: 'mid', drop: true, d: rectB(ANT) });
    layers.push({ stage: 1, ink: 'fine', drop: true, d: rect(ANT.x + 12, ANT.y + 12, ANT.w - 24, ANT.h - 24) });
    layers.push({ stage: 1, ink: 'hot', drop: true, at: 0.05, d: circle(ANT.x + ANT.w / 2, ANT.y + ANT.h / 2 - 7, 3.5) });

    // GNSS receiver
    const quad = (b: Box, count: number, pitch: number, len: number) => {
        const o = (b.w - (count - 1) * pitch) / 2;
        return (
            padRow(b.x + o, b.y, count, pitch, len, 'top') +
            padRow(b.x + o, b.y + b.h, count, pitch, len, 'bottom') +
            padRow(b.x, b.y + o, count, pitch, len, 'left') +
            padRow(b.x + b.w, b.y + o, count, pitch, len, 'right')
        );
    };
    layers.push({ stage: 1, ink: 'mid', drop: true, at: 0.2, d: rectB(U2) });
    layers.push({ stage: 1, ink: 'fine', drop: true, at: 0.2, d: quad(U2, 5, 8, 5) });

    // IMU at the centre of the board, magnetometer away from the power path
    layers.push({ stage: 1, ink: 'mid', drop: true, at: 0.35, d: rectB(IMU) + rectB(MAG) });
    layers.push({ stage: 1, ink: 'fine', drop: true, at: 0.35, d: quad(IMU, 4, 4.4, 3) + quad(MAG, 3, 4.6, 3) });

    // the ESP32-S3 module: carrier, shield can, castellations, the printed antenna
    let castell = '';
    for (let i = 0; i < 15; i++) {
        const y = 92 + i * 6.3;
        castell += line(MOD.x, y, MOD.x + 6, y) + line(MOD.x + MOD.w, y, MOD.x + MOD.w - 6, y);
    }
    for (let i = 0; i < 13; i++) castell += line(460 + i * 7.3, MOD.y + MOD.h, 460 + i * 7.3, MOD.y + MOD.h - 6);
    const meander: Pt[] = [[462, 76]];
    for (let i = 0; i < 7; i++) {
        const x = 462 + i * 12;
        meander.push([x, 50], [x + 6, 50], [x + 6, 70], [x + 12, 70]);
    }
    layers.push({ stage: 1, ink: 'mid', drop: true, at: 0.5, d: rectB(MOD) + rectB(CAN) });
    layers.push({ stage: 1, ink: 'fine', drop: true, at: 0.5, d: castell });
    layers.push({ stage: 1, ink: 'trace', drop: true, at: 0.55, d: poly(meander) });

    // power: input connector, regulator, its capacitors
    layers.push({
        stage: 1,
        ink: 'mid',
        drop: true,
        at: 0.7,
        d: rectB(J1) + rectB(U5) + rect(500, 317, 9, 4.5) + rect(500, 330, 9, 4.5),
    });
    layers.push({ stage: 1, ink: 'fine', drop: true, at: 0.7, d: padRow(J1.x + 6, J1.y, 9, 4.5, 4, 'top') });

    /* ---- 2 · routing ---- */
    // RF: a short line from the patch to the receiver, stitched both sides
    let rfVias = '';
    for (let x = 180; x <= 202; x += 5.5) rfVias += circle(x, 135, 1.5) + circle(x, 152, 1.5);
    layers.push({ stage: 2, ink: 'hot', draw: true, d: [line(ANT.x + ANT.w, 141, U2.x, 141), line(ANT.x + ANT.w, 146, U2.x, 146)] });
    layers.push({ stage: 2, ink: 'via', at: 0.2, d: rfVias });

    // SPI: IMU → module; UART: receiver → module; I2C: magnetometer → module
    const spi = [0, 1, 2, 3].map((i) => poly(route45([IMU.x + IMU.w + 3, 255.5 + i * 4.4], [MOD.x, 155 + i * 6.3], 0.5)));
    const uart = [0, 1].map((i) => poly(route45([U2.x + U2.w + 5, 137 + i * 6], [MOD.x, 98.3 + i * 6.3], 0.55)));
    const i2cA: Pt[] = [
        [MAG.x + MAG.w + 3, 305],
        [400, 305],
        [460, 245],
        [460, 199],
    ];
    const i2c = [poly(i2cA), poly(offset(i2cA, 6.3))];
    layers.push({ stage: 2, ink: 'trace', draw: true, at: 0.3, d: [...spi, ...uart, ...i2c] });

    // power runs
    layers.push({
        stage: 2,
        ink: 'wide',
        at: 0.6,
        d: poly([[416, 380], [416, 362], [448, 330], [U5.x, 330]]) + poly([[U5.x + U5.w, 327], [540, 327], [540, 199]]),
    });

    /* ---- 3 · pour ---- */
    const keep: Box[] = [
        grow(MOD, 10),
        grow(ANT, 12),
        grow(U2, 12),
        { x: 176, y: 128, w: 32, h: 30 },
        { x: ROSE.cx - ROSE.r - 6, y: ROSE.cy - ROSE.r - 6, w: (ROSE.r + 6) * 2, h: (ROSE.r + 6) * 2 },
        grow(MAG, 12),
        { x: 380, y: 300, w: 180, h: 100 },
        { x: 150, y: 296, w: 330, h: 18 },
        { x: 320, y: 140, w: 140, h: 140 },
        { x: 40, y: 40, w: 90, h: 50 },
        { x: 40, y: 350, w: 90, h: 60 },
    ];
    layers.push({ stage: 3, ink: 'dash', d: pourEdge(board, 5) });
    layers.push({
        stage: 3,
        ink: 'via',
        at: 0.3,
        d: stitching({ x: board.x + 20, y: board.y + 20, w: board.w - 40, h: board.h - 40 }, 24, keep),
        minW: 360,
    });

    /* ---- 4 · silkscreen: the compass rose around the IMU, and refdes ---- */
    const { cx, cy, r } = ROSE;
    layers.push({ stage: 4, ink: 'mid', draw: true, d: [circle(cx, cy, r)] });
    layers.push({
        stage: 4,
        ink: 'fine',
        at: 0.2,
        d: ticks(cx, cy, r, 72, (i) => (i % 18 === 0 ? 14 : i % 6 === 0 ? 9 : 4.5)),
    });
    layers.push({ stage: 4, ink: 'mid', at: 0.3, d: dot(IMU.x - 5, IMU.y - 5) + dot(U2.x - 6, U2.y - 6) + dot(MAG.x - 5, MAG.y - 5) });
    const silk = (x: number, y: number, text: string, anchor: Label['anchor'] = 'middle', ink: Label['ink'] = 'mid', minW?: number) =>
        labels.push({ x, y, text, stage: 4, size: 8.5, ink, anchor, minW });
    silk(cx, cy - r - 8, 'N', 'middle', 'hot');
    silk(cx + r + 10, cy + 3, 'E', 'start', 'faint', 380);
    silk(cx, cy + r + 15, 'S', 'middle', 'faint', 380);
    silk(cx - r - 10, cy + 3, 'W', 'end', 'faint', 380);
    silk(CAN.x + CAN.w / 2, CAN.y + CAN.h / 2 + 3, 'ESP32-S3');
    silk(MOD.x + 4, MOD.y + MOD.h + 16, 'U1', 'start');
    silk(ANT.x + ANT.w / 2, ANT.y + ANT.h + 15, 'ANT1');
    silk(U2.x + U2.w / 2, U2.y + U2.h + 17, 'U2 · GNSS');
    silk(IMU.x + IMU.w / 2, IMU.y + IMU.h + 15, 'U3', 'middle', 'mid', 380);
    silk(MAG.x + MAG.w / 2, MAG.y + MAG.h + 15, 'U4 · MAG');
    silk(J1.x + J1.w / 2, J1.y - 9, 'J1', 'middle', 'mid', 380);
    labels.push({ x: 72, y: 394, text: 'AZIMUTH · REV A', stage: 4, size: 8.5, ink: 'faint', minW: 380 });

    const parts: Part[] = [
        {
            id: 'ant',
            name: 'ANT1',
            note: 'GNSS patch antenna',
            stage: 1,
            d: rectB(ANT),
            hit: ANT,
            anchor: [ANT.x + ANT.w / 2, ANT.y],
            balloon: [ANT.x + ANT.w / 2, 18],
        },
        {
            id: 'gnss',
            name: 'U2',
            note: 'GNSS receiver — position',
            stage: 1,
            d: rectB(U2),
            hit: grow(U2, 6),
            anchor: [U2.x + U2.w / 2, U2.y],
            balloon: [U2.x + U2.w / 2, 18],
        },
        {
            id: 'imu',
            name: 'U3',
            note: 'IMU — accelerometer for tilt correction, gyroscope for smoothing',
            stage: 1,
            d: rectB(IMU),
            hit: grow(IMU, 8),
            anchor: [cx, cy + IMU.h / 2],
            balloon: [cx, 424],
        },
        {
            id: 'mag',
            name: 'U4',
            note: 'Magnetometer — heading',
            stage: 1,
            d: rectB(MAG),
            hit: grow(MAG, 8),
            anchor: [MAG.x, MAG.y + MAG.h / 2],
            balloon: [22, MAG.y + MAG.h / 2],
        },
        {
            id: 'esp',
            name: 'U1',
            note: 'ESP32-S3 — runs the fusion',
            stage: 1,
            d: rectB(MOD),
            hit: MOD,
            anchor: [MOD.x + MOD.w, CAN.y + CAN.h / 2],
            balloon: [618, CAN.y + CAN.h / 2],
        },
        {
            id: 'pwr',
            name: 'J1',
            note: 'Power input and regulation',
            stage: 1,
            d: rectB(J1) + rectB(U5),
            hit: { x: J1.x - 4, y: U5.y - 6, w: U5.x + U5.w - J1.x + 24, h: J1.y + J1.h - U5.y + 6 },
            anchor: [J1.x + J1.w, J1.y + J1.h / 2],
            balloon: [618, J1.y + J1.h / 2],
        },
    ];

    return {
        id: 'azimuth',
        w: 640,
        h: 440,
        stages: BOARD_STAGES,
        layers,
        parts,
        labels,
        title: 'Plan view of the AZIMUTH board: a GNSS patch and receiver on a stitched RF line, the IMU at the centre of a compass rose, the magnetometer, and the ESP32-S3 module over an antenna keep-out.',
    };
}

export const azimuth = build();

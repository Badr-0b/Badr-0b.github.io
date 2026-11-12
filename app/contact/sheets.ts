/* ===========================================================================
   The brief's own sheets — the drawings /contact needs that the kit has no
   fallback for: firmware (a block diagram, built the way bring-up goes) and the
   calendar a role is placed on. Same vocabulary as app/kit/draw: hairline inks,
   build stages, deterministic paths from a seed.
   =========================================================================== */

import type { Box, Drawing, Label, Layer } from '../kit/draw/types';
import { circle, dot, hash, line, padRow, poly, rect, rectB, rng, route45 } from '../kit/draw/primitives';

export const FIRMWARE_STAGES = ['contact.build.bringup', 'contact.build.drivers', 'contact.build.logic', 'contact.build.test'];

/** Firmware on a microcontroller: core and clock, the drivers around it, the logic wiring them, test points. */
export function firmwareSheet(seed: string, title: string): Drawing {
    const R = rng(hash(seed));
    const layers: Layer[] = [];
    const labels: Label[] = [];
    const mcu: Box = { x: R.range(118, 150), y: R.range(118, 134), w: 184, h: 184 };
    const core: Box = { x: mcu.x + 42, y: mcu.y + 42, w: 100, h: 100 };

    // 0 · bring-up — the part, its pins, the core and the clock
    const pins =
        padRow(mcu.x + 14, mcu.y, 12, 14, 8, 'top') +
        padRow(mcu.x + 14, mcu.y + mcu.h, 12, 14, 8, 'bottom') +
        padRow(mcu.x, mcu.y + 14, 12, 14, 8, 'left') +
        padRow(mcu.x + mcu.w, mcu.y + 14, 12, 14, 8, 'right');
    layers.push({ stage: 0, ink: 'edge', draw: true, d: [rectB(mcu)] });
    layers.push({ stage: 0, ink: 'fine', at: 0.35, d: pins });
    layers.push({ stage: 0, ink: 'mid', at: 0.55, d: rectB(core) });
    const xt: Box = { x: mcu.x - 66, y: mcu.y + 82, w: 24, h: 14 };
    layers.push({
        stage: 0,
        ink: 'mid',
        at: 0.7,
        d: rectB(xt) + line(xt.x + xt.w, xt.y + 4, mcu.x - 8, xt.y + 4) + line(xt.x + xt.w, xt.y + 10, mcu.x - 8, xt.y + 10),
    });
    labels.push({ x: core.x + 8, y: core.y + 16, text: 'MCU', stage: 0, size: 8.5, ink: 'mid' });
    labels.push({ x: xt.x, y: xt.y - 8, text: 'Y1', stage: 0, size: 8.5, ink: 'faint' });

    // 1 · drivers — the peripherals the firmware talks to, down the right
    const pool = ['SPI', 'I2C', 'UART', 'ADC', 'GPIO', 'PWM', 'USB', 'CAN', 'DMA'];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(R.next() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const names = pool.slice(0, 5);
    const px = 432;
    const boxes: Box[] = names.map((_, i) => ({ x: px, y: 76 + i * 62, w: 112, h: 34 }));
    layers.push({ stage: 1, ink: 'mid', drop: true, d: boxes.map((b) => rectB(b)) });
    boxes.forEach((b, i) => labels.push({ x: b.x + 10, y: b.y + 21, text: names[i], stage: 1, size: 8.5, ink: 'mid' }));

    // 2 · logic — the wiring from the pins out, and the state machine in the core
    const traces = boxes.map((b, i) =>
        poly(route45([mcu.x + mcu.w + 8, mcu.y + 14 + (i * 2 + 1) * 14], [b.x, b.y + b.h / 2], 0.45))
    );
    layers.push({ stage: 2, ink: 'trace', draw: true, d: traces });
    const cx = core.x + core.w / 2;
    const cy = core.y + core.h / 2 + 6;
    const s: [number, number][] = [
        [cx - 24, cy - 14],
        [cx + 24, cy - 14],
        [cx, cy + 24],
    ];
    layers.push({
        stage: 2,
        ink: 'fine',
        at: 0.4,
        draw: true,
        d: [
            circle(s[0][0], s[0][1], 8),
            circle(s[1][0], s[1][1], 8),
            circle(s[2][0], s[2][1], 8),
            line(s[0][0] + 8, s[0][1], s[1][0] - 8, s[1][1]),
            line(s[1][0] - 4, s[1][1] + 7, s[2][0] + 5, s[2][1] - 7),
            line(s[2][0] - 5, s[2][1] - 7, s[0][0] + 4, s[0][1] + 7),
        ],
    });

    // 3 · test — probe points at every driver, the scope of the test, the one that matters
    let tps = '';
    boxes.forEach((b) => (tps += dot(b.x - 14, b.y + b.h / 2)));
    layers.push({ stage: 3, ink: 'dot', d: tps });
    layers.push({ stage: 3, ink: 'dash', at: 0.25, d: rect(mcu.x - 84, 52, px + 112 + 22 - (mcu.x - 84), 352) });
    const hot = boxes[R.int(0, boxes.length - 1)];
    layers.push({ stage: 3, ink: 'hot', at: 0.5, d: circle(hot.x - 14, hot.y + hot.h / 2, 7) });
    labels.push({ x: mcu.x - 84, y: 420, text: `${title.toUpperCase()} · FW REV A`, stage: 3, size: 8.5, ink: 'faint' });

    return { id: `fw-${seed}`, w: 640, h: 440, stages: FIRMWARE_STAGES, layers, parts: [], labels, title };
}

/* ---------------------------------------------------------------------------
   The calendar — twelve months from now on a rail. The window a role would take
   is not part of the drawing: it's an overlay (see Sheet), so changing an answer
   moves the window without redrawing the calendar.
   --------------------------------------------------------------------------- */

export const CALENDAR_STAGES = ['contact.build.calendar', 'contact.build.months', 'contact.build.window'];
export const CAL = { x0: 64, x1: 576, axis: 306, top: 118, months: 12 };
export const monthX = (offset: number) => CAL.x0 + ((CAL.x1 - CAL.x0) * offset) / CAL.months;

const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function calendarSheet(from: Date, title: string): Drawing {
    const layers: Layer[] = [];
    const labels: Label[] = [];
    const m0 = from.getMonth();
    const y0 = from.getFullYear();

    layers.push({ stage: 0, ink: 'edge', draw: true, d: [line(CAL.x0, CAL.axis, CAL.x1, CAL.axis)] });
    let ticks = '';
    let yearTicks = '';
    for (let i = 0; i <= CAL.months; i++) {
        const x = monthX(i);
        if ((m0 + i) % 12 === 0) yearTicks += line(x, CAL.axis, x, CAL.axis + 18);
        else ticks += line(x, CAL.axis, x, CAL.axis + 8);
    }
    layers.push({ stage: 0, ink: 'mid', at: 0.4, d: ticks });
    layers.push({ stage: 0, ink: 'edge', at: 0.5, d: yearTicks || line(CAL.x0, CAL.axis, CAL.x0, CAL.axis + 18) });

    const grid: string[] = [];
    for (let i = 0; i <= CAL.months; i++) grid.push(line(monthX(i), CAL.top, monthX(i), CAL.axis - 6));
    layers.push({ stage: 1, ink: 'faint', d: grid });
    for (let i = 0; i < CAL.months; i++) {
        const m = (m0 + i) % 12;
        labels.push({ x: (monthX(i) + monthX(i + 1)) / 2, y: CAL.axis + 26, text: MON[m], stage: 1, size: 8.5, ink: 'mid', anchor: 'middle' });
        if (m === 0 || i === 0) {
            labels.push({ x: monthX(i) + 4, y: CAL.axis + 44, text: String(y0 + Math.floor((m0 + i) / 12)), stage: 1, size: 8.5, ink: 'faint' });
        }
    }

    // today, to the day
    const days = new Date(y0, m0 + 1, 0).getDate();
    const nx = monthX((from.getDate() - 1) / days);
    layers.push({ stage: 2, ink: 'hot', d: line(nx, CAL.top - 10, nx, CAL.axis) + dot(nx, CAL.axis) });
    labels.push({ x: nx + 6, y: CAL.top - 2, text: 'NOW', stage: 2, size: 8.5, ink: 'hot' });
    layers.push({ stage: 2, ink: 'dash', at: 0.3, d: line(CAL.x0, 226, CAL.x1, 226) });
    labels.push({ x: CAL.x0, y: 420, text: `${title.toUpperCase()} · SCHEDULE`, stage: 2, size: 8.5, ink: 'faint' });

    return { id: `cal-${y0}-${m0}`, w: 640, h: 440, stages: CALENDAR_STAGES, layers, parts: [], labels, title };
}

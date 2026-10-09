/* ===========================================================================
   Board helpers — the parts every PCB plan view shares: outline, mounting holes,
   fiducials, a via fence along the edge, the pour boundary and its stitching.
   Boards are drawn in the order they're laid out: outline → placement →
   routing → pour → silkscreen.
   =========================================================================== */

import type { Box } from './types';
import { along, circle, dot, inside, rrect, rrectPts, type Pt } from './primitives';

export const BOARD_STAGES = [
    'kit.stage.outline',
    'kit.stage.place',
    'kit.stage.route',
    'kit.stage.pour',
    'kit.stage.silk',
];

export type BoardFrame = { x: number; y: number; w: number; h: number; r: number };

export const outlineOf = (b: BoardFrame) => rrect(b.x, b.y, b.w, b.h, b.r);

/** Plated mounting holes: the hole, and a faint keep-out ring around it. */
export function holes(pts: Pt[], r = 6) {
    return {
        hole: pts.map(([x, y]) => circle(x, y, r)).join(''),
        ring: pts.map(([x, y]) => circle(x, y, r + 5)).join(''),
    };
}

/** Fiducials: a copper dot inside a clear ring. */
export function fiducials(pts: Pt[]) {
    return {
        dot: pts.map(([x, y]) => dot(x, y)).join(''),
        ring: pts.map(([x, y]) => circle(x, y, 5.5)).join(''),
    };
}

/** Stitching vias every `step` along the board edge, inset — the EMC fence. */
export function viaFence(b: BoardFrame, inset: number, step: number, avoid: Box[] = [], r = 1.9) {
    const pts = along(rrectPts(b.x + inset, b.y + inset, b.w - inset * 2, b.h - inset * 2, Math.max(2, b.r - inset), 6), step);
    return pts
        .filter(([x, y]) => !inside(x, y, avoid))
        .map(([x, y]) => circle(x, y, r))
        .join('');
}

/** The copper pour's boundary — pulled back from the edge. */
export const pourEdge = (b: BoardFrame, inset: number) =>
    rrect(b.x + inset, b.y + inset, b.w - inset * 2, b.h - inset * 2, Math.max(2, b.r - inset));

/** A regular grid of stitching vias across the pour, clear of everything in `avoid`. */
export function stitching(area: Box, pitch: number, avoid: Box[], pad = 6) {
    let d = '';
    const cols = Math.floor(area.w / pitch);
    const rows = Math.floor(area.h / pitch);
    const ox = area.x + (area.w - cols * pitch) / 2;
    const oy = area.y + (area.h - rows * pitch) / 2;
    for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
            const x = ox + c * pitch;
            const y = oy + r * pitch;
            if (!inside(x, y, avoid, pad)) d += circle(x, y, 1.6);
        }
    }
    return d;
}

/** Grow a box on every side. */
export const grow = (b: Box, by: number): Box => ({ x: b.x - by, y: b.y - by, w: b.w + by * 2, h: b.h + by * 2 });

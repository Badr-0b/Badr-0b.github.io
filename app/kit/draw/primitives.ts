/* ===========================================================================
   Path primitives for the drawing kit. Everything returns SVG path data with
   coordinates rounded to 0.1 — deterministic, so the server render and the
   client render are byte-identical (no hydration drift), and compact.
   =========================================================================== */

import type { Box } from './types';

export type Pt = [number, number];

/** 0.1-unit rounding; never emits "-0". */
export const n = (v: number) => {
    const r = Math.round(v * 10) / 10;
    return (r === 0 ? 0 : r).toString();
};

export const rect = (x: number, y: number, w: number, h: number) =>
    `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}z`;

export const rectB = (b: Box) => rect(b.x, b.y, b.w, b.h);

/** Rounded rectangle. */
export function rrect(x: number, y: number, w: number, h: number, r: number) {
    const k = Math.min(r, w / 2, h / 2);
    return (
        `M${n(x + k)} ${n(y)}h${n(w - 2 * k)}a${n(k)} ${n(k)} 0 0 1 ${n(k)} ${n(k)}` +
        `v${n(h - 2 * k)}a${n(k)} ${n(k)} 0 0 1 ${n(-k)} ${n(k)}` +
        `h${n(-(w - 2 * k))}a${n(k)} ${n(k)} 0 0 1 ${n(-k)} ${n(-k)}` +
        `v${n(-(h - 2 * k))}a${n(k)} ${n(k)} 0 0 1 ${n(k)} ${n(-k)}z`
    );
}

export const circle = (cx: number, cy: number, r: number) =>
    `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0`;

/** A zero-length stroke — with round caps it renders as a dot (pads, balls, vias). */
export const dot = (x: number, y: number) => `M${n(x)} ${n(y)}h0`;

export const line = (x1: number, y1: number, x2: number, y2: number) =>
    `M${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}`;

export const poly = (pts: Pt[]) => 'M' + pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L');

export const closed = (pts: Pt[]) => poly(pts) + 'z';

/** Length of a polyline (for routing that should read as length-matched). */
export const lengthOf = (pts: Pt[]) =>
    pts.reduce((acc, p, i) => (i ? acc + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);

/**
 * Offset a polyline sideways by d (positive = to the left of travel), with mitred
 * joins — the second conductor of a differential pair.
 */
export function offset(pts: Pt[], d: number): Pt[] {
    const out: Pt[] = [];
    const norm = (a: Pt, b: Pt): Pt => {
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const l = Math.hypot(dx, dy) || 1;
        return [dy / l, -dx / l];
    };
    for (let i = 0; i < pts.length; i++) {
        if (i === 0) {
            const nn = norm(pts[0], pts[1]);
            out.push([pts[0][0] + nn[0] * d, pts[0][1] + nn[1] * d]);
        } else if (i === pts.length - 1) {
            const nn = norm(pts[i - 1], pts[i]);
            out.push([pts[i][0] + nn[0] * d, pts[i][1] + nn[1] * d]);
        } else {
            const a = norm(pts[i - 1], pts[i]);
            const b = norm(pts[i], pts[i + 1]);
            const mx = a[0] + b[0];
            const my = a[1] + b[1];
            const ml = Math.hypot(mx, my) || 1;
            const cos = (a[0] * b[0] + a[1] * b[1] + 1) / 2;
            const k = d / Math.sqrt(Math.max(cos, 0.1));
            out.push([pts[i][0] + (mx / ml) * k, pts[i][1] + (my / ml) * k]);
        }
    }
    return out;
}

/**
 * A trace from a to b that runs straight, turns 45°, and lands straight —
 * the way copper is routed. `bend` (0..1) places the diagonal along the run.
 */
export function route45(a: Pt, b: Pt, bend = 0.5, axis: 'x' | 'y' = 'x'): Pt[] {
    const [ax, ay] = a;
    const [bx, by] = b;
    if (axis === 'x') {
        const dy = by - ay;
        const run = bx - ax;
        const diag = Math.min(Math.abs(dy), Math.abs(run));
        if (diag < 0.05) return [a, b];
        const sx = Math.sign(run) || 1;
        const room = Math.abs(run) - diag;
        const x1 = ax + sx * room * bend;
        return [a, [x1, ay], [x1 + sx * diag, by], b];
    }
    const dx = bx - ax;
    const run = by - ay;
    const diag = Math.min(Math.abs(dx), Math.abs(run));
    if (diag < 0.05) return [a, b];
    const sy = Math.sign(run) || 1;
    const room = Math.abs(run) - diag;
    const y1 = ay + sy * room * bend;
    return [a, [ax, y1], [bx, y1 + sy * diag], b];
}

/** Serpentine (length-tuning meander) along a horizontal run, from x1 to x2 at y. */
export function serpentine(x1: number, x2: number, y: number, amp: number, pitch: number): Pt[] {
    const pts: Pt[] = [[x1, y]];
    const dir = Math.sign(x2 - x1) || 1;
    const count = Math.max(1, Math.floor(Math.abs(x2 - x1) / pitch));
    for (let i = 0; i < count; i++) {
        const x = x1 + dir * i * pitch;
        const up = i % 2 === 0 ? -amp : amp;
        pts.push([x, y + up], [x + dir * pitch, y + up]);
    }
    pts.push([x1 + dir * count * pitch, y], [x2, y]);
    return pts;
}

/** Radial ticks on a circle; len(i) gives each tick's length (0 = none). Angles from north, clockwise. */
export function ticks(cx: number, cy: number, r: number, count: number, len: (i: number) => number) {
    let d = '';
    for (let i = 0; i < count; i++) {
        const l = len(i);
        if (!l) continue;
        const a = (i / count) * Math.PI * 2;
        const sx = Math.sin(a);
        const sy = -Math.cos(a);
        d += line(cx + sx * r, cy + sy * r, cx + sx * (r - l), cy + sy * (r - l));
    }
    return d;
}

/**
 * An H-tree clock distribution filling a w × h region, one array entry per level (so
 * each level can draw on in turn). Every level lands on the centres of the quadrants
 * below it, so all sinks sit at equal wire length from the root.
 */
export function hTree(cx: number, cy: number, w: number, h: number, levels: number): string[][] {
    const out: string[][] = Array.from({ length: levels }, () => []);
    const walk = (x: number, y: number, hw: number, hh: number, lvl: number, horizontal: boolean) => {
        if (lvl >= levels) return;
        if (horizontal) {
            out[lvl].push(line(x - hw, y, x + hw, y));
            walk(x - hw, y, hw, hh, lvl + 1, false);
            walk(x + hw, y, hw, hh, lvl + 1, false);
        } else {
            out[lvl].push(line(x, y - hh, x, y + hh));
            walk(x, y - hh, hw / 2, hh / 2, lvl + 1, true);
            walk(x, y + hh, hw / 2, hh / 2, lvl + 1, true);
        }
    };
    walk(cx, cy, w / 4, h / 4, 0, true);
    return out;
}

/** Diagonal hatch clipped (approximately) to a box — keep-out zones. */
export function hatch(b: Box, step: number) {
    let d = '';
    for (let s = -b.h; s < b.w; s += step) {
        const x1 = Math.max(b.x, b.x + s);
        const y1 = b.y + (x1 - (b.x + s));
        const x2 = Math.min(b.x + b.w, b.x + s + b.h);
        const y2 = b.y + (x2 - (b.x + s));
        if (x2 - x1 > 0.5) d += line(x1, y1, x2, y2);
    }
    return d;
}

/** Pads along a side of a footprint: short strokes, perpendicular to the edge. */
export function padRow(
    x: number,
    y: number,
    count: number,
    pitch: number,
    len: number,
    side: 'top' | 'bottom' | 'left' | 'right'
) {
    let d = '';
    for (let i = 0; i < count; i++) {
        if (side === 'top') d += line(x + i * pitch, y, x + i * pitch, y - len);
        else if (side === 'bottom') d += line(x + i * pitch, y, x + i * pitch, y + len);
        else if (side === 'left') d += line(x, y + i * pitch, x - len, y + i * pitch);
        else d += line(x, y + i * pitch, x + len, y + i * pitch);
    }
    return d;
}

/** A grid of dots (BGA balls, stitching vias), skipping anything inside `avoid`. */
export function dotGrid(b: Box, pitch: number, avoid: Box[] = [], pad = 0) {
    let d = '';
    const cols = Math.floor(b.w / pitch);
    const rows = Math.floor(b.h / pitch);
    const ox = b.x + (b.w - cols * pitch) / 2;
    const oy = b.y + (b.h - rows * pitch) / 2;
    for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
            const x = ox + c * pitch;
            const y = oy + r * pitch;
            if (avoid.some((a) => x > a.x - pad && x < a.x + a.w + pad && y > a.y - pad && y < a.y + a.h + pad)) continue;
            d += dot(x, y);
        }
    }
    return d;
}

/** Points every `step` along a polyline (via fences, stitching along a run). */
export function along(pts: Pt[], step: number, startAt = step / 2): Pt[] {
    const out: Pt[] = [];
    let carry = startAt;
    for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1];
        const [bx, by] = pts[i];
        const seg = Math.hypot(bx - ax, by - ay);
        let t = carry;
        while (t <= seg) {
            out.push([ax + ((bx - ax) * t) / seg, ay + ((by - ay) * t) / seg]);
            t += step;
        }
        carry = t - seg;
    }
    return out;
}

/** Rounded-rectangle perimeter as points (for a via fence that follows the board edge). */
export function rrectPts(x: number, y: number, w: number, h: number, r: number, perArc = 4): Pt[] {
    const pts: Pt[] = [];
    const arc = (cx: number, cy: number, a0: number) => {
        for (let i = 0; i <= perArc; i++) {
            const a = a0 + (i / perArc) * (Math.PI / 2);
            pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
        }
    };
    arc(x + w - r, y + r, -Math.PI / 2);
    arc(x + w - r, y + h - r, 0);
    arc(x + r, y + h - r, Math.PI / 2);
    arc(x + r, y + r, Math.PI);
    pts.push(pts[0]);
    return pts;
}

/* ---------------------------------------------------------------------------
   Determinism
   --------------------------------------------------------------------------- */

/** String → 32-bit seed. */
export function hash(s: string) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

/** mulberry32 — small, fast, deterministic. */
export function rng(seed: number) {
    let a = seed >>> 0;
    const next = () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
        next,
        range: (lo: number, hi: number) => lo + (hi - lo) * next(),
        int: (lo: number, hi: number) => Math.floor(lo + (hi - lo + 1) * next()),
        pick: <T,>(arr: readonly T[]) => arr[Math.floor(next() * arr.length)],
        chance: (p: number) => next() < p,
    };
}

/** Is a point inside any of the boxes (with padding)? */
export const inside = (x: number, y: number, boxes: Box[], pad = 0) =>
    boxes.some((b) => x > b.x - pad && x < b.x + b.w + pad && y > b.y - pad && y < b.y + b.h + pad);

/** Split items into `count` bands by x, preserving order inside each band. */
export function bandsByX<T>(items: T[], xOf: (t: T) => number, x0: number, x1: number, count: number): T[][] {
    const out: T[][] = Array.from({ length: count }, () => []);
    for (const it of items) {
        const k = Math.min(count - 1, Math.max(0, Math.floor(((xOf(it) - x0) / (x1 - x0)) * count)));
        out[k].push(it);
    }
    return out;
}

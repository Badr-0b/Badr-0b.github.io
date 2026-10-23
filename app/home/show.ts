/* ===========================================================================
   The show — one scroll-driven state shared by the landing's DOM choreography
   and its 3D line-up. The page's controller writes it every frame; the scene
   reads it. The schedule splits the pinned work section into stations: a dwell
   at each artifact, a move along the rail between them, and a closing pull-back.
   =========================================================================== */

export type Rect = { x: number; y: number; w: number; h: number };

export type Show = {
    /** hero → first station, damped 0..1 (pinned only) */
    hp: number;
    /** the same, undamped — the scene damps its camera itself */
    hpT: number;
    /** raw scroll position over the hero, 0..1 — the flow layout's exit */
    hy: number;
    /** progress through the pinned work section, damped 0..1 */
    q: number;
    qT: number;
    /** scroll position past which the pinned stage has fully left the screen */
    trackEnd: number;
    /** pinned (wide screens, motion allowed, WebGL) or in flow */
    pinned: boolean;
    entered: boolean;
    enteredAt: number;
    /** the hero's viewport frame, in viewport pixels at scroll 0 */
    view: Rect;
    /** the pinned stage's frame */
    stage: Rect;
    /** where an artifact is centred while it is inspected */
    focus: { x: number; y: number; r: number };
    /** the scene could not start: the page falls back to the 2D plates */
    noGL: boolean;
    /** one artifact hovered from the page (a register entry), or -1 */
    hot: number;
};

export const initialShow = (): Show => ({
    hp: 0,
    hpT: 0,
    hy: 0,
    q: 0,
    qT: 0,
    trackEnd: 0,
    pinned: false,
    entered: false,
    enteredAt: 0,
    view: { x: 0, y: 0, w: 1, h: 1 },
    stage: { x: 0, y: 0, w: 1, h: 1 },
    focus: { x: 0, y: 0, r: 1 },
    noGL: false,
    hot: -1,
});

const W_DWELL = 2.2;
const W_MOVE = 1.2;
const W_END = 1.0;

export type Schedule = {
    n: number;
    dwell: number;
    move: number;
    end: number;
    /** [start, end] of each dwell */
    windows: [number, number][];
};

export function schedule(n: number): Schedule {
    const total = n * W_DWELL + Math.max(0, n - 1) * W_MOVE + W_END;
    const dwell = W_DWELL / total;
    const move = W_MOVE / total;
    const end = W_END / total;
    const windows: [number, number][] = [];
    for (let k = 0; k < n; k++) {
        const a = k * (dwell + move);
        windows.push([a, a + dwell]);
    }
    return { n, dwell, move, end, windows };
}

/**
 * Where the camera is along the line-up for progress q: `s` is a continuous
 * station index (whole numbers at a dwell), `out` the closing pull-back 0..1.
 */
export function stationAt(q: number, sc: Schedule) {
    const { n, dwell, move, windows } = sc;
    let s = n - 1;
    for (let k = 0; k < n; k++) {
        const [a, b] = windows[k];
        if (q <= b) {
            s = k;
            break;
        }
        if (k < n - 1 && q < b + move) {
            s = k + (q - b) / move;
            break;
        }
    }
    const last = windows[n - 1][1];
    const out = q > last ? Math.min(1, (q - last) / Math.max(1e-6, 1 - last)) : 0;
    return { s, out, current: Math.min(n - 1, Math.round(s)), dwell };
}

/** Scroll progress at the middle of station k's dwell — where the register jumps to. */
export const centreOf = (k: number, sc: Schedule) => (sc.windows[k][0] + sc.windows[k][1]) / 2;

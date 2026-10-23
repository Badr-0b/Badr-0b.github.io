'use client';

import React, { useEffect, useRef } from 'react';
import { damp, ease, onFrame, onMeasure, reducedMotion, span } from './motion';
import './kit.css';

/**
 * A figure on mechanical reels: each digit rolls, and a place only turns over as
 * the one below it passes nine — a counter, not a fade. Driven by the figure's
 * own position in the viewport (scroll-linked, damped), from `from` to `value`.
 * Leading zeros fall away and give their width back (only in the moment a place
 * empties), so the figure stays flush with its column in either direction.
 * Screen readers get the final figure; no-JS shows it.
 */
export default function Odometer({
    value,
    from = 0,
    digits,
    decimals = 0,
    window: win = [0.95, 0.58],
    suffix,
    onProgress,
}: {
    value: number;
    from?: number;
    /** whole-number places */
    digits: number;
    decimals?: number;
    /** roll window: the figure's top, as fractions of the viewport height */
    window?: [number, number];
    /** set after the figure, inside its left-to-right run (a Latin unit, a ratio) */
    suffix?: React.ReactNode;
    /** 0..1 as the reels run — for anything that rolls with them */
    onProgress?: (p: number) => void;
}) {
    const rootRef = useRef<HTMLSpanElement>(null);
    const reelRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const colRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const progressRef = useRef(onProgress);
    progressRef.current = onProgress;
    const places = digits + decimals;
    const scale = 10 ** decimals;
    const final = value.toFixed(decimals);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const reels = reelRefs.current;
        const cols = colRefs.current;
        const lastPos = new Float32Array(places).fill(-1);
        const lastOp = new Float32Array(places).fill(-1);
        let colW = 0;

        const show = (v: number) => {
            const n = Math.max(0, v * scale);
            for (let i = 0; i < places; i++) {
                const p = places - 1 - i; // place, 0 = least significant
                const unit = 10 ** p;
                let pos = (n / unit) % 10;
                if (p > 0) {
                    // whole steps, plus the carry rolling in as the place below passes 9
                    const below = (n % unit) / unit;
                    pos = Math.floor(pos) + (below > 0.9 ? (below - 0.9) * 10 : 0);
                }
                if (Math.abs(pos - lastPos[i]) > 0.002) {
                    lastPos[i] = pos;
                    const reel = reels[i];
                    if (reel) reel.style.transform = `translate3d(0, ${(-pos * (100 / 11)).toFixed(3)}%, 0)`;
                }
                // a leading place shows only once the number reaches it
                const lead = p >= decimals + 1;
                const op = lead ? span(n, unit * 0.92, unit) : 1;
                if (Math.abs(op - lastOp[i]) > 0.002) {
                    lastOp[i] = op;
                    const col = cols[i];
                    if (col) {
                        col.style.opacity = op.toFixed(3);
                        col.style.width = op >= 1 || !colW ? '' : `${(colW * op).toFixed(2)}px`;
                    }
                }
            }
        };
        const measureCols = () => {
            // the units place is always shown: it carries a column's natural width
            colW = cols[places - 1]?.offsetWidth ?? 0;
            lastOp.fill(-1);
        };

        if (reducedMotion()) {
            measureCols();
            show(value);
            progressRef.current?.(1);
            return;
        }

        let top = 0;
        let p = -1;
        let last = from;
        const offMeasure = onMeasure(() => {
            top = root.getBoundingClientRect().top + window.scrollY;
            measureCols();
            show(last);
        });
        const offFrame = onFrame(({ y, vh, dt }) => {
            const target = span(y, top - vh * win[0], top - vh * win[1]);
            const prev = p;
            p = p < 0 ? target : damp(p, target, 6, dt);
            if (prev >= 0 && Math.abs(p - prev) < 0.0002) return false;
            const e = ease(p);
            last = from + (value - from) * e;
            show(last);
            progressRef.current?.(e);
            return Math.abs(target - p) > 0.0004;
        });
        return () => {
            offFrame();
            offMeasure();
        };
    }, [value, from, places, decimals, scale, win[0], win[1]]);

    // server render: reels parked on the final figure (what no-JS shows)
    const finalDigits = Math.round(value * scale)
        .toString()
        .padStart(places, '0')
        .slice(-places)
        .split('')
        .map(Number);
    const firstShown = Math.max(0, finalDigits.findIndex((d, i) => d !== 0 || i >= digits - 1));

    return (
        <span className="k-odo" ref={rootRef}>
            <span className="k-sr">{final}</span>
            <span className="k-odo__track" aria-hidden="true">
            <span className="k-odo__reels">
                {finalDigits.map((d, i) => (
                    <React.Fragment key={i}>
                        {decimals > 0 && i === digits && <span className="k-odo__dot">.</span>}
                        <span
                            className="k-odo__col"
                            ref={(el) => {
                                colRefs.current[i] = el;
                            }}
                            style={i < firstShown ? { opacity: 0, width: 0 } : undefined}
                        >
                            <span
                                className="k-odo__reel"
                                ref={(el) => {
                                    reelRefs.current[i] = el;
                                }}
                                style={{ transform: `translate3d(0, ${(-d * (100 / 11)).toFixed(3)}%, 0)` }}
                            >
                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n, j) => (
                                    <span key={j}>{n}</span>
                                ))}
                            </span>
                        </span>
                    </React.Fragment>
                ))}
            </span>
            {suffix !== undefined && <span className="k-odo__suffix">{suffix}</span>}
            </span>
        </span>
    );
}

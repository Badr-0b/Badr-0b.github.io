'use client';

import React, { useEffect, useRef } from 'react';
import { onFrame, reducedMotion, wake } from './motion';

/**
 * A bearing needle on a drawing's compass rose — it turns toward the pointer and
 * reads out the azimuth (clockwise from north), damped so it swings with weight and
 * always takes the short way round. At rest it points north. Lives inside a <Plate>'s
 * SVG and appears once the drawing is complete.
 */
export default function Bearing({ cx, cy, r }: { cx: number; cy: number; r: number }) {
    const gRef = useRef<SVGGElement>(null);
    const needleRef = useRef<SVGGElement>(null);
    const readRef = useRef<SVGTextElement>(null);

    useEffect(() => {
        const g = gRef.current;
        const needle = needleRef.current;
        const read = readRef.current;
        const svg = g?.ownerSVGElement;
        if (!g || !needle || !read || !svg) return;
        const reduce = reducedMotion();
        let target = 0;
        let angle = 0;
        let shown = -1;

        const aim = (e: PointerEvent) => {
            const m = svg.getScreenCTM();
            if (!m) return;
            const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
            target = ((Math.atan2(p.x - cx, -(p.y - cy)) * 180) / Math.PI + 360) % 360;
            g.dataset.live = '';
            wake();
        };
        const rest = () => {
            target = 0;
            delete g.dataset.live;
            wake();
        };
        svg.addEventListener('pointermove', aim);
        svg.addEventListener('pointerdown', aim);
        svg.addEventListener('pointerleave', rest);

        const off = onFrame(({ dt }) => {
            const d = ((target - angle + 540) % 360) - 180; // shortest way round
            if (Math.abs(d) < 0.02) return false;
            angle = reduce ? target : (angle + d * (1 - Math.exp(-5.5 * dt)) + 360) % 360;
            needle.setAttribute('transform', `rotate(${angle.toFixed(2)} ${cx} ${cy})`);
            const deg = Math.round(angle) % 360;
            if (deg !== shown) {
                shown = deg;
                read.textContent = `AZ ${String(deg).padStart(3, '0')}°`;
            }
            return true;
        });

        return () => {
            off();
            svg.removeEventListener('pointermove', aim);
            svg.removeEventListener('pointerdown', aim);
            svg.removeEventListener('pointerleave', rest);
        };
    }, [cx, cy, r]);

    const tip = cy - r + 17;
    return (
        <g className="k-bearing" ref={gRef} aria-hidden="true">
            <g ref={needleRef}>
                <path className="k-bearing__needle" d={`M${cx} ${cy - 15}V${tip}`} />
                <path className="k-bearing__head" d={`M${cx - 4} ${tip + 8}L${cx} ${tip}L${cx + 4} ${tip + 8}`} />
            </g>
            <text ref={readRef} className="k-bearing__read" x={cx + r * 0.74 + 12} y={cy - r * 0.74 - 6}>
                AZ 000°
            </text>
        </g>
    );
}

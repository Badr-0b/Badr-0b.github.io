'use client';

import React, { useEffect, useRef } from 'react';
import { matches, onMeasure } from '../../kit/motion';

type Pt = { x: number; y: number };
type Kind = 'v' | 'd' | 'h';

/**
 * The page trace — the About page routed like a board. A single hairline leaves a pin
 * under the hero, jogs 45° into the margin, runs down through every section's via and
 * every node of the record, then turns (chamfered, as copper does) into the email row,
 * where it terminates on a pad. The route is laid out in full as a ghost; the scroll
 * "energises" it from the top (see useFront in AboutPage). Desktop only.
 *
 * Anchors are any [data-trace] elements, in DOM order:
 *   start · via · node (data-trace-future = not yet routed) · end
 */
export default function Trace({ scope }: { scope: React.RefObject<HTMLElement | null> }) {
    const layerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = scope.current;
        const layer = layerRef.current;
        if (!root || !layer) return;

        return onMeasure(() => {
            layer.replaceChildren();
            if (!matches('(min-width: 1024px)')) return;

            const box = root.getBoundingClientRect();
            const anchors = Array.from(root.querySelectorAll<HTMLElement>('[data-trace]'))
                .filter((el) => el.offsetParent !== null)
                .map((el) => {
                    const r = el.getBoundingClientRect();
                    return {
                        kind: el.dataset.trace ?? '',
                        future: el.hasAttribute('data-trace-future'),
                        x: r.left + r.width / 2 - box.left,
                        y: r.top + r.height / 2 - box.top,
                    };
                });
            const firstVia = anchors.find((a) => a.kind === 'via');
            if (!firstVia) return;
            const trunk = firstVia.x;
            const frag = document.createDocumentFragment();

            const seg = (kind: Kind, a: Pt, b: Pt, future = false) => {
                const el = document.createElement('span');
                el.className = `ab-trace__seg ab-trace__seg--${kind}${future ? ' is-future' : ''}`;
                if (!future) {
                    el.dataset.front = kind === 'h' ? 'hline' : 'line';
                    const fill = document.createElement('span');
                    fill.className = 'ab-trace__fill';
                    el.appendChild(fill);
                }
                if (kind === 'v') {
                    el.style.left = `${a.x}px`;
                    el.style.top = `${a.y}px`;
                    el.style.height = `${Math.max(0, b.y - a.y)}px`;
                } else if (kind === 'h') {
                    el.style.left = `${Math.min(a.x, b.x)}px`;
                    el.style.top = `${a.y}px`;
                    el.style.width = `${Math.abs(b.x - a.x)}px`;
                    if (b.x < a.x) el.classList.add('is-rev');
                } else {
                    el.style.left = `${a.x}px`;
                    el.style.top = `${a.y}px`;
                    el.style.height = `${Math.hypot(b.x - a.x, b.y - a.y)}px`;
                    el.style.transform = `rotate(${b.x > a.x ? -45 : 45}deg)`;
                }
                frag.appendChild(el);
            };

            let i = 0;
            let cur: Pt = { x: trunk, y: anchors[0].y };
            if (anchors[0].kind === 'start') {
                // leave the pin straight down, then a 45° jog into the margin
                const pin = anchors[0];
                const drop = { x: pin.x, y: pin.y + 14 };
                seg('v', pin, drop);
                const d = Math.abs(trunk - pin.x);
                const join = { x: trunk, y: drop.y + d };
                if (d > 0.5) seg('d', drop, join);
                cur = join;
                i = 1;
            }

            for (; i < anchors.length; i++) {
                const a = anchors[i];
                if (a.kind === 'end') {
                    // chamfered 90° turn into the row, terminating on its pad
                    const c = 10;
                    const dir = a.x >= trunk ? 1 : -1;
                    const turn = { x: trunk, y: a.y - c };
                    if (turn.y > cur.y) seg('v', cur, turn);
                    const corner = { x: trunk + dir * c, y: a.y };
                    seg('d', turn, corner);
                    seg('h', corner, { x: a.x, y: a.y });
                    break;
                }
                if (a.y > cur.y) {
                    const next = { x: trunk, y: a.y };
                    seg('v', cur, next, a.future);
                    cur = next;
                }
            }

            layer.appendChild(frag);
        });
    }, [scope]);

    return <div className="ab-trace" ref={layerRef} aria-hidden="true" />;
}

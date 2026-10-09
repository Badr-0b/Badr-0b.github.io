'use client';

import React, { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { useLanguage } from '../components/LanguageContext';
import type { Drawing, Part } from './draw';
import { clamp, damp, ease, finePointer, onFrame, onMeasure, reducedMotion, span } from './motion';
import './kit.css';

/* ===========================================================================
   <Plate> — a technical drawing, framed: corner marks, a probe readout, and a
   caption strip with the build stages. The drawing rebuilds itself in the order
   the artifact was made (driven by scroll, by time, or by a parent's progress
   ref), parts light up when inspected, and numbered balloons tie parts to notes
   elsewhere on the page. Hairlines stay 1px at any size (--k = units per px).
   =========================================================================== */

export type PlateNote = { n: number; part: string | string[] };

export type PlateBuild =
    | 'scroll' // follows the plate through the viewport (in-flow scrub)
    | 'time' // builds once, over a few seconds, when it first comes into view
    | 'static' // drawn complete
    | MutableRefObject<number>; // a parent's 0..1 progress (pinned scenes)

interface PlateProps {
    drawing: Drawing;
    build?: PlateBuild;
    /** balloons: numbered notes keyed to parts */
    notes?: PlateNote[];
    /** parts lit from outside (a hovered note, a decision in view) */
    active?: string[] | null;
    onActive?: (ids: string[] | null) => void;
    /** the caption strip (view + build stages) */
    strip?: boolean;
    /** the probe readout in the frame's corner */
    probe?: boolean;
    /** scroll window for build="scroll": plate-top positions as fractions of the viewport */
    window?: [number, number];
    className?: string;
    /** overlays drawn inside the SVG, above the parts */
    children?: React.ReactNode;
}

type Anim = { start: number; end: number; mode: 'fade' | 'draw' | 'drop' };

/** Timing for a layer (or band) within the build: each stage is 1/N of progress. */
function windowOf(stage: number, at: number, N: number, band = 0, bands = 1): [number, number] {
    const s0 = (stage + at * 0.5) / N;
    const len = 0.5 / N;
    if (bands <= 1) return [s0, s0 + len];
    const bs = s0 + (band / (bands - 1)) * len * 0.55;
    return [bs, bs + len * 0.45];
}

export default function Plate({
    drawing,
    build = 'scroll',
    notes = [],
    active = null,
    onActive,
    strip = true,
    probe = true,
    window: win = [0.86, 0.22],
    className = '',
    children,
}: PlateProps) {
    const { t } = useLanguage();
    const rootRef = useRef<HTMLElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [hover, setHover] = useState<string | null>(null);
    const [touch, setTouch] = useState(false);
    const N = drawing.stages.length;

    // Every animated element gets a data-a index into this list (built once per drawing).
    const plan = useMemo(() => {
        const anims: Anim[] = [];
        const push = (a: Anim) => anims.push(a) - 1;
        const layers = drawing.layers.map((l) => {
            const at = l.at ?? 0;
            if (l.draw) {
                const ds = Array.isArray(l.d) ? l.d : [l.d];
                const [s, e] = windowOf(l.stage, at, N);
                return { l, kind: 'draw' as const, items: ds.map((d) => ({ d, a: push({ start: s, end: e, mode: 'draw' }) })) };
            }
            if (Array.isArray(l.d)) {
                const B = l.d.length;
                return {
                    l,
                    kind: 'bands' as const,
                    items: l.d.map((d, i) => {
                        const [s, e] = windowOf(l.stage, at, N, i, B);
                        return { d, a: push({ start: s, end: e, mode: l.drop ? 'drop' : 'fade' }) };
                    }),
                };
            }
            const [s, e] = windowOf(l.stage, at, N);
            return { l, kind: 'one' as const, items: [{ d: l.d, a: push({ start: s, end: e, mode: l.drop ? 'drop' : 'fade' }) }] };
        });
        const labels = drawing.labels.map((lb) => {
            const [s, e] = windowOf(lb.stage, 0.45, N);
            return { lb, a: push({ start: s, end: e, mode: 'fade' }) };
        });
        const parts = drawing.parts.map((p) => {
            const [s, e] = windowOf(p.stage, 0.6, N);
            return { p, a: push({ start: s, end: e, mode: 'fade' }) };
        });
        return { anims, layers, labels, parts };
    }, [drawing, N]);

    const partById = useMemo(() => new Map(drawing.parts.map((p) => [p.id, p])), [drawing]);
    const balloons = useMemo(
        () =>
            notes
                .map((nt) => {
                    const ids = Array.isArray(nt.part) ? nt.part : [nt.part];
                    const p = partById.get(ids[0]);
                    if (!p) return null;
                    const [s, e] = windowOf(Math.max(p.stage, N - 1), 0.7, N);
                    return { n: nt.n, ids, p, start: s, end: e };
                })
                .filter(Boolean) as { n: number; ids: string[]; p: Part; start: number; end: number }[],
        [notes, partById, N]
    );

    const lit = new Set<string>(hover ? [hover] : active ?? []);
    const probePart = hover ? partById.get(hover) : active?.length === 1 ? partById.get(active[0]) : undefined;

    useEffect(() => setTouch(!finePointer()), []);

    /* ---- the build loop: imperative writes only, never a React render per frame ---- */
    useEffect(() => {
        const root = rootRef.current;
        const svg = svgRef.current;
        if (!root || !svg) return;
        const reduce = reducedMotion();
        const els = Array.from(svg.querySelectorAll<SVGElement>('[data-a]'));
        const balloonEls = Array.from(svg.querySelectorAll<SVGElement>('[data-b]'));
        const stageEls = Array.from(root.querySelectorAll<HTMLElement>('[data-stage-i]'));
        const fill = root.querySelector<HTMLElement>('.k-plate__fill');
        const sized = Array.from(svg.querySelectorAll<SVGElement>('[data-minw]'));
        const last = new Float32Array(els.length).fill(-1);
        const lastB = new Float32Array(balloonEls.length).fill(-1);
        let curStage = -2;
        let built = false;

        const apply = (p: number) => {
            for (let i = 0; i < els.length; i++) {
                const el = els[i];
                const a = plan.anims[Number(el.dataset.a)];
                const v = ease(span(p, a.start, a.end));
                if (Math.abs(v - last[i]) < 0.002) continue;
                last[i] = v;
                if (a.mode === 'draw') {
                    el.style.strokeDashoffset = (1 - v).toFixed(4);
                    el.style.opacity = v > 0.001 ? '1' : '0';
                } else {
                    el.style.opacity = v.toFixed(3);
                    if (a.mode === 'drop') el.style.transform = v >= 1 ? '' : `translate3d(0, ${(-7 * (1 - v)).toFixed(2)}px, 0)`;
                }
                // parts are only inspectable once they exist
                if (el.classList.contains('k-part')) (el as SVGElement).style.pointerEvents = v > 0.6 ? '' : 'none';
            }
            for (let i = 0; i < balloonEls.length; i++) {
                const b = balloons[Number(balloonEls[i].dataset.b)];
                if (!b) continue;
                const v = ease(span(p, b.start, b.end));
                if (Math.abs(v - lastB[i]) < 0.002) continue;
                lastB[i] = v;
                balloonEls[i].style.opacity = v.toFixed(3);
                balloonEls[i].style.pointerEvents = v > 0.6 ? '' : 'none';
            }
            const s = p <= 0.0005 ? -1 : Math.min(N - 1, Math.floor(p * N));
            if (s !== curStage) {
                curStage = s;
                stageEls.forEach((li, i) => {
                    li.dataset.state = p >= 0.999 || i < s ? 'done' : i === s ? 'on' : '';
                });
                root.dataset.stage = String(s);
            }
            if (fill) fill.style.transform = `scaleX(${clamp(p).toFixed(4)})`;
            const isBuilt = p >= 0.999;
            if (isBuilt !== built) {
                built = isBuilt;
                root.toggleAttribute('data-built', built);
            }
        };

        // hairline compensation + size-gated detail
        const offMeasure = onMeasure(() => {
            const w = svg.getBoundingClientRect().width || drawing.w;
            svg.style.setProperty('--k', (drawing.w / w).toFixed(4));
            sized.forEach((el) => {
                el.style.display = w < Number(el.dataset.minw) ? 'none' : '';
            });
        });

        if (build === 'static' || reduce) {
            apply(1);
            root.dataset.live = '';
            return offMeasure;
        }

        root.dataset.live = '';
        let p = 0;
        apply(0);

        if (build === 'time') {
            let t0 = -1;
            let seen = false;
            const io = new IntersectionObserver(
                (entries) => {
                    if (entries.some((e) => e.isIntersecting)) {
                        seen = true;
                        io.disconnect();
                    }
                },
                { threshold: 0.25 }
            );
            io.observe(root);
            const DURATION = 2.6;
            const off = onFrame(({ now }) => {
                if (!seen) return false;
                if (t0 < 0) t0 = now;
                const q = clamp((now - t0) / 1000 / DURATION);
                apply(q);
                return q < 1;
            });
            return () => {
                io.disconnect();
                off();
                offMeasure();
            };
        }

        let top = 0;
        const offTop = onMeasure(() => {
            top = root.getBoundingClientRect().top + window.scrollY;
        });
        const off = onFrame(({ y, vh, dt }) => {
            const target =
                typeof build === 'object' ? clamp(build.current) : span(y, top - vh * win[0], top - vh * win[1]);
            const next = damp(p, target, 7, dt);
            const settled = Math.abs(target - next) < 0.0004;
            p = settled ? target : next;
            apply(p);
            return !settled;
        });
        return () => {
            off();
            offTop();
            offMeasure();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [plan, balloons, build, drawing, N, win[0], win[1]]);

    const enter = (id: string) => (e: React.PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        setHover(id);
        onActive?.([id]);
    };
    const leave = (e: React.PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        setHover(null);
        onActive?.(null);
    };
    const tap = (id: string) => () => {
        if (!touch) return;
        const next = hover === id ? null : id;
        setHover(next);
        onActive?.(next ? [next] : null);
    };

    const stageName = (k: string) => t(k);
    const current = drawing.stages;

    return (
        <figure
            ref={rootRef}
            className={`k-plate ${lit.size ? 'has-on' : ''} ${className}`}
            data-plate={drawing.id}
        >
            <div className="k-plate__frame">
                <span className="k-corner k-corner--tl" aria-hidden="true" />
                <span className="k-corner k-corner--tr" aria-hidden="true" />
                <span className="k-corner k-corner--bl" aria-hidden="true" />
                <span className="k-corner k-corner--br" aria-hidden="true" />

                <svg
                    ref={svgRef}
                    className="k-plate__svg"
                    viewBox={`0 0 ${drawing.w} ${drawing.h}`}
                    role="img"
                    aria-label={drawing.title}
                    focusable="false"
                >
                    <g className="k-plate__ink">
                        {plan.layers.map(({ l, kind, items }, li) =>
                            kind === 'draw' ? (
                                <g key={li} className={`k-ink k-ink--${l.ink}`} data-minw={l.minW}>
                                    {items.map((it, i) => (
                                        <path key={i} d={it.d} pathLength={1} className="k-draw" data-a={it.a} />
                                    ))}
                                </g>
                            ) : (
                                <g key={li} className={`k-ink k-ink--${l.ink}`} data-minw={l.minW}>
                                    {items.map((it, i) => (
                                        <path key={i} d={it.d} data-a={it.a} />
                                    ))}
                                </g>
                            )
                        )}
                        {plan.labels.map(({ lb, a }, i) => (
                            <text
                                key={i}
                                x={lb.x}
                                y={lb.y}
                                textAnchor={lb.anchor ?? 'start'}
                                className={`k-label k-label--${lb.ink ?? 'mid'} ${lb.size && lb.size >= 9 ? 'k-label--9' : ''}`}
                                transform={lb.vertical ? `rotate(-90 ${lb.x} ${lb.y})` : undefined}
                                data-a={a}
                                data-minw={lb.minW}
                            >
                                {lb.text}
                            </text>
                        ))}
                    </g>

                    <g className="k-parts">
                        {plan.parts.map(({ p, a }) => (
                            <g
                                key={p.id}
                                className={`k-part ${lit.has(p.id) ? 'is-on' : ''}`}
                                data-a={a}
                                data-part={p.id}
                            >
                                <path d={p.d} />
                                <rect
                                    className="k-hit"
                                    x={p.hit.x}
                                    y={p.hit.y}
                                    width={p.hit.w}
                                    height={p.hit.h}
                                    data-hover
                                    data-cursor={p.name}
                                    onPointerEnter={enter(p.id)}
                                    onPointerLeave={leave}
                                    onClick={tap(p.id)}
                                />
                            </g>
                        ))}
                    </g>

                    <g className="k-balloons">
                        {balloons.map((b, i) => {
                            const [bx, by] = b.p.balloon;
                            const [ax, ay] = b.p.anchor;
                            const dx = ax - bx;
                            const dy = ay - by;
                            const L = Math.hypot(dx, dy) || 1;
                            const R = 8.5;
                            const on = b.ids.some((id) => lit.has(id));
                            return (
                                <g
                                    key={b.n}
                                    className={`k-balloon ${on ? 'is-on' : ''}`}
                                    data-b={i}
                                    data-hover
                                    onPointerEnter={(e) => {
                                        if (e.pointerType !== 'mouse') return;
                                        onActive?.(b.ids);
                                    }}
                                    onPointerLeave={(e) => {
                                        if (e.pointerType !== 'mouse') return;
                                        onActive?.(null);
                                    }}
                                    onClick={() => touch && onActive?.(on ? null : b.ids)}
                                >
                                    <path className="k-balloon__leader" d={`M${(bx + (dx / L) * R).toFixed(1)} ${(by + (dy / L) * R).toFixed(1)}L${ax} ${ay}`} />
                                    <path className="k-balloon__tip" d={`M${ax} ${ay}h0`} />
                                    <circle className="k-balloon__ring" cx={bx} cy={by} r={R} />
                                    <text className="k-balloon__n" x={bx} y={by}>
                                        {b.n}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                    {children}
                </svg>

                {probe && (
                    <p className={`k-plate__probe ${probePart ? 'is-on' : ''}`} aria-live="polite">
                        {probePart ? (
                            <span className="k-plate__probe-in" key={probePart.id}>
                                <span className="k-plate__probe-name">{probePart.name}</span>
                                <span className="k-plate__probe-note">
                                    <bdi>{probePart.note}</bdi>
                                </span>
                            </span>
                        ) : (
                            <span className="k-plate__probe-idle">{t(touch ? 'kit.probe.tap' : 'kit.probe.hover')}</span>
                        )}
                    </p>
                )}
            </div>

            {strip && (
                <figcaption className="k-plate__strip">
                    <span className="k-plate__view">{t('kit.plate.view')}</span>
                    <ol className="k-plate__stages" aria-label={t('kit.plate.stages')}>
                        {current.map((k, i) => (
                            <li key={k} className="k-plate__stage" data-stage-i={i}>
                                <span className="k-plate__stage-n">{String(i + 1).padStart(2, '0')}</span>
                                <span className="k-plate__stage-name">{stageName(k)}</span>
                            </li>
                        ))}
                    </ol>
                    <span className="k-plate__rule" aria-hidden="true">
                        <span className="k-plate__fill" />
                    </span>
                </figcaption>
            )}
        </figure>
    );
}

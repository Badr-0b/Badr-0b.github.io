'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../../components/LanguageContext';
import Plate from '../../../kit/Plate';
import Bearing from '../../../kit/Bearing';
import { ROSE, drawingFor } from '../../../kit/draw';
import { matches, onFrame, onMeasure, reducedMotion, span, wake } from '../../../kit/motion';
import { decisionOf, type Project } from '../../projects.data';

/**
 * The drawing, held in view while the key decisions pass beside it. The plate
 * rebuilds as the section arrives; then each decision, as it reaches the middle
 * of the screen, lights the parts it shaped (a numbered balloon marks each one).
 * Hover a part and its decision answers; hover a decision and its parts light.
 */
export default function Decisions({ p, idx }: { p: Project; idx: string }) {
    const { t } = useLanguage();
    const rootRef = useRef<HTMLElement>(null);
    const listRef = useRef<HTMLOListElement>(null);
    const progress = useRef(0);
    const [current, setCurrent] = useState(-1);
    const [hover, setHover] = useState<number | null>(null);
    const [probe, setProbe] = useState<string[] | null>(null);
    const currentRef = useRef(-1);

    const drawing = useMemo(() => drawingFor(p.slug, p.kind, p.title), [p.slug, p.kind, p.title]);
    const decisions = useMemo(() => p.decisions.map(decisionOf), [p.decisions]);
    const notes = useMemo(
        () => decisions.map((d, i) => (d.parts.length ? { n: i + 1, part: d.parts } : null)).filter(Boolean) as { n: number; part: string[] }[],
        [decisions]
    );
    const partName = useMemo(() => new Map(drawing.parts.map((pt) => [pt.id, pt.name])), [drawing]);

    // build progress as the section arrives; the decision nearest mid-screen is current
    useEffect(() => {
        const root = rootRef.current;
        const list = listRef.current;
        if (!root || !list) return;
        if (reducedMotion()) progress.current = 1;
        let top = 0;
        let mids: number[] = [];
        let stacked = false;
        const offMeasure = onMeasure(() => {
            const sy = window.scrollY;
            top = root.getBoundingClientRect().top + sy;
            stacked = !matches('(min-width: 1100px)');
            mids = Array.from(list.children).map((li) => {
                const r = (li as HTMLElement).getBoundingClientRect();
                return r.top + sy + r.height * 0.5;
            });
        });
        const offFrame = onFrame(({ y, vh }) => {
            if (!reducedMotion()) {
                const next = stacked ? span(y, top - vh * 0.9, top - vh * 0.1) : span(y, top - vh * 0.75, top + vh * 0.25);
                if (Math.abs(next - progress.current) > 0.0005) {
                    progress.current = next;
                    wake();
                }
            }
            const probeY = y + vh * 0.55;
            let c = -1;
            mids.forEach((m, i) => {
                if (probeY >= m - vh * 0.22) c = i;
            });
            if (c !== currentRef.current) {
                currentRef.current = c;
                setCurrent(c);
            }
            return false;
        });
        return () => {
            offFrame();
            offMeasure();
        };
    }, []);

    const shown = hover ?? current;
    const active = probe ?? (shown >= 0 ? decisions[shown]?.parts ?? null : null);
    // a part under the pointer answers with the decision that shaped it
    const answering = probe ? decisions.findIndex((d) => d.parts.some((id) => probe.includes(id))) : -1;

    return (
        <section className="pj-sec pd-draw" id="drawing" ref={rootRef} aria-labelledby="drawing-title">
            <header className="pj-sec__label" data-reveal="fade">
                <span className="pj-sec__idx">{idx}</span>
                <h2 className="pj-sec__name" id="drawing-title">
                    {t('projects.detail.drawing')}
                </h2>
            </header>

            <div className="pd-draw__plate">
                <div className="pd-draw__sticky">
                    <Plate drawing={drawing} build={progress} notes={notes} active={active} onActive={setProbe}>
                        {p.slug === 'azimuth' && <Bearing cx={ROSE.cx} cy={ROSE.cy} r={ROSE.r} />}
                    </Plate>
                </div>
            </div>

            <div className="pd-draw__side">
                <p className="pd-draw__k" data-reveal="fade">
                    {t('projects.detail.decisions')}
                </p>
                <ol className="pd-decs" ref={listRef}>
                    {decisions.map((d, i) => {
                        const on = shown === i || answering === i;
                        return (
                            <li
                                key={i}
                                className={`pd-dec ${on ? 'is-on' : ''}`}
                                onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(i)}
                                onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
                            >
                                <button
                                    type="button"
                                    className="pd-dec__head"
                                    onFocus={() => setHover(i)}
                                    onBlur={() => setHover(null)}
                                    onClick={() => setHover(hover === i ? null : i)}
                                    aria-pressed={hover === i}
                                >
                                    <span className="pd-dec__n">{i + 1}</span>
                                    <span className="pd-dec__k">
                                        {t('projects.detail.decision')} {String(i + 1).padStart(2, '0')}
                                    </span>
                                </button>
                                <p className="pd-dec__text">
                                    <bdi>{d.text}</bdi>
                                </p>
                                {d.parts.length > 0 && (
                                    <p className="pd-dec__parts">
                                        <bdi>{d.parts.map((id) => partName.get(id) ?? id).join(' · ')}</bdi>
                                    </p>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}

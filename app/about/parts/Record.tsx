'use client';

import React, { useEffect, useRef, type CSSProperties } from 'react';
import { useLanguage } from '../../components/LanguageContext';
import { GPA, record } from '../about.data';
import { ease, onFrame, onMeasure, reducedMotion, span } from '../../kit/motion';

/** Layout position of a node's centre inside the timeline — offsetTop ignores the
 *  reveal transforms, so the rails always meet the nodes where they settle. */
function centreIn(node: HTMLElement, container: HTMLElement) {
    let top = node.offsetHeight / 2;
    for (let el: HTMLElement | null = node; el && el !== container; el = el.offsetParent as HTMLElement | null) {
        top += el.offsetTop;
    }
    return top;
}

/**
 * The record — a figure (GPA, ticking up with the scroll) above a timeline.
 * On desktop the nodes sit exactly on the page's trace, so the route itself becomes
 * the timeline; on narrow screens a local rail draws through them instead. The
 * stretch from "now" to graduation stays un-energised: that part isn't routed yet.
 */
export default function Record() {
    const { t } = useLanguage();
    const gpaRef = useRef<HTMLSpanElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const railRef = useRef<HTMLSpanElement>(null);
    const futureRef = useRef<HTMLSpanElement>(null);

    // GPA: a counter tied to scroll position
    useEffect(() => {
        const el = gpaRef.current;
        if (!el) return;
        if (reducedMotion()) {
            el.textContent = GPA.toFixed(2);
            return;
        }
        let top = 0;
        let last = '';
        const offMeasure = onMeasure(() => {
            const block = (el.closest('.ab-rec__fig-in') as HTMLElement | null) ?? el;
            top = block.getBoundingClientRect().top + window.scrollY;
        });
        const offFrame = onFrame(({ y, vh }) => {
            const v = (GPA * ease(span(y, top - vh * 0.95, top - vh * 0.45))).toFixed(2);
            if (v !== last) {
                last = v;
                el.textContent = v;
            }
            return false;
        });
        return () => {
            offFrame();
            offMeasure();
        };
    }, []);

    // local rails for narrow screens (hidden on desktop, where the page trace takes over)
    useEffect(() => {
        const box = timelineRef.current;
        const rail = railRef.current;
        const future = futureRef.current;
        if (!box || !rail || !future) return;
        return onMeasure(() => {
            const nodes = Array.from(box.querySelectorAll<HTMLElement>('.ab-rec__node'));
            const nowIdx = record.findIndex((r) => r.state === 'now');
            if (nodes.length < 2 || nowIdx < 0) return;
            const a = centreIn(nodes[0], box);
            const b = centreIn(nodes[nowIdx], box);
            const z = centreIn(nodes[nodes.length - 1], box);
            rail.style.top = `${a}px`;
            rail.style.height = `${Math.max(0, b - a)}px`;
            future.style.top = `${b}px`;
            future.style.height = `${Math.max(0, z - b)}px`;
        });
    }, []);

    return (
        <>
            <div className="ab-sec__body ab-rec__fig">
                <div className="ab-rec__fig-in" data-reveal>
                    <p className="ab-rec__gpa">
                        <span className="ab-rec__gpa-v" ref={gpaRef}>
                            {GPA.toFixed(2)}
                        </span>
                        <span className="ab-rec__gpa-of">/ 4.0</span>
                    </p>
                    <div className="ab-rec__gpa-meta">
                        <p className="ab-rec__gpa-k">{t('about.rec.gpa')}</p>
                        <p className="ab-rec__gpa-note">{t('about.rec.gpa.note')}</p>
                    </div>
                </div>
                <div className="ab-rec__courses" data-reveal style={{ '--d': '120ms' } as CSSProperties}>
                    <p className="ab-rec__courses-k">{t('about.rec.coursework')}</p>
                    <p className="ab-rec__courses-v">{t('about.rec.courses')}</p>
                </div>
            </div>

            <div className="ab-rec__timeline" ref={timelineRef}>
                <span className="ab-rec__rail" data-front="line" ref={railRef}>
                    <span className="ab-rec__rail-fill" />
                </span>
                <span className="ab-rec__rail ab-rec__rail--future" ref={futureRef} />
                <ol className="ab-rec__list">
                    {record.map((e, i) => (
                        <li key={i} className={`ab-rec__item ${e.state ? `is-${e.state}` : ''}`}>
                            <span
                                className="ab-rec__node"
                                data-front="node"
                                data-trace="node"
                                data-trace-future={e.state === 'future' ? '' : undefined}
                                aria-hidden="true"
                            />
                            <div className="ab-rec__when" data-reveal style={{ '--d': `${i * 40}ms` } as CSSProperties}>
                                {/* ltr-isolated: in Arabic, "2025–26" would otherwise render as "26–2025" */}
                                {e.whenKey ? t(e.whenKey) : <span dir="ltr">{e.when}</span>}
                            </div>
                            <div className="ab-rec__what" data-reveal style={{ '--d': `${60 + i * 40}ms` } as CSSProperties}>
                                <p className="ab-rec__title">{t(e.titleKey)}</p>
                                <p className="ab-rec__detail">{t(e.detailKey)}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </>
    );
}

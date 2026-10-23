'use client';

import React, { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLanguage } from '../../components/LanguageContext';
import { damp, ease, finePointer, onFrame, onMeasure, reducedMotion, span } from '../../kit/motion';
import { glyphs } from '../home.data';

const INKS = ['edge', 'fine', 'faint'] as const;

/**
 * 02 · Capabilities — a thin strip: five labels, nothing else to read. Each carries
 * a hairline glyph that draws itself in as the strip crosses the screen, one after
 * another; point at one and its signal path energises.
 */
export default function Capabilities() {
    const { t } = useLanguage();
    const rootRef = useRef<HTMLOListElement>(null);
    const [on, setOn] = useState(-1);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const cells = Array.from(root.querySelectorAll<HTMLElement>('.hm-cap__cell'));
        const paths = cells.map((c) => Array.from(c.querySelectorAll<SVGPathElement>('.hm-glyph__ink')));
        const rules = cells.map((c) => c.querySelector<HTMLElement>('.hm-cap__rule'));
        if (reducedMotion()) {
            root.dataset.drawn = '';
            return;
        }
        root.dataset.live = '';
        let top = 0;
        let p = -1;
        const last = cells.map(() => -1);
        const offMeasure = onMeasure(() => {
            top = root.getBoundingClientRect().top + window.scrollY;
        });
        const offFrame = onFrame(({ y, vh, dt }) => {
            const target = span(y, top - vh * 0.92, top - vh * 0.4);
            p = p < 0 ? target : damp(p, target, 7, dt);
            cells.forEach((_, i) => {
                const v = ease(span(p, i * 0.1, i * 0.1 + 0.6));
                if (Math.abs(v - last[i]) < 0.002) return;
                last[i] = v;
                paths[i].forEach((el, j) => {
                    const vj = ease(span(v, j * 0.18, j * 0.18 + 0.64));
                    el.style.strokeDashoffset = (1 - vj).toFixed(4);
                });
                const rule = rules[i];
                if (rule) rule.style.transform = `scaleY(${v.toFixed(4)})`;
            });
            return Math.abs(target - p) > 0.0004;
        });
        return () => {
            offFrame();
            offMeasure();
        };
    }, []);

    const fine = typeof window !== 'undefined' && finePointer();

    return (
        <section className="hm-sec hm-cap" id="capabilities" aria-labelledby="capabilities-title">
            <header className="hm-sec__label" data-reveal="fade">
                <span className="hm-sec__idx">02</span>
                <h2 className="hm-sec__name" id="capabilities-title">
                    {t('home.capabilities.title')}
                </h2>
            </header>

            <ol className={`hm-cap__row ${on >= 0 ? 'has-on' : ''}`} ref={rootRef}>
                {glyphs.map((g, i) => (
                    <li
                        key={i}
                        className={`hm-cap__cell ${on === i ? 'is-on' : ''}`}
                        onPointerEnter={(e) => e.pointerType === 'mouse' && setOn(i)}
                        onPointerLeave={(e) => e.pointerType === 'mouse' && setOn(-1)}
                        onClick={() => !fine && setOn(on === i ? -1 : i)}
                    >
                        <span className="hm-cap__rule" aria-hidden="true" />
                        <span className="hm-cap__n">{String(i + 1).padStart(2, '0')}</span>
                        <svg className="hm-glyph" viewBox="0 0 120 64" aria-hidden="true" focusable="false">
                            {INKS.map((ink) => (
                                <path key={ink} className={`hm-glyph__ink hm-glyph__${ink}`} d={g[ink]} pathLength={1} />
                            ))}
                            <path className="hm-glyph__signal" d={g.signal} pathLength={1} />
                        </svg>
                        <span className="hm-cap__label" data-reveal style={{ '--d': `${i * 70}ms` } as CSSProperties}>
                            {t(`home.capabilities.${i + 1}`)}
                        </span>
                    </li>
                ))}
            </ol>
        </section>
    );
}

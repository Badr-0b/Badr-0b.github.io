'use client';

import React, { useEffect, useRef, type CSSProperties } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { PLACE } from './about.data';
import {
    damp,
    onFrame,
    onMeasure,
    reducedMotion,
    requestMeasure,
    span,
    useReveal,
} from '../kit/motion';
import Stack from './parts/Stack';
import Statement from './parts/Statement';
import Toolkit from './parts/Toolkit';
import FieldScene from './parts/FieldScene';
import Record from './parts/Record';
import Now from './parts/Now';
import Contact from './parts/Contact';
import SectionIndex from './parts/SectionIndex';
import Trace from './parts/Trace';

/* ===========================================================================
   /about — built from AESTHETIC_DIRECTION.md + Bare Bones.md alone.
   The page is routed like a board: one hairline trace runs the margin, every
   section label is a via on it, the record's nodes sit on it, and it ends on a
   pad beside the email address. Scroll energises the route from the top.
   =========================================================================== */

/**
 * The "front" — one energy line moving down the page at 62% of the viewport.
 * Every [data-front="line"] fills as the front passes its span, every
 * [data-front="node"] lights once the front reaches it, and the latest via
 * marks the current section. Reduced motion: fully drawn, nothing moves.
 */
function useFront(scope: React.RefObject<HTMLElement | null>) {
    useEffect(() => {
        const root = scope.current;
        if (!root) return;
        const reduce = reducedMotion();

        type Line = { fill: HTMLElement; top: number; bottom: number; horizontal: boolean; v: number };
        type Node = { el: HTMLElement; y: number; lit: boolean; via: boolean };
        let lines: Line[] = [];
        let nodes: Node[] = [];
        let front = -1;
        let current: HTMLElement | null = null;

        const offMeasure = onMeasure(() => {
            const sy = window.scrollY;
            lines = Array.from(
                root.querySelectorAll<HTMLElement>('[data-front="line"], [data-front="hline"]')
            ).map((el) => {
                const r = el.getBoundingClientRect();
                const horizontal = el.dataset.front === 'hline';
                return {
                    fill: (el.firstElementChild as HTMLElement | null) ?? el,
                    top: r.top + sy,
                    // a horizontal run draws over the next 180px of travel once reached
                    bottom: horizontal ? r.top + sy + 180 : r.bottom + sy,
                    horizontal,
                    v: -1,
                };
            });
            nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-front="node"]'))
                .filter((el) => el.offsetParent !== null)
                .map((el) => {
                    const r = el.getBoundingClientRect();
                    return {
                        el,
                        y: r.top + r.height / 2 + sy,
                        lit: el.classList.contains('is-lit'),
                        via: el.classList.contains('ab-via'),
                    };
                });
            front = -1;
        });

        const offFrame = onFrame(({ y, vh, dt }) => {
            const target = y + vh * 0.62;
            front = front < 0 || reduce ? target : damp(front, target, 8, dt);
            for (const ln of lines) {
                const p = reduce ? 1 : span(front, ln.top, ln.bottom);
                if (Math.abs(p - ln.v) > 0.0008) {
                    ln.v = p;
                    ln.fill.style.transform = ln.horizontal ? `scaleX(${p.toFixed(4)})` : `scaleY(${p.toFixed(4)})`;
                }
            }
            let cur: HTMLElement | null = null;
            for (const n of nodes) {
                const reached = front >= n.y;
                const lit = reduce || reached;
                if (lit !== n.lit) {
                    n.lit = lit;
                    n.el.classList.toggle('is-lit', lit);
                }
                if (n.via && reached) cur = n.el;
            }
            if (cur !== current) {
                current?.classList.remove('is-current');
                current?.parentElement?.classList.remove('is-current');
                current = cur;
                current?.classList.add('is-current');
                current?.parentElement?.classList.add('is-current');
            }
            return Math.abs(target - front) > 0.5;
        });

        return () => {
            offFrame();
            offMeasure();
        };
    }, [scope]);
}

/** Set a system's proper name (e.g. CONDUIT) as a mono identifier inside running prose. */
function named(text: string, name: string): React.ReactNode {
    const parts = text.split(name);
    if (parts.length < 2) return text;
    return parts.map((part, i) => (
        <React.Fragment key={i}>
            {i > 0 && <span className="ab-exp__name">{name}</span>}
            {part}
        </React.Fragment>
    ));
}

/** Section frame: a mono label (with its via on the trace) beside the content. */
function Section({
    id,
    idx,
    name,
    children,
}: {
    id: string;
    idx: string;
    name: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className={`ab-sec ab-sec--${id}`} aria-labelledby={`${id}-title`}>
            <header className="ab-sec__label">
                <span className="ab-via" data-trace="via" data-front="node" aria-hidden="true" />
                <span className="ab-sec__label-in" data-reveal="fade">
                    <span className="ab-sec__idx">{idx}</span>
                    <h2 className="ab-sec__name" id={`${id}-title`}>
                        {name}
                    </h2>
                </span>
            </header>
            {children}
        </section>
    );
}

/** Hero — weight sinks lower-left, the stack holds the right, micro-type works the corners. */
function Hero({ rev }: { rev: string }) {
    const { t } = useLanguage();
    const heroRef = useRef<HTMLElement>(null);
    const copyRef = useRef<HTMLDivElement>(null);

    // the copy leaves a little faster than the page (it sits nearer), fading as it goes
    useEffect(() => {
        const hero = heroRef.current;
        const copy = copyRef.current;
        if (!hero || !copy || reducedMotion()) return;
        let H = 1;
        let parked = false;
        const offMeasure = onMeasure(() => {
            H = hero.offsetHeight;
            parked = false;
        });
        const offFrame = onFrame(({ y }) => {
            if (y > H) {
                if (!parked) {
                    copy.style.opacity = '0';
                    parked = true;
                }
                return false;
            }
            parked = false;
            copy.style.transform = `translate3d(0, ${(-y * 0.14).toFixed(1)}px, 0)`;
            copy.style.opacity = (1 - span(y, H * 0.2, H * 0.75)).toFixed(3);
            return false;
        });
        return () => {
            offFrame();
            offMeasure();
            copy.style.transform = '';
            copy.style.opacity = '';
        };
    }, []);

    return (
        <header className="ab-hero" ref={heroRef}>
            <div className="ab-hero__meta" data-in style={{ '--d': '820ms' } as CSSProperties}>
                <span>
                    {t('about.meta.profile')} — {t('about.meta.rev')} {rev}
                </span>
                <span dir="ltr">{PLACE.coords}</span>
            </div>

            <Stack
                tags={[
                    { name: t('about.layer.1'), note: t('about.layer.1.note') },
                    { name: t('about.layer.2'), note: t('about.layer.2.note') },
                    { name: t('about.layer.3'), note: t('about.layer.3.note') },
                ]}
            />

            <div className="ab-hero__copy" ref={copyRef}>
                <p className="ab-hero__eyebrow" data-in style={{ '--d': '120ms' } as CSSProperties}>
                    <span className="ab-hero__eyebrow-n">(02)</span>
                    {t('nav.about')} — Badr Obtel
                </p>
                <h1 className="ab-hero__title" data-in="mask" style={{ '--d': '240ms' } as CSSProperties}>
                    {t('about.hero.title')}
                </h1>
                <p className="ab-hero__sub" data-in style={{ '--d': '460ms' } as CSSProperties}>
                    {t('about.hero.sub')}
                </p>
            </div>

            <span className="ab-hero__pin" data-trace="start" data-front="node" aria-hidden="true" />

            <div className="ab-hero__foot" data-in style={{ '--d': '960ms' } as CSSProperties} aria-hidden="true">
                <span className="ab-hero__cue">
                    {t('about.hero.cue')} <span className="ab-hero__cue-arrow">↓</span>
                </span>
                <span className="ab-hero__idx">[ 02 ]</span>
            </div>
        </header>
    );
}

interface AboutPageProps {
    /** résumé PDF size, read from disk at build time ("143 KB") */
    resumeSize: string | null;
    /** build revision, YY.MM — the page's datasheet revision */
    rev: string;
    /** build year, for the colophon */
    year: string;
}

export default function AboutPage({ resumeSize, rev, year }: AboutPageProps) {
    const { t, language } = useLanguage();
    const abRef = useRef<HTMLElement>(null);

    useReveal(abRef, language);
    useFront(abRef);

    // compose the hero in once mounted (the [data-in] stagger lives in CSS)
    useEffect(() => {
        const id = requestAnimationFrame(() => abRef.current?.classList.add('is-ready'));
        return () => cancelAnimationFrame(id);
    }, []);

    // a language switch re-flows every line (and may flip the page to RTL)
    useEffect(() => {
        requestMeasure();
    }, [language]);

    const split = language === 'en' || language === 'fr';

    const sections = [
        { id: 'profile', idx: '01', name: t('about.sec.profile') },
        { id: 'toolkit', idx: '02', name: t('about.sec.toolkit') },
        { id: 'experience', idx: '03', name: t('about.sec.experience') },
        { id: 'record', idx: '04', name: t('about.sec.record') },
        { id: 'now', idx: '05', name: t('about.sec.now') },
        { id: 'contact', idx: '06', name: t('about.sec.contact') },
    ];
    const [profile, toolkit, experience, recordSec, now, contact] = sections;

    return (
        <main className="ab" ref={abRef}>
            <Hero rev={rev} />

            <Section {...profile}>
                <div className="ab-sec__body">
                    <Statement
                        text={t('about.profile.statement')}
                        notes={[1, 2, 3, 4].map((n) => t(`about.profile.note.${n}`))}
                        noteLabel={t('about.profile.note')}
                        split={split}
                    />
                </div>
            </Section>

            <Section {...toolkit}>
                <div className="ab-sec__body">
                    <Toolkit />
                </div>
            </Section>

            <Section {...experience}>
                <div className="ab-sec__body ab-exp">
                    <div className="ab-exp__head" data-reveal>
                        <h3 className="ab-exp__org">
                            Lear Corporation <span className="ab-exp__org-unit">— E-Systems</span>
                        </h3>
                        <p className="ab-exp__meta">
                            <span>{t('about.exp.role')}</span>
                            <span className="ab-exp__meta-sep" aria-hidden="true">
                                ·
                            </span>
                            <span>{t('about.exp.dates')}</span>
                        </p>
                        <p className="ab-exp__note">{t('about.exp.note')}</p>
                    </div>

                    <FieldScene />

                    <ol className="ab-exp__list">
                        {['a1', 'a2', 'a3'].map((k, i) => (
                            <li
                                key={k}
                                className="ab-exp__item"
                                data-reveal
                                style={{ '--d': `${i * 100}ms` } as CSSProperties}
                            >
                                <span className="ab-exp__item-n">{String(i + 1).padStart(2, '0')}</span>
                                <p className="ab-exp__item-text">{named(t(`about.exp.${k}`), 'CONDUIT')}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </Section>

            <Section {...recordSec}>
                <Record />
            </Section>

            <Section {...now}>
                <Now />
            </Section>

            <Section {...contact}>
                <Contact resumeSize={resumeSize} />
            </Section>

            <footer className="ab-colophon">
                <span>© {year} Badr Obtel</span>
                <span className="ab-colophon__set">{t('about.colophon.set')}</span>
                <button
                    type="button"
                    className="ab-colophon__top"
                    data-hover
                    onClick={() =>
                        window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })
                    }
                >
                    {t('about.colophon.top')} <span aria-hidden="true">↑</span>
                </button>
            </footer>

            <SectionIndex items={sections} label={t('about.index.label')} />
            <Trace scope={abRef} />
        </main>
    );
}

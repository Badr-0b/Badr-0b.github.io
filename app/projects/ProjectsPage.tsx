'use client';

import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { reducedMotion, requestMeasure, useReveal } from '../kit/motion';
import PageIndex from '../kit/PageIndex';
import { projects } from './projects.data';
import Hero from './parts/Hero';
import Register from './parts/Register';
import Sheet from './parts/Sheet';
import Reserved from './parts/Reserved';
import ExitRamp from './parts/ExitRamp';

/* ===========================================================================
   /projects — the drawing set. Built from AESTHETIC_DIRECTION.md + Bare Bones.md.
   The portfolio as a set of engineering sheets: an index, one sheet per project
   whose drawing rebuilds in the order the thing was actually made, a reserved
   sheet for what's next, and the exit ramp. Compositions change sheet to sheet
   on a 12-column field, so no two views share an anchor line.
   =========================================================================== */

export default function ProjectsPage({ rev, year }: { rev: string; year: string }) {
    const { t, language } = useLanguage();
    const pjRef = useRef<HTMLElement>(null);

    useReveal(pjRef, language);

    // compose the hero in once mounted (the [data-in] stagger lives in CSS)
    useEffect(() => {
        const id = requestAnimationFrame(() => pjRef.current?.classList.add('is-ready'));
        return () => cancelAnimationFrame(id);
    }, []);

    // a language switch re-flows every line (and may flip the page to RTL)
    useEffect(() => {
        requestMeasure();
    }, [language]);

    const total = projects.length;
    const sheetName = (i: number) => `${t('projects.sec.sheet')} ${String(i + 1).padStart(2, '0')}`;
    const index = [
        { id: 'index', idx: '00', name: t('projects.sec.index') },
        ...projects.map((p, i) => ({ id: `sheet-${p.slug}`, idx: String(i + 1).padStart(2, '0'), name: p.title })),
        { id: 'next', idx: String(total + 1).padStart(2, '0'), name: t('projects.sec.next') },
        { id: 'contact', idx: String(total + 2).padStart(2, '0'), name: t('projects.sec.contact') },
    ];

    return (
        <main className="pj k-scope" ref={pjRef}>
            <Hero rev={rev} />
            <Register />
            {projects.map((p, i) => (
                <Sheet key={p.slug} project={p} index={i} total={total} label={sheetName(i)} />
            ))}
            <Reserved index={total} />
            <ExitRamp />

            <footer className="pj-colophon">
                <span>© {year} Badr Obtel</span>
                <span className="pj-colophon__set">{t('about.colophon.set')}</span>
                <button
                    type="button"
                    className="pj-colophon__top"
                    data-hover
                    onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })}
                >
                    {t('about.colophon.top')} <span aria-hidden="true">↑</span>
                </button>
            </footer>

            <PageIndex items={index} label={t('projects.index.label')} after=".pj-hero" />
        </main>
    );
}

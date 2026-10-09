'use client';

import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../components/LanguageContext';
import { reducedMotion, requestMeasure, useReveal } from '../../kit/motion';
import PageIndex from '../../kit/PageIndex';
import { getProject, projects } from '../projects.data';
import ExitRamp from '../parts/ExitRamp';
import DetailHero from './parts/DetailHero';
import Brief from './parts/Brief';
import Decisions from './parts/Decisions';
import Delivered from './parts/Delivered';
import NextSheet from './parts/NextSheet';
import { SCENES } from './parts/scenes';

/* ===========================================================================
   /projects/[slug] — one sheet, opened. The specimen separates into its layers;
   the brief and a spec sheet; the drawing rebuilds and holds while each key
   decision lights the parts it shaped; the project's own story, told with its
   numbers where it has one; what shipped; the next sheet; the exit ramp.
   =========================================================================== */

export default function ProjectDetail({ slug, rev, year }: { slug: string; rev: string; year: string }) {
    const { t, language } = useLanguage();
    const rootRef = useRef<HTMLElement>(null);
    const p = getProject(slug)!;
    const index = projects.indexOf(p);
    const total = projects.length;
    const next = projects[(index + 1) % total];
    const scene = SCENES[slug];

    useReveal(rootRef, language);

    useEffect(() => {
        const id = requestAnimationFrame(() => rootRef.current?.classList.add('is-ready'));
        return () => cancelAnimationFrame(id);
    }, []);

    useEffect(() => {
        requestMeasure();
    }, [language]);

    // section numbering follows what this sheet actually has
    const order = ['brief', 'drawing', ...(scene ? ['story'] : []), 'delivered', 'next', 'contact'];
    const n = (id: string) => String(order.indexOf(id) + 1).padStart(2, '0');
    const names: Record<string, string> = {
        brief: t('projects.detail.brief'),
        drawing: t('projects.detail.drawing'),
        story: scene ? t(scene.name) : '',
        delivered: t('projects.detail.delivered'),
        next: t('projects.sec.next'),
        contact: t('projects.sec.contact'),
    };

    return (
        <main className="pj pd k-scope" ref={rootRef} data-project={p.slug}>
            <DetailHero p={p} index={index} total={total} rev={rev} />
            <Brief p={p} idx={n('brief')} />
            <Decisions p={p} idx={n('drawing')} />
            {scene && <scene.Scene idx={n('story')} name={t(scene.name)} />}
            <Delivered p={p} idx={n('delivered')} />
            <NextSheet p={p} next={next} index={index} total={total} idx={n('next')} />
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

            <PageIndex
                items={order.map((id) => ({ id, idx: n(id), name: names[id] }))}
                label={`${p.title} — ${t('projects.index.label')}`}
                after=".pd-hero"
            />
        </main>
    );
}

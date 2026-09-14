'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '../components/LanguageContext';
import Reveal from '../components/Reveal';
import { useProjectsGallery } from '../components/useProjectsGallery';
import { projects, type Project } from './projects.data';
import './projects.css';

/** Group the flat list into mosaic columns. Few projects read best as a clean
 *  horizontal gallery — one full-height column each. Once the set grows, pack
 *  non-feature projects into 2-tile stacks for a denser mosaic. Either way the
 *  track overflows the viewport so the pan has something to travel. */
function toColumns(list: Project[]): Project[][] {
    const DENSE_AT = 6;
    if (list.length < DENSE_AT) return list.map((p) => [p]);

    const cols: Project[][] = [];
    let stack: Project[] = [];
    const flush = () => {
        if (stack.length) {
            cols.push(stack);
            stack = [];
        }
    };
    for (const p of list) {
        if (p.feature) {
            flush();
            cols.push([p]);
        } else {
            stack.push(p);
            if (stack.length === 2) flush();
        }
    }
    flush();
    return cols;
}

export default function Projects() {
    const { t } = useLanguage();
    const scopeRef = useRef<HTMLElement>(null);
    useProjectsGallery(scopeRef);

    const total = projects.length;
    const columns = toColumns(projects);
    const totalStr = String(total).padStart(2, '0');
    const headlineLines = t('projects.headline').split('\n');

    return (
        <main className="pj" ref={scopeRef}>
            {/* ============ INTRO — tall vertical hero, weight lower-left ============ */}
            <section className="pj-intro">
                <span className="pj-intro__marker" aria-hidden="true">
                    / {t('nav.projects')}
                </span>
                <span className="pj-intro__vlabel" aria-hidden="true">
                    {t('projects.eyebrow')} — 2026
                </span>

                <div className="pj-intro__inner">
                    <Reveal>
                        <p className="eyebrow pj-intro__eyebrow">
                            <span className="pj-intro__count">({totalStr})</span>{' '}
                            {t('projects.eyebrow')}
                        </p>
                    </Reveal>
                    <Reveal delay={80}>
                        <h1 className="pj-intro__title">
                            {headlineLines.map((line, i) => (
                                <span key={i} className="pj-intro__title-line">
                                    {line}
                                </span>
                            ))}
                        </h1>
                    </Reveal>
                    <Reveal delay={180}>
                        <p className="pj-intro__lede">{t('projects.lede')}</p>
                    </Reveal>
                    <Reveal delay={280}>
                        <span className="pj-intro__cue">
                            {t('projects.scroll_cue')}{' '}
                            <span className="pj-intro__cue-arrow" aria-hidden="true">
                                ↓
                            </span>
                        </span>
                    </Reveal>
                </div>
            </section>

            {/* ============ GALLERY — horizontal cinematic pan ============ */}
            <div className="pj__scroll">
                <section className="pj__stage">
                    <div className="pj__stage-head">
                        <p className="label">{t('projects.gallery_label')}</p>
                        <span className="pj__cue" aria-hidden="true">
                            {t('projects.scroll_cue')}{' '}
                            <span className="pj__cue-arrow">→</span>
                        </span>
                    </div>

                    <div className="pj__gallery">
                        <div className="pj__track">
                            {columns.map((col, ci) => (
                                <div
                                    key={ci}
                                    className={`pj__col pj__col--v${ci % 4} ${
                                        col.length === 1 && col[0].feature
                                            ? 'pj__col--feature'
                                            : ''
                                    }`}
                                >
                                    {col.map((p) => {
                                        const idx = projects.indexOf(p);
                                        return (
                                            <Link
                                                key={p.slug}
                                                href={`/projects/${p.slug}`}
                                                className={`pj__tile ${
                                                    p.feature ? 'pj__tile--feature' : ''
                                                }`}
                                                data-idx={idx + 1}
                                                data-hover
                                            >
                                                <div
                                                    className="pj__tile-media"
                                                    data-cat={p.category}
                                                >
                                                    {p.image ? (
                                                        <img
                                                            className="pj__tile-img"
                                                            src={p.image}
                                                            alt={p.title}
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <span
                                                            className="pj__tile-ph"
                                                            aria-hidden="true"
                                                        >
                                                            {p.title.charAt(0)}
                                                        </span>
                                                    )}
                                                    <span className="pj__tile-index">
                                                        {String(idx + 1).padStart(2, '0')} /{' '}
                                                        {totalStr}
                                                    </span>
                                                </div>
                                                <div className="pj__tile-body">
                                                    <span className="pj__tile-cat">
                                                        {p.category}
                                                    </span>
                                                    <h2 className="pj__tile-title">{p.title}</h2>
                                                    <p className="pj__tile-blurb">{p.blurb}</p>
                                                    <span className="pj__tile-cue text-link">
                                                        {t('projects.view_project')}{' '}
                                                        <span aria-hidden="true">↗</span>
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ))}

                            {/* closing tile: future works */}
                            <div className="pj__col pj__col--future">
                                <div className="pj__future">
                                    <p className="eyebrow">{t('projects.future.title')}</p>
                                    <p className="pj__future-text">{t('projects.future.text')}</p>
                                    <span className="pj__future-note">
                                        {t('projects.future.note')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pj__progress" aria-hidden="true">
                        <span className="pj__progress-now">01</span>
                        <span className="pj__progress-rule">
                            <span className="pj__progress-fill" />
                        </span>
                        <span className="pj__progress-total">{totalStr}</span>
                        <span className="pj__progress-label">/ {t('nav.projects')}</span>
                    </div>
                </section>
            </div>

            {/* ============ OUTRO — vertical close + CTA ============ */}
            <section className="pj-outro">
                <Reveal className="pj-outro__block">
                    <p className="eyebrow pj-outro__eyebrow">{t('projects.outro.eyebrow')}</p>
                    <h2 className="pj-outro__title">{t('projects.outro.title')}</h2>
                    <Link className="text-link pj-outro__cta" href="/contact" data-hover>
                        {t('projects.outro.cta')} <span aria-hidden="true">↗</span>
                    </Link>
                </Reveal>
                <span className="pj-outro__coords" aria-hidden="true">
                    33.5731° N / 7.5898° W
                </span>
            </section>
        </main>
    );
}

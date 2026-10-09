'use client';

import React, { type CSSProperties } from 'react';
import { useLanguage } from '../../../components/LanguageContext';
import type { Project } from '../../projects.data';

/**
 * The brief: what needed to be built, as one statement — and beside it, a spec
 * sheet with everything a reader scans for first.
 */
export default function Brief({ p, idx }: { p: Project; idx: string }) {
    const { t } = useLanguage();
    const repo = p.github.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return (
        <section className="pj-sec pd-brief" id="brief" aria-labelledby="brief-title">
            <header className="pj-sec__label" data-reveal="fade">
                <span className="pj-sec__idx">{idx}</span>
                <h2 className="pj-sec__name" id="brief-title">
                    {t('projects.detail.brief')}
                </h2>
            </header>

            <p className="pd-brief__text" data-reveal>
                <bdi>{p.problem}</bdi>
            </p>

            <dl className="pd-spec" data-reveal style={{ '--d': '120ms' } as CSSProperties}>
                <div className="pd-spec__row">
                    <dt>{t('projects.index.discipline')}</dt>
                    <dd>
                        <bdi>{p.category}</bdi>
                    </dd>
                </div>
                <div className="pd-spec__row">
                    <dt>{t('projects.index.spec')}</dt>
                    <dd>
                        <bdi>{p.spec}</bdi>
                    </dd>
                </div>
                <div className="pd-spec__row">
                    <dt>{t('projects.detail.tools')}</dt>
                    <dd>
                        <bdi>{p.tags.join(' · ')}</bdi>
                    </dd>
                </div>
                <div className="pd-spec__row">
                    <dt>{t('projects.detail.delivered')}</dt>
                    <dd>{String(p.deliverables.length).padStart(2, '0')}</dd>
                </div>
                <div className="pd-spec__row">
                    <dt>{t('projects.detail.repo')}</dt>
                    <dd>
                        <a
                            className="pj-link"
                            href={p.github}
                            target="_blank"
                            rel="noreferrer"
                            dir="ltr"
                            data-hover
                            data-cursor={t('projects.contact.open')}
                        >
                            {repo}
                            <span className="pj-link__arrow" aria-hidden="true">
                                ↗
                            </span>
                        </a>
                    </dd>
                </div>
            </dl>
        </section>
    );
}

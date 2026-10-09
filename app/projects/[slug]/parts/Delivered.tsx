'use client';

import React, { type CSSProperties } from 'react';
import { useLanguage } from '../../../components/LanguageContext';
import type { Project } from '../../projects.data';

/** What shipped — a manifest, each line ruled in as it arrives. */
export default function Delivered({ p, idx }: { p: Project; idx: string }) {
    const { t } = useLanguage();
    return (
        <section className="pj-sec pd-deliv" id="delivered" aria-labelledby="delivered-title">
            <header className="pj-sec__label" data-reveal="fade">
                <span className="pj-sec__idx">{idx}</span>
                <h2 className="pj-sec__name" id="delivered-title">
                    {t('projects.detail.delivered')}
                </h2>
            </header>
            <ol className="pd-deliv__list">
                {p.deliverables.map((d, i) => (
                    <li key={i} className="pd-deliv__item" data-reveal="rule" style={{ '--d': `${i * 80}ms` } as CSSProperties}>
                        <span className="k-rule" aria-hidden="true" />
                        <span className="pd-deliv__n">{String(i + 1).padStart(2, '0')}</span>
                        <span className="pd-deliv__text">
                            <bdi>{d}</bdi>
                        </span>
                    </li>
                ))}
            </ol>
        </section>
    );
}

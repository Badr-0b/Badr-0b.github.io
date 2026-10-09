'use client';

import React, { type CSSProperties } from 'react';
import { useLanguage } from '../../components/LanguageContext';
import { scrollToId } from '../../kit/motion';
import { projects } from '../projects.data';

/**
 * The drawing register — every sheet in the set on one screen, the way a drawing
 * set's title sheet lists them. Scales to any number of projects; a row jumps to
 * its sheet, and the next, reserved sheet is listed honestly as not yet drawn.
 */
export default function Register() {
    const { t } = useLanguage();
    const reserved = String(projects.length + 1).padStart(2, '0');

    return (
        <section className="pj-sec pj-reg" id="index" aria-labelledby="index-title">
            <header className="pj-sec__label" data-reveal="fade">
                <span className="pj-sec__idx">00</span>
                <h2 className="pj-sec__name" id="index-title">
                    {t('projects.sec.index')}
                </h2>
            </header>

            <div className="pj-reg__table">
                <div className="pj-reg__head" aria-hidden="true" data-reveal="fade">
                    <span>{t('projects.index.no')}</span>
                    <span>{t('projects.index.work')}</span>
                    <span className="pj-reg__c-disc">{t('projects.index.discipline')}</span>
                    <span className="pj-reg__c-spec">{t('projects.index.spec')}</span>
                </div>
                <ol className="pj-reg__rows">
                    {projects.map((p, i) => (
                        <li key={p.slug} className="pj-reg__item" data-reveal="rule" style={{ '--d': `${i * 90}ms` } as CSSProperties}>
                            <span className="k-rule" aria-hidden="true" />
                            <a
                                className="pj-reg__row"
                                href={`#sheet-${p.slug}`}
                                data-hover
                                data-cursor={t('projects.sec.sheet')}
                                onClick={(e) => {
                                    e.preventDefault();
                                    scrollToId(`sheet-${p.slug}`);
                                }}
                            >
                                <span className="pj-reg__no">{String(i + 1).padStart(2, '0')}</span>
                                <span className="pj-reg__title">{p.title}</span>
                                <span className="pj-reg__disc">
                                    <bdi>{p.category}</bdi>
                                </span>
                                <span className="pj-reg__spec">
                                    <bdi>{p.spec}</bdi>
                                </span>
                                <span className="pj-reg__go" aria-hidden="true">
                                    ↓
                                </span>
                            </a>
                        </li>
                    ))}
                    <li
                        className="pj-reg__item is-reserved"
                        data-reveal="rule"
                        style={{ '--d': `${projects.length * 90}ms` } as CSSProperties}
                    >
                        <span className="k-rule" aria-hidden="true" />
                        <div className="pj-reg__row">
                            <span className="pj-reg__no">{reserved}</span>
                            <span className="pj-reg__title">—</span>
                            <span className="pj-reg__disc">{t('projects.index.reserved')}</span>
                            <span className="pj-reg__spec">{t('projects.index.reserved.spec')}</span>
                            <span className="pj-reg__go" aria-hidden="true">
                                ·
                            </span>
                        </div>
                    </li>
                </ol>
            </div>
        </section>
    );
}

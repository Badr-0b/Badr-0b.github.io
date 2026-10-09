'use client';

import React, { useMemo, type CSSProperties } from 'react';
import { useLanguage } from '../../components/LanguageContext';
import Plate from '../../kit/Plate';
import { blankSheet } from '../../kit/draw';
import { FENERIS } from '../../about/about.data';

/**
 * The next sheet, reserved: a blank plate (a grid and a centre mark, nothing drawn
 * yet) and two plain lines. Honest about what isn't here — and the one thing
 * elsewhere worth knowing: Feneris.
 */
export default function Reserved({ index }: { index: number }) {
    const { t } = useLanguage();
    const no = String(index + 1).padStart(2, '0');
    const drawing = useMemo(() => blankSheet(`${t('projects.sec.sheet')} ${no} · ${t('projects.index.reserved')}`), [t, no]);

    return (
        <section className="pj-sec pj-next" id="next" aria-labelledby="next-title">
            <header className="pj-sec__label" data-reveal="fade">
                <span className="pj-sec__idx">{no}</span>
                <h2 className="pj-sec__name" id="next-title">
                    {t('projects.sec.next')}
                </h2>
            </header>

            <div className="pj-next__text">
                <p className="pj-next__title" data-reveal="mask">
                    <span className="k-mask">{t('projects.reserved.title')}</span>
                </p>
                <p className="pj-next__note" data-reveal style={{ '--d': '100ms' } as CSSProperties}>
                    {t('projects.reserved.note')}
                </p>
                <p className="pj-next__also" data-reveal style={{ '--d': '200ms' } as CSSProperties}>
                    <span className="pj-next__also-k">{t('projects.also')}</span>
                    <span>
                        {t('projects.also.feneris')}{' '}
                        <a
                            className="pj-link"
                            href={FENERIS.href}
                            target="_blank"
                            rel="noreferrer"
                            data-hover
                            data-cursor={t('projects.contact.open')}
                        >
                            {FENERIS.label}
                            <span className="pj-link__arrow" aria-hidden="true">
                                ↗
                            </span>
                        </a>
                    </span>
                </p>
            </div>

            <div className="pj-next__plate">
                <Plate drawing={drawing} build="time" strip={false} probe={false} className="is-blank" />
            </div>
        </section>
    );
}

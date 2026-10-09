'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../components/LanguageContext';
import Plate from '../../../kit/Plate';
import { drawingFor } from '../../../kit/draw';
import type { Project } from '../../projects.data';

/**
 * The way on: the repository, and the next sheet in the set — its drawing waits
 * beside the title and comes forward when you reach for it.
 */
export default function NextSheet({
    p,
    next,
    index,
    total,
    idx,
}: {
    p: Project;
    next: Project;
    index: number;
    total: number;
    idx: string;
}) {
    const { t } = useLanguage();
    const drawing = useMemo(() => drawingFor(next.slug, next.kind, next.title), [next]);
    const nn = String(((index + 1) % total) + 1).padStart(2, '0');
    const repo = p.github.replace(/^https?:\/\//, '').replace(/\/$/, '');

    return (
        <section className="pj-sec pd-next" id="next" aria-labelledby="next-title">
            <header className="pj-sec__label" data-reveal="fade">
                <span className="pj-sec__idx">{idx}</span>
                <h2 className="pj-sec__name" id="next-title">
                    {t('projects.sec.next')}
                </h2>
            </header>

            <div className="pd-next__body">
                <ul className="pj-rows pd-next__rows">
                    <li className="pj-row">
                        <a
                            className="pj-row__in"
                            href={p.github}
                            target="_blank"
                            rel="noreferrer"
                            data-reveal
                            data-hover
                            data-cursor={t('projects.contact.open')}
                        >
                            <span className="pj-row__k">{t('projects.detail.repo')}</span>
                            <span className="pj-row__v" dir="ltr">
                                {repo}
                            </span>
                            <span className="pj-row__act" aria-hidden="true">
                                ↗
                            </span>
                        </a>
                    </li>
                </ul>

                <Link className="pd-sheetlink" href={`/projects/${next.slug}/`} data-hover data-cursor={t('projects.detail.next')} data-reveal>
                    <span className="pd-sheetlink__k">
                        {t('projects.detail.next')} — {nn} / {String(total).padStart(2, '0')}
                    </span>
                    <span className="pd-sheetlink__title">{next.title}</span>
                    <span className="pd-sheetlink__spec">
                        <bdi>{next.spec}</bdi>
                    </span>
                    <span className="pd-sheetlink__arrow" aria-hidden="true">
                        →
                    </span>
                    <span className="pd-sheetlink__plate" aria-hidden="true">
                        <Plate drawing={drawing} build="static" strip={false} probe={false} />
                    </span>
                </Link>
            </div>
        </section>
    );
}

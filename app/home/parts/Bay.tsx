'use client';

import React, { useMemo, type CSSProperties } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../components/LanguageContext';
import Plate from '../../kit/Plate';
import { drawingFor } from '../../kit/draw';
import { ROSE } from '../../kit/draw';
import Bearing from '../../kit/Bearing';
import type { Project } from '../../projects/projects.data';
import type { Mode } from '../useShow';

/** One artifact's sheet: in the pinned stage it rises in beside the 3D; in flow it carries its drawing. */
function Panel({ p, k, n, mode, onFocus }: { p: Project; k: number; n: number; mode: Mode; onFocus: () => void }) {
    const { t } = useLanguage();
    const drawing = useMemo(() => drawingFor(p.slug, p.kind, p.title), [p.slug, p.kind, p.title]);
    const flow = mode === 'flow';

    return (
        <li className="hm-panel" id={`work-${k}`} data-sh="panel">
            <p className="hm-panel__head" data-reveal="rule">
                <span className="hm-panel__no" dir="ltr">
                    {String(k + 1).padStart(2, '0')} <span className="hm-panel__of">/ {String(n).padStart(2, '0')}</span>
                </span>
                <span className="k-rule" aria-hidden="true" />
                <span className="hm-panel__cat">{p.category}</span>
            </p>

            {flow && (
                <div className="hm-panel__plate">
                    <Plate drawing={drawing} build="scroll" strip={false}>
                        {p.slug === 'azimuth' && <Bearing cx={ROSE.cx} cy={ROSE.cy} r={ROSE.r} />}
                    </Plate>
                </div>
            )}

            <div className="hm-panel__body" data-reveal={flow ? '' : undefined}>
                <h3 className="hm-panel__title">{p.title}</h3>
                <p className="hm-panel__blurb">
                    <bdi>{p.blurb}</bdi>
                </p>
                <dl className="hm-panel__spec">
                    <div>
                        <dt>{t('home.bay.spec')}</dt>
                        <dd>
                            <bdi>{p.spec}</bdi>
                        </dd>
                    </div>
                    <div>
                        <dt>{t('projects.detail.tools')}</dt>
                        <dd>
                            <bdi>{p.tags.join(' · ')}</bdi>
                        </dd>
                    </div>
                </dl>
                <Link
                    className="hm-panel__link"
                    href={`/projects/${p.slug}/`}
                    data-hover
                    data-cursor={t('projects.contact.open')}
                    onFocus={onFocus}
                >
                    <span className="hm-panel__link-text">{t('projects.view_project')}</span>
                    <span className="hm-panel__link-arrow" aria-hidden="true">
                        ↗
                    </span>
                </Link>
            </div>
        </li>
    );
}

/**
 * 01 · Selected work. Pinned (wide screens, motion allowed): a tall track holds the
 * stage while the camera travels the rail; panels and the register are driven by
 * useShow. In flow: the same panels as a list, each with its drawing rebuilding.
 */
export default function Bay({
    items,
    mode,
    goTo,
    onHot,
}: {
    items: Project[];
    mode: Mode;
    goTo: (k: number) => void;
    onHot: (k: number) => void;
}) {
    const { t } = useLanguage();
    const n = items.length;

    return (
        <section className="hm-bay" id="work" aria-labelledby="work-title" style={{ '--n': n } as CSSProperties}>
            <div className="hm-bay__stage">
                <div className="hm-bay__frame" aria-hidden="true" />

                <header className="hm-bay__label" data-sh="bay-chrome">
                    <div className="hm-sec__label" data-reveal="fade">
                        <span className="hm-sec__idx">01</span>
                        <h2 className="hm-sec__name" id="work-title">
                            {t('home.selected_work.title')}
                        </h2>
                    </div>
                </header>

                <ol className="hm-bay__panels">
                    {items.map((p, k) => (
                        <Panel key={p.slug} p={p} k={k} n={n} mode={mode} onFocus={() => mode === 'pinned' && goTo(k)} />
                    ))}
                </ol>

                <nav className="hm-bay__reg" data-sh="bay-chrome" aria-label={t('home.selected_work.title')}>
                    <ol className="hm-reg">
                        {items.map((p, k) => (
                            <li key={p.slug}>
                                <button
                                    type="button"
                                    className="hm-reg__item"
                                    data-sh="reg"
                                    data-hover
                                    onClick={() => goTo(k)}
                                    onPointerEnter={(e) => e.pointerType === 'mouse' && onHot(k)}
                                    onPointerLeave={(e) => e.pointerType === 'mouse' && onHot(-1)}
                                >
                                    <span className="hm-reg__n">{String(k + 1).padStart(2, '0')}</span>
                                    <span className="hm-reg__name">{p.title}</span>
                                </button>
                            </li>
                        ))}
                    </ol>
                    <span className="hm-reg__rule" aria-hidden="true">
                        <span className="hm-reg__fill" data-sh="reg-fill" />
                    </span>
                    <Link className="hm-reg__all" href="/projects/" data-hover>
                        {t('projects.detail.back')} <span aria-hidden="true">↗</span>
                    </Link>
                </nav>

                <p className="hm-bay__hint" data-sh="bay-chrome" aria-hidden="true">
                    {t('home.bay.drag')} <span className="hm-bay__hint-sep">·</span> {t('home.bay.click')}
                </p>
            </div>
        </section>
    );
}

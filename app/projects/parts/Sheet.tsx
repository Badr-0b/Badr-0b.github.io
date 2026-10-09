'use client';

import React, { useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../components/LanguageContext';
import Plate from '../../kit/Plate';
import { drawingFor } from '../../kit/draw';
import { ROSE } from '../../kit/draw';
import Bearing from '../../kit/Bearing';
import type { Project } from '../projects.data';

/** Three compositions, cycled — so consecutive sheets never share an anchor line. */
const VARIANTS = ['a', 'b', 'c'] as const;

/**
 * One sheet of the set: a title strip, the drawing (rebuilding with the scroll),
 * and the copy — title, one line, three notes keyed to balloons on the drawing.
 * Hover a note and its part lights; hover a part and the probe names it.
 */
export default function Sheet({
    project: p,
    index,
    total,
    label,
}: {
    project: Project;
    index: number;
    total: number;
    label: string;
}) {
    const { t } = useLanguage();
    const [active, setActive] = useState<string[] | null>(null);
    const drawing = useMemo(() => drawingFor(p.slug, p.kind, p.title), [p.slug, p.kind, p.title]);
    const notes = useMemo(() => p.notes.slice(0, 3).map((nt, i) => ({ n: i + 1, part: nt.part })), [p.notes]);
    const variant = VARIANTS[index % VARIANTS.length];
    const ids = (part: string | string[]) => (Array.isArray(part) ? part : [part]);
    const isOn = (part: string | string[]) => !!active && ids(part).some((id) => active.includes(id));

    return (
        <section
            id={`sheet-${p.slug}`}
            className={`pj-sheet pj-sheet--${variant}`}
            aria-labelledby={`sheet-${p.slug}-title`}
        >
            <header className="pj-sheet__head" data-reveal="rule">
                <span className="pj-sheet__no">
                    {label} <span className="pj-sheet__of">/ {String(total).padStart(2, '0')}</span>
                </span>
                <span className="k-rule" aria-hidden="true" />
                <span className="pj-sheet__cat">{p.category}</span>
            </header>

            <div className="pj-sheet__plate">
                <Plate drawing={drawing} build="scroll" notes={notes} active={active} onActive={setActive}>
                    {p.slug === 'azimuth' && <Bearing cx={ROSE.cx} cy={ROSE.cy} r={ROSE.r} />}
                </Plate>
            </div>

            <div className="pj-sheet__text">
                <h2 className="pj-sheet__title" id={`sheet-${p.slug}-title`} data-reveal="mask">
                    <span className="k-mask">{p.title}</span>
                </h2>
                <p className="pj-sheet__blurb" data-reveal style={{ '--d': '90ms' } as CSSProperties}>
                    <bdi>{p.blurb}</bdi>
                </p>
                <ol className="pj-sheet__notes" aria-label={t('projects.sheet.notes')} data-reveal style={{ '--d': '180ms' } as CSSProperties}>
                    {p.notes.slice(0, 3).map((nt, i) => (
                        <li key={i}>
                            <button
                                type="button"
                                className={`pj-note ${isOn(nt.part) ? 'is-on' : ''}`}
                                onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(ids(nt.part))}
                                onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
                                onFocus={() => setActive(ids(nt.part))}
                                onBlur={() => setActive(null)}
                                onClick={() => setActive(isOn(nt.part) ? null : ids(nt.part))}
                            >
                                <span className="pj-note__n">{i + 1}</span>
                                <span className="pj-note__text">
                                    <bdi>{nt.text}</bdi>
                                </span>
                            </button>
                        </li>
                    ))}
                </ol>
                <Link
                    className="pj-sheet__link"
                    href={`/projects/${p.slug}/`}
                    data-hover
                    data-cursor={t('projects.view_project')}
                    data-reveal
                    style={{ '--d': '260ms' } as CSSProperties}
                >
                    <span className="pj-sheet__link-text">{t('projects.view_project')}</span>
                    <span className="pj-sheet__link-arrow" aria-hidden="true">
                        ↗
                    </span>
                </Link>
            </div>
        </section>
    );
}

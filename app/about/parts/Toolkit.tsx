'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../components/LanguageContext';
import { allTools, toolkit, works, type Tool, type Work, type WorkId } from '../about.data';
import { scrollToId } from '../../kit/motion';

type Sel = { kind: 'tool'; id: string } | { kind: 'work'; id: WorkId } | null;

const sameSel = (a: Sel, b: Sel) => !!a && !!b && a.kind === b.kind && a.id === b.id;

/**
 * "What I work with" — two sides, one practice. No skill bars (they measure nothing);
 * instead every tool is traceable to the work that used it, and every work lights up
 * the tools behind it. Hover to preview, click / tap to pin, Esc or click away to clear.
 */
export default function Toolkit() {
    const { t } = useLanguage();
    const rootRef = useRef<HTMLDivElement>(null);
    const [sel, setSel] = useState<Sel>(null);
    const [pinned, setPinned] = useState(false);

    const toolById = useMemo(() => new Map(allTools.map((tl) => [tl.id, tl])), []);
    const counts = useMemo(() => {
        const m = new Map<WorkId, number>();
        allTools.forEach((tl) => tl.works.forEach((w) => m.set(w, (m.get(w) ?? 0) + 1)));
        return m;
    }, []);

    const activeTool = sel?.kind === 'tool' ? toolById.get(sel.id) : undefined;
    const activeWork = sel?.kind === 'work' ? works.find((w) => w.id === sel.id) : undefined;
    const litWorks = new Set<WorkId>(activeTool ? activeTool.works : activeWork ? [activeWork.id] : []);
    const isLit = (tl: Tool) =>
        activeTool ? tl.id === activeTool.id : activeWork ? tl.works.includes(activeWork.id) : false;

    const workName = (w: Work) => (w.nameKey ? t(w.nameKey) : w.name ?? '');
    const toolName = (tl: Tool) => (tl.nameKey ? t(tl.nameKey) : tl.name);

    const clear = () => {
        setPinned(false);
        setSel(null);
    };

    // pinned selections clear on Escape or a click anywhere else
    useEffect(() => {
        if (!pinned) return;
        const onDown = (e: PointerEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) clear();
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') clear();
        };
        document.addEventListener('pointerdown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [pinned]);

    const handlers = (next: Exclude<Sel, null>) => ({
        onPointerEnter: (e: React.PointerEvent) => {
            if (e.pointerType === 'mouse' && !pinned) setSel(next);
        },
        onPointerLeave: (e: React.PointerEvent) => {
            if (e.pointerType === 'mouse' && !pinned) setSel(null);
        },
        onFocus: () => {
            if (!pinned) setSel(next);
        },
        onBlur: () => {
            if (!pinned) setSel(null);
        },
        onClick: () => {
            if (pinned && sameSel(sel, next)) return clear();
            setSel(next);
            setPinned(true);
        },
    });

    const workLink = (w: Work, label: React.ReactNode) => {
        if (!w.href) return <span className="ab-kit__target">{label}</span>;
        if (w.href.startsWith('#')) {
            const id = w.href.slice(1);
            return (
                <a
                    className="ab-kit__target is-link"
                    href={w.href}
                    data-hover
                    onClick={(e) => {
                        e.preventDefault();
                        scrollToId(id);
                    }}
                >
                    {label}
                </a>
            );
        }
        return (
            <Link className="ab-kit__target is-link" href={w.href} data-hover>
                {label}
            </Link>
        );
    };

    return (
        <div className={`ab-kit ${sel ? 'has-sel' : ''}`} ref={rootRef}>
            <div className="ab-kit__head" data-reveal>
                <p className="ab-kit__title">{t('about.kit.title')}</p>
                <p className="ab-kit__hint">{t('about.kit.hint')}</p>
            </div>

            <div className="ab-kit__works" data-reveal style={{ '--d': '80ms' } as React.CSSProperties}>
                <span className="ab-kit__works-k">{t('about.kit.works')}</span>
                <ul className="ab-kit__works-list">
                    {works.map((w) => {
                        const me: Sel = { kind: 'work', id: w.id };
                        return (
                            <li key={w.id}>
                                <button
                                    type="button"
                                    className={`ab-work ${litWorks.has(w.id) ? 'is-on' : ''}`}
                                    aria-pressed={pinned && sameSel(sel, me)}
                                    data-cursor={t('about.kit.trace')}
                                    {...handlers(me)}
                                >
                                    <span className="ab-work__name">{workName(w)}</span>
                                    <span className="ab-work__n">
                                        {String(counts.get(w.id) ?? 0).padStart(2, '0')}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="ab-kit__sides">
                {toolkit.map((side, si) => {
                    const n = side.groups.reduce((a, g) => a + g.tools.length, 0);
                    return (
                        <div
                            key={side.key}
                            className="ab-kit__side"
                            data-reveal
                            style={{ '--d': `${140 + si * 110}ms` } as React.CSSProperties}
                        >
                            <h3 className="ab-kit__side-title">
                                <span>{t(`about.stack.${side.key}`)}</span>
                                <span className="ab-kit__side-n">{String(n).padStart(2, '0')}</span>
                            </h3>
                            {side.groups.map((g) => (
                                <div key={g.key} className="ab-kit__group">
                                    <p className="ab-kit__group-name">{t(`about.kit.g.${g.key}`)}</p>
                                    <ul className="ab-kit__list">
                                        {g.tools.map((tl) => {
                                            const me: Sel = { kind: 'tool', id: tl.id };
                                            return (
                                                <li key={tl.id}>
                                                    <button
                                                        type="button"
                                                        className={`ab-tool ${isLit(tl) ? 'is-on' : ''} ${
                                                            tl.works.length ? '' : 'is-general'
                                                        }`}
                                                        aria-pressed={pinned && sameSel(sel, me)}
                                                        data-cursor={t('about.kit.trace')}
                                                        {...handlers(me)}
                                                    >
                                                        {toolName(tl)}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            <div className={`ab-kit__readout ${sel ? 'has-sel' : ''}`} aria-live="polite">
                <span className="ab-kit__readout-k">{t('about.kit.trace')}</span>
                {!sel && <span className="ab-kit__readout-idle">{t('about.kit.idle')}</span>}

                {activeTool && (
                    <span className="ab-kit__readout-body" key={`tool-${activeTool.id}`}>
                        <span className="ab-kit__readout-name">{toolName(activeTool)}</span>
                        <span className="ab-kit__wire" aria-hidden="true" />
                        {activeTool.works.length ? (
                            <span className="ab-kit__targets">
                                <span className="ab-kit__targets-k">{t('about.kit.used')}</span>
                                {activeTool.works.map((id) => {
                                    const w = works.find((x) => x.id === id);
                                    return w ? <React.Fragment key={id}>{workLink(w, workName(w))}</React.Fragment> : null;
                                })}
                            </span>
                        ) : (
                            <span className="ab-kit__general">{t('about.kit.general')}</span>
                        )}
                    </span>
                )}

                {activeWork && (
                    <span className="ab-kit__readout-body" key={`work-${activeWork.id}`}>
                        <span className="ab-kit__readout-name">{workName(activeWork)}</span>
                        <span className="ab-kit__wire" aria-hidden="true" />
                        <span className="ab-kit__targets">
                            <span className="ab-kit__targets-k">{activeWork.meta}</span>
                            <span className="ab-kit__targets-k">
                                {counts.get(activeWork.id) ?? 0} {t('about.kit.tools')}
                            </span>
                            {activeWork.href &&
                                workLink(
                                    activeWork,
                                    <>
                                        {t('about.kit.view')} <span aria-hidden="true">↗</span>
                                    </>
                                )}
                        </span>
                    </span>
                )}

                {pinned && (
                    <button type="button" className="ab-kit__clear" onClick={clear} data-hover>
                        {t('about.kit.clear')} <span aria-hidden="true">✕</span>
                    </button>
                )}
            </div>
        </div>
    );
}

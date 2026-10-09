'use client';

import React, { useEffect, useRef, type CSSProperties } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLanguage } from '../../../components/LanguageContext';
import { onFrame, onMeasure, reducedMotion, span } from '../../../kit/motion';
import type { Project } from '../../projects.data';

const Specimen = dynamic(() => import('../../../kit/three/Specimen'), { ssr: false });

/**
 * A sheet's hero: the line holds the upper left, the specimen takes the lower right
 * and separates into its layers as you scroll — a diagonal, the inverse of the index.
 */
export default function DetailHero({ p, index, total, rev }: { p: Project; index: number; total: number; rev: string }) {
    const { t } = useLanguage();
    const heroRef = useRef<HTMLElement>(null);
    const copyRef = useRef<HTMLDivElement>(null);
    const n = String(index + 1).padStart(2, '0');
    const key = `projects.line.${p.slug}`;
    const line = t(key) !== key ? t(key) : p.line;

    useEffect(() => {
        const hero = heroRef.current;
        const copy = copyRef.current;
        if (!hero || !copy || reducedMotion()) return;
        let H = 1;
        let track = 1;
        const offMeasure = onMeasure(() => {
            H = hero.offsetHeight;
            // pinned (desktop): the hero is taller than the screen and its stage sticks
            track = H - window.innerHeight > 40 ? H - window.innerHeight : 0;
        });
        const offFrame = onFrame(({ y }) => {
            if (y > H) return false;
            if (track) {
                // the copy steps aside early, leaving the specimen the whole stage
                const q = span(y, track * 0.04, track * 0.36);
                copy.style.transform = `translate3d(0, ${(-q * 48).toFixed(1)}px, 0)`;
                copy.style.opacity = (1 - q).toFixed(3);
            } else {
                copy.style.transform = `translate3d(0, ${(-y * 0.1).toFixed(1)}px, 0)`;
                copy.style.opacity = (1 - span(y, H * 0.3, H * 0.8)).toFixed(3);
            }
            return false;
        });
        return () => {
            offFrame();
            offMeasure();
            copy.style.transform = '';
            copy.style.opacity = '';
        };
    }, []);

    return (
        <header className="pd-hero" ref={heroRef}>
            <div className="pd-hero__pin">
            <div className="pd-hero__stage">
                <Specimen slug={p.slug} kind={p.kind} title={p.title} />
            </div>

            <Link className="pd-back" href="/projects/" data-hover data-in style={{ '--d': '80ms' } as CSSProperties}>
                <span className="pd-back__arrow" aria-hidden="true">
                    ←
                </span>
                {t('projects.detail.back')}
            </Link>

            <div className="pd-hero__meta" data-in style={{ '--d': '900ms' } as CSSProperties}>
                <span>
                    {t('projects.sec.sheet')} {n} / {String(total).padStart(2, '0')} — {t('projects.meta.rev')} {rev}
                </span>
                <span>{p.category}</span>
            </div>

            <div className="pd-hero__copy" ref={copyRef}>
                <p className="pd-hero__eyebrow" data-in style={{ '--d': '160ms' } as CSSProperties}>
                    <span className="pd-hero__eyebrow-n">({n})</span>
                    {p.title}
                </p>
                <h1 className="pd-hero__title" data-in="mask" style={{ '--d': '280ms' } as CSSProperties}>
                    <span className="k-sr">{p.title} — </span>
                    {line}
                </h1>
                <p className="pd-hero__sub" data-in style={{ '--d': '480ms' } as CSSProperties}>
                    <bdi>{p.blurb}</bdi>
                </p>
                <ul className="pd-hero__tags" data-in style={{ '--d': '620ms' } as CSSProperties}>
                    {p.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                    ))}
                </ul>
            </div>

            <div className="pd-hero__foot" data-in style={{ '--d': '1040ms' } as CSSProperties} aria-hidden="true">
                <span>[ {n} ]</span>
                <span>
                    {t('projects.hero.cue')} <span className="pd-hero__cue-arrow">↓</span>
                </span>
            </div>
            </div>
        </header>
    );
}

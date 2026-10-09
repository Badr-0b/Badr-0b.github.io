'use client';

import React, { useEffect, useRef, type CSSProperties } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '../../components/LanguageContext';
import { onFrame, onMeasure, reducedMotion, span } from '../../kit/motion';
import { projects } from '../projects.data';

// The bench is WebGL — client-only, loaded after first paint so the copy is never held up.
const Bench = dynamic(() => import('../../kit/three/Bench'), { ssr: false });

/**
 * The index hero, mirrored from /about's: the objects hold the left, the copy sinks to
 * the lower right like a drawing's title block, metadata keeps the upper corner.
 */
export default function Hero({ rev }: { rev: string }) {
    const { t } = useLanguage();
    const heroRef = useRef<HTMLElement>(null);
    const copyRef = useRef<HTMLDivElement>(null);

    // the copy leaves a little faster than the page (it sits nearer), fading as it goes
    useEffect(() => {
        const hero = heroRef.current;
        const copy = copyRef.current;
        if (!hero || !copy || reducedMotion()) return;
        let H = 1;
        let parked = false;
        const offMeasure = onMeasure(() => {
            H = hero.offsetHeight;
            parked = false;
        });
        const offFrame = onFrame(({ y }) => {
            if (y > H) {
                if (!parked) {
                    copy.style.opacity = '0';
                    parked = true;
                }
                return false;
            }
            parked = false;
            copy.style.transform = `translate3d(0, ${(-y * 0.12).toFixed(1)}px, 0)`;
            copy.style.opacity = (1 - span(y, H * 0.22, H * 0.78)).toFixed(3);
            return false;
        });
        return () => {
            offFrame();
            offMeasure();
            copy.style.transform = '';
            copy.style.opacity = '';
        };
    }, []);

    const n = String(projects.length).padStart(2, '0');

    return (
        <header className="pj-hero" ref={heroRef}>
            <div className="pj-hero__stage">
                <Bench />
            </div>

            <div className="pj-hero__meta" data-in style={{ '--d': '900ms' } as CSSProperties}>
                <span>
                    {t('projects.meta.index')} — {t('projects.meta.rev')} {rev}
                </span>
                <span>
                    {n} {t('projects.meta.works')} · {t('projects.meta.nts')}
                </span>
            </div>

            <div className="pj-hero__copy" ref={copyRef}>
                <p className="pj-hero__eyebrow" data-in style={{ '--d': '160ms' } as CSSProperties}>
                    <span className="pj-hero__eyebrow-n">(01)</span>
                    {t('projects.hero.eyebrow')}
                </p>
                <h1 className="pj-hero__title" data-in="mask" style={{ '--d': '280ms' } as CSSProperties}>
                    {t('projects.hero.title')}
                </h1>
                <p className="pj-hero__sub" data-in style={{ '--d': '500ms' } as CSSProperties}>
                    {t('projects.hero.sub')}
                </p>
            </div>

            <div className="pj-hero__foot" data-in style={{ '--d': '1040ms' } as CSSProperties} aria-hidden="true">
                <span className="pj-hero__idx">[ 01 ]</span>
                <span className="pj-hero__cue">
                    {t('projects.hero.cue')} <span className="pj-hero__cue-arrow">↓</span>
                </span>
            </div>
        </header>
    );
}

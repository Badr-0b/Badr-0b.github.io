'use client';

import React, { type CSSProperties } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../components/LanguageContext';
import { scrollToId, useMagnet } from '../../kit/motion';

/**
 * The hero — the copy sinks to the lower left; the viewport (drawn by the pin
 * beneath, see Frame and Showcase) holds the right, its bottom edge on the copy's
 * last line. View work leads; getting in touch sits apart, in the far corner.
 */
export default function Hero() {
    const { t } = useLanguage();
    const workArrow = useMagnet<HTMLSpanElement>(0.22, 5);
    const touchArrow = useMagnet<HTMLSpanElement>(0.22, 5);

    return (
        <header className="hm-hero">
            <div className="hm-hero__view" aria-hidden="true" />

            <div className="hm-hero__copy" data-sh="copy">
                <p className="hm-hero__eyebrow" data-in style={{ '--d': '120ms' } as CSSProperties}>
                    <span className="hm-hero__eyebrow-n">(00)</span>
                    {t('home.hero.eyebrow')}
                </p>
                <h1 className="hm-hero__title" data-in="mask" style={{ '--d': '240ms' } as CSSProperties}>
                    <span className="k-sr">Badr Obtel — </span>
                    {t('home.hero.title')}
                </h1>
                <p className="hm-hero__sub" data-in style={{ '--d': '460ms' } as CSSProperties}>
                    {t('home.hero.sub')}
                </p>
                <div className="hm-hero__cta" data-in style={{ '--d': '600ms' } as CSSProperties}>
                    <Link className="hm-cta" href="/projects/" data-hover data-cursor={t('projects.contact.open')} data-magnet-zone>
                        <span className="hm-cta__text">{t('home.hero.cta.work')}</span>
                        <span className="hm-cta__arrow" ref={workArrow} aria-hidden="true">
                            ↗
                        </span>
                    </Link>
                </div>
            </div>

            <div className="hm-hero__foot" data-sh="foot">
                <span className="hm-hero__cue" data-in style={{ '--d': '960ms' } as CSSProperties} aria-hidden="true">
                    {t('home.hero.cue')} <span className="hm-hero__cue-arrow">↓</span>
                </span>
                <span className="hm-hero__foot-end" data-in style={{ '--d': '1040ms' } as CSSProperties}>
                    <a
                        className="hm-touch"
                        href="#contact"
                        data-hover
                        data-magnet-zone
                        onClick={(e) => {
                            e.preventDefault();
                            scrollToId('contact');
                        }}
                    >
                        {t('home.hero.cta.contact')}
                        <span className="hm-touch__arrow" ref={touchArrow} aria-hidden="true">
                            →
                        </span>
                    </a>
                    <span className="hm-hero__idx" aria-hidden="true">
                        [ 00 ]
                    </span>
                </span>
            </div>
        </header>
    );
}

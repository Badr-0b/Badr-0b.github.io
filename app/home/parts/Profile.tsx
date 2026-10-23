'use client';

import React, { useEffect, useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../components/LanguageContext';
import Odometer from '../../kit/Odometer';
import { damp, onFrame, onMeasure, reducedMotion, span } from '../../kit/motion';
import { characteristics, type Characteristic } from '../home.data';

/** The statement's words come up out of the dark as it crosses the screen — a straight tie to the scroll. */
function Statement({ text, split }: { text: string; split: boolean }) {
    const ref = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const words = Array.from(el.querySelectorAll<HTMLElement>('[data-w]'));
        const targets = words.length ? words : [el];
        if (reducedMotion()) return;
        el.dataset.live = '';
        let top = 0;
        let H = 1;
        let p = -1;
        const last = targets.map(() => -1);
        const offMeasure = onMeasure(() => {
            const r = el.getBoundingClientRect();
            top = r.top + window.scrollY;
            H = r.height;
        });
        const offFrame = onFrame(({ y, vh, dt }) => {
            const target = span(y, top - vh * 0.82, top + H - vh * 0.42);
            p = p < 0 ? target : damp(p, target, 7, dt);
            const N = targets.length;
            targets.forEach((w, i) => {
                const a = N > 1 ? (i / N) * 0.82 : 0;
                const v = 0.16 + 0.84 * span(p, a, a + (N > 1 ? 0.18 : 1));
                if (Math.abs(v - last[i]) < 0.003) return;
                last[i] = v;
                w.style.opacity = v.toFixed(3);
            });
            return Math.abs(target - p) > 0.0004;
        });
        return () => {
            offFrame();
            offMeasure();
            delete el.dataset.live;
            targets.forEach((w) => (w.style.opacity = ''));
        };
    }, [text, split]);

    return (
        <p className="hm-pro__statement" ref={ref}>
            {split
                ? text.split(/(\s+)/).map((w, i) =>
                      /^\s+$/.test(w) ? (
                          w
                      ) : (
                          <span key={i} data-w>
                              {w}
                          </span>
                      )
                  )
                : text}
        </p>
    );
}

function Row({ c, i }: { c: Characteristic; i: number }) {
    const { t } = useLanguage();
    const barRef = useRef<HTMLSpanElement>(null);
    // a translated unit is a word and flows with the page; a Latin unit or ratio stays in the figure's LTR run
    const word = c.unitKey ? t(c.unitKey) : null;

    return (
        <li className="hm-char__item" data-reveal="rule" style={{ '--d': `${i * 80}ms` } as CSSProperties}>
            <span className="k-rule" aria-hidden="true" />
            <Link className="hm-char__row" href={c.href} data-hover data-cursor={t('projects.contact.open')}>
                <span className="hm-char__k">{t(`home.char.${c.id}.k`)}</span>
                <span className="hm-char__v">
                    <Odometer
                        value={c.value}
                        from={c.from}
                        digits={c.digits}
                        decimals={c.decimals}
                        onProgress={
                            c.bar !== undefined
                                ? (p) => {
                                      if (barRef.current)
                                          barRef.current.style.transform = `scaleX(${(1 + (c.bar! - 1) * p).toFixed(4)})`;
                                  }
                                : undefined
                        }
                        suffix={c.unit ? <span className="hm-char__u">{c.unit}</span> : undefined}
                    />
                    {word && <span className="hm-char__u">{word}</span>}
                </span>
                <span className="hm-char__c">
                    <bdi>{t(`home.char.${c.id}.c`)}</bdi>
                    {c.bar !== undefined && (
                        <span className="hm-char__bar" aria-hidden="true">
                            <span className="hm-char__bar-fill" ref={barRef} />
                        </span>
                    )}
                </span>
                <span className="hm-char__go" aria-hidden="true">
                    ↗
                </span>
            </Link>
        </li>
    );
}

/** 03 · Profile — who, in three sentences, and the figures that back them. */
export default function Profile() {
    const { t, language } = useLanguage();
    const split = language === 'en' || language === 'fr';

    return (
        <section className="hm-sec hm-pro" id="profile" aria-labelledby="profile-title">
            <header className="hm-sec__label" data-reveal="fade">
                <span className="hm-sec__idx">03</span>
                <h2 className="hm-sec__name" id="profile-title">
                    {t('about.sec.profile')}
                </h2>
            </header>

            <div className="hm-pro__text">
                <Statement text={t('home.about.blurb')} split={split} />
                <Link className="hm-pro__more" href="/about/" data-hover data-reveal>
                    <span className="hm-pro__more-text">{t('home.about.more')}</span>
                    <span className="hm-pro__more-arrow" aria-hidden="true">
                        ↗
                    </span>
                </Link>
            </div>

            <div className="hm-char">
                <p className="hm-char__title" data-reveal="fade">
                    {t('home.char.title')}
                </p>
                <div className="hm-char__cols" aria-hidden="true" data-reveal="fade">
                    <span>{t('home.char.k.param')}</span>
                    <span>{t('home.char.k.value')}</span>
                    <span className="hm-char__cols-c">{t('home.char.k.cond')}</span>
                </div>
                <ul className="hm-char__rows">
                    {characteristics.map((c, i) => (
                        <Row key={c.id} c={c} i={i} />
                    ))}
                </ul>
            </div>
        </section>
    );
}

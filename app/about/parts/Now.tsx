'use client';

import React, { useEffect, useState, type CSSProperties } from 'react';
import { useLanguage } from '../../components/LanguageContext';
import { FENERIS, PLACE, spoken } from '../about.data';

/**
 * Local time in Salmiya, and how far that is from the visitor's own clock.
 * Live data, not decoration: it changes once a minute, on the minute.
 */
function LocalTime() {
    const { t } = useLanguage();
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());
        let id = 0;
        const schedule = () => {
            id = window.setTimeout(() => {
                setNow(new Date());
                schedule();
            }, 60_000 - (Date.now() % 60_000) + 40);
        };
        schedule();
        return () => window.clearTimeout(id);
    }, []);

    const time = now
        ? new Intl.DateTimeFormat('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              hourCycle: 'h23',
              timeZone: PLACE.timeZone,
          }).format(now)
        : '--:--';

    // minutes Kuwait is ahead of the visitor (getTimezoneOffset is minutes *behind* UTC)
    const diff = now ? PLACE.offset + now.getTimezoneOffset() : 0;
    const h = Math.floor(Math.abs(diff) / 60);
    const m = Math.abs(diff) % 60;
    const d = `${diff >= 0 ? '+' : '−'}${h}h${m ? ` ${String(m).padStart(2, '0')}m` : ''}`;
    const [pre, post] = t('about.now.diff').split('{d}');

    return (
        <div className="ab-time">
            <p className="ab-mini">{t('about.now.time')}</p>
            <p className="ab-time__v" aria-live="off">
                <span dir="ltr">{time}</span>
            </p>
            <p className="ab-time__place">
                {t('about.now.place')} · <span dir="ltr">GMT+3</span>
            </p>
            <p className="ab-time__diff">
                {now === null ? ' ' : diff === 0 ? (
                    t('about.now.same')
                ) : (
                    <>
                        {pre}
                        <span dir="ltr">{d}</span>
                        {post}
                    </>
                )}
            </p>
        </div>
    );
}

/** "Currently" — status, what else, languages, off the clock, and the clock itself. */
export default function Now() {
    const { t } = useLanguage();
    return (
        <div className="ab-sec__body ab-now">
            <p className="ab-now__status" data-reveal>
                {t('about.now.status')}
            </p>
            <div className="ab-now__line" data-reveal style={{ '--d': '100ms' } as CSSProperties}>
                <p className="ab-now__avail">
                    <span className="ab-now__dot" aria-hidden="true" />
                    {t('about.now.available')}
                </p>
                <p className="ab-now__feneris">
                    {t('about.now.feneris')}{' '}
                    <a
                        className="ab-link"
                        href={FENERIS.href}
                        target="_blank"
                        rel="noreferrer"
                        data-hover
                        data-cursor={t('about.contact.open')}
                    >
                        {FENERIS.label}
                        <span className="ab-link__arrow" aria-hidden="true">
                            ↗
                        </span>
                    </a>
                </p>
            </div>

            <div className="ab-now__grid">
                <div className="ab-now__cell" data-reveal style={{ '--d': '0ms' } as CSSProperties}>
                    <p className="ab-mini">{t('about.now.languages')}</p>
                    <ul className="ab-langs">
                        {spoken.map((l) => (
                            <li key={l.code} className="ab-lang">
                                <span className="ab-lang__code">{l.code}</span>
                                <span className="ab-lang__name">
                                    {/* isolated so each name shapes in its own script, aligned with the page */}
                                    <bdi lang={l.lang}>{l.name}</bdi>
                                </span>
                                <span className="ab-lang__level">{t(l.levelKey)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="ab-now__cell" data-reveal style={{ '--d': '110ms' } as CSSProperties}>
                    <p className="ab-mini">{t('about.now.off')}</p>
                    <p className="ab-now__off">{t('about.now.off.text')}</p>
                </div>
                <div className="ab-now__cell" data-reveal style={{ '--d': '220ms' } as CSSProperties}>
                    <LocalTime />
                </div>
            </div>
        </div>
    );
}

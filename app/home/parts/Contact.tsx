'use client';

import React, { type CSSProperties } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../components/LanguageContext';
import CopyButton from '../../kit/CopyButton';
import { useMagnet } from '../../kit/motion';
import { EMAIL, GITHUB, LINKEDIN } from '../../about/about.data';
import { useClock } from '../useClock';

function Row({
    k,
    v,
    href,
    arrow,
    delay,
    cursor,
    external,
    internal,
}: {
    k: string;
    v: string;
    href: string;
    arrow: string;
    delay: number;
    cursor: string;
    external?: boolean;
    internal?: boolean;
}) {
    const arrowRef = useMagnet<HTMLSpanElement>(0.22, 5);
    const inner = (
        <>
            <span className="hm-row__k">{k}</span>
            <span className="hm-row__v">
                <bdi>{v}</bdi>
            </span>
            <span className="hm-row__act" ref={arrowRef} aria-hidden="true">
                {arrow}
            </span>
        </>
    );
    const common = {
        className: 'hm-row__in',
        'data-reveal': true,
        'data-hover': true,
        'data-cursor': cursor,
        'data-magnet-zone': true,
        style: { '--d': `${delay}ms` } as CSSProperties,
    };
    return (
        <li className="hm-row">
            {internal ? (
                <Link href={href} {...common}>
                    {inner}
                </Link>
            ) : (
                <a href={href} {...common} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                    {inner}
                </a>
            )}
        </li>
    );
}

/**
 * 04 · Contact — the exit ramp, split: the line on one side, the ways in on the
 * other, and the hour it is where the reply would come from.
 */
export default function Contact() {
    const { t } = useLanguage();
    const { time, diff, delta } = useClock();
    const [pre, post] = t('about.now.diff').split('{d}');

    return (
        <section className="hm-sec hm-contact" id="contact" aria-labelledby="contact-title">
            <header className="hm-sec__label" data-reveal="fade">
                <span className="hm-sec__idx">04</span>
                <span className="hm-sec__name">{t('projects.sec.contact')}</span>
            </header>

            <div className="hm-contact__lead">
                <h2 className="hm-contact__title" id="contact-title" data-reveal="mask">
                    <span className="k-mask">{t('home.cta.text')}</span>
                </h2>
                <div className="hm-contact__status" data-reveal style={{ '--d': '120ms' } as CSSProperties}>
                    <p className="hm-contact__avail">
                        <span className="hm-contact__dot" aria-hidden="true" />
                        {t('about.now.available')}
                    </p>
                    <p className="hm-contact__time">
                        <span>{t('about.now.place')}</span>
                        <span className="hm-contact__clock" dir="ltr">
                            {time}
                        </span>
                        <span className="hm-contact__diff">
                            {diff === null ? ' ' : diff === 0 ? (
                                t('about.now.same')
                            ) : (
                                <>
                                    {pre}
                                    <span dir="ltr">{delta}</span>
                                    {post}
                                </>
                            )}
                        </span>
                    </p>
                </div>
            </div>

            <ul className="hm-rows">
                <li className="hm-row hm-row--email">
                    <div className="hm-row__in" data-reveal data-magnet-zone style={{ '--d': '0ms' } as CSSProperties}>
                        <span className="hm-row__k">{t('projects.contact.email')}</span>
                        <a className="hm-row__v hm-row__v--link" href={`mailto:${EMAIL}`} dir="ltr" data-hover data-cursor="mailto">
                            {EMAIL}
                        </a>
                        <CopyButton text={EMAIL} label={t('projects.contact.copy')} done={t('projects.contact.copied')} />
                    </div>
                </li>
                <Row
                    k={t('projects.contact.brief')}
                    v={t('projects.contact.start')}
                    href="/contact/"
                    arrow="→"
                    delay={90}
                    cursor={t('projects.contact.open')}
                    internal
                />
                <Row
                    k="LinkedIn"
                    v={LINKEDIN.handle}
                    href={LINKEDIN.href}
                    arrow="↗"
                    delay={180}
                    cursor={t('projects.contact.open')}
                    external
                />
                <Row
                    k="GitHub"
                    v={GITHUB.handle}
                    href={GITHUB.href}
                    arrow="↗"
                    delay={270}
                    cursor={t('projects.contact.open')}
                    external
                />
            </ul>
        </section>
    );
}

'use client';

import React, { type CSSProperties } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../components/LanguageContext';
import CopyButton from '../../kit/CopyButton';
import { useMagnet } from '../../kit/motion';
import { EMAIL, GITHUB } from '../../about/about.data';

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
            <span className="pj-row__k">{k}</span>
            <span className="pj-row__v" dir="ltr">
                {v}
            </span>
            <span className="pj-row__act" ref={arrowRef} aria-hidden="true">
                {arrow}
            </span>
        </>
    );
    const common = {
        className: 'pj-row__in',
        'data-reveal': true,
        'data-hover': true,
        'data-cursor': cursor,
        'data-magnet-zone': true,
        style: { '--d': `${delay}ms` } as CSSProperties,
    };
    return (
        <li className="pj-row">
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

/** The exit ramp — every page ends with a way to reach Badr. */
export default function ExitRamp() {
    const { t } = useLanguage();
    return (
        <section className="pj-sec pj-contact" id="contact" aria-labelledby="contact-title">
            <header className="pj-sec__label" data-reveal="fade">
                <span className="pj-sec__idx">→</span>
                <h2 className="pj-sec__name" id="contact-title">
                    {t('projects.sec.contact')}
                </h2>
            </header>

            <div className="pj-contact__body">
                <p className="pj-contact__title" data-reveal="mask">
                    <span className="k-mask">{t('projects.contact.title')}</span>
                </p>
                <ul className="pj-rows">
                    <li className="pj-row pj-row--email">
                        <div className="pj-row__in" data-reveal data-magnet-zone style={{ '--d': '0ms' } as CSSProperties}>
                            <span className="pj-row__k">{t('projects.contact.email')}</span>
                            <a className="pj-row__v pj-row__v--link" href={`mailto:${EMAIL}`} dir="ltr" data-hover data-cursor="mailto">
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
                        k="GitHub"
                        v={GITHUB.handle}
                        href={GITHUB.href}
                        arrow="↗"
                        delay={180}
                        cursor={t('projects.contact.open')}
                        external
                    />
                </ul>
            </div>
        </section>
    );
}

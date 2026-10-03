'use client';

import React, { useEffect, useState, type CSSProperties } from 'react';
import { useLanguage } from '../../components/LanguageContext';
import { EMAIL, GITHUB, LINKEDIN, RESUME } from '../about.data';
import { useMagnet } from '../motion';

/** Copy the address in place — no alert, the label itself confirms. */
function CopyButton({ text }: { text: string }) {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);
    const ref = useMagnet<HTMLButtonElement>();

    useEffect(() => {
        if (!copied) return;
        const id = window.setTimeout(() => setCopied(false), 1800);
        return () => window.clearTimeout(id);
    }, [copied]);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // older / insecure contexts: a throwaway selection
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
            } catch {
                /* nothing else to try — the address is still on screen */
            }
            ta.remove();
        }
        setCopied(true);
    };

    return (
        <button
            type="button"
            ref={ref}
            className={`ab-copy ${copied ? 'is-copied' : ''}`}
            onClick={copy}
            data-hover
        >
            <span className="ab-copy__a" aria-hidden={copied}>
                {t('about.contact.copy')}
            </span>
            <span className="ab-copy__b" aria-hidden={!copied}>
                {t('about.contact.copied')}
            </span>
            <span className="ab-sr" aria-live="polite">
                {copied ? t('about.contact.copied') : ''}
            </span>
        </button>
    );
}

/** A whole-row link: key · value · arrow. */
function Row({
    k,
    v,
    href,
    arrow,
    delay,
    cursor,
    external,
    download,
}: {
    k: string;
    v: string;
    href: string;
    arrow: string;
    delay: number;
    cursor: string;
    external?: boolean;
    download?: string;
}) {
    const arrowRef = useMagnet<HTMLSpanElement>(0.22, 5);
    return (
        <li className="ab-row">
            <a
                className="ab-row__in"
                href={href}
                data-reveal
                data-hover
                data-cursor={cursor}
                data-magnet-zone
                style={{ '--d': `${delay}ms` } as CSSProperties}
                {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                {...(download ? { download } : {})}
            >
                <span className="ab-row__k">{k}</span>
                {/* handles and sizes are Latin identifiers: keep "/in/…" and "@…" intact in RTL */}
                <span className="ab-row__v" dir="ltr">
                    {v}
                </span>
                <span className="ab-row__act" ref={arrowRef} aria-hidden="true">
                    {arrow}
                </span>
            </a>
        </li>
    );
}

/** The exit ramp — every page ends here. The page trace terminates at the address. */
export default function Contact({ resumeSize }: { resumeSize: string | null }) {
    const { t } = useLanguage();
    return (
        <div className="ab-sec__body ab-contact">
            <h3 className="ab-contact__title" data-reveal="mask">
                <span className="ab-mask">{t('about.contact.title')}</span>
            </h3>
            <ul className="ab-rows">
                <li className="ab-row ab-row--email">
                    <span className="ab-row__pad" data-trace="end" aria-hidden="true" />
                    <div className="ab-row__in" data-reveal data-magnet-zone style={{ '--d': '0ms' } as CSSProperties}>
                        <span className="ab-row__k">{t('about.contact.email')}</span>
                        <a className="ab-row__v ab-row__v--link" href={`mailto:${EMAIL}`} dir="ltr" data-hover data-cursor="mailto">
                            {EMAIL}
                        </a>
                        <CopyButton text={EMAIL} />
                    </div>
                </li>
                <Row
                    k={t('about.contact.resume')}
                    v={`PDF${resumeSize ? ` · ${resumeSize}` : ''}`}
                    href={RESUME.href}
                    download={RESUME.file}
                    arrow="↓"
                    delay={90}
                    cursor={t('about.contact.download')}
                />
                <Row
                    k="LinkedIn"
                    v={LINKEDIN.handle}
                    href={LINKEDIN.href}
                    arrow="↗"
                    delay={180}
                    cursor={t('about.contact.open')}
                    external
                />
                <Row
                    k="GitHub"
                    v={GITHUB.handle}
                    href={GITHUB.href}
                    arrow="↗"
                    delay={270}
                    cursor={t('about.contact.open')}
                    external
                />
            </ul>
        </div>
    );
}
